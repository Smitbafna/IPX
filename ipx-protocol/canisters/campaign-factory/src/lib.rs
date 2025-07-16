use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::cell::RefCell;
use ic_cdk_macros::*;


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


thread_local! {
    static CAMPAIGN_COUNTER: RefCell<u64> = RefCell::new(0);
    static CAMPAIGNS: RefCell<HashMap<u64, CampaignMetadata>> = RefCell::new(HashMap::new());
}

#[init]
fn init() {
    ic_cdk::println!("Campaign Factory initialized");
}