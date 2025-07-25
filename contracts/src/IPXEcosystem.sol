// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IPTokenFactory.sol";
import "./RoyaltyEngine.sol";
import "./LicenseRegistry.sol";
import "./ComplianceModule.sol";

/**
 * @title IPXEcosystem
 * @dev Main coordinator contract for the IPX ecosystem
 * Manages deployment and interaction between all core contracts
 */
contract IPXEcosystem is Ownable, ReentrancyGuard {
    
    // Core contract addresses
    IPTokenFactory public ipTokenFactory;
    RoyaltyEngine public royaltyEngine;
    LicenseRegistry public licenseRegistry;
    ComplianceModule public complianceModule;
    
    // Supported stablecoin for payments
    IERC20 public stablecoin;
    
    // Ecosystem settings
    bool public ecosystemActive = true;
    uint256 public platformFeeRate = 250; // 2.5% in basis points
    address public platformFeeRecipient;
    
    // Hedera Consensus Service integration
    address public hcsTopicId; // Hedera Topic ID for logging events
    bool public hcsEnabled = false;
    
    // Emergency controls
    bool public emergencyPaused = false;
    address public emergencyOperator;
    
    struct EcosystemStats {
        uint256 totalTokensCreated;
        uint256 totalLicensesIssued;
        uint256 totalRoyaltiesDistributed;
        uint256 totalVerifiedUsers;
        uint256 lastUpdated;
    }
    
    EcosystemStats public stats;
    
    // Events for Hedera Consensus Service logging
    event EcosystemInitialized(
        address indexed factory,
        address indexed royaltyEngine,
        address indexed licenseRegistry,
        address complianceModule,
        uint256 timestamp
    );
    
    event TokenCreatedInEcosystem(
        uint256 indexed tokenId,
        address indexed creator,
        address tokenContract,
        uint256 timestamp
    );
    
    event LicenseIssuedInEcosystem(
        uint256 indexed licenseId,
        address indexed tokenContract,
        address indexed licensee,
        uint256 fee,
        uint256 timestamp
    );
    
    event RoyaltiesDistributedInEcosystem(
        address indexed tokenContract,
        uint256 amount,
        uint256 holderCount,
        uint256 timestamp
    );
    
    event ComplianceVerifiedInEcosystem(
        address indexed user,
        string jurisdiction,
        uint256 timestamp
    );
    
    event EcosystemStatusUpdated(
        bool active,
        address updatedBy,
        uint256 timestamp
    );
    
    event EmergencyPauseToggled(
        bool paused,
        address triggeredBy,
        uint256 timestamp
    );
    
    event HCSTopicUpdated(
        address oldTopic,
        address newTopic,
        bool enabled
    );
    
    // Modifiers
    modifier onlyActiveEcosystem() {
        require(ecosystemActive && !emergencyPaused, "Ecosystem not active");
        _;
    }
    
    modifier onlyEmergencyOperator() {
        require(msg.sender == emergencyOperator || msg.sender == owner(), "Not emergency operator");
        _;
    }
    
    constructor(
        address _stablecoin,
        address _platformFeeRecipient,
        address _emergencyOperator
    ) {
        require(_stablecoin != address(0), "Invalid stablecoin address");
        require(_platformFeeRecipient != address(0), "Invalid fee recipient");
        require(_emergencyOperator != address(0), "Invalid emergency operator");
        
        stablecoin = IERC20(_stablecoin);
        platformFeeRecipient = _platformFeeRecipient;
        emergencyOperator = _emergencyOperator;
        
        // Initialize stats
        stats.lastUpdated = block.timestamp;
    }
    
    /**
     * @dev Initialize the ecosystem by deploying all core contracts
     */
    function initializeEcosystem() external onlyOwner {
        require(address(complianceModule) == address(0), "Already initialized");
        
        // Deploy ComplianceModule first
        complianceModule = new ComplianceModule();
        
        // Deploy LicenseRegistry
        licenseRegistry = new LicenseRegistry();
        
        // Deploy RoyaltyEngine
        royaltyEngine = new RoyaltyEngine(
            address(stablecoin),
            address(licenseRegistry),
            platformFeeRecipient
        );
        
        // Deploy IPTokenFactory
        ipTokenFactory = new IPTokenFactory(address(complianceModule));
        
        // Set up cross-contract permissions
        _setupPermissions();
        
        emit EcosystemInitialized(
            address(ipTokenFactory),
            address(royaltyEngine),
            address(licenseRegistry),
            address(complianceModule),
            block.timestamp
        );
    }
    
    /**
     * @dev Set up permissions between contracts
     */
    function _setupPermissions() internal {
        // Authorize RoyaltyEngine to register licenses
        licenseRegistry.setAuthorizedRegistrar(address(royaltyEngine), true);
        
        // Grant necessary roles in ComplianceModule
        complianceModule.grantRole(complianceModule.KYC_PROVIDER_ROLE(), owner());
        complianceModule.grantRole(complianceModule.COMPLIANCE_OFFICER_ROLE(), owner());
        
        // Set up basic compliance settings
        complianceModule.setJurisdictionAllowed("US", true);
        complianceModule.setJurisdictionAllowed("EU", true);
        complianceModule.setJurisdictionAllowed("UK", true);
        complianceModule.setJurisdictionAllowed("CA", true);
        complianceModule.setJurisdictionAllowed("AU", true);
        
        // Authorize a default KYC provider
        complianceModule.setProviderAuthorized("IPX_DEFAULT", true);
    }
    
    /**
     * @dev Create an IP token through the ecosystem
     * @param _metadataURI URI pointing to IP metadata
     * @param _supply Total supply of fractional tokens
     * @param _royaltyRate Royalty rate in basis points
     * @param _name Name of the IP token
     * @param _symbol Symbol of the IP token
     * @return tokenId The ID of the newly created token
     */
    function createIPToken(
        string memory _metadataURI,
        uint256 _supply,
        uint256 _royaltyRate,
        string memory _name,
        string memory _symbol
    ) 
        external 
        onlyActiveEcosystem 
        nonReentrant 
        returns (uint256 tokenId) 
    {
        // Create token through factory
        tokenId = ipTokenFactory.createIPToken(
            _metadataURI,
            _supply,
            _royaltyRate,
            _name,
            _symbol
        );
        
        // Get token contract address
        address tokenContract = ipTokenFactory.ipTokens(tokenId);
        
        // Set up token with ecosystem contracts
        IPToken(tokenContract).setRoyaltyEngine(address(royaltyEngine));
        IPToken(tokenContract).setComplianceModule(address(complianceModule));
        
        // Update stats
        stats.totalTokensCreated++;
        stats.lastUpdated = block.timestamp;
        
        emit TokenCreatedInEcosystem(
            tokenId,
            msg.sender,
            tokenContract,
            block.timestamp
        );
        
        return tokenId;
    }
    
    /**
     * @dev Quick compliance verification for new users
     * @param _user Address to verify
     * @param _jurisdiction Legal jurisdiction
     * @param _isAccreditedInvestor Whether user is accredited investor
     */
    function quickVerifyUser(
        address _user,
        string memory _jurisdiction,
        bool _isAccreditedInvestor
    ) external onlyOwner {
        require(complianceModule.allowedJurisdictions(_jurisdiction), "Jurisdiction not allowed");
        
        complianceModule.verifyAddress(
            _user,
            "IPX_DEFAULT",
            keccak256(abi.encodePacked(_user, block.timestamp)),
            _jurisdiction,
            ComplianceModule.RiskLevel.Low,
            _isAccreditedInvestor
        );
        
        stats.totalVerifiedUsers++;
        stats.lastUpdated = block.timestamp;
        
        emit ComplianceVerifiedInEcosystem(_user, _jurisdiction, block.timestamp);
    }
    
    /**
     * @dev Get ecosystem overview
     * @return Complete ecosystem statistics
     */
    function getEcosystemOverview() external view returns (
        EcosystemStats memory ecosystemStats,
        address[] memory contractAddresses,
        bool[] memory statuses
    ) {
        ecosystemStats = stats;
        
        contractAddresses = new address[](4);
        contractAddresses[0] = address(ipTokenFactory);
        contractAddresses[1] = address(royaltyEngine);
        contractAddresses[2] = address(licenseRegistry);
        contractAddresses[3] = address(complianceModule);
        
        statuses = new bool[](3);
        statuses[0] = ecosystemActive;
        statuses[1] = emergencyPaused;
        statuses[2] = hcsEnabled;
        
        return (ecosystemStats, contractAddresses, statuses);
    }
    
    /**
     * @dev Update ecosystem active status
     * @param _active New active status
     */
    function setEcosystemActive(bool _active) external onlyOwner {
        ecosystemActive = _active;
        
        emit EcosystemStatusUpdated(_active, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Emergency pause toggle
     * @param _paused New pause status
     */
    function emergencyPause(bool _paused) external onlyEmergencyOperator {
        emergencyPaused = _paused;
        
        emit EmergencyPauseToggled(_paused, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Update Hedera Consensus Service settings
     * @param _topicId New HCS topic ID
     * @param _enabled Whether HCS logging is enabled
     */
    function updateHCSSettings(address _topicId, bool _enabled) external onlyOwner {
        address oldTopic = hcsTopicId;
        hcsTopicId = _topicId;
        hcsEnabled = _enabled;
        
        emit HCSTopicUpdated(oldTopic, _topicId, _enabled);
    }
    
    /**
     * @dev Update platform fee settings
     * @param _newRate New platform fee rate
     * @param _newRecipient New fee recipient
     */
    function updatePlatformFeeSettings(uint256 _newRate, address _newRecipient) 
        external 
        onlyOwner 
    {
        require(_newRate <= 1000, "Fee rate too high"); // Max 10%
        require(_newRecipient != address(0), "Invalid recipient");
        
        platformFeeRate = _newRate;
        platformFeeRecipient = _newRecipient;
        
        // Update royalty engine settings
        if (address(royaltyEngine) != address(0)) {
            royaltyEngine.updatePlatformFeeRate(_newRate);
            royaltyEngine.updatePlatformFeeRecipient(_newRecipient);
        }
    }
    
    /**
     * @dev Batch process ecosystem statistics update
     */
    function updateEcosystemStats() external {
        if (address(ipTokenFactory) != address(0)) {
            stats.totalTokensCreated = ipTokenFactory.getCurrentTokenId();
        }
        
        if (address(licenseRegistry) != address(0)) {
            stats.totalLicensesIssued = licenseRegistry.getTotalLicenses();
        }
        
        stats.lastUpdated = block.timestamp;
    }
    
    /**
     * @dev Check if ecosystem is fully operational
     * @return Whether all contracts are deployed and ecosystem is active
     */
    function isEcosystemOperational() external view returns (bool) {
        return (
            address(ipTokenFactory) != address(0) &&
            address(royaltyEngine) != address(0) &&
            address(licenseRegistry) != address(0) &&
            address(complianceModule) != address(0) &&
            ecosystemActive &&
            !emergencyPaused
        );
    }
    
    /**
     * @dev Upgrade contract address (only owner)
     * @param _contractType Type of contract (0=factory, 1=royalty, 2=license, 3=compliance)
     * @param _newAddress New contract address
     */
    function upgradeContract(uint8 _contractType, address _newAddress) 
        external 
        onlyOwner 
    {
        require(_newAddress != address(0), "Invalid address");
        
        if (_contractType == 0) {
            ipTokenFactory = IPTokenFactory(_newAddress);
        } else if (_contractType == 1) {
            royaltyEngine = RoyaltyEngine(_newAddress);
        } else if (_contractType == 2) {
            licenseRegistry = LicenseRegistry(_newAddress);
        } else if (_contractType == 3) {
            complianceModule = ComplianceModule(_newAddress);
        } else {
            revert("Invalid contract type");
        }
    }
    
    /**
     * @dev Emergency function to recover stuck tokens
     * @param _token Token address
     * @param _amount Amount to recover
     */
    function emergencyRecoverTokens(address _token, uint256 _amount) 
        external 
        onlyOwner 
    {
        require(IERC20(_token).transfer(owner(), _amount), "Transfer failed");
    }
}
