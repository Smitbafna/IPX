use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct CampaignMetadata {
    pub creator: Principal,
    pub title: String,
    pub description: String,
    pub funding_goal: u64,
    pub revenue_share_percentage: u8, // 1-100
    pub oracle_endpoints: Vec<String>,
    pub vault_canister_id: Option<Principal>,
    pub created_at: u64,
    pub status: CampaignStatus,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq)]
pub enum CampaignStatus {
    Draft,
    Active,
    Funded,
    Completed,
    Cancelled,
}