// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./RoyaltyEngine.sol";
import "./ComplianceModule.sol";

/**
 * @title IPToken
 * @dev ERC-20/HTS-compatible token representing fractional ownership of a specific IP asset
 * Embeds royalty terms in contract state
 */
contract IPToken is ERC20, Ownable, ReentrancyGuard {
    
    struct LicenseTerms {
        uint256 duration; // License duration in seconds
        uint256 fee; // License fee in stablecoin
        string territory; // Geographic territory
        string field; // Field of use
        bool exclusive; // Whether license is exclusive
        string additionalTerms; // Additional terms hash/URI
    }
    
    // Core token properties
    uint256 public royaltyRate; // In basis points (e.g., 500 = 5%)
    address public factory; // Factory contract that created this token
    address public royaltyEngine;
    ComplianceModule public complianceModule;
    
    // IP-specific metadata
    string public ipMetadataURI;
    address public originalCreator;
    uint256 public creationTimestamp;
    
    // License management
    mapping(address => uint256) public activeLicenses; // licensee => license count
    mapping(uint256 => LicenseTerms) public licenseTemplates;
    uint256 public nextLicenseTemplateId = 1;
    
    // Transfer restrictions
    bool public transferRestricted = false;
    mapping(address => bool) public authorizedTransferees;
    
    // Events
    event LicenseRequested(
        address indexed licensee,
        uint256 indexed templateId,
        uint256 fee,
        uint256 duration
    );
    
    event RoyaltyRateUpdated(
        uint256 oldRate,
        uint256 newRate,
        address updatedBy
    );
    
    event LicenseTemplateCreated(
        uint256 indexed templateId,
        uint256 fee,
        uint256 duration,
        bool exclusive
    );
    
    event TransferRestrictionUpdated(
        bool restricted,
        address updatedBy
    );
    
    event AuthorizedTransfereeUpdated(
        address indexed transferee,
        bool authorized
    );
    
    // Modifiers
    modifier onlyCompliant(address _address) {
        require(complianceModule.isCompliant(_address), "Address not compliant");
        _;
    }
    
    modifier onlyFactory() {
        require(msg.sender == factory, "Only factory can call");
        _;
    }
    
    modifier validRoyaltyRate(uint256 _rate) {
        require(_rate <= 5000, "Royalty rate too high"); // Max 50%
        _;
    }
    
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply,
        address _creator,
        uint256 _royaltyRate,
        address _factory
    ) ERC20(_name, _symbol) {
        require(_totalSupply > 0, "Total supply must be greater than 0");
        require(_creator != address(0), "Invalid creator address");
        require(_royaltyRate <= 5000, "Royalty rate too high");
        require(_factory != address(0), "Invalid factory address");
        
        originalCreator = _creator;
        royaltyRate = _royaltyRate;
        factory = _factory;
        creationTimestamp = block.timestamp;
        
        // Mint all tokens to creator initially
        _mint(_creator, _totalSupply);
        
        // Transfer ownership to creator
        _transferOwnership(_creator);
    }
    
    /**
     * @dev Set the royalty engine address (only factory)
     * @param _royaltyEngine Address of the royalty engine
     */
    function setRoyaltyEngine(address _royaltyEngine) external onlyFactory {
        require(_royaltyEngine != address(0), "Invalid royalty engine address");
        royaltyEngine = _royaltyEngine;
    }
    
    /**
     * @dev Set the compliance module address (only factory)
     * @param _complianceModule Address of the compliance module
     */
    function setComplianceModule(address _complianceModule) external onlyFactory {
        require(_complianceModule != address(0), "Invalid compliance module address");
        complianceModule = ComplianceModule(_complianceModule);
    }
    
    /**
     * @dev Set IP metadata URI (only owner)
     * @param _metadataURI New metadata URI
     */
    function setMetadataURI(string memory _metadataURI) external onlyOwner {
        require(bytes(_metadataURI).length > 0, "Metadata URI required");
        ipMetadataURI = _metadataURI;
    }
    
    /**
     * @dev Standard token transfer with optional compliance restrictions
     * @param to Recipient address
     * @param amount Transfer amount
     * @return Success boolean
     */
    function transfer(address to, uint256 amount) 
        public 
        override 
        onlyCompliant(msg.sender)
        onlyCompliant(to)
        returns (bool) 
    {
        if (transferRestricted) {
            require(
                authorizedTransferees[to] || to == owner(),
                "Transfer to unauthorized address"
            );
        }
        
        return super.transfer(to, amount);
    }
    
    /**
     * @dev Standard token transferFrom with optional compliance restrictions
     * @param from Sender address
     * @param to Recipient address  
     * @param amount Transfer amount
     * @return Success boolean
     */
    function transferFrom(address from, address to, uint256 amount)
        public
        override
        onlyCompliant(from)
        onlyCompliant(to)
        returns (bool)
    {
        if (transferRestricted) {
            require(
                authorizedTransferees[to] || to == owner(),
                "Transfer to unauthorized address"
            );
        }
        
        return super.transferFrom(from, to, amount);
    }
    
    /**
     * @dev Create a license template for this IP
     * @param _terms License terms structure
     * @return templateId ID of the created template
     */
    function createLicenseTemplate(LicenseTerms memory _terms)
        external
        onlyOwner
        returns (uint256 templateId)
    {
        require(_terms.duration > 0, "Duration must be positive");
        require(_terms.fee > 0, "Fee must be positive");
        require(bytes(_terms.territory).length > 0, "Territory required");
        require(bytes(_terms.field).length > 0, "Field required");
        
        templateId = nextLicenseTemplateId++;
        licenseTemplates[templateId] = _terms;
        
        emit LicenseTemplateCreated(
            templateId,
            _terms.fee,
            _terms.duration,
            _terms.exclusive
        );
        
        return templateId;
    }
    
    /**
     * @dev Initiate licensing via RoyaltyEngine
     * @param _templateId License template ID
     * @return Success boolean
     */
    function requestLicense(uint256 _templateId)
        external
        nonReentrant
        onlyCompliant(msg.sender)
        returns (bool)
    {
        require(royaltyEngine != address(0), "Royalty engine not set");
        require(licenseTemplates[_templateId].duration > 0, "Invalid template");
        
        LicenseTerms memory terms = licenseTemplates[_templateId];
        
        // If exclusive license, ensure no other active licenses
        if (terms.exclusive) {
            require(activeLicenses[msg.sender] == 0, "Exclusive license conflict");
        }
        
        // Call royalty engine to handle license payment and registration
        RoyaltyEngine(royaltyEngine).processLicense(
            address(this),
            msg.sender,
            terms.fee,
            terms.duration,
            _templateId
        );
        
        activeLicenses[msg.sender]++;
        
        emit LicenseRequested(
            msg.sender,
            _templateId,
            terms.fee,
            terms.duration
        );
        
        return true;
    }
    
    /**
     * @dev Update royalty rate (only owner)
     * @param _newRate New royalty rate in basis points
     */
    function updateRoyaltyRate(uint256 _newRate) 
        external 
        onlyOwner 
        validRoyaltyRate(_newRate) 
    {
        uint256 oldRate = royaltyRate;
        royaltyRate = _newRate;
        
        emit RoyaltyRateUpdated(oldRate, _newRate, msg.sender);
    }
    
    /**
     * @dev Set transfer restrictions (only owner)
     * @param _restricted Whether transfers should be restricted
     */
    function setTransferRestricted(bool _restricted) external onlyOwner {
        transferRestricted = _restricted;
        
        emit TransferRestrictionUpdated(_restricted, msg.sender);
    }
    
    /**
     * @dev Authorize/deauthorize addresses for restricted transfers (only owner)
     * @param _transferee Address to authorize/deauthorize
     * @param _authorized Authorization status
     */
    function setAuthorizedTransferee(address _transferee, bool _authorized) 
        external 
        onlyOwner 
    {
        require(_transferee != address(0), "Invalid transferee address");
        authorizedTransferees[_transferee] = _authorized;
        
        emit AuthorizedTransfereeUpdated(_transferee, _authorized);
    }
    
    /**
     * @dev Get license template information
     * @param _templateId Template ID
     * @return License terms
     */
    function getLicenseTemplate(uint256 _templateId) 
        external 
        view 
        returns (LicenseTerms memory) 
    {
        return licenseTemplates[_templateId];
    }
    
    /**
     * @dev Get token information summary
     * @return Token information struct
     */
    function getTokenInfo() external view returns (
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        uint256 royaltyRateValue,
        address creator,
        uint256 createdAt,
        string memory metadataURI
    ) {
        return (
            name(),
            symbol(),
            totalSupply(),
            royaltyRate,
            originalCreator,
            creationTimestamp,
            ipMetadataURI
        );
    }
    
    /**
     * @dev Check if address has active licenses
     * @param _licensee Address to check
     * @return Number of active licenses
     */
    function getActiveLicenseCount(address _licensee) 
        external 
        view 
        returns (uint256) 
    {
        return activeLicenses[_licensee];
    }
    
    /**
     * @dev Reduce active license count (only royalty engine)
     * @param _licensee Licensee address
     */
    function reduceLicenseCount(address _licensee) external {
        require(msg.sender == royaltyEngine, "Only royalty engine can call");
        require(activeLicenses[_licensee] > 0, "No active licenses");
        activeLicenses[_licensee]--;
    }
}
