use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};

use std::collections::HashMap;
use std::cell::RefCell;
use ic_cdk_macros::*;

use serde_json::Value;
use ic_cdk::api::time;
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


#[update]
async fn fetch_revenue_data(campaign_id: u64) -> Result<Vec<RevenueData>, String> {
    let config = ORACLE_CONFIGS.with(|configs| configs.borrow().get(&campaign_id).cloned());
    match config {
        Some(mut config) => {
            if !config.is_active {
                return Err("Oracle is not active for this campaign".to_string());
            }
            let mut results = Vec::new();
            for endpoint in &config.endpoints {
                match fetch_from_endpoint(campaign_id, endpoint).await {
                    Ok(data) => {
                        results.push(data.clone());
                        let key = (campaign_id, data.timestamp);
                        REVENUE_HISTORY.with(|history| {
                            history.borrow_mut().insert(key, data);
                        });
                    }
                    Err(e) => {
                        ic_cdk::println!("Failed to fetch from {}: {}", endpoint.platform, e);
                    }
                }
            }
            config.last_update = time();
            ORACLE_CONFIGS.with(|configs| {
                configs.borrow_mut().insert(campaign_id, config.clone());
            });
            if !results.is_empty() {
                let total_revenue: u64 = results.iter().map(|r| r.amount).sum();
                let _ = update_vault_revenue(config.vault_canister, total_revenue).await;
            }
            Ok(results)
        }
        None => Err("Oracle not configured for this campaign".to_string()),
    }
}