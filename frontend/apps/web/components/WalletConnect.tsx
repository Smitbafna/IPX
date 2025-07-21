import React from 'react';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { Providers } from '../app/providers'; 


const MetaMaskWallet: React.FC = () => {
  const { address, isConnected, isConnecting } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getChainName = (chainId: number): string => {
    const chains: Record<number, string> = {
      1: 'Ethereum Mainnet',
      137: 'Polygon Mainnet',
      42161: 'Arbitrum One',
      10: 'Optimism',
      11155111: 'Sepolia Testnet',
    };
    return chains[chainId] || `Chain ID: ${chainId}`;
  };

  // Handle chain switching
  const handleSwitchChain = (targetChainId: number) => {
    switchChain({ chainId: targetChainId });
  };

  // Handle connection
  const handleConnect = () => {
    const metamaskConnector = connectors.find(connector => connector.name === 'MetaMask');
    if (metamaskConnector) {
      connect({ connector: metamaskConnector });
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center space-y-4">
        <button
          onClick={handleConnect}
          disabled={isConnecting || isPending}
          className="w-[16rem] bg-gradient-to-r from-orange-300 to-orange-300 hover:from-orange-100 hover:to-orange-100 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
        >
          {isConnecting || isPending ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
              <span>Connecting...</span>
            </>
          ) : (
            <span>Connect MetaMask</span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
       <button
        onClick={() => disconnect()}
        className="w-[10rem] bg-orange-100 hover:bg-orange-200 text-black font-bold py-2 px-4 rounded-lg transition-colors text-lg"
      >
        Disconnect
      </button>
    </div>
  );
};

// Main App Component with Providers
const App: React.FC = () => {
  return (
    <Providers>
   
        
          
          <MetaMaskWallet />
     
     
    </Providers>
  );
};

export default App;