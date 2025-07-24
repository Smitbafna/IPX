// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./IPToken.sol";
import "./ComplianceModule.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title IPTokenFactory
 * @dev Deploys new IP token contracts for each registered piece of intellectual property
 * Mints fractional tokens linked to ownership proof and licensing metadata
 */
contract IPTokenFactory is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    ComplianceModule public complianceModule;
    
    // Mapping from token ID to IP token contract address
    mapping(uint256 => address) public ipTokens;
    // Mapping from proof hash to token ID
    mapping(bytes32 => uint256) public proofToToken;
    // Mapping from creator to their tokens
    mapping(address => uint256[]) public creatorTokens;
    
    struct IPTokenInfo {
        uint256 tokenId;
        address tokenContract;
        address creator;
        string metadataURI;
        uint256 totalSupply;
        uint256 royaltyRate; // In basis points (e.g., 500 = 5%)
        bytes32 proofHash;
        uint256 createdAt;
        bool isActive;
    }
    
    mapping(uint256 => IPTokenInfo) public tokenInfo;
    
    // Events
    event TokenCreated(
        uint256 indexed tokenId,
        address indexed tokenContract,
        address indexed creator,
        string metadataURI,
        uint256 totalSupply,
        uint256 royaltyRate
    );
    
    event ProofLinked(
        uint256 indexed tokenId,
        bytes32 indexed proofHash,
        address indexed creator
    );
    
    event TokenStatusUpdated(
        uint256 indexed tokenId,
        bool isActive
    );
    
    // Modifiers
    modifier onlyCompliant(address _address) {
        require(complianceModule.isCompliant(_address), "Address not compliant");
        _;
    }
    
    modifier validRoyaltyRate(uint256 _royaltyRate) {
        require(_royaltyRate <= 5000, "Royalty rate too high"); // Max 50%
        _;
    }
    
    constructor(address _complianceModule) {
        complianceModule = ComplianceModule(_complianceModule);
    }
    
    /**
     * @dev Creates a new IP token contract with specified parameters
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
        nonReentrant 
        onlyCompliant(msg.sender)
        validRoyaltyRate(_royaltyRate)
        returns (uint256 tokenId) 
    {
        require(_supply > 0, "Supply must be greater than 0");
        require(bytes(_metadataURI).length > 0, "Metadata URI required");
        require(bytes(_name).length > 0, "Name required");
        require(bytes(_symbol).length > 0, "Symbol required");
        
        _tokenIdCounter.increment();
        tokenId = _tokenIdCounter.current();
        
        // Deploy new IPToken contract
        IPToken newToken = new IPToken(
            _name,
            _symbol,
            _supply,
            msg.sender,
            _royaltyRate,
            address(this)
        );
        
        address tokenAddress = address(newToken);
        ipTokens[tokenId] = tokenAddress;
        
        // Store token information
        tokenInfo[tokenId] = IPTokenInfo({
            tokenId: tokenId,
            tokenContract: tokenAddress,
            creator: msg.sender,
            metadataURI: _metadataURI,
            totalSupply: _supply,
            royaltyRate: _royaltyRate,
            proofHash: bytes32(0), // Will be set when proof is registered
            createdAt: block.timestamp,
            isActive: true
        });
        
        // Add to creator's tokens
        creatorTokens[msg.sender].push(tokenId);
        
        emit TokenCreated(
            tokenId,
            tokenAddress,
            msg.sender,
            _metadataURI,
            _supply,
            _royaltyRate
        );
        
        return tokenId;
    }
    
    /**
     * @dev Links on-chain token to off-chain IP proof in registry
     * @param _tokenId The ID of the token to link proof to
     * @param _proofHash Hash of the IP proof document
     */
    function registerProof(uint256 _tokenId, bytes32 _proofHash) 
        external 
        onlyCompliant(msg.sender) 
    {
        require(_tokenId > 0 && _tokenId <= _tokenIdCounter.current(), "Invalid token ID");
        require(tokenInfo[_tokenId].creator == msg.sender, "Not token creator");
        require(_proofHash != bytes32(0), "Invalid proof hash");
        require(proofToToken[_proofHash] == 0, "Proof already registered");
        
        tokenInfo[_tokenId].proofHash = _proofHash;
        proofToToken[_proofHash] = _tokenId;
        
        emit ProofLinked(_tokenId, _proofHash, msg.sender);
    }
    
    /**
     * @dev Updates the active status of a token
     * @param _tokenId The ID of the token to update
     * @param _isActive New active status
     */
    function updateTokenStatus(uint256 _tokenId, bool _isActive) 
        external 
        onlyCompliant(msg.sender) 
    {
        require(_tokenId > 0 && _tokenId <= _tokenIdCounter.current(), "Invalid token ID");
        require(tokenInfo[_tokenId].creator == msg.sender, "Not token creator");
        
        tokenInfo[_tokenId].isActive = _isActive;
        
        emit TokenStatusUpdated(_tokenId, _isActive);
    }
    
    /**
     * @dev Gets token information by ID
     * @param _tokenId The ID of the token
     * @return Token information struct
     */
    function getTokenInfo(uint256 _tokenId) 
        external 
        view 
        returns (IPTokenInfo memory) 
    {
        require(_tokenId > 0 && _tokenId <= _tokenIdCounter.current(), "Invalid token ID");
        return tokenInfo[_tokenId];
    }
    
    /**
     * @dev Gets token ID by proof hash
     * @param _proofHash The proof hash to look up
     * @return Token ID associated with the proof
     */
    function getTokenByProof(bytes32 _proofHash) 
        external 
        view 
        returns (uint256) 
    {
        return proofToToken[_proofHash];
    }
    
    /**
     * @dev Gets all tokens created by a specific creator
     * @param _creator The creator address
     * @return Array of token IDs
     */
    function getCreatorTokens(address _creator) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return creatorTokens[_creator];
    }
    
    /**
     * @dev Gets the current token counter value
     * @return Current token counter
     */
    function getCurrentTokenId() external view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    /**
     * @dev Updates the compliance module address (only owner)
     * @param _newComplianceModule New compliance module address
     */
    function updateComplianceModule(address _newComplianceModule) 
        external 
        onlyOwner 
    {
        require(_newComplianceModule != address(0), "Invalid address");
        complianceModule = ComplianceModule(_newComplianceModule);
    }
    
    /**
     * @dev Emergency function to pause token creation (only owner)
     */
    function pauseFactory() external onlyOwner {
        // Implementation for pausing factory operations
        // This could involve setting a paused state variable
    }
}
