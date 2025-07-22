// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title ComplianceModule
 * @dev Basic KYC/AML compliance framework
 */
contract ComplianceModule is Ownable, AccessControl {
    
    // Role definitions
    bytes32 public constant COMPLIANCE_OFFICER_ROLE = keccak256("COMPLIANCE_OFFICER_ROLE");
    bytes32 public constant KYC_PROVIDER_ROLE = keccak256("KYC_PROVIDER_ROLE");
    
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
        uint256 lastUpdated;
    }
    
    // Mapping from address to compliance record
    mapping(address => ComplianceRecord) public complianceRecords;
    
    // Global settings
    bool public complianceRequired = true;
    uint256 public defaultExpirationPeriod = 365 days;
    
    // Events
    event ComplianceStatusUpdated(
        address indexed user,
        ComplianceStatus oldStatus,
        ComplianceStatus newStatus,
        address indexed updatedBy
    );
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(COMPLIANCE_OFFICER_ROLE, msg.sender);
    }
    
    /**
     * @dev Check if an address is compliant
     */
    function isCompliant(address _user) external view returns (bool) {
        if (!complianceRequired) {
            return true;
        }
        
        ComplianceRecord memory record = complianceRecords[_user];
        
        if (record.status != ComplianceStatus.Verified) {
            return false;
        }
        
        if (block.timestamp > record.expiresAt) {
            return false;
        }
        
        return true;
    }
    
    /**
     * @dev Update compliance status
     */
    function updateComplianceStatus(
        address _user,
        ComplianceStatus _newStatus
    ) external onlyRole(COMPLIANCE_OFFICER_ROLE) {
        ComplianceRecord storage record = complianceRecords[_user];
        ComplianceStatus oldStatus = record.status;
        
        record.status = _newStatus;
        record.lastUpdated = block.timestamp;
        
        if (_newStatus == ComplianceStatus.Verified) {
            record.verifiedAt = block.timestamp;
            record.expiresAt = block.timestamp + defaultExpirationPeriod;
            record.verifiedBy = msg.sender;
        }
        
        emit ComplianceStatusUpdated(_user, oldStatus, _newStatus, msg.sender);
    }
}