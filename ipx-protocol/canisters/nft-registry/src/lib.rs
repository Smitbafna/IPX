use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};

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