use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};
use std::cell::RefCell;
use std::collections::HashMap;
use ic_cdk_macros::{init};

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub enum ProposalType {
    ParameterChange,
    CodeUpgrade,
    Treasury,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct ProposalData {
    pub title: String,
    pub description: String,
    pub proposal_type: ProposalType,
    pub voting_period: u64, // Duration in nanoseconds
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct Proposal {
    pub id: u64,
    pub proposer: Principal,
    pub data: ProposalData,
    pub votes_for: u64,
    pub votes_against: u64,
    pub created_at: u64,
    pub voting_deadline: u64,
    pub executed: bool,
    pub voters: Vec<Principal>,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct GovernanceStats {
    pub total_proposals: u64,
    pub active_proposals: u64,
    pub total_votes_cast: u64,
    pub treasury_balance: u64,
}


thread_local! {
    static PROPOSALS: RefCell<HashMap<u64, Proposal>> = RefCell::new(HashMap::new());
    static PROPOSAL_COUNTER: RefCell<u64> = RefCell::new(0);
    static MEMBER_VOTES: RefCell<HashMap<Principal, u64>> = RefCell::new(HashMap::new()); // Voting power
    static TREASURY_BALANCE: RefCell<u64> = RefCell::new(1000000); // Initial treasury
    static READY_FOR_UPGRADE: RefCell<bool> = RefCell::new(false); // Flag for code upgrade
}

#[init]
fn init() {
    // Initialize with some voting power for the deployer
    let caller = ic_cdk::api::msg_caller();
    MEMBER_VOTES.with(|votes| {
        votes.borrow_mut().insert(caller, 100);
    });
}