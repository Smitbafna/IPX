import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface EndpointConfig {
  'url' : string,
  'name' : string,
  'update_frequency' : bigint,
  'data_path' : string,
  'auth_header' : [] | [string],
}
export interface OracleStats {
  'successful_requests' : bigint,
  'total_requests' : bigint,
  'total_endpoints' : bigint,
  'failed_requests' : bigint,
  'last_update' : bigint,
}
export type Result = { 'Ok' : string } |
  { 'Err' : string };
export type Result_1 = { 'Ok' : bigint } |
  { 'Err' : string };
export interface RevenueData {
  'source' : string,
  'timestamp' : bigint,
  'data_hash' : string,
  'amount' : bigint,
}
export interface _SERVICE {
  'add_endpoint' : ActorMethod<[EndpointConfig], Result>,
  'fetch_revenue_data' : ActorMethod<[string], Result>,
  'get_all_revenue_data' : ActorMethod<[], Array<RevenueData>>,
  'get_endpoints' : ActorMethod<[], Array<EndpointConfig>>,
  'get_latest_data' : ActorMethod<[string], [] | [RevenueData]>,
  'get_oracle_stats' : ActorMethod<[], OracleStats>,
  'get_revenue_data' : ActorMethod<[string], [] | [RevenueData]>,
  'remove_endpoint' : ActorMethod<[string], Result>,
  'update_endpoint_auth' : ActorMethod<[string, string], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
