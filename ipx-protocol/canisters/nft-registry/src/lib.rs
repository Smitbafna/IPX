use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::cell::RefCell;
use ic_cdk_macros::*;

type TokenId = u64;

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct TokenMetadata {
    pub token_id: TokenId,
    pub owner: Principal,
    pub campaign_id: u64,
    pub vault_canister: Principal,
    pub investment_amount: u64,
    pub share_percentage: f64,
    pub metadata_json: String,
    pub created_at: u64,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct CollectionMetadata {
    pub name: String,
    pub description: String,
    pub image: String,
    pub total_supply: u64,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct TransferArgs {
    pub token_id: TokenId,
    pub from: Principal,
    pub to: Principal,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct ApprovalArgs {
    pub token_id: TokenId,
    pub approved: Principal,
}


thread_local! {
    static TOKENS: RefCell<HashMap<TokenId, TokenMetadata>> = RefCell::new(HashMap::new());
    static TOKEN_APPROVALS: RefCell<HashMap<TokenId, Principal>> = RefCell::new(HashMap::new());
    static OPERATOR_APPROVALS: RefCell<HashMap<(Principal, Principal), bool>> = RefCell::new(HashMap::new());
    static TOKEN_COUNTER: RefCell<TokenId> = RefCell::new(0);
    static COLLECTION_METADATA: RefCell<CollectionMetadata> = RefCell::new(
        CollectionMetadata {
            name: "IPX Campaign NFTs".to_string(),
            description: "NFTs representing investments in IPX Protocol campaigns".to_string(),
            image: "https://ipx-protocol.com/collection-image.png".to_string(),
            total_supply: 0,
        }
    );
}

#[init]
fn init() {
    ic_cdk::println!("NFT Registry (ICRC-7 compliant) initialized");
}