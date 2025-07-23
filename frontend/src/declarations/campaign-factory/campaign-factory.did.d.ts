import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Campaign {
  'id' : bigint,
  'creator' : Principal,
  'metadata' : CampaignMetadata,
  'created_at' : bigint,
  'backers_count' : bigint,
  'current_amount' : bigint,
  'is_active' : boolean,
}
export interface CampaignMetadata {
  'title' : string,
  'image_url' : string,
  'description' : string,
  'end_date' : bigint,
  'target_amount' : bigint,
  'category' : string,
}
export type Result = { 'Ok' : string } |
  { 'Err' : string };
export type Result_1 = { 'Ok' : bigint } |
  { 'Err' : string };
export interface _SERVICE {
  'create_campaign' : ActorMethod<[CampaignMetadata], Result_1>,
  'end_campaign' : ActorMethod<[bigint], Result>,
  'fund_campaign' : ActorMethod<[bigint, bigint], Result>,
  'get_all_campaigns' : ActorMethod<[], Array<Campaign>>,
  'get_campaign' : ActorMethod<[bigint], [] | [Campaign]>,
  'get_campaign_backers' : ActorMethod<[bigint], Array<Principal>>,
  'get_user_campaigns' : ActorMethod<[Principal], Array<Campaign>>,
  'withdraw_funds' : ActorMethod<[bigint], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
