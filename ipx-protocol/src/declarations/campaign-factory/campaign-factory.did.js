export const idlFactory = ({ IDL }) => {
  const CampaignMetadata = IDL.Record({
    'title' : IDL.Text,
    'image_url' : IDL.Text,
    'description' : IDL.Text,
    'end_date' : IDL.Nat,
    'target_amount' : IDL.Nat,
    'category' : IDL.Text,
  });
  const Result_1 = IDL.Variant({ 'Ok' : IDL.Nat, 'Err' : IDL.Text });
  const Result = IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text });
  const Campaign = IDL.Record({
    'id' : IDL.Nat,
    'creator' : IDL.Principal,
    'metadata' : CampaignMetadata,
    'created_at' : IDL.Nat,
    'backers_count' : IDL.Nat,
    'current_amount' : IDL.Nat,
    'is_active' : IDL.Bool,
  });
  return IDL.Service({
    'create_campaign' : IDL.Func([CampaignMetadata], [Result_1], []),
    'end_campaign' : IDL.Func([IDL.Nat], [Result], []),
    'fund_campaign' : IDL.Func([IDL.Nat, IDL.Nat], [Result], []),
    'get_all_campaigns' : IDL.Func([], [IDL.Vec(Campaign)], ['query']),
    'get_campaign' : IDL.Func([IDL.Nat], [IDL.Opt(Campaign)], ['query']),
    'get_campaign_backers' : IDL.Func(
        [IDL.Nat],
        [IDL.Vec(IDL.Principal)],
        ['query'],
      ),
    'get_user_campaigns' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(Campaign)],
        ['query'],
      ),
    'withdraw_funds' : IDL.Func([IDL.Nat], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
