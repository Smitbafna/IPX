// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./ComplianceModule.sol";

/**
 * @title IPToken
 * @dev ERC-20 token with compliance and licensing
 */
contract IPToken is ERC20, Ownable, ReentrancyGuard {
    
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
    ComplianceModule public complianceModule;
    
    // License management
    mapping(uint256 => LicenseTerms) public licenseTemplates;
    uint256 public nextLicenseTemplateId = 1;
    
    // Transfer restrictions
    bool public transferRestricted = false;
    mapping(address => bool) public authorizedTransferees;
    
    // Events
    event LicenseTemplateCreated(uint256 indexed templateId, uint256 fee, bool exclusive);
    event TransferRestrictionUpdated(bool restricted, address updatedBy);
    
    // Modifiers
    modifier onlyCompliant(address _address) {
        require(address(complianceModule) == address(0) || complianceModule.isCompliant(_address), "Not compliant");
        _;
    }
    
    modifier onlyFactory() {
        require(msg.sender == factory, "Only factory");
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
    
    function transfer(address to, uint256 amount) public override onlyCompliant(msg.sender) onlyCompliant(to) returns (bool) {
        if (transferRestricted) {
            require(authorizedTransferees[to] || to == owner(), "Unauthorized transfer");
        }
        return super.transfer(to, amount);
    }
    
    function transferFrom(address from, address to, uint256 amount) public override onlyCompliant(from) onlyCompliant(to) returns (bool) {
        if (transferRestricted) {
            require(authorizedTransferees[to] || to == owner(), "Unauthorized transfer");
        }
        return super.transferFrom(from, to, amount);
    }
    
    function createLicenseTemplate(LicenseTerms memory _terms) external onlyOwner returns (uint256) {
        require(_terms.duration > 0, "Invalid duration");
        require(_terms.fee > 0, "Invalid fee");
        
        uint256 templateId = nextLicenseTemplateId++;
        licenseTemplates[templateId] = _terms;
        
        emit LicenseTemplateCreated(templateId, _terms.fee, _terms.exclusive);
        return templateId;
    }
    
    function setComplianceModule(address _complianceModule) external onlyFactory {
        complianceModule = ComplianceModule(_complianceModule);
    }
    
    function setTransferRestricted(bool _restricted) external onlyOwner {
        transferRestricted = _restricted;
        emit TransferRestrictionUpdated(_restricted, msg.sender);
    }
    
    function setAuthorizedTransferee(address _transferee, bool _authorized) external onlyOwner {
        authorizedTransferees[_transferee] = _authorized;
    }
}