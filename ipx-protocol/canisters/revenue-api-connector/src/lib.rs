use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};

use std::collections::HashMap;
use std::cell::RefCell;
use ic_cdk_macros::*;

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct OracleConfig {
    pub campaign_id: u64,
    pub vault_canister: Principal,
    pub endpoints: Vec<ApiEndpoint>,
    pub update_frequency: u64, // seconds
    pub last_update: u64,
    pub is_active: bool,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct ApiEndpoint {
    pub platform: String,
    pub url: String,
    pub auth_header: Option<String>,
    pub data_path: String, // JSON path to extract revenue data
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct RevenueData {
    pub campaign_id: u64,
    pub platform: String,
    pub amount: u64,
    pub currency: String,
    pub timestamp: u64,
    pub raw_data: String,
    pub verified: bool,
}


thread_local! {
    static ORACLE_CONFIGS: RefCell<HashMap<u64, OracleConfig>> = RefCell::new(HashMap::new());
    static REVENUE_HISTORY: RefCell<HashMap<(u64, u64), RevenueData>> = RefCell::new(HashMap::new());
}

#[init]
fn init() {
    ic_cdk::println!("Oracle Aggregator initialized");
}