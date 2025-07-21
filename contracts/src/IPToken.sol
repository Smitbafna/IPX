
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title IPToken
 * @dev ERC-20 token with licensing capabilities
 */
contract IPToken is ERC20, Ownable {
    
    struct LicenseTerms {
        uint256 duration;
        uint256 fee;
        string territory;
        string field;
        bool exclusive;
        string additionalTerms;
    }
    
    // Core properties
    uint256 public royaltyRate;
    address public factory;
    address public originalCreator;
    uint256 public creationTimestamp;
    string public ipMetadataURI;
    
    // License management
    mapping(uint256 => LicenseTerms) public licenseTemplates;
    uint256 public nextLicenseTemplateId = 1;
    
    // Events
    event LicenseTemplateCreated(uint256 indexed templateId, uint256 fee, bool exclusive);
    
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply,
        address _creator,
        uint256 _royaltyRate,
        address _factory
    ) ERC20(_name, _symbol) {
        require(_totalSupply > 0, "Invalid supply");
        require(_creator != address(0), "Invalid creator");
        require(_factory != address(0), "Invalid factory");
        
        originalCreator = _creator;
        royaltyRate = _royaltyRate;
        factory = _factory;
        creationTimestamp = block.timestamp;
        
        _mint(_creator, _totalSupply);
        _transferOwnership(_creator);
    }
    
    function createLicenseTemplate(LicenseTerms memory _terms) external onlyOwner returns (uint256) {
        require(_terms.duration > 0, "Invalid duration");
        require(_terms.fee > 0, "Invalid fee");
        
        uint256 templateId = nextLicenseTemplateId++;
        licenseTemplates[templateId] = _terms;
        
        emit LicenseTemplateCreated(templateId, _terms.fee, _terms.exclusive);
        return templateId;
    }
    
    function setMetadataURI(string memory _metadataURI) external onlyOwner {
        ipMetadataURI = _metadataURI;
    }
}