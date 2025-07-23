// hooks/useIPXProtocol.ts
import { useState, useEffect } from 'react';
import { Actor } from '@dfinity/agent';
import { 
  createAgent, 
  getIdentity, 
  isAuthenticated, 
  getUserPrincipal,
  CANISTER_IDS 
} from '../lib/agent';
import {
  VaultCanister,
  BeamFiCanister,
  CampaignFactoryCanister,
  NFTRegistryCanister,
  SNSDAOCanister,
  OracleAggregatorCanister
} from '../types/canisters';

// IDL definitions for each canister (you'll need to generate these from your Candid files)
import { idlFactory as vaultIDL } from '../src/declarations/vault';
import { idlFactory as beamfiIDL } from '../src/declarations/ipx-stream';
import { idlFactory as campaignIDL } from '../src/declarations/campaign-factory';
import { idlFactory as nftIDL } from '../src/declarations/nft-registry';
import { idlFactory as daoIDL } from '../src/declarations/ipx-dao';
import { idlFactory as oracleIDL } from '../src/declarations/revenue-api-connector';

export const useIPXProtocol = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [principal, setPrincipal] = useState<string | null>(null);

  // Actor states
  const [vaultActor, setVaultActor] = useState<VaultCanister | null>(null);
  const [beamfiActor, setBeamfiActor] = useState<BeamFiCanister | null>(null);
  const [campaignActor, setCampaignActor] = useState<CampaignFactoryCanister | null>(null);
  const [nftActor, setNftActor] = useState<NFTRegistryCanister | null>(null);
  const [daoActor, setDaoActor] = useState<SNSDAOCanister | null>(null);
  const [oracleActor, setOracleActor] = useState<OracleAggregatorCanister | null>(null);

  const initializeActors = async () => {
    try {
      const identity = await getIdentity();
      const agent = await createAgent(identity);

      // Create actors for each canister
      const vault = Actor.createActor(vaultIDL, {
        agent,
        canisterId: CANISTER_IDS.vault,
      }) as VaultCanister;

      const beamfi = Actor.createActor(beamfiIDL, {
        agent,
        canisterId: CANISTER_IDS.beamfiStream,
      }) as BeamFiCanister;

      const campaign = Actor.createActor(campaignIDL, {
        agent,
        canisterId: CANISTER_IDS.campaignFactory,
      }) as CampaignFactoryCanister;

      const nft = Actor.createActor(nftIDL, {
        agent,
        canisterId: CANISTER_IDS.nftRegistry,
      }) as NFTRegistryCanister;

      const dao = Actor.createActor(daoIDL, {
        agent,
        canisterId: CANISTER_IDS.snsDao,
      }) as SNSDAOCanister;

      const oracle = Actor.createActor(oracleIDL, {
        agent,
        canisterId: CANISTER_IDS.oracleAggregator,
      }) as OracleAggregatorCanister;

      setVaultActor(vault);
      setBeamfiActor(beamfi);
      setCampaignActor(campaign);
      setNftActor(nft);
      setDaoActor(dao);
      setOracleActor(oracle);
    } catch (error) {
      console.error('Failed to initialize actors:', error);
    }
  };

  const checkAuthentication = async () => {
    setLoading(true);
    try {
      const authStatus = await isAuthenticated();
      setAuthenticated(authStatus);
      
      if (authStatus) {
        const userPrincipal = await getUserPrincipal();
        setPrincipal(userPrincipal?.toString() || null);
        await initializeActors();
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthentication();
  }, []);

  return {
    // Authentication state
    authenticated,
    loading,
    principal,
    
    // Actors
    vaultActor,
    beamfiActor,
    campaignActor,
    nftActor,
    daoActor,
    oracleActor,
    
    // Methods
    refreshAuth: checkAuthentication,
    initializeActors,
  };
};
