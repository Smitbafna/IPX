// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title ComplianceModule
 * @dev Enforces KYC/AML checks before allowing token transfers or licensing
 * Integrates with external compliance APIs and maintains compliance status
 */
contract ComplianceModule is Ownable, AccessControl, ReentrancyGuard {
    
    // Role definitions
    bytes32 public constant COMPLIANCE_OFFICER_ROLE = keccak256("COMPLIANCE_OFFICER_ROLE");
    bytes32 public constant KYC_PROVIDER_ROLE = keccak256("KYC_PROVIDER_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
    
    enum ComplianceStatus {
        Unknown,        // Default state
        Pending,        // Verification in progress
        Verified,       // KYC/AML passed
        Rejected,       // KYC/AML failed
        Suspended,      // Temporarily suspended
        Revoked         // Permanently revoked
    }
    
    enum RiskLevel {
        Low,
        Medium,
        High,
        Prohibited
    }
    
    struct ComplianceRecord {
        ComplianceStatus status;
        RiskLevel riskLevel;
        uint256 verifiedAt;         // Timestamp of verification
        uint256 expiresAt;          // Expiration timestamp
        address verifiedBy;         // Address of verifier
        string providerId;          // External KYC provider ID
        bytes32 documentHash;       // Hash of compliance documents
        string jurisdiction;        // Legal jurisdiction
        bool isAccreditedInvestor;  // Accredited investor status
        uint256 lastUpdated;       // Last update timestamp
        string notes;              // Additional notes
    }
    
    // Mapping from address to compliance record
    mapping(address => ComplianceRecord) public complianceRecords;
    
    // Mapping from jurisdiction to allowed status
    mapping(string => bool) public allowedJurisdictions;
    
    // Mapping from KYC provider to authorized status
    mapping(string => bool) public authorizedProviders;
    
    // Global compliance settings
    bool public complianceRequired = true;
    uint256 public defaultExpirationPeriod = 365 days; // 1 year
    uint256 public gracePeriod = 30 days; // 30 days after expiration
    
    // Risk level restrictions
    mapping(RiskLevel => bool) public riskLevelAllowed;
    
    // Country/region restrictions
    mapping(string => bool) public restrictedCountries;
    
    // Events
    event ComplianceStatusUpdated(
        address indexed user,
        ComplianceStatus oldStatus,
        ComplianceStatus newStatus,
        address indexed updatedBy
    );
    
    event RiskLevelUpdated(
        address indexed user,
        RiskLevel oldLevel,
        RiskLevel newLevel,
        address indexed updatedBy
    );
    
    event ComplianceExpired(
        address indexed user,
        uint256 expiredAt
    );
    
    event ComplianceRenewed(
        address indexed user,
        uint256 newExpirationDate,
        address indexed renewedBy
    );
    
    event JurisdictionUpdated(
        string indexed jurisdiction,
        bool allowed
    );
    
    event ProviderAuthorized(
        string indexed providerId,
        bool authorized
    );
    
    event ComplianceSettingsUpdated(
        bool complianceRequired,
        uint256 expirationPeriod,
        uint256 gracePeriod
    );
    
    // Modifiers
    modifier onlyComplianceOfficer() {
        require(hasRole(COMPLIANCE_OFFICER_ROLE, msg.sender), "Not a compliance officer");
        _;
    }
    
    modifier onlyKYCProvider() {
        require(hasRole(KYC_PROVIDER_ROLE, msg.sender), "Not a KYC provider");
        _;
    }
    
    modifier validAddress(address _user) {
        require(_user != address(0), "Invalid address");
        _;
    }
    
    constructor() {
        // Grant admin role to deployer
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(COMPLIANCE_OFFICER_ROLE, msg.sender);
        
        // Initialize default risk level permissions
        riskLevelAllowed[RiskLevel.Low] = true;
        riskLevelAllowed[RiskLevel.Medium] = true;
        riskLevelAllowed[RiskLevel.High] = false;
        riskLevelAllowed[RiskLevel.Prohibited] = false;
    }
    
    /**
     * @dev Verify an address with KYC/AML information
     * @param _user Address to verify
     * @param _providerId External KYC provider ID
     * @param _documentHash Hash of compliance documents
     * @param _jurisdiction Legal jurisdiction
     * @param _riskLevel Risk assessment level
     * @param _isAccreditedInvestor Whether user is accredited investor
     */
    function verifyAddress(
        address _user,
        string memory _providerId,
        bytes32 _documentHash,
        string memory _jurisdiction,
        RiskLevel _riskLevel,
        bool _isAccreditedInvestor
    ) 
        external 
        onlyKYCProvider 
        validAddress(_user) 
        nonReentrant 
    {
        require(bytes(_providerId).length > 0, "Provider ID required");
        require(authorizedProviders[_providerId], "Provider not authorized");
        require(allowedJurisdictions[_jurisdiction], "Jurisdiction not allowed");
        require(!restrictedCountries[_jurisdiction], "Jurisdiction restricted");
        
        ComplianceRecord storage record = complianceRecords[_user];
        ComplianceStatus oldStatus = record.status;
        RiskLevel oldRiskLevel = record.riskLevel;
        
        // Update compliance record
        record.status = ComplianceStatus.Verified;
        record.riskLevel = _riskLevel;
        record.verifiedAt = block.timestamp;
        record.expiresAt = block.timestamp + defaultExpirationPeriod;
        record.verifiedBy = msg.sender;
        record.providerId = _providerId;
        record.documentHash = _documentHash;
        record.jurisdiction = _jurisdiction;
        record.isAccreditedInvestor = _isAccreditedInvestor;
        record.lastUpdated = block.timestamp;
        
        emit ComplianceStatusUpdated(_user, oldStatus, ComplianceStatus.Verified, msg.sender);
        
        if (oldRiskLevel != _riskLevel) {
            emit RiskLevelUpdated(_user, oldRiskLevel, _riskLevel, msg.sender);
        }
    }
    
    /**
     * @dev Check if an address is compliant
     * @param _user Address to check
     * @return Whether the address is compliant
     */
    function isCompliant(address _user) external view validAddress(_user) returns (bool) {
        if (!complianceRequired) {
            return true;
        }
        
        ComplianceRecord memory record = complianceRecords[_user];
        
        // Check if verification exists
        if (record.status != ComplianceStatus.Verified) {
            return false;
        }
        
        // Check if verification has expired (with grace period)
        if (block.timestamp > record.expiresAt + gracePeriod) {
            return false;
        }
        
        // Check risk level
        if (!riskLevelAllowed[record.riskLevel]) {
            return false;
        }
        
        // Check jurisdiction restrictions
        if (restrictedCountries[record.jurisdiction]) {
            return false;
        }
        
        return true;
    }
    
    /**
     * @dev Get detailed compliance status
     * @param _user Address to check
     * @return Detailed compliance information
     */
    function getComplianceStatus(address _user) 
        external 
        view 
        validAddress(_user) 
        returns (
            ComplianceStatus status,
            RiskLevel riskLevel,
            bool isExpired,
            bool isInGracePeriod,
            uint256 expiresAt,
            bool isAccreditedInvestor
        ) 
    {
        ComplianceRecord memory record = complianceRecords[_user];
        
        status = record.status;
        riskLevel = record.riskLevel;
        expiresAt = record.expiresAt;
        isAccreditedInvestor = record.isAccreditedInvestor;
        
        if (record.status == ComplianceStatus.Verified) {
            isExpired = block.timestamp > record.expiresAt;
            isInGracePeriod = block.timestamp <= record.expiresAt + gracePeriod;
        } else {
            isExpired = false;
            isInGracePeriod = false;
        }
    }
    
    /**
     * @dev Update compliance status (compliance officers only)
     * @param _user Address to update
     * @param _newStatus New compliance status
     * @param _notes Additional notes
     */
    function updateComplianceStatus(
        address _user,
        ComplianceStatus _newStatus,
        string memory _notes
    ) 
        external 
        onlyComplianceOfficer 
        validAddress(_user) 
    {
        ComplianceRecord storage record = complianceRecords[_user];
        ComplianceStatus oldStatus = record.status;
        
        require(oldStatus != _newStatus, "Status unchanged");
        
        record.status = _newStatus;
        record.lastUpdated = block.timestamp;
        record.notes = _notes;
        
        // If suspending or revoking, update timestamps
        if (_newStatus == ComplianceStatus.Suspended || _newStatus == ComplianceStatus.Revoked) {
            record.expiresAt = block.timestamp; // Immediate expiration
        }
        
        emit ComplianceStatusUpdated(_user, oldStatus, _newStatus, msg.sender);
    }
    
    /**
     * @dev Renew compliance verification
     * @param _user Address to renew
     * @param _additionalPeriod Additional time to extend (optional)
     */
    function renewCompliance(address _user, uint256 _additionalPeriod) 
        external 
        onlyKYCProvider 
        validAddress(_user) 
    {
        ComplianceRecord storage record = complianceRecords[_user];
        require(record.status == ComplianceStatus.Verified, "User not verified");
        
        uint256 newExpiration;
        if (_additionalPeriod > 0) {
            newExpiration = record.expiresAt + _additionalPeriod;
        } else {
            newExpiration = block.timestamp + defaultExpirationPeriod;
        }
        
        record.expiresAt = newExpiration;
        record.lastUpdated = block.timestamp;
        record.verifiedBy = msg.sender;
        
        emit ComplianceRenewed(_user, newExpiration, msg.sender);
    }
    
    /**
     * @dev Batch verify multiple addresses
     * @param _users Array of addresses to verify
     * @param _providerId External KYC provider ID
     * @param _documentHashes Array of document hashes
     * @param _jurisdictions Array of jurisdictions
     * @param _riskLevels Array of risk levels
     * @param _accreditedStatuses Array of accredited investor statuses
     */
    function batchVerifyAddresses(
        address[] memory _users,
        string memory _providerId,
        bytes32[] memory _documentHashes,
        string[] memory _jurisdictions,
        RiskLevel[] memory _riskLevels,
        bool[] memory _accreditedStatuses
    ) external onlyKYCProvider {
        require(_users.length == _documentHashes.length, "Array length mismatch");
        require(_users.length == _jurisdictions.length, "Array length mismatch");
        require(_users.length == _riskLevels.length, "Array length mismatch");
        require(_users.length == _accreditedStatuses.length, "Array length mismatch");
        
        for (uint256 i = 0; i < _users.length; i++) {
            if (_users[i] != address(0)) {
                this.verifyAddress(
                    _users[i],
                    _providerId,
                    _documentHashes[i],
                    _jurisdictions[i],
                    _riskLevels[i],
                    _accreditedStatuses[i]
                );
            }
        }
    }
    
    /**
     * @dev Set jurisdiction allowance (admin only)
     * @param _jurisdiction Jurisdiction code
     * @param _allowed Whether jurisdiction is allowed
     */
    function setJurisdictionAllowed(string memory _jurisdiction, bool _allowed) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(bytes(_jurisdiction).length > 0, "Jurisdiction required");
        allowedJurisdictions[_jurisdiction] = _allowed;
        
        emit JurisdictionUpdated(_jurisdiction, _allowed);
    }
    
    /**
     * @dev Set country restriction (admin only)
     * @param _country Country code
     * @param _restricted Whether country is restricted
     */
    function setCountryRestricted(string memory _country, bool _restricted) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(bytes(_country).length > 0, "Country required");
        restrictedCountries[_country] = _restricted;
    }
    
    /**
     * @dev Authorize KYC provider (admin only)
     * @param _providerId Provider ID
     * @param _authorized Whether provider is authorized
     */
    function setProviderAuthorized(string memory _providerId, bool _authorized) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(bytes(_providerId).length > 0, "Provider ID required");
        authorizedProviders[_providerId] = _authorized;
        
        emit ProviderAuthorized(_providerId, _authorized);
    }
    
    /**
     * @dev Set risk level allowance (admin only)
     * @param _riskLevel Risk level
     * @param _allowed Whether risk level is allowed
     */
    function setRiskLevelAllowed(RiskLevel _riskLevel, bool _allowed) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        riskLevelAllowed[_riskLevel] = _allowed;
    }
    
    /**
     * @dev Update global compliance settings (admin only)
     * @param _complianceRequired Whether compliance is required
     * @param _expirationPeriod Default expiration period
     * @param _gracePeriod Grace period after expiration
     */
    function updateComplianceSettings(
        bool _complianceRequired,
        uint256 _expirationPeriod,
        uint256 _gracePeriod
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_expirationPeriod > 0, "Expiration period must be positive");
        require(_gracePeriod <= _expirationPeriod, "Grace period too long");
        
        complianceRequired = _complianceRequired;
        defaultExpirationPeriod = _expirationPeriod;
        gracePeriod = _gracePeriod;
        
        emit ComplianceSettingsUpdated(_complianceRequired, _expirationPeriod, _gracePeriod);
    }
    
    /**
     * @dev Get complete compliance record
     * @param _user Address to query
     * @return Complete compliance record
     */
    function getComplianceRecord(address _user) 
        external 
        view 
        validAddress(_user) 
        returns (ComplianceRecord memory) 
    {
        return complianceRecords[_user];
    }
    
    /**
     * @dev Check if user is accredited investor
     * @param _user Address to check
     * @return Whether user is accredited investor
     */
    function isAccreditedInvestor(address _user) 
        external 
        view 
        validAddress(_user) 
        returns (bool) 
    {
        return complianceRecords[_user].isAccreditedInvestor;
    }
    
    /**
     * @dev Batch check compliance for multiple addresses
     * @param _users Array of addresses to check
     * @return Array of compliance statuses
     */
    function batchCheckCompliance(address[] memory _users) 
        external 
        view 
        returns (bool[] memory) 
    {
        bool[] memory results = new bool[](_users.length);
        
        for (uint256 i = 0; i < _users.length; i++) {
            if (_users[i] != address(0)) {
                results[i] = this.isCompliant(_users[i]);
            }
        }
        
        return results;
    }
}
