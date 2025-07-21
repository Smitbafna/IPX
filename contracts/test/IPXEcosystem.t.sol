// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/IPXEcosystem.sol";
import "../src/IPTokenFactory.sol";
import "../src/IPToken.sol";
import "../src/RoyaltyEngine.sol";
import "../src/LicenseRegistry.sol";
import "../src/ComplianceModule.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Mock USDC token for testing
contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USDC", "USDC") {
        _mint(msg.sender, 1000000 * 10**6); // 1M USDC with 6 decimals
    }
    
    function decimals() public pure override returns (uint8) {
        return 6;
    }
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract IPXEcosystemTest is Test {
    IPXEcosystem public ecosystem;
    IPTokenFactory public factory;
    RoyaltyEngine public royaltyEngine;
    LicenseRegistry public licenseRegistry;
    ComplianceModule public complianceModule;
    MockUSDC public usdc;
    
    address public owner;
    address public creator;
    address public licensee;
    address public platformFeeRecipient;
    address public emergencyOperator;
    
    // Test constants
    uint256 constant INITIAL_SUPPLY = 1000 * 10**18; // 1000 tokens
    uint256 constant ROYALTY_RATE = 500; // 5%
    uint256 constant LICENSE_FEE = 1000 * 10**6; // 1000 USDC
    
    function setUp() public {
        owner = address(this);
        creator = makeAddr("creator");
        licensee = makeAddr("licensee");
        platformFeeRecipient = makeAddr("platformFeeRecipient");
        emergencyOperator = makeAddr("emergencyOperator");
        
        // Deploy mock USDC
        usdc = new MockUSDC();
        
        // Deploy ecosystem
        ecosystem = new IPXEcosystem(
            address(usdc),
            platformFeeRecipient,
            emergencyOperator
        );
        
        // Initialize ecosystem
        ecosystem.initializeEcosystem();
        
        // Get contract references
        (
            ,
            address[] memory contractAddresses,
            
        ) = ecosystem.getEcosystemOverview();
        
        factory = IPTokenFactory(contractAddresses[0]);
        royaltyEngine = RoyaltyEngine(contractAddresses[1]);
        licenseRegistry = LicenseRegistry(contractAddresses[2]);
        complianceModule = ComplianceModule(contractAddresses[3]);
        
        // Setup test accounts with USDC
        usdc.mint(creator, 10000 * 10**6); // 10,000 USDC
        usdc.mint(licensee, 10000 * 10**6); // 10,000 USDC
        
        // Verify creator and licensee for compliance
        ecosystem.quickVerifyUser(creator, "US", false);
        ecosystem.quickVerifyUser(licensee, "US", false);
    }
    
    function testEcosystemInitialization() public {
        assertTrue(ecosystem.isEcosystemOperational());
        
        (
            IPXEcosystem.EcosystemStats memory stats,
            address[] memory contractAddresses,
            bool[] memory statuses
        ) = ecosystem.getEcosystemOverview();
        
        assertEq(stats.totalTokensCreated, 0);
        assertEq(stats.totalLicensesIssued, 0);
        assertEq(stats.totalVerifiedUsers, 2); // creator and licensee
        
        assertTrue(statuses[0]); // ecosystemActive
        assertFalse(statuses[1]); // emergencyPaused
        assertFalse(statuses[2]); // hcsEnabled
        
        // Check all contracts are deployed
        assertNotEq(contractAddresses[0], address(0)); // factory
        assertNotEq(contractAddresses[1], address(0)); // royaltyEngine
        assertNotEq(contractAddresses[2], address(0)); // licenseRegistry
        assertNotEq(contractAddresses[3], address(0)); // complianceModule
    }
    
    function testIPTokenCreation() public {
        vm.startPrank(creator);
        
        uint256 tokenId = ecosystem.createIPToken(
            "https://ipfs.io/metadata/test",
            INITIAL_SUPPLY,
            ROYALTY_RATE,
            "Test IP Token",
            "TIP"
        );
        
        assertEq(tokenId, 1);
        
        // Verify token was created
        address tokenContract = factory.ipTokens(tokenId);
        assertNotEq(tokenContract, address(0));
        
        IPToken token = IPToken(tokenContract);
        assertEq(token.name(), "Test IP Token");
        assertEq(token.symbol(), "TIP");
        assertEq(token.totalSupply(), INITIAL_SUPPLY);
        assertEq(token.royaltyRate(), ROYALTY_RATE);
        assertEq(token.balanceOf(creator), INITIAL_SUPPLY);
        
        vm.stopPrank();
    }
    
    function testLicenseCreationAndPayment() public {
        // Create IP token first
        vm.prank(creator);
        uint256 tokenId = ecosystem.createIPToken(
            "https://ipfs.io/metadata/test",
            INITIAL_SUPPLY,
            ROYALTY_RATE,
            "Test IP Token",
            "TIP"
        );
        
        address tokenContract = factory.ipTokens(tokenId);
        IPToken token = IPToken(tokenContract);
        
        // Create license template
        vm.prank(creator);
        IPToken.LicenseTerms memory terms = IPToken.LicenseTerms({
            duration: 365 days,
            fee: LICENSE_FEE,
            territory: "US",
            field: "Software",
            exclusive: false,
            additionalTerms: "Standard terms"
        });
        
        uint256 templateId = token.createLicenseTemplate(terms);
        assertEq(templateId, 1);
        
        // Approve USDC spending
        vm.prank(licensee);
        usdc.approve(address(royaltyEngine), LICENSE_FEE);
        
        // Request license
        vm.prank(licensee);
        bool success = token.requestLicense(templateId);
        assertTrue(success);
        
        // Verify license was registered
        uint256 totalLicenses = licenseRegistry.getTotalLicenses();
        assertEq(totalLicenses, 1);
        
        LicenseRegistry.License memory license = licenseRegistry.getLicense(1);
        assertEq(license.tokenContract, tokenContract);
        assertEq(license.licensee, licensee);
        assertEq(license.fee, LICENSE_FEE);
        assertEq(uint256(license.status), uint256(LicenseRegistry.LicenseStatus.Active));
    }
    
    function testRoyaltyDistribution() public {
        // Create IP token and license (similar to above test)
        vm.prank(creator);
        uint256 tokenId = ecosystem.createIPToken(
            "https://ipfs.io/metadata/test",
            INITIAL_SUPPLY,
            ROYALTY_RATE,
            "Test IP Token",
            "TIP"
        );
        
        address tokenContract = factory.ipTokens(tokenId);
        IPToken token = IPToken(tokenContract);
        
        // Transfer some tokens to another holder for distribution testing
        address holder2 = makeAddr("holder2");
        ecosystem.quickVerifyUser(holder2, "US", false);
        
        vm.prank(creator);
        token.transfer(holder2, INITIAL_SUPPLY / 4); // 25% to holder2
        
        // Create and pay for license
        vm.prank(creator);
        IPToken.LicenseTerms memory terms = IPToken.LicenseTerms({
            duration: 365 days,
            fee: LICENSE_FEE,
            territory: "US",
            field: "Software",
            exclusive: false,
            additionalTerms: "Standard terms"
        });
        uint256 templateId = token.createLicenseTemplate(terms);
        
        vm.prank(licensee);
        usdc.approve(address(royaltyEngine), LICENSE_FEE);
        
        vm.prank(licensee);
        token.requestLicense(templateId);
        
        // Check royalty pool
        (
            uint256 totalCollected,
            uint256 totalDistributed,
            uint256 pendingDistribution,
            
        ) = royaltyEngine.getRoyaltyPoolInfo(tokenContract);
        
        assertGt(pendingDistribution, 0);
        assertEq(totalDistributed, 0);
        
        // Note: Distribution would require implementing holder tracking
        // For now, we verify that royalties were collected
        uint256 expectedRoyalties = LICENSE_FEE * (10000 - royaltyEngine.platformFeeRate()) / 10000;
        assertEq(pendingDistribution, expectedRoyalties);
    }
    
    function testComplianceRestrictions() public {
        // Try to create token with non-compliant address
        address nonCompliantUser = makeAddr("nonCompliant");
        
        vm.prank(nonCompliantUser);
        vm.expectRevert("Address not compliant");
        ecosystem.createIPToken(
            "https://ipfs.io/metadata/test",
            INITIAL_SUPPLY,
            ROYALTY_RATE,
            "Test IP Token",
            "TIP"
        );
        
        // Verify compliance check works
        assertFalse(complianceModule.isCompliant(nonCompliantUser));
        assertTrue(complianceModule.isCompliant(creator));
    }
    
    function testEmergencyPause() public {
        // Test emergency pause by emergency operator
        vm.prank(emergencyOperator);
        ecosystem.emergencyPause(true);
        
        // Try to create token while paused
        vm.prank(creator);
        vm.expectRevert("Ecosystem not active");
        ecosystem.createIPToken(
            "https://ipfs.io/metadata/test",
            INITIAL_SUPPLY,
            ROYALTY_RATE,
            "Test IP Token",
            "TIP"
        );
        
        // Unpause
        vm.prank(emergencyOperator);
        ecosystem.emergencyPause(false);
        
        // Should work again
        vm.prank(creator);
        uint256 tokenId = ecosystem.createIPToken(
            "https://ipfs.io/metadata/test",
            INITIAL_SUPPLY,
            ROYALTY_RATE,
            "Test IP Token",
            "TIP"
        );
        assertEq(tokenId, 1);
    }
    
    function testLicenseRevocation() public {
        // Create token and license
        vm.prank(creator);
        uint256 tokenId = ecosystem.createIPToken(
            "https://ipfs.io/metadata/test",
            INITIAL_SUPPLY,
            ROYALTY_RATE,
            "Test IP Token",
            "TIP"
        );
        
        address tokenContract = factory.ipTokens(tokenId);
        IPToken token = IPToken(tokenContract);
        
        vm.prank(creator);
        IPToken.LicenseTerms memory terms = IPToken.LicenseTerms({
            duration: 365 days,
            fee: LICENSE_FEE,
            territory: "US",
            field: "Software",
            exclusive: false,
            additionalTerms: "Standard terms"
        });
        uint256 templateId = token.createLicenseTemplate(terms);
        
        vm.prank(licensee);
        usdc.approve(address(royaltyEngine), LICENSE_FEE);
        
        vm.prank(licensee);
        token.requestLicense(templateId);
        
        // Revoke license as creator (licensor)
        vm.prank(creator);
        licenseRegistry.revokeLicense(1, "Breach of terms");
        
        // Verify license status
        LicenseRegistry.LicenseStatus status = licenseRegistry.getLicenseStatus(1);
        assertEq(uint256(status), uint256(LicenseRegistry.LicenseStatus.Revoked));
    }
    
    function testAccessControl() public {
        // Test that only owner can update ecosystem settings
        address unauthorized = makeAddr("unauthorized");
        
        vm.prank(unauthorized);
        vm.expectRevert("Ownable: caller is not the owner");
        ecosystem.setEcosystemActive(false);
        
        // Test that owner can update settings
        ecosystem.setEcosystemActive(false);
        assertFalse(ecosystem.ecosystemActive());
        
        ecosystem.setEcosystemActive(true);
        assertTrue(ecosystem.ecosystemActive());
    }
}
