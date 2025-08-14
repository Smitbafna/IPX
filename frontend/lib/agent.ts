// lib/agent.ts
import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';

// Canister IDs - Replace with your actual deployed canister IDs
export const CANISTER_IDS = {
  vault: 'rdmx6-jaaaa-aaaah-qca7a-cai',
  beamfiStream: 'rrkah-fqaaa-aaaah-qcu4q-cai', 
  campaignFactory: 'rno2w-sqaaa-aaaah-qcu4a-cai',
  nftRegistry: 'rnp4c-xaaaa-aaaah-qcu5q-cai',
  snsDao: 'rqhpj-eaaaa-aaaah-qcu6a-cai',
  oracleAggregator: 'rrkec-7aaaa-aaaah-qcu6q-cai'
};

// Network configuration
const HOST = process.env.NODE_ENV === 'production' 
  ? 'https://ic0.app' 
  : 'http://127.0.0.1:4943';

// Initialize HTTP Agent
export const createAgent = async (identity?: any): Promise<HttpAgent> => {
  const agent = new HttpAgent({
    host: HOST,
    identity,
  });

  // Fetch root key for local development
  if (process.env.NODE_ENV !== 'production') {
    await agent.fetchRootKey();
  }

  return agent;
};

// Auth client singleton
let authClient: AuthClient | null = null;

export const getAuthClient = async (): Promise<AuthClient> => {
  if (!authClient) {
    authClient = await AuthClient.create();
  }
  return authClient;
};

// Login function
export const login = async (): Promise<boolean> => {
  const authClient = await getAuthClient();
  
  return new Promise((resolve) => {
    authClient.login({
      identityProvider: process.env.NODE_ENV === 'production' 
        ? 'https://identity.ic0.app/#authorize'
        : `http://127.0.0.1:4943?canisterId=${process.env.INTERNET_IDENTITY_CANISTER_ID}`,
      onSuccess: () => resolve(true),
      onError: () => resolve(false),
    });
  });
};

// Logout function
export const logout = async (): Promise<void> => {
  const authClient = await getAuthClient();
  await authClient.logout();
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const authClient = await getAuthClient();
  return await authClient.isAuthenticated();
};

// Get user identity
export const getIdentity = async () => {
  const authClient = await getAuthClient();
  return authClient.getIdentity();
};

// Get user principal
export const getUserPrincipal = async (): Promise<Principal | null> => {
  const identity = await getIdentity();
  return identity.getPrincipal();
};
