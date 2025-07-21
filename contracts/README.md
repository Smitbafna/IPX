# IPX Smart Contract Ecosystem

A comprehensive smart contract architecture for intellectual property tokenization and licensing on the Hedera network.

## Overview

The IPX ecosystem enables creators to tokenize their intellectual property, issue fractional ownership tokens, and automate licensing and royalty distribution. Built specifically for Hedera's high-throughput, low-cost environment with integration to Hedera Consensus Service (HCS) for transparent event logging.

## Architecture

### Core Contracts

1. **IPXEcosystem.sol** - Main coordinator contract
2. **IPTokenFactory.sol** - Deploys and manages IP token contracts
3. **IPToken.sol** - ERC-20 compatible tokens representing IP ownership
4. **RoyaltyEngine.sol** - Automates royalty calculation and distribution
5. **LicenseRegistry.sol** - On-chain license management and tracking
6. **ComplianceModule.sol** - KYC/AML enforcement and compliance

### Contract Flow

```
1. Creator verification (ComplianceModule) → IP token deployment (IPTokenFactory)
2. Token ownership tracked in IPToken contract
3. Licenses issued via IPToken → registered in LicenseRegistry
4. Royalties paid into RoyaltyEngine → distributed to holders
5. All events mirrored to Hedera Consensus Service for transparency
```

## Features

### 🎯 **IP Tokenization**
- Fractional ownership through ERC-20 compatible tokens
- Configurable royalty rates and licensing terms
- Metadata linking to off-chain IP documentation
- Proof-of-ownership registration

### 💰 **Automated Royalties**
- Pro-rata distribution to token holders
- Stablecoin (USDC) payments
- Platform fee collection
- Claimable payout system

### 📄 **License Management**
- On-chain license registry
- Flexible licensing terms (territory, duration, exclusivity)
- Automated license validation
- Revocation mechanisms

### 🔒 **Compliance & Security**
- KYC/AML verification system
- Jurisdiction-based restrictions
- Risk level assessments
- Transfer restrictions for compliance

### ⚡ **Hedera Integration**
- Optimized for Hedera's low fees
- HCS event logging for transparency
- HTS compatibility for native tokens
- Fast finality for real-time operations

## Contract Details

### IPTokenFactory.sol
**Purpose:** Deploys new IP token contracts for each registered piece of intellectual property.

**Key Functions:**
- `createIPToken()` - Deploys new IPToken with specified parameters
- `registerProof()` - Links on-chain token to off-chain IP proof
- `getTokenInfo()` - Retrieves token metadata and stats

### IPToken.sol
**Purpose:** ERC-20 compatible token representing fractional ownership of specific IP assets.

**Key Functions:**
- `transfer()` - Compliance-checked token transfers
- `requestLicense()` - Initiates licensing via RoyaltyEngine
- `createLicenseTemplate()` - Defines licensing terms
- `updateRoyaltyRate()` - Adjusts royalty percentage

### RoyaltyEngine.sol
**Purpose:** Automates calculation and distribution of royalties to token holders.

**Key Functions:**
- `processLicense()` - Handles license payments
- `distributeRoyalties()` - Pro-rata distribution to holders
- `claim()` - Allows holders to claim pending payouts

### LicenseRegistry.sol
**Purpose:** On-chain record of all active and expired licenses.

**Key Functions:**
- `registerLicense()` - Creates immutable license record
- `revokeLicense()` - Cancels license under breach conditions
- `getLicenseStatus()` - Returns current license status

### ComplianceModule.sol
**Purpose:** Enforces KYC/AML checks and compliance requirements.

**Key Functions:**
- `verifyAddress()` - Marks address as KYC/AML verified
- `isCompliant()` - Returns compliance status
- `updateComplianceStatus()` - Manages compliance lifecycle

## Deployment

### Prerequisites
- [Foundry](https://getfoundry.sh/) installed
- Private key with testnet HBAR for deployment
- Access to Hedera testnet

### Deploy to Hedera Testnet

1. **Set environment variables:**
```bash
export PRIVATE_KEY=your_private_key_here
export RPC_URL=https://testnet.hashio.io/api
```

2. **Deploy the ecosystem:**
```bash
forge script script/DeployIPXEcosystem.sol --rpc-url $RPC_URL --broadcast --verify
```

3. **Verify deployment:**
Check the generated `deployments/hedera-testnet.txt` file for contract addresses.

## Testing

Run the comprehensive test suite:

```bash
# Run all tests
forge test

# Run with verbose output
forge test -vvv

# Run specific test
forge test --match-test testIPTokenCreation
```

### Test Coverage
- ✅ Ecosystem initialization
- ✅ IP token creation and management
- ✅ License creation and payment
- ✅ Royalty distribution
- ✅ Compliance restrictions
- ✅ Emergency controls
- ✅ Access control mechanisms

## Configuration

### Hedera-Specific Settings

```solidity
// Hedera testnet USDC address
address constant HEDERA_USDC = 0x0000000000000000000000000000000000068cda;

// Platform fee (2.5%)
uint256 public platformFeeRate = 250;

// Minimum distribution threshold (100 USDC)
uint256 public minimumDistributionThreshold = 100 * 10**6;
```

### Compliance Configuration

```solidity
// Supported jurisdictions
allowedJurisdictions["US"] = true;
allowedJurisdictions["EU"] = true;
allowedJurisdictions["UK"] = true;

// Risk level permissions
riskLevelAllowed[RiskLevel.Low] = true;
riskLevelAllowed[RiskLevel.Medium] = true;
riskLevelAllowed[RiskLevel.High] = false;
```

## Integration Examples

### Creating an IP Token

```solidity
// Verify user compliance first
ecosystem.quickVerifyUser(creator, "US", false);

// Create IP token
uint256 tokenId = ecosystem.createIPToken(
    "https://ipfs.io/metadata/my-ip",
    1000 * 10**18,  // 1000 tokens
    500,            // 5% royalty
    "My IP Token",
    "MIP"
);
```

### Licensing IP

```solidity
// Create license template
IPToken.LicenseTerms memory terms = IPToken.LicenseTerms({
    duration: 365 days,
    fee: 1000 * 10**6,  // 1000 USDC
    territory: "US",
    field: "Software",
    exclusive: false,
    additionalTerms: "Standard license terms"
});

uint256 templateId = ipToken.createLicenseTemplate(terms);

// Request license
usdc.approve(address(royaltyEngine), 1000 * 10**6);
ipToken.requestLicense(templateId);
```

## Security Considerations

- **Access Control:** Role-based permissions for critical functions
- **Reentrancy Protection:** All external calls protected
- **Integer Overflow:** SafeMath usage for calculations
- **Emergency Controls:** Pause mechanisms for critical issues
- **Compliance:** KYC/AML verification before token operations

## Gas Optimization

Optimized for Hedera's low-cost environment:
- Batch operations for multiple transactions
- Efficient storage patterns
- Minimal external calls
- Event-based state tracking

## HCS Integration

Events are automatically logged to Hedera Consensus Service for:
- Transparent audit trails
- Real-time monitoring
- Third-party integrations
- Regulatory compliance

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create feature branch
3. Add comprehensive tests
4. Submit pull request

## Support

For questions and support:
- GitHub Issues: [Create an issue](https://github.com/your-repo/issues)
- Documentation: [Full docs](https://docs.ipx.com)
- Community: [Discord](https://discord.gg/ipx)
