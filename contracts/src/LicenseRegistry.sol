// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title LicenseRegistry
 * @dev On-chain record of all active and expired licenses
 * Serves as a queryable proof of licensing status for investors and licensees
 */
contract LicenseRegistry is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _licenseIdCounter;
    
    enum LicenseStatus {
        Active,
        Expired,
        Revoked,
        Suspended
    }
    
    struct License {
        uint256 licenseId;
        address tokenContract;      // IP token contract address
        address licensee;           // Address of the licensee
        address licensor;           // Address of the licensor (token creator)
        uint256 startDate;          // License start timestamp
        uint256 endDate;            // License end timestamp
        uint256 templateId;         // License template ID from IPToken
        bytes32 termsHash;          // Hash of license terms
        LicenseStatus status;       // Current license status
        uint256 fee;                // License fee paid
        uint256 createdAt;          // Creation timestamp
        uint256 lastUpdated;        // Last status update timestamp
        string metadata;            // Additional metadata URI
    }
    
    // Mapping from license ID to license details
    mapping(uint256 => License) public licenses;
    
    // Mapping from token contract to array of license IDs
    mapping(address => uint256[]) public tokenLicenses;
    
    // Mapping from licensee to array of license IDs
    mapping(address => uint256[]) public licenseeLicenses;
    
    // Mapping from licensor to array of license IDs
    mapping(address => uint256[]) public licensorLicenses;
    
    // Authorized contracts that can register licenses
    mapping(address => bool) public authorizedRegistrars;
    
    // License revocation conditions and authorized revokers
    mapping(uint256 => mapping(address => bool)) public revokeAuthorizations;
    
    // Events
    event LicenseRegistered(
        uint256 indexed licenseId,
        address indexed tokenContract,
        address indexed licensee,
        address licensor,
        uint256 startDate,
        uint256 endDate,
        uint256 fee
    );
    
    event LicenseRevoked(
        uint256 indexed licenseId,
        address indexed revokedBy,
        string reason,
        uint256 timestamp
    );
    
    event LicenseStatusUpdated(
        uint256 indexed licenseId,
        LicenseStatus oldStatus,
        LicenseStatus newStatus,
        address updatedBy
    );
    
    event LicenseExpired(
        uint256 indexed licenseId,
        uint256 expiredAt
    );
    
    event AuthorizedRegistrarUpdated(
        address indexed registrar,
        bool authorized
    );
    
    event RevokeAuthorizationGranted(
        uint256 indexed licenseId,
        address indexed authorizedRevoker
    );
    
    // Modifiers
    modifier onlyAuthorizedRegistrar() {
        require(authorizedRegistrars[msg.sender], "Not authorized registrar");
        _;
    }
    
    modifier validLicense(uint256 _licenseId) {
        require(_licenseId > 0 && _licenseId <= _licenseIdCounter.current(), "Invalid license ID");
        _;
    }
    
    modifier onlyLicenseParticipant(uint256 _licenseId) {
        License memory license = licenses[_licenseId];
        require(
            msg.sender == license.licensee || 
            msg.sender == license.licensor || 
            owner() == msg.sender,
            "Not authorized to access this license"
        );
        _;
    }
    
    constructor() {
        // Owner is automatically authorized
        authorizedRegistrars[msg.sender] = true;
    }
    
    /**
     * @dev Register a new license (only authorized registrars)
     * @param _tokenContract Address of the IP token contract
     * @param _licensee Address of the licensee
     * @param _startDate License start timestamp
     * @param _endDate License end timestamp
     * @param _templateId License template ID
     * @return licenseId ID of the newly registered license
     */
    function registerLicense(
        address _tokenContract,
        address _licensee,
        uint256 _startDate,
        uint256 _endDate,
        uint256 _templateId
    ) 
        external 
        onlyAuthorizedRegistrar 
        nonReentrant 
        returns (uint256 licenseId) 
    {
        require(_tokenContract != address(0), "Invalid token contract");
        require(_licensee != address(0), "Invalid licensee address");
        require(_startDate < _endDate, "Invalid date range");
        require(_endDate > block.timestamp, "End date must be in future");
        
        _licenseIdCounter.increment();
        licenseId = _licenseIdCounter.current();
        
        // Get licensor from token contract (assuming it's the owner)
        address licensor;
        try Ownable(_tokenContract).owner() returns (address _owner) {
            licensor = _owner;
        } catch {
            licensor = msg.sender; // Fallback to registrar
        }
        
        // Create license record
        licenses[licenseId] = License({
            licenseId: licenseId,
            tokenContract: _tokenContract,
            licensee: _licensee,
            licensor: licensor,
            startDate: _startDate,
            endDate: _endDate,
            templateId: _templateId,
            termsHash: bytes32(0), // Will be set separately if needed
            status: LicenseStatus.Active,
            fee: 0, // Will be set by calling contract
            createdAt: block.timestamp,
            lastUpdated: block.timestamp,
            metadata: ""
        });
        
        // Add to mappings for easy lookup
        tokenLicenses[_tokenContract].push(licenseId);
        licenseeLicenses[_licensee].push(licenseId);
        licensorLicenses[licensor].push(licenseId);
        
        emit LicenseRegistered(
            licenseId,
            _tokenContract,
            _licensee,
            licensor,
            _startDate,
            _endDate,
            0
        );
        
        return licenseId;
    }
    
    /**
     * @dev Update license fee (only authorized registrars)
     * @param _licenseId License ID
     * @param _fee License fee amount
     */
    function updateLicenseFee(uint256 _licenseId, uint256 _fee) 
        external 
        onlyAuthorizedRegistrar 
        validLicense(_licenseId) 
    {
        licenses[_licenseId].fee = _fee;
        licenses[_licenseId].lastUpdated = block.timestamp;
    }
    
    /**
     * @dev Set license terms hash
     * @param _licenseId License ID
     * @param _termsHash Hash of the license terms
     */
    function setLicenseTermsHash(uint256 _licenseId, bytes32 _termsHash)
        external
        validLicense(_licenseId)
        onlyLicenseParticipant(_licenseId)
    {
        require(_termsHash != bytes32(0), "Invalid terms hash");
        licenses[_licenseId].termsHash = _termsHash;
        licenses[_licenseId].lastUpdated = block.timestamp;
    }
    
    /**
     * @dev Revoke a license under predefined breach conditions
     * @param _licenseId License ID to revoke
     * @param _reason Reason for revocation
     */
    function revokeLicense(uint256 _licenseId, string memory _reason) 
        external 
        validLicense(_licenseId) 
        nonReentrant 
    {
        License storage license = licenses[_licenseId];
        
        require(
            msg.sender == license.licensor || 
            revokeAuthorizations[_licenseId][msg.sender] ||
            msg.sender == owner(),
            "Not authorized to revoke"
        );
        
        require(
            license.status == LicenseStatus.Active || 
            license.status == LicenseStatus.Suspended,
            "License cannot be revoked"
        );
        
        LicenseStatus oldStatus = license.status;
        license.status = LicenseStatus.Revoked;
        license.lastUpdated = block.timestamp;
        
        emit LicenseRevoked(_licenseId, msg.sender, _reason, block.timestamp);
        emit LicenseStatusUpdated(_licenseId, oldStatus, LicenseStatus.Revoked, msg.sender);
    }
    
    /**
     * @dev Update license status
     * @param _licenseId License ID
     * @param _newStatus New status
     */
    function updateLicenseStatus(uint256 _licenseId, LicenseStatus _newStatus)
        external
        validLicense(_licenseId)
        onlyLicenseParticipant(_licenseId)
    {
        License storage license = licenses[_licenseId];
        LicenseStatus oldStatus = license.status;
        
        require(oldStatus != _newStatus, "Status unchanged");
        
        // Validate status transitions
        if (oldStatus == LicenseStatus.Revoked) {
            require(msg.sender == owner(), "Cannot change revoked status");
        }
        
        license.status = _newStatus;
        license.lastUpdated = block.timestamp;
        
        emit LicenseStatusUpdated(_licenseId, oldStatus, _newStatus, msg.sender);
    }
    
    /**
     * @dev Check and update expired licenses
     * @param _licenseId License ID to check
     */
    function checkAndUpdateExpired(uint256 _licenseId) 
        external 
        validLicense(_licenseId) 
    {
        License storage license = licenses[_licenseId];
        
        if (
            block.timestamp >= license.endDate && 
            license.status == LicenseStatus.Active
        ) {
            LicenseStatus oldStatus = license.status;
            license.status = LicenseStatus.Expired;
            license.lastUpdated = block.timestamp;
            
            emit LicenseExpired(_licenseId, block.timestamp);
            emit LicenseStatusUpdated(_licenseId, oldStatus, LicenseStatus.Expired, msg.sender);
        }
    }
    
    /**
     * @dev Grant revocation authorization to an address
     * @param _licenseId License ID
     * @param _authorizedRevoker Address to authorize
     */
    function grantRevokeAuthorization(uint256 _licenseId, address _authorizedRevoker)
        external
        validLicense(_licenseId)
        onlyLicenseParticipant(_licenseId)
    {
        require(_authorizedRevoker != address(0), "Invalid authorizer address");
        revokeAuthorizations[_licenseId][_authorizedRevoker] = true;
        
        emit RevokeAuthorizationGranted(_licenseId, _authorizedRevoker);
    }
    
    /**
     * @dev Get license status
     * @param _licenseId License ID
     * @return Current license status
     */
    function getLicenseStatus(uint256 _licenseId) 
        external 
        view 
        validLicense(_licenseId) 
        returns (LicenseStatus) 
    {
        License memory license = licenses[_licenseId];
        
        // Check if license should be expired
        if (
            block.timestamp >= license.endDate && 
            license.status == LicenseStatus.Active
        ) {
            return LicenseStatus.Expired;
        }
        
        return license.status;
    }
    
    /**
     * @dev Get complete license information
     * @param _licenseId License ID
     * @return Complete license struct
     */
    function getLicense(uint256 _licenseId) 
        external 
        view 
        validLicense(_licenseId) 
        returns (License memory) 
    {
        return licenses[_licenseId];
    }
    
    /**
     * @dev Get all licenses for a token contract
     * @param _tokenContract Token contract address
     * @return Array of license IDs
     */
    function getTokenLicenses(address _tokenContract) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return tokenLicenses[_tokenContract];
    }
    
    /**
     * @dev Get all licenses for a licensee
     * @param _licensee Licensee address
     * @return Array of license IDs
     */
    function getLicenseeLicenses(address _licensee) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return licenseeLicenses[_licensee];
    }
    
    /**
     * @dev Get all licenses for a licensor
     * @param _licensor Licensor address
     * @return Array of license IDs
     */
    function getLicensorLicenses(address _licensor) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return licensorLicenses[_licensor];
    }
    
    /**
     * @dev Get total license count
     * @return Total number of licenses
     */
    function getTotalLicenses() external view returns (uint256) {
        return _licenseIdCounter.current();
    }
    
    /**
     * @dev Authorize/deauthorize registrar (only owner)
     * @param _registrar Registrar address
     * @param _authorized Authorization status
     */
    function setAuthorizedRegistrar(address _registrar, bool _authorized) 
        external 
        onlyOwner 
    {
        require(_registrar != address(0), "Invalid registrar address");
        authorizedRegistrars[_registrar] = _authorized;
        
        emit AuthorizedRegistrarUpdated(_registrar, _authorized);
    }
    
    /**
     * @dev Batch check license expiration for multiple licenses
     * @param _licenseIds Array of license IDs to check
     */
    function batchCheckExpiration(uint256[] memory _licenseIds) external {
        for (uint256 i = 0; i < _licenseIds.length; i++) {
            if (_licenseIds[i] > 0 && _licenseIds[i] <= _licenseIdCounter.current()) {
                License storage license = licenses[_licenseIds[i]];
                
                if (
                    block.timestamp >= license.endDate && 
                    license.status == LicenseStatus.Active
                ) {
                    LicenseStatus oldStatus = license.status;
                    license.status = LicenseStatus.Expired;
                    license.lastUpdated = block.timestamp;
                    
                    emit LicenseExpired(_licenseIds[i], block.timestamp);
                    emit LicenseStatusUpdated(_licenseIds[i], oldStatus, LicenseStatus.Expired, msg.sender);
                }
            }
        }
    }
}
