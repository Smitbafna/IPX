// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title LicenseRegistry
 * @dev License registry with management and revocation
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
        address tokenContract;
        address licensee;
        address licensor;
        uint256 startDate;
        uint256 endDate;
        uint256 templateId;
        bytes32 termsHash;
        LicenseStatus status;
        uint256 fee;
        uint256 createdAt;
        uint256 lastUpdated;
        string metadata;
    }
    
    // Mappings
    mapping(uint256 => License) public licenses;
    mapping(address => uint256[]) public tokenLicenses;
    mapping(address => uint256[]) public licenseeLicenses;
    mapping(address => uint256[]) public licensorLicenses;
    mapping(address => bool) public authorizedRegistrars;
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
        authorizedRegistrars[msg.sender] = true;
    }
    
    /**
     * @dev Register a new license with enhanced details
     */
    function registerLicense(
        address _tokenContract,
        address _licensee,
        uint256 _startDate,
        uint256 _endDate,
        uint256 _templateId
    ) external onlyAuthorizedRegistrar nonReentrant returns (uint256 licenseId) {
        require(_tokenContract != address(0), "Invalid token contract");
        require(_licensee != address(0), "Invalid licensee address");
        require(_startDate < _endDate, "Invalid date range");
        require(_endDate > block.timestamp, "End date must be in future");
        
        _licenseIdCounter.increment();
        licenseId = _licenseIdCounter.current();
        
        address licensor;
        try Ownable(_tokenContract).owner() returns (address _owner) {
            licensor = _owner;
        } catch {
            licensor = msg.sender;
        }
        
        licenses[licenseId] = License({
            licenseId: licenseId,
            tokenContract: _tokenContract,
            licensee: _licensee,
            licensor: licensor,
            startDate: _startDate,
            endDate: _endDate,
            templateId: _templateId,
            termsHash: bytes32(0),
            status: LicenseStatus.Active,
            fee: 0,
            createdAt: block.timestamp,
            lastUpdated: block.timestamp,
            metadata: ""
        });
        
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
     * @dev Update license fee
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
     * @dev Revoke a license
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
     */
    function updateLicenseStatus(uint256 _licenseId, LicenseStatus _newStatus)
        external
        validLicense(_licenseId)
        onlyLicenseParticipant(_licenseId)
    {
        License storage license = licenses[_licenseId];
        LicenseStatus oldStatus = license.status;
        
        require(oldStatus != _newStatus, "Status unchanged");
        
        if (oldStatus == LicenseStatus.Revoked) {
            require(msg.sender == owner(), "Cannot change revoked status");
        }
        
        license.status = _newStatus;
        license.lastUpdated = block.timestamp;
        
        emit LicenseStatusUpdated(_licenseId, oldStatus, _newStatus, msg.sender);
    }
    
    /**
     * @dev Check and update expired licenses
     */
    function checkAndUpdateExpired(uint256 _licenseId) external validLicense(_licenseId) {
        License storage license = licenses[_licenseId];
        
        if (block.timestamp >= license.endDate && license.status == LicenseStatus.Active) {
            LicenseStatus oldStatus = license.status;
            license.status = LicenseStatus.Expired;
            license.lastUpdated = block.timestamp;
            
            emit LicenseExpired(_licenseId, block.timestamp);
            emit LicenseStatusUpdated(_licenseId, oldStatus, LicenseStatus.Expired, msg.sender);
        }
    }
    
    /**
     * @dev Grant revocation authorization
     */
    function grantRevokeAuthorization(uint256 _licenseId, address _authorizedRevoker)
        external
        validLicense(_licenseId)
        onlyLicenseParticipant(_licenseId)
    {
        require(_authorizedRevoker != address(0), "Invalid authorizer address");
        revokeAuthorizations[_licenseId][_authorizedRevoker] = true;
    }
    
    /**