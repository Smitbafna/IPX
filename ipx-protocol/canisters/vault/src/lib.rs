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

use ic_cdk::api::{msg_caller, time};
use ic_cdk::api::call::{call, CallResult};

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

#[update]
async fn invest(amount: u64) -> InvestmentResult {
    let caller = msg_caller();
    VAULT_STATE.with(|state_ref| {
        let mut state_opt = state_ref.borrow_mut();
        if let Some(ref mut state) = *state_opt {
            if state.current_funding >= state.funding_goal {
                return InvestmentResult {
                    success: false,
                    nft_token_id: None,
                    share_percentage: 0.0,
                    message: "Campaign already fully funded".to_string(),
                };
            }
            let remaining_funding = state.funding_goal - state.current_funding;
            let actual_investment = amount.min(remaining_funding);
            let share_percentage = (actual_investment as f64 / state.funding_goal as f64) * 100.0;
            state.current_funding += actual_investment;
            let backer_info = BackerInfo {
                amount_invested: actual_investment,
                nft_token_id: None,
                share_percentage,
                total_claimed: 0,
                investment_timestamp: time(),
            };
            state.backers.insert(caller, backer_info.clone());
            InvestmentResult {
                success: true,
                nft_token_id: None,
                share_percentage,
                message: format!("Investment of {} successful", actual_investment),
            }
        } else {
            InvestmentResult {
                success: false,
                nft_token_id: None,
                share_percentage: 0.0,
                message: "Vault not initialized".to_string(),
            }
        }
    })
}

#[update]
async fn mint_nft_for_backer(backer: Principal) -> Result<u64, String> {
    let backer_info = VAULT_STATE.with(|state_ref| {
        let state_opt = state_ref.borrow();
        if let Some(ref state) = *state_opt {
            state.backers.get(&backer).cloned()
        } else {
            None
        }
    });
    if let Some(info) = backer_info {
        if let Some(nft_registry) = get_nft_registry_canister() {
            let metadata = format!(
                "{{\"campaign_id\":{},\"investment\":{},\"share\":{:.2}}}",
                get_campaign_id(),
                info.amount_invested,
                info.share_percentage
            );
            let result: CallResult<(Result<u64, String>,)> = call(
                nft_registry,
                "mint",
                (backer, metadata),
            ).await;
            match result {
                Ok((Ok(token_id),)) => {
                    VAULT_STATE.with(|state_ref| {
                        let mut state_opt = state_ref.borrow_mut();
                        if let Some(ref mut state) = *state_opt {
                            if let Some(ref mut backer_info) = state.backers.get_mut(&backer) {
                                backer_info.nft_token_id = Some(token_id);
                            }
                        }
                    });
                    Ok(token_id)
                },
                Ok((Err(e),)) => Err(e),
                Err(e) => Err(format!("Failed to call NFT registry: {:?}", e)),
            }
        } else {
            Err("NFT registry not configured".to_string())
        }
    } else {
        Err("Backer not found".to_string())
    }
}