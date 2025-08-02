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


se ic_cdk::api::msg_caller;

#[update]
fn register_campaign_oracle(
    campaign_id: u64,
    vault_canister: Principal,
    endpoints: Vec<ApiEndpoint>,
    update_frequency: u64,
) -> Result<(), String> {
    let caller = msg_caller();
    // Authorization check: only vault canister or campaign creator can register
    if caller != vault_canister {
        // Query vault canister for campaign creator
        let creator_result: Result<(Principal,), _> = ic_cdk::api::call::call(
            vault_canister,
            "get_campaign_creator",
            (campaign_id,)
        ).await;
        match creator_result {
            Ok((creator,)) => {
                if caller != creator {
                    return Err("Unauthorized: Only vault or campaign creator can register oracle".to_string());
                }
            }
            Err(_) => {
                return Err("Failed to fetch campaign creator from vault canister".to_string());
            }
        }
    }
    let config = OracleConfig {
        campaign_id,
        vault_canister,
        endpoints,
        update_frequency,
        last_update: 0,
        is_active: true,
    };
    ORACLE_CONFIGS.with(|configs| {
        configs.borrow_mut().insert(campaign_id, config.clone());
    });
    ic_cdk::println!("Oracle registered for campaign {}", campaign_id);
    Ok(())
}