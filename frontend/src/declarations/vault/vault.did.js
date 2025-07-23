export const idlFactory = ({ IDL }) => {
  const Result = IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text });
  const VaultData = IDL.Record({
    'balance' : IDL.Nat,
    'owner' : IDL.Principal,
    'locked_until' : IDL.Nat,
  });
  return IDL.Service({
    'deposit' : IDL.Func([IDL.Nat], [Result], []),
    'get_balance' : IDL.Func([], [IDL.Nat], ['query']),
    'get_locked_until' : IDL.Func([], [IDL.Nat], ['query']),
    'get_vault_data' : IDL.Func([], [IDL.Opt(VaultData)], ['query']),
    'lock_vault' : IDL.Func([IDL.Nat], [Result], []),
    'transfer_ownership' : IDL.Func([IDL.Principal], [Result], []),
    'unlock_vault' : IDL.Func([], [Result], []),
    'withdraw' : IDL.Func([IDL.Nat], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
