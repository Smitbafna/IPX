import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type Result = { 'Ok' : string } |
  { 'Err' : string };
export type Result_1 = { 'Ok' : bigint } |
  { 'Err' : string };
export interface StreamData {
  'id' : bigint,
  'withdrawn_amount' : bigint,
  'total_amount' : bigint,
  'amount_per_second' : bigint,
  'recipient' : Principal,
  'end_time' : bigint,
  'sender' : Principal,
  'start_time' : bigint,
  'is_active' : boolean,
}
export interface _SERVICE {
  'cancel_stream' : ActorMethod<[bigint], Result>,
  'create_stream' : ActorMethod<[Principal, bigint, bigint], Result_1>,
  'get_available_balance' : ActorMethod<[bigint], bigint>,
  'get_recipient_streams' : ActorMethod<[Principal], Array<StreamData>>,
  'get_stream' : ActorMethod<[bigint], [] | [StreamData]>,
  'get_stream_count' : ActorMethod<[], bigint>,
  'get_user_streams' : ActorMethod<[Principal], Array<StreamData>>,
  'withdraw_from_stream' : ActorMethod<[bigint], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
