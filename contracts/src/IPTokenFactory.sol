// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./IPToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title IPTokenFactory
 * @dev Basic factory for deploying IP tokens
 */
contract IPTokenFactory is Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    // Mapping from token ID to IP token contract address
    mapping(uint256 => address) public ipTokens;
    
    struct IPTokenInfo {
        uint256 tokenId;
        address tokenContract;
        address creator;
        string metadataURI;
        uint256 totalSupply;
        uint256 royaltyRate;
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
        uint256 totalSupply
    );
    
    constructor() {}
    
    /**
     * @dev Creates a new IP token contract
     */
    function createIPToken(
        string memory _metadataURI,
        uint256 _supply,
        uint256 _royaltyRate,
        string memory _name,
        string memory _symbol
    ) external returns (uint256 tokenId) {
        require(_supply > 0, "Supply must be greater than 0");
        require(bytes(_metadataURI).length > 0, "Metadata URI required");
        require(_royaltyRate <= 5000, "Royalty rate too high");
        
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
            createdAt: block.timestamp,
            isActive: true
        });
        
        emit TokenCreated(
            tokenId,
            tokenAddress,
            msg.sender,
            _metadataURI,
            _supply
        );
        
        return tokenId;
    }
    
    /**
     * @dev Gets token information by ID
     */
    function getTokenInfo(uint256 _tokenId) external view returns (IPTokenInfo memory) {
        require(_tokenId > 0 && _tokenId <= _tokenIdCounter.current(), "Invalid token ID");
        return tokenInfo[_tokenId];
    }
    
    /**
     * @dev Gets the current token counter value
     */
    function getCurrentTokenId() external view returns (uint256) {
        return _tokenIdCounter.current();
    }
}