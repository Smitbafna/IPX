import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type Result = { 'Ok' : string } |
  { 'Err' : string };
export type Result_1 = { 'Ok' : bigint } |
  { 'Err' : string };
export interface TokenMetadata {
  'name' : string,
  'description' : string,
  'image' : string,
}
export interface _SERVICE {
  'approve' : ActorMethod<[Principal, bigint], Result>,
  'get_approved' : ActorMethod<[bigint], [] | [Principal]>,
  'icrc7_atomic_batch_transfers' : ActorMethod<[], [] | [boolean]>,
  'icrc7_balance_of' : ActorMethod<[Array<Principal>], Array<bigint>>,
  'icrc7_collection_metadata' : ActorMethod<
    [],
    Array<
      [
        string,
        { 'Nat' : bigint } |
          { 'Blob' : Uint8Array | number[] } |
          { 'Text' : string },
      ]
    >
  >,
  'icrc7_default_take_value' : ActorMethod<[], [] | [bigint]>,
  'icrc7_description' : ActorMethod<[], [] | [string]>,
  'icrc7_logo' : ActorMethod<[], [] | [string]>,
  'icrc7_max_memo_size' : ActorMethod<[], [] | [bigint]>,
  'icrc7_max_query_batch_size' : ActorMethod<[], [] | [bigint]>,
  'icrc7_max_take_value' : ActorMethod<[], [] | [bigint]>,
  'icrc7_max_update_batch_size' : ActorMethod<[], [] | [bigint]>,
  'icrc7_name' : ActorMethod<[], string>,
  'icrc7_owner_of' : ActorMethod<[Array<bigint>], Array<[] | [Principal]>>,
  'icrc7_permitted_drift' : ActorMethod<[], [] | [bigint]>,
  'icrc7_supply_cap' : ActorMethod<[], [] | [bigint]>,
  'icrc7_symbol' : ActorMethod<[], string>,
  'icrc7_token_metadata' : ActorMethod<
    [Array<bigint>],
    Array<
      [] | [
        Array<
          [
            string,
            { 'Nat' : bigint } |
              { 'Blob' : Uint8Array | number[] } |
              { 'Text' : string },
          ]
        >
      ]
    >
  >,
  'icrc7_tokens' : ActorMethod<
    [[] | [Principal], [] | [bigint]],
    Array<bigint>
  >,
  'icrc7_tokens_of' : ActorMethod<
    [Principal, [] | [bigint], [] | [bigint]],
    Array<bigint>
  >,
  'icrc7_total_supply' : ActorMethod<[], bigint>,
  'icrc7_tx_window' : ActorMethod<[], [] | [bigint]>,
  'is_approved_for_all' : ActorMethod<[Principal, Principal], boolean>,
  'mint' : ActorMethod<[TokenMetadata], Result_1>,
  'set_approval_for_all' : ActorMethod<[Principal, boolean], Result>,
  'transfer' : ActorMethod<[Principal, bigint], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
