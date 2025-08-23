'use client';

import { useState, useEffect } from 'react';
import { useInternetIdentity } from '../lib/useInternetIdentity';

interface YouTubeConnectProps {
  onConnectionChange?: (connected: boolean) => void;
}

  const [isConnecting, setIsConnecting] = useState(false);
  const { principal, isAuthenticated } = useInternetIdentity();



  const handleConnect = async () => {
    setIsConnecting(true);
    if (!isAuthenticated || !principal) {
      alert('Please login with Internet Identity first.');
      setIsConnecting(false);
      return;
    }
  
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/oauth/youtube/callback`;
    const scope = 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.channel-memberships.creator';
    const state = crypto.randomUUID();
  
    await fetch('/api/youtube/oauth-init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ principal, state })
    });
   
    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=code&state=${state}&access_type=offline&prompt=consent`;
    window.location.href = oauthUrl;
  };
  };

  const handleDisconnect = () => {
    setIsConnecting(false);
    if (onConnectionChange) {
      onConnectionChange(false);
    }
  };

  if (isConnecting) {
    return (
      <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
          <div>
            <p className="text-sm font-medium text-blue-800">Redirecting to YouTube OAuth 2.0...</p>
          </div>
        </div>
      </div>
    );
  }

  }

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">Connect YouTube Channel</p>
            <p className="text-xs text-gray-600">Required to tokenize your content</p>
          </div>
        </div>
        <button
          onClick={handleConnect}
          className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
        >
          Connect
        </button>
      </div>
    </div>
  );
};
