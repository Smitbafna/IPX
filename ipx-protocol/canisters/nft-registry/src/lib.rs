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


#[query]
fn icrc7_collection_metadata() -> CollectionMetadata {
    COLLECTION_METADATA.with(|metadata| metadata.borrow().clone())
}

#[query]
fn icrc7_name() -> String {
    COLLECTION_METADATA.with(|metadata| metadata.borrow().name.clone())
}

#[query]
fn icrc7_description() -> String {
    COLLECTION_METADATA.with(|metadata| metadata.borrow().description.clone())
}

#[query]
fn icrc7_total_supply() -> u64 {
    TOKENS.with(|tokens| tokens.borrow().len() as u64)
}

#[query]
fn icrc7_owner_of(token_id: TokenId) -> Option<Principal> {
    TOKENS.with(|tokens| {
        tokens.borrow().get(&token_id).map(|token| token.owner)
    })
}

#[query]
fn icrc7_balance_of(owner: Principal) -> u64 {
    TOKENS.with(|tokens| {
        tokens.borrow().iter()
            .filter(|(_, token)| token.owner == owner)
            .count() as u64
    })
}

#[query]
fn icrc7_tokens_of(owner: Principal) -> Vec<TokenId> {
    TOKENS.with(|tokens| {
        tokens.borrow().iter()
            .filter(|(_, token)| token.owner == owner)
            .map(|(token_id, _)| *token_id)
            .collect()
    })
}

#[query]
fn icrc7_token_metadata(token_id: TokenId) -> Option<TokenMetadata> {
    TOKENS.with(|tokens| tokens.borrow().get(&token_id).cloned())
}