export const idlFactory = ({ IDL }) => {
  const Result = IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text });
  const Result_1 = IDL.Variant({ 'Ok' : IDL.Nat, 'Err' : IDL.Text });
  const StreamData = IDL.Record({
    'id' : IDL.Nat,
    'withdrawn_amount' : IDL.Nat,
    'total_amount' : IDL.Nat,
    'amount_per_second' : IDL.Nat,
    'recipient' : IDL.Principal,
    'end_time' : IDL.Nat,
    'sender' : IDL.Principal,
    'start_time' : IDL.Nat,
    'is_active' : IDL.Bool,
  });
  return IDL.Service({
    'cancel_stream' : IDL.Func([IDL.Nat], [Result], []),
    'create_stream' : IDL.Func(
        [IDL.Principal, IDL.Nat, IDL.Nat],
        [Result_1],
        [],
      ),
    'get_available_balance' : IDL.Func([IDL.Nat], [IDL.Nat], ['query']),
    'get_recipient_streams' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(StreamData)],
        ['query'],
      ),
    'get_stream' : IDL.Func([IDL.Nat], [IDL.Opt(StreamData)], ['query']),
    'get_stream_count' : IDL.Func([], [IDL.Nat], ['query']),
    'get_user_streams' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(StreamData)],
        ['query'],
      ),
    'withdraw_from_stream' : IDL.Func([IDL.Nat], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
