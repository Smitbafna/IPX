use ic_cdk::api::{msg_caller, time, canister_self};
use candid::{CandidType, Principal};
use ic_cdk_macros::*;
use ic_cdk::api::call::{call, CallResult};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager, VirtualMemory},
    DefaultMemoryImpl, StableBTreeMap,
};

type Memory = VirtualMemory<DefaultMemoryImpl>;

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct VaultState {
    pub campaign_id: u64,
    pub creator: Principal,
    pub title: String,
    pub funding_goal: u64,
    pub current_funding: u64,
    pub revenue_share_percentage: u8,
    pub total_revenue: u64,
    pub oracle_endpoints: Vec<String>,
    pub nft_registry_canister: Option<Principal>,
    pub stream_canister: Option<Principal>,
    pub oracle_canister: Option<Principal>,
    pub backers: HashMap<Principal, BackerInfo>,
    pub revenue_history: Vec<RevenueUpdate>,
    pub created_at: u64,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct BackerInfo {
    pub amount_invested: u64,
    pub nft_token_id: Option<u64>,
    pub share_percentage: f64,
    pub total_claimed: u64,
    pub investment_timestamp: u64,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct RevenueUpdate {
    pub amount: u64,
    pub source: String,
    pub timestamp: u64,
    pub oracle_verification: bool,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct InvestmentResult {
    pub success: bool,
    pub nft_token_id: Option<u64>,
    pub share_percentage: f64,
    pub message: String,
}

thread_local! {
    static MEMORY_MANAGER: MemoryManager<DefaultMemoryImpl> = MemoryManager::init(DefaultMemoryImpl::default());
    
    static VAULT_STATE: std::cell::RefCell<Option<VaultState>> = std::cell::RefCell::new(None);
}

#[init]
fn init() {
    // Initialize with default state - can be configured later via update calls
    let vault_state = VaultState {
        campaign_id: 0,
        creator: Principal::anonymous(),
        title: "Default Vault".to_string(),
        funding_goal: 1000000, // 1M default goal
        current_funding: 0,
        revenue_share_percentage: 10, // Default 10%
        total_revenue: 0,
        oracle_endpoints: Vec::new(), // Empty by default
        nft_registry_canister: None,
        stream_canister: None,
        oracle_canister: None,
        backers: HashMap::new(),
        revenue_history: Vec::new(),
        created_at: time(),
    };
    
    VAULT_STATE.with(|state| {
        *state.borrow_mut() = Some(vault_state);
    });
    
    ic_cdk::println!("Vault initialized with default settings");
}

