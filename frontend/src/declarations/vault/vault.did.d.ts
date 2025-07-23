import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type Result = { 'Ok' : string } |
  { 'Err' : string };
export type Result_1 = { 'Ok' : bigint } |
  { 'Err' : string };
export interface VaultData {
  'balance' : bigint,
  'owner' : Principal,
  'locked_until' : bigint,
}
export interface _SERVICE {
  'deposit' : ActorMethod<[bigint], Result>,
  'get_balance' : ActorMethod<[], bigint>,
  'get_locked_until' : ActorMethod<[], bigint>,
  'get_vault_data' : ActorMethod<[], [] | [VaultData]>,
  'lock_vault' : ActorMethod<[bigint], Result>,
  'transfer_ownership' : ActorMethod<[Principal], Result>,
  'unlock_vault' : ActorMethod<[], Result>,
  'withdraw' : ActorMethod<[bigint], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
