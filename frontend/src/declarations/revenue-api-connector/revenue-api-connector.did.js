export const idlFactory = ({ IDL }) => {
  const EndpointConfig = IDL.Record({
    'url' : IDL.Text,
    'name' : IDL.Text,
    'update_frequency' : IDL.Nat64,
    'data_path' : IDL.Text,
    'auth_header' : IDL.Opt(IDL.Text),
  });
  const Result = IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text });
  const RevenueData = IDL.Record({
    'source' : IDL.Text,
    'timestamp' : IDL.Nat,
    'data_hash' : IDL.Text,
    'amount' : IDL.Nat,
  });
  const OracleStats = IDL.Record({
    'successful_requests' : IDL.Nat64,
    'total_requests' : IDL.Nat64,
    'total_endpoints' : IDL.Nat,
    'failed_requests' : IDL.Nat64,
    'last_update' : IDL.Nat,
  });
  return IDL.Service({
    'add_endpoint' : IDL.Func([EndpointConfig], [Result], []),
    'fetch_revenue_data' : IDL.Func([IDL.Text], [Result], []),
    'get_all_revenue_data' : IDL.Func([], [IDL.Vec(RevenueData)], ['query']),
    'get_endpoints' : IDL.Func([], [IDL.Vec(EndpointConfig)], ['query']),
    'get_latest_data' : IDL.Func([IDL.Text], [IDL.Opt(RevenueData)], ['query']),
    'get_oracle_stats' : IDL.Func([], [OracleStats], ['query']),
    'get_revenue_data' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(RevenueData)],
        ['query'],
      ),
    'remove_endpoint' : IDL.Func([IDL.Text], [Result], []),
    'update_endpoint_auth' : IDL.Func([IDL.Text, IDL.Text], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
