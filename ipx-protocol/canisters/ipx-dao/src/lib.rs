use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};

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