// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./IPToken.sol";
import "./LicenseRegistry.sol";

/**
 * @title RoyaltyEngine
 * @dev Automates calculation and distribution of royalties to token holders
 * Executes stablecoin payouts via Hedera-compatible payment channels
 */
contract RoyaltyEngine is Ownable, ReentrancyGuard {
    using SafeMath for uint256;
    
    // Supported stablecoin for payments (e.g., USDC)
    IERC20 public stablecoin;
    LicenseRegistry public licenseRegistry;
    
    struct RoyaltyPool {
        uint256 totalCollected;      // Total royalties collected
        uint256 totalDistributed;    // Total royalties distributed
        uint256 pendingDistribution; // Pending distribution amount
        uint256 lastDistributionTime; // Last distribution timestamp
        mapping(address => uint256) holderClaims; // Amount claimable by each holder
        mapping(address => uint256) totalClaimed; // Total claimed by each holder
    }
    
    struct LicensePayment {
        address tokenContract;
        address licensee;
        uint256 amount;
        uint256 timestamp;
        uint256 licenseId;
        bool processed;
    }
    
    // Mapping from IP token address to royalty pool
    mapping(address => RoyaltyPool) public royaltyPools;
    
    // Mapping from payment ID to license payment
    mapping(uint256 => LicensePayment) public licensePayments;
    uint256 public nextPaymentId = 1;
    
    // Platform fee (in basis points, e.g., 250 = 2.5%)
    uint256 public platformFeeRate = 250;
    address public platformFeeRecipient;
    
    // Minimum distribution threshold
    uint256 public minimumDistributionThreshold = 100 * 10**6; // 100 USDC (assuming 6 decimals)
    
    // Events
    event LicenseFeeRecorded(
        uint256 indexed paymentId,
        address indexed tokenContract,
        address indexed licensee,
        uint256 amount,
        uint256 licenseId
    );
    
    event RoyaltiesDistributed(
        address indexed tokenContract,
        uint256 totalAmount,
        uint256 holderCount,
        uint256 timestamp
    );
    
    event RoyaltyClaimed(
        address indexed tokenContract,
        address indexed holder,
        uint256 amount
    );
    
    event PlatformFeeCollected(
        address indexed tokenContract,
        uint256 amount
    );
    
    event PlatformFeeRateUpdated(
        uint256 oldRate,
        uint256 newRate
    );
    
    event StablecoinUpdated(
        address oldStablecoin,
        address newStablecoin
    );
    
    // Modifiers
    modifier validTokenContract(address _tokenContract) {
        require(_tokenContract != address(0), "Invalid token contract");
        // Additional validation could be added here
        _;
    }
    
    constructor(
        address _stablecoin,
        address _licenseRegistry,
        address _platformFeeRecipient
    ) {
        require(_stablecoin != address(0), "Invalid stablecoin address");
        require(_licenseRegistry != address(0), "Invalid license registry address");
        require(_platformFeeRecipient != address(0), "Invalid platform fee recipient");
        
        stablecoin = IERC20(_stablecoin);
        licenseRegistry = LicenseRegistry(_licenseRegistry);
        platformFeeRecipient = _platformFeeRecipient;
    }
    
    /**
     * @dev Process a license payment and record fee
     * @param _tokenContract Address of the IP token contract
     * @param _licensee Address of the licensee
     * @param _amount License fee amount
     * @param _duration License duration
     * @param _templateId License template ID
     */
    function processLicense(
        address _tokenContract,
        address _licensee,
        uint256 _amount,
        uint256 _duration,
        uint256 _templateId
    ) 
        external
        nonReentrant
        validTokenContract(_tokenContract)
        returns (uint256 licenseId)
    {
        require(msg.sender == _tokenContract, "Only token contract can call");
        require(_licensee != address(0), "Invalid licensee address");
        require(_amount > 0, "Amount must be positive");
        
        // Transfer stablecoin from licensee to this contract
        require(
            stablecoin.transferFrom(_licensee, address(this), _amount),
            "Stablecoin transfer failed"
        );
        
        // Register license in registry
        licenseId = licenseRegistry.registerLicense(
            _tokenContract,
            _licensee,
            block.timestamp,
            block.timestamp + _duration,
            _templateId
        );
        
        // Record the license payment
        uint256 paymentId = nextPaymentId++;
        licensePayments[paymentId] = LicensePayment({
            tokenContract: _tokenContract,
            licensee: _licensee,
            amount: _amount,
            timestamp: block.timestamp,
            licenseId: licenseId,
            processed: false
        });
        
        // Record license fee for royalty distribution
        _recordLicenseFee(_tokenContract, _amount, paymentId);
        
        emit LicenseFeeRecorded(
            paymentId,
            _tokenContract,
            _licensee,
            _amount,
            licenseId
        );
        
        return licenseId;
    }
    
    /**
     * @dev Record license fee for a given IP token (internal)
     * @param _tokenContract Address of the IP token contract
     * @param _amount License fee amount
     * @param _paymentId Payment ID for tracking
     */
    function _recordLicenseFee(
        address _tokenContract,
        uint256 _amount,
        uint256 _paymentId
    ) internal {
        // Calculate platform fee
        uint256 platformFee = _amount.mul(platformFeeRate).div(10000);
        uint256 royaltyAmount = _amount.sub(platformFee);
        
        // Transfer platform fee
        if (platformFee > 0) {
            require(
                stablecoin.transfer(platformFeeRecipient, platformFee),
                "Platform fee transfer failed"
            );
            
            emit PlatformFeeCollected(_tokenContract, platformFee);
        }
        
        // Add to royalty pool
        RoyaltyPool storage pool = royaltyPools[_tokenContract];
        pool.totalCollected = pool.totalCollected.add(royaltyAmount);
        pool.pendingDistribution = pool.pendingDistribution.add(royaltyAmount);
        
        // Mark payment as processed
        licensePayments[_paymentId].processed = true;
    }
    
    /**
     * @dev Distribute royalties pro-rata to all token holders
     * @param _tokenContract Address of the IP token contract
     */
    function distributeRoyalties(address _tokenContract)
        external
        nonReentrant
        validTokenContract(_tokenContract)
    {
        RoyaltyPool storage pool = royaltyPools[_tokenContract];
        require(
            pool.pendingDistribution >= minimumDistributionThreshold,
            "Below minimum distribution threshold"
        );
        
        IPToken tokenContract = IPToken(_tokenContract);
        uint256 totalSupply = tokenContract.totalSupply();
        require(totalSupply > 0, "No tokens in circulation");
        
        uint256 distributionAmount = pool.pendingDistribution;
        
        // Get all unique token holders (this is a simplified approach)
        // In practice, you might need to maintain a holder registry or use events
        address[] memory holders = _getTokenHolders(_tokenContract);
        
        uint256 distributedAmount = 0;
        uint256 holderCount = 0;
        
        for (uint256 i = 0; i < holders.length; i++) {
            address holder = holders[i];
            uint256 balance = tokenContract.balanceOf(holder);
            
            if (balance > 0) {
                uint256 holderShare = distributionAmount.mul(balance).div(totalSupply);
                
                if (holderShare > 0) {
                    pool.holderClaims[holder] = pool.holderClaims[holder].add(holderShare);
                    distributedAmount = distributedAmount.add(holderShare);
                    holderCount++;
                }
            }
        }
        
        // Update pool state
        pool.pendingDistribution = pool.pendingDistribution.sub(distributedAmount);
        pool.totalDistributed = pool.totalDistributed.add(distributedAmount);
        pool.lastDistributionTime = block.timestamp;
        
        emit RoyaltiesDistributed(
            _tokenContract,
            distributedAmount,
            holderCount,
            block.timestamp
        );
    }
    
    /**
     * @dev Allow holders to claim their pending royalty payouts
     * @param _tokenContract Address of the IP token contract
     */
    function claim(address _tokenContract) 
        external 
        nonReentrant 
        validTokenContract(_tokenContract) 
    {
        RoyaltyPool storage pool = royaltyPools[_tokenContract];
        uint256 claimableAmount = pool.holderClaims[msg.sender];
        
        require(claimableAmount > 0, "No claimable royalties");
        
        // Reset claimable amount
        pool.holderClaims[msg.sender] = 0;
        pool.totalClaimed[msg.sender] = pool.totalClaimed[msg.sender].add(claimableAmount);
        
        // Transfer stablecoin to holder
        require(
            stablecoin.transfer(msg.sender, claimableAmount),
            "Royalty transfer failed"
        );
        
        emit RoyaltyClaimed(_tokenContract, msg.sender, claimableAmount);
    }
    
    /**
     * @dev Get claimable amount for a holder
     * @param _tokenContract Address of the IP token contract
     * @param _holder Holder address
     * @return Claimable amount
     */
    function getClaimableAmount(address _tokenContract, address _holder)
        external
        view
        returns (uint256)
    {
        return royaltyPools[_tokenContract].holderClaims[_holder];
    }
    
    /**
     * @dev Get royalty pool information
     * @param _tokenContract Address of the IP token contract
     * @return Pool information
     */
    function getRoyaltyPoolInfo(address _tokenContract)
        external
        view
        returns (
            uint256 totalCollected,
            uint256 totalDistributed,
            uint256 pendingDistribution,
            uint256 lastDistributionTime
        )
    {
        RoyaltyPool storage pool = royaltyPools[_tokenContract];
        return (
            pool.totalCollected,
            pool.totalDistributed,
            pool.pendingDistribution,
            pool.lastDistributionTime
        );
    }
    
    /**
     * @dev Get total claimed by a holder
     * @param _tokenContract Address of the IP token contract
     * @param _holder Holder address
     * @return Total claimed amount
     */
    function getTotalClaimed(address _tokenContract, address _holder)
        external
        view
        returns (uint256)
    {
        return royaltyPools[_tokenContract].totalClaimed[_holder];
    }
    
    /**
     * @dev Update platform fee rate (only owner)
     * @param _newRate New platform fee rate in basis points
     */
    function updatePlatformFeeRate(uint256 _newRate) external onlyOwner {
        require(_newRate <= 1000, "Platform fee too high"); // Max 10%
        
        uint256 oldRate = platformFeeRate;
        platformFeeRate = _newRate;
        
        emit PlatformFeeRateUpdated(oldRate, _newRate);
    }
    
    /**
     * @dev Update platform fee recipient (only owner)
     * @param _newRecipient New platform fee recipient
     */
    function updatePlatformFeeRecipient(address _newRecipient) external onlyOwner {
        require(_newRecipient != address(0), "Invalid recipient address");
        platformFeeRecipient = _newRecipient;
    }
    
    /**
     * @dev Update stablecoin address (only owner)
     * @param _newStablecoin New stablecoin address
     */
    function updateStablecoin(address _newStablecoin) external onlyOwner {
        require(_newStablecoin != address(0), "Invalid stablecoin address");
        
        address oldStablecoin = address(stablecoin);
        stablecoin = IERC20(_newStablecoin);
        
        emit StablecoinUpdated(oldStablecoin, _newStablecoin);
    }
    
    /**
     * @dev Update minimum distribution threshold (only owner)
     * @param _newThreshold New minimum threshold
     */
    function updateMinimumDistributionThreshold(uint256 _newThreshold) external onlyOwner {
        minimumDistributionThreshold = _newThreshold;
    }
    
    /**
     * @dev Get token holders (simplified implementation)
     * @param _tokenContract Address of the IP token contract
     * @return Array of holder addresses
     */
    function _getTokenHolders(address _tokenContract) 
        internal 
        view 
        returns (address[] memory) 
    {
        // This is a simplified implementation
        // In practice, you would maintain a registry of holders or use events to track them
        // For now, returning an empty array - this would need to be implemented based on your needs
        address[] memory holders = new address[](0);
        return holders;
    }
    
    /**
     * @dev Emergency withdraw function (only owner)
     * @param _amount Amount to withdraw
     */
    function emergencyWithdraw(uint256 _amount) external onlyOwner {
        require(_amount <= stablecoin.balanceOf(address(this)), "Insufficient balance");
        require(stablecoin.transfer(owner(), _amount), "Transfer failed");
    }
}
