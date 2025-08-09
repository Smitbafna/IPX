export const idlFactory = ({ IDL }) => {
  const Result = IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text });
  const TokenMetadata = IDL.Record({
    'name' : IDL.Text,
    'description' : IDL.Text,
    'image' : IDL.Text,
  });
  const Result_1 = IDL.Variant({ 'Ok' : IDL.Nat, 'Err' : IDL.Text });
  return IDL.Service({
    'approve' : IDL.Func([IDL.Principal, IDL.Nat], [Result], []),
    'get_approved' : IDL.Func([IDL.Nat], [IDL.Opt(IDL.Principal)], ['query']),
    'icrc7_atomic_batch_transfers' : IDL.Func(
        [],
        [IDL.Opt(IDL.Bool)],
        ['query'],
      ),
    'icrc7_balance_of' : IDL.Func(
        [IDL.Vec(IDL.Principal)],
        [IDL.Vec(IDL.Nat)],
        ['query'],
      ),
    'icrc7_collection_metadata' : IDL.Func(
        [],
        [
          IDL.Vec(
            IDL.Tuple(
              IDL.Text,
              IDL.Variant({
                'Nat' : IDL.Nat,
                'Blob' : IDL.Vec(IDL.Nat8),
                'Text' : IDL.Text,
              }),
            )
          ),
        ],
        ['query'],
      ),
    'icrc7_default_take_value' : IDL.Func([], [IDL.Opt(IDL.Nat)], ['query']),
    'icrc7_description' : IDL.Func([], [IDL.Opt(IDL.Text)], ['query']),
    'icrc7_logo' : IDL.Func([], [IDL.Opt(IDL.Text)], ['query']),
    'icrc7_max_memo_size' : IDL.Func([], [IDL.Opt(IDL.Nat)], ['query']),
    'icrc7_max_query_batch_size' : IDL.Func([], [IDL.Opt(IDL.Nat)], ['query']),
    'icrc7_max_take_value' : IDL.Func([], [IDL.Opt(IDL.Nat)], ['query']),
    'icrc7_max_update_batch_size' : IDL.Func([], [IDL.Opt(IDL.Nat)], ['query']),
    'icrc7_name' : IDL.Func([], [IDL.Text], ['query']),
    'icrc7_owner_of' : IDL.Func(
        [IDL.Vec(IDL.Nat)],
        [IDL.Vec(IDL.Opt(IDL.Principal))],
        ['query'],
      ),
    'icrc7_permitted_drift' : IDL.Func([], [IDL.Opt(IDL.Nat)], ['query']),
    'icrc7_supply_cap' : IDL.Func([], [IDL.Opt(IDL.Nat)], ['query']),
    'icrc7_symbol' : IDL.Func([], [IDL.Text], ['query']),
    'icrc7_token_metadata' : IDL.Func(
        [IDL.Vec(IDL.Nat)],
        [
          IDL.Vec(
            IDL.Opt(
              IDL.Vec(
                IDL.Tuple(
                  IDL.Text,
                  IDL.Variant({
                    'Nat' : IDL.Nat,
                    'Blob' : IDL.Vec(IDL.Nat8),
                    'Text' : IDL.Text,
                  }),
                )
              )
            )
          ),
        ],
        ['query'],
      ),
    'icrc7_tokens' : IDL.Func(
        [IDL.Opt(IDL.Principal), IDL.Opt(IDL.Nat)],
        [IDL.Vec(IDL.Nat)],
        ['query'],
      ),
    'icrc7_tokens_of' : IDL.Func(
        [IDL.Principal, IDL.Opt(IDL.Nat), IDL.Opt(IDL.Nat)],
        [IDL.Vec(IDL.Nat)],
        ['query'],
      ),
    'icrc7_total_supply' : IDL.Func([], [IDL.Nat], ['query']),
    'icrc7_tx_window' : IDL.Func([], [IDL.Opt(IDL.Nat)], ['query']),
    'is_approved_for_all' : IDL.Func(
        [IDL.Principal, IDL.Principal],
        [IDL.Bool],
        ['query'],
      ),
    'mint' : IDL.Func([TokenMetadata], [Result_1], []),
    'set_approval_for_all' : IDL.Func([IDL.Principal, IDL.Bool], [Result], []),
    'transfer' : IDL.Func([IDL.Principal, IDL.Nat], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
