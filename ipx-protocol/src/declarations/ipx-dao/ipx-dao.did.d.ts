import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface GovernanceStats {
  'active_proposals' : bigint,
  'total_votes_cast' : bigint,
  'total_proposals' : bigint,
  'treasury_balance' : bigint,
}
export interface Proposal {
  'id' : bigint,
  'voting_deadline' : bigint,
  'data' : ProposalData,
  'voters' : Array<Principal>,
  'created_at' : bigint,
  'proposer' : Principal,
  'votes_for' : bigint,
  'executed' : boolean,
  'votes_against' : bigint,
}
export interface ProposalData {
  'title' : string,
  'voting_period' : bigint,
  'description' : string,
  'proposal_type' : ProposalType,
}
export type ProposalType = { 'CodeUpgrade' : null } |
  { 'ParameterChange' : null } |
  { 'Treasury' : null };
export type Result = { 'Ok' : string } |
  { 'Err' : string };
export type Result_1 = { 'Ok' : bigint } |
  { 'Err' : string };
export interface _SERVICE {
  'create_proposal' : ActorMethod<[ProposalData], Result_1>,
  'execute_proposal' : ActorMethod<[bigint], Result>,
  'get_active_proposals' : ActorMethod<[], Array<Proposal>>,
  'get_all_proposals' : ActorMethod<[], Array<Proposal>>,
  'get_governance_stats' : ActorMethod<[], GovernanceStats>,
  'get_proposal' : ActorMethod<[bigint], [] | [Proposal]>,
  'get_voting_power' : ActorMethod<[Principal], bigint>,
  'grant_voting_power' : ActorMethod<[Principal, bigint], Result>,
  'vote' : ActorMethod<[bigint, boolean], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
