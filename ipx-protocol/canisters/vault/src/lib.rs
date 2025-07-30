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
