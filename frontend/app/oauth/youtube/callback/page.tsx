'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Principal } from '@dfinity/principal';
import { Actor } from '@dfinity/agent';
import { createAgent, CANISTER_IDS } from '../../../../lib/agent';
import { NFTRegistryCanister } from '../../../../types/canisters';
import { ProofType } from '../../../../types/youtube';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { idlFactory as nftIDL } from '../../../../src/declarations/nft-registry';

export default function YouTubeCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing YouTube verification...');
  
  useEffect(() => {
    const processOAuth = async () => {
      try {
        // Extract code and state from URL
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        
        // Get state and principal from session storage
        const storedState = sessionStorage.getItem('youtube_oauth_state');
        const principalStr = sessionStorage.getItem('youtube_principal');
        const requiredProofType = sessionStorage.getItem('youtube_required_proof') as ProofType || ProofType.ChannelOwnership;
        
        if (!code || !state || state !== storedState || !principalStr) {
          setStatus('error');
          setMessage('Invalid or missing parameters. Please try again.');
          return;
        }
        
      
        const response = await fetch('/api/youtube/exchange-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, proofType: requiredProofType })
        });
        
        if (!response.ok) {
          throw new Error('Failed to exchange code');
        }
        
        
        const { channelData, zkProof } = await response.json();
        
       
        const proofBytes = new Uint8Array(zkProof.proof_bytes);
        
   
        const principal = Principal.fromText(principalStr);
        const nftActor = await getNFTRegistryActor();
        
        const result = await nftActor.store_youtube_zk_proof(
          proofBytes,
          zkProof.public_inputs,
          channelData.id,
          channelData.title || null,
          getProofTypeCode(requiredProofType),
          BigInt(channelData.statistics?.subscriberCount || 0),
          BigInt(channelData.statistics?.viewCount || 0),
          BigInt(channelData.statistics?.videoCount || 0),
          channelData.snippet?.publishedAt || null
        );
        
        if ('Err' in result) {
          throw new Error(result.Err);
        }
        
        // Success
        setStatus('success');
        setMessage('YouTube channel successfully verified!');
        
        // Clean up session storage
        sessionStorage.removeItem('youtube_oauth_state');
        sessionStorage.removeItem('youtube_principal');
        sessionStorage.removeItem('youtube_required_proof');
        
      } catch (error) {
        console.error('Error processing YouTube OAuth:', error);
        setStatus('error');
        setMessage('Failed to complete YouTube verification. Please try again.');
      }
    };
    
    processOAuth();
  }, [searchParams]);
  
  // Get NFT Registry actor
  const getNFTRegistryActor = async (): Promise<NFTRegistryCanister> => {
    const agent = await createAgent();
    return Actor.createActor(nftIDL, {
      agent,
      canisterId: CANISTER_IDS.nftRegistry,
    }) as NFTRegistryCanister;
  };
  
  
  
  // Helper function to convert ProofType enum to numeric code
  const getProofTypeCode = (proofType: ProofType): number => {
    switch (proofType) {
      case ProofType.ChannelOwnership:
        return 0;
      case ProofType.SubscriberCount:
        return 1;
      case ProofType.ViewCount:
        return 2;
      case ProofType.VideoEngagement:
        return 3;
      case ProofType.Combined:
        return 4;
      default:
        return 0;
    }
  };
  
  const handleReturn = () => {
    router.push('/dashboard');
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            YouTube Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-6 text-center">
            {status === 'loading' && (
              <div className="w-8 h-8 border-4 border-blue-600 rounded-full animate-spin border-t-transparent mb-4"></div>
            )}
            {status === 'success' && (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            {status === 'error' && (
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
            <p className={`text-lg font-medium ${status === 'error' ? 'text-red-600' : ''}`}>{message}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={handleReturn} disabled={status === 'loading'}>
            Return to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
