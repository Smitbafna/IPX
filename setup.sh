#!/bin/bash

# IPX Protoecho -e "${BLUE}Deploying IC Canisters...${NC}"ol Quick Setup Script
set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}IPX Protocol Quick Setup${NC}"

# Check prerequisites exist
for cmd in node npm dfx rustc; do
    if ! command -v $cmd >/dev/null 2>&1; then
        echo -e "${RED}Error: $cmd not found. Please install: Node.js 18+, npm, dfx, rust${NC}"
        exit 1
    fi
done

echo -e "${GREEN}All dependencies found${NC}"

# Deploy IC Canisters
echo -e "${BLUE}� Deploying IC Canisters...${NC}"
cd ipx-protocol
dfx start --background --clean
dfx canister create --all
dfx build
dfx deploy

# Get canister IDs
VAULT_ID=$(dfx canister id vault)
CAMPAIGN_ID=$(dfx canister id campaign-factory)
NFT_ID=$(dfx canister id nft-registry)
IPX_STREAM_ID=$(dfx canister id ipx-stream)
IPX_DAO_ID=$(dfx canister id ipx-dao)
REVENUE_API_CONNECTOR_ID=$(dfx canister id revenue-api-connector)

echo -e "${GREEN}Canisters deployed${NC}"
cd ..

# Setup Frontend
echo -e "${BLUE}Setting up Frontend...${NC}"
cd frontend
npm install

# Create environment config
cat > .env.local << EOF
NEXT_PUBLIC_VAULT_CANISTER_ID=$VAULT_ID
NEXT_PUBLIC_CAMPAIGN_FACTORY_CANISTER_ID=$CAMPAIGN_ID
NEXT_PUBLIC_NFT_REGISTRY_CANISTER_ID=$NFT_ID
NEXT_PUBLIC_IPX_STREAM_CANISTER_ID=$IPX_STREAM_ID
NEXT_PUBLIC_IPX_DAO_CANISTER_ID=$IPX_DAO_ID
NEXT_PUBLIC_REVENUE_API_CONNECTOR_CANISTER_ID=$REVENUE_API_CONNECTOR_ID
NEXT_PUBLIC_IC_HOST=http://localhost:4943
EOF


cd ..

echo -e "${GREEN}Setup Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. cd frontend && npm run dev"
echo "2. Open http://localhost:3000"
echo "3. Connect wallet and test the platform"
echo ""
echo "Stop IC replica: cd ipx-protocol && dfx stop"
