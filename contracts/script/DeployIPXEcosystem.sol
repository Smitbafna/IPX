// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/IPXEcosystem.sol";
import "../src/ComplianceModule.sol";
import "../src/IPTokenFactory.sol";
import "../src/RoyaltyEngine.sol";
import "../src/LicenseRegistry.sol";

/**
 * @title DeployIPXEcosystem
 * @dev Deployment script for the complete IPX ecosystem on Hedera
 */
contract DeployIPXEcosystem is Script {
    
    // Hedera testnet configuration
    address constant HEDERA_USDC = 0x0000000000000000000000000000000000068cda; // Hedera testnet USDC
    address constant PLATFORM_FEE_RECIPIENT = 0x1234567890123456789012345678901234567890; // Replace with actual address
    address constant EMERGENCY_OPERATOR = 0x1234567890123456789012345678901234567890; // Replace with actual address
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying IPX Ecosystem with deployer:", deployer);
        console.log("Deployer balance:", deployer.balance);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy the main ecosystem coordinator
        IPXEcosystem ecosystem = new IPXEcosystem(
            HEDERA_USDC,
            PLATFORM_FEE_RECIPIENT,
            EMERGENCY_OPERATOR
        );
        
        console.log("IPXEcosystem deployed at:", address(ecosystem));
        
        // Initialize the ecosystem (deploys all sub-contracts)
        ecosystem.initializeEcosystem();
        
        console.log("Ecosystem initialized successfully");
        
        // Get deployed contract addresses
        (
            ,
            address[] memory contractAddresses,
            
        ) = ecosystem.getEcosystemOverview();
        
        console.log("IPTokenFactory deployed at:", contractAddresses[0]);
        console.log("RoyaltyEngine deployed at:", contractAddresses[1]);
        console.log("LicenseRegistry deployed at:", contractAddresses[2]);
        console.log("ComplianceModule deployed at:", contractAddresses[3]);
        
        // Verify basic functionality
        console.log("Checking ecosystem operational status:");
        bool isOperational = ecosystem.isEcosystemOperational();
        console.log("Ecosystem operational:", isOperational);
        
        vm.stopBroadcast();
        
        // Save deployment addresses to file
        _saveDeploymentInfo(
            address(ecosystem),
            contractAddresses[0], // IPTokenFactory
            contractAddresses[1], // RoyaltyEngine
            contractAddresses[2], // LicenseRegistry
            contractAddresses[3]  // ComplianceModule
        );
    }
    
    function _saveDeploymentInfo(
        address ecosystem,
        address factory,
        address royaltyEngine,
        address licenseRegistry,
        address complianceModule
    ) internal {
        string memory deploymentInfo = string(
            abi.encodePacked(
                "IPX Ecosystem Deployment\n",
                "========================\n",
                "Network: Hedera Testnet\n",
                "Timestamp: ", vm.toString(block.timestamp), "\n",
                "Block: ", vm.toString(block.number), "\n\n",
                "Contract Addresses:\n",
                "IPXEcosystem: ", vm.toString(ecosystem), "\n",
                "IPTokenFactory: ", vm.toString(factory), "\n",
                "RoyaltyEngine: ", vm.toString(royaltyEngine), "\n",
                "LicenseRegistry: ", vm.toString(licenseRegistry), "\n",
                "ComplianceModule: ", vm.toString(complianceModule), "\n\n",
                "Configuration:\n",
                "Stablecoin (USDC): ", vm.toString(HEDERA_USDC), "\n",
                "Platform Fee Recipient: ", vm.toString(PLATFORM_FEE_RECIPIENT), "\n",
                "Emergency Operator: ", vm.toString(EMERGENCY_OPERATOR), "\n"
            )
        );
        
        vm.writeFile("./deployments/hedera-testnet.txt", deploymentInfo);
        console.log("Deployment info saved to ./deployments/hedera-testnet.txt");
    }
}
