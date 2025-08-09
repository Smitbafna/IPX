# IPX Protocol - Internet Computer Implementation

A decentralized protocol for creator economy investments with revenue sharing through NFTs.

## Architecture

- **Campaign Factory**: Creates vault canisters for each campaign
- **Vault**: Manages investments, NFT minting, and revenue distribution
- **NFT Registry**: ICRC-7 compliant NFT management
- **Oracle Aggregator**: Fetches revenue data from YouTube, Spotify, Substack
- **BeamFi Stream**: Handles vesting and streaming payments
- **SNS DAO**: Governance for disputes and early unlocks

## Setup

```bash
# Install dependencies
rustup target add wasm32-unknown-unknown

# Deploy locally
./scripts/deploy.sh

# Build only
dfx build

# Deploy specific canister
dfx deploy campaign_factory
```

## Usage

```bash
# Test campaign factory
dfx canister call campaign_factory greet '("IPX Protocol")'

# Check canister status
dfx canister status --all
```
