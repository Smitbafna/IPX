// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title ComplianceModule
 * @dev Advanced KYC/AML compliance with risk management
 */
contract ComplianceModule is Ownable, AccessControl, ReentrancyGuard {
    
    // Role definitions
    bytes32 public constant COMPLIANCE_OFFICER_ROLE = keccak256("COMPLIANCE_OFFICER_ROLE");
    bytes32 public constant KYC_PROVIDER_ROLE = keccak256("KYC_PROVIDER_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
    
    enum ComplianceStatus {
        Unknown,
        Pending,
        Verified,
        Rejected,
        Suspended,
        Revoked
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
        uint256 verifiedAt;
        uint256 expiresAt;
        address verifiedBy;
        string providerId;
        bytes32 documentHash;
        string jurisdiction;
        bool isAccreditedInvestor;
        uint256 lastUpdated;
        string notes;
    }
    
    // Mappings
    mapping(address => ComplianceRecord) public complianceRecords;
    mapping(string => bool) public allowedJurisdictions;
    mapping(string => bool) public authorizedProviders;
    mapping(RiskLevel => bool) public riskLevelAllowed;
    mapping(string => bool) public restrictedCountries;
    
    // Global settings
    bool public complianceRequired = true;
    uint256 public defaultExpirationPeriod = 365 days;
    uint256 public gracePeriod = 30 days;
    
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
    
    event JurisdictionUpdated(
        string indexed jurisdiction,
        bool allowed
    );
    
    // Modifiers
    modifier onlyKYCProvider() {
        require(hasRole(KYC_PROVIDER_ROLE, msg.sender), "Not a KYC provider");
        _;
    }
    
    modifier validAddress(address _user) {
        require(_user != address(0), "Invalid address");
        _;
    }
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(COMPLIANCE_OFFICER_ROLE, msg.sender);
        
        // Initialize default risk levels
        riskLevelAllowed[RiskLevel.Low] = true;
        riskLevelAllowed[RiskLevel.Medium] = true;
        riskLevelAllowed[RiskLevel.High] = false;
        riskLevelAllowed[RiskLevel.Prohibited] = false;
    }
    
    /**
     * @dev Verify an address with full KYC/AML information
     */
    function verifyAddress(
        address _user,
        string memory _providerId,
        bytes32 _documentHash,
        string memory _jurisdiction,
        RiskLevel _riskLevel,
        bool _isAccreditedInvestor
    ) external onlyKYCProvider validAddress(_user) nonReentrant {
        require(authorizedProviders[_providerId], "Provider not authorized");
        require(allowedJurisdictions[_jurisdiction], "Jurisdiction not allowed");
        require(!restrictedCountries[_jurisdiction], "Jurisdiction restricted");
        
        ComplianceRecord storage record = complianceRecords[_user];
        ComplianceStatus oldStatus = record.status;
        RiskLevel oldRiskLevel = record.riskLevel;
        
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
     * @dev Enhanced compliance check
     */
    function isCompliant(address _user) external view validAddress(_user) returns (bool) {
        if (!complianceRequired) {
            return true;
        }
        
        ComplianceRecord memory record = complianceRecords[_user];
        
        if (record.status != ComplianceStatus.Verified) {
            return false;
        }
        
        if (block.timestamp > record.expiresAt + gracePeriod) {
            return false;
        }
        
        if (!riskLevelAllowed[record.riskLevel]) {
            return false;
        }
        
        if (restrictedCountries[record.jurisdiction]) {
            return false;
        }
        
        return true;
    }
    
    /**
     * @dev Get detailed compliance status
     */
    function getComplianceStatus(address _user) external view validAddress(_user) returns (
        ComplianceStatus status,
        RiskLevel riskLevel,
        bool isExpired,
        bool isInGracePeriod,
        uint256 expiresAt,
        bool isAccreditedInvestor
    ) {
        ComplianceRecord memory record = complianceRecords[_user];
        
        status = record.status;
        riskLevel = record.riskLevel;
        expiresAt = record.expiresAt;
        isAccreditedInvestor = record.isAccreditedInvestor;
        
        if (record.status == ComplianceStatus.Verified) {
            isExpired = block.timestamp > record.expiresAt;
            isInGracePeriod = block.timestamp <= record.expiresAt + gracePeriod;
        }
    }
    
    /**
     * @dev Set jurisdiction allowance
     */
    function setJurisdictionAllowed(string memory _jurisdiction, bool _allowed) external onlyRole(DEFAULT_ADMIN_ROLE) {
        allowedJurisdictions[_jurisdiction] = _allowed;
        emit JurisdictionUpdated(_jurisdiction, _allowed);
    }
    
    /**
     * @dev Authorize KYC provider
     */
    function setProviderAuthorized(string memory _providerId, bool _authorized) external onlyRole(DEFAULT_ADMIN_ROLE) {
        authorizedProviders[_providerId] = _authorized;
    }
    
    /**
     * @dev Set risk level allowance
     */
    function setRiskLevelAllowed(RiskLevel _riskLevel, bool _allowed) external onlyRole(DEFAULT_ADMIN_ROLE) {
        riskLevelAllowed[_riskLevel] = _allowed;
    }
}