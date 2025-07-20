use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};
use std::cell::RefCell;
use std::collections::HashMap;
use ic_cdk_macros::{init};

use ic_cdk::api::{msg_caller, time};
use ic_cdk_macros::{update};

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


#[update]
fn create_proposal(data: ProposalData) -> Result<u64, String> {
    let caller = msg_caller();
    let has_voting_power = MEMBER_VOTES.with(|votes| {
        votes.borrow().get(&caller).unwrap_or(&0) > &0
    });
    if !has_voting_power {
        return Err("No voting power".to_string());
    }
    let proposal_id = PROPOSAL_COUNTER.with(|counter| {
        let mut counter = counter.borrow_mut();
        *counter += 1;
        *counter
    });
    let current_time = time();
    let voting_deadline = current_time + data.voting_period;
    let proposal = Proposal {
        id: proposal_id,
        proposer: caller,
        data,
        votes_for: 0,
        votes_against: 0,
        created_at: current_time,
        voting_deadline,
        executed: false,
        voters: Vec::new(),
    };
    PROPOSALS.with(|proposals| {
        proposals.borrow_mut().insert(proposal_id, proposal);
    });
    Ok(proposal_id)
}

#[update]
fn vote(proposal_id: u64, support: bool) -> Result<String, String> {
    let caller = msg_caller();
    let voting_power = MEMBER_VOTES.with(|votes| {
        *votes.borrow().get(&caller).unwrap_or(&0)
    });
    if voting_power == 0 {
        return Err("No voting power".to_string());
    }
    PROPOSALS.with(|proposals| {
        let mut proposals = proposals.borrow_mut();
        if let Some(proposal) = proposals.get_mut(&proposal_id) {
            if time() > proposal.voting_deadline {
                return Err("Voting period has ended".to_string());
            }
            if proposal.voters.contains(&caller) {
                return Err("Already voted".to_string());
            }
            if support {
                proposal.votes_for += voting_power;
            } else {
                proposal.votes_against += voting_power;
            }
            proposal.voters.push(caller);
            Ok("Vote cast successfully".to_string())
        } else {
            Err("Proposal not found".to_string())
        }
    })
}

#[update]
fn execute_proposal(proposal_id: u64) -> Result<String, String> {
    let current_time = time();
    PROPOSALS.with(|proposals| {
        let mut proposals = proposals.borrow_mut();
        if let Some(proposal) = proposals.get_mut(&proposal_id) {
            if current_time <= proposal.voting_deadline {
                return Err("Voting period still active".to_string());
            }
            if proposal.executed {
                return Err("Proposal already executed".to_string());
            }
            if proposal.votes_for > proposal.votes_against {
                proposal.executed = true;
                match proposal.data.proposal_type {
                    ProposalType::Treasury => {
                        TREASURY_BALANCE.with(|balance| {
                            let mut balance = balance.borrow_mut();
                            if *balance >= 1000 {
                                *balance -= 1000;
                            }
                        });
                    },
                    ProposalType::ParameterChange => {
                        DEFAULT_VOTING_PERIOD.with(|period| {
                            let mut period = period.borrow_mut();
                            *period = proposal.data.voting_period;
                        });
                        ic_cdk::println!("Default voting period updated to {}", proposal.data.voting_period);
                    },
                    ProposalType::CodeUpgrade => {
                        READY_FOR_UPGRADE.with(|flag| {
                            *flag.borrow_mut() = true;
                        });
                        ic_cdk::println!("Code upgrade proposal executed. Upgrade flag set.");
                    },
                }
                Ok("Proposal executed successfully".to_string())
            } else {
                Ok("Proposal failed to pass".to_string())
            }
        } else {
            Err("Proposal not found".to_string())
        }
    })
}