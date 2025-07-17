'use client';

// components/WalletConnection.tsx
import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';

export const WalletConnection = () => {
  // Demo mode - always show as connected with sample Internet Identity
  const [isConnected, setIsConnected] = useState(true);
  const [showIdentityLoading, setShowIdentityLoading] = useState(false);
  const [showIdentity, setShowIdentity] = useState(true);
  
  // Sample Internet Identity
  const samplePrincipal = "rdmx6-jaaaa-aaaah-qcaiq-cai";
  const sampleIdentityNumber = "10001";

  const handleConnect = () => {
    setIsConnected(false);
    setShowIdentityLoading(true);
    setShowIdentity(false);
    
    // Simulate connection process
    setTimeout(() => {
      setIsConnected(true);
      setShowIdentityLoading(false);
      
      // Show loading for Internet Identity
      setTimeout(() => {
        setShowIdentity(true);
      }, 2000);
    }, 1000);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setShowIdentityLoading(false);
    setShowIdentity(false);
  };

  if (showIdentityLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 border-2 border-green-600 rounded-full animate-spin border-t-transparent"></div>
        <span className="text-sm text-green-600">Loading Internet Identity...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      {isConnected ? (
        <>
          {showIdentity ? (
            <div className="text-sm">
              <div className="flex flex-col">
               
                <span className="font-mono text-xs bg-green-100 text-green-800 px-2 py-1 rounded border border-green-200">
                  {samplePrincipal.slice(0, 8)}...{samplePrincipal.slice(-4)}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-sm">
              <span className="text-gray-600">Connected:</span>
              <span className="ml-2 font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                {samplePrincipal.slice(0, 8)}...{samplePrincipal.slice(-4)}
              </span>
            </div>
          )}
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Disconnect
          </button>
        </>
      ) : (
        <button
          onClick={handleConnect}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
};

// components/VaultManager.tsx

import { useIPXProtocol } from '../hooks/useIPXProtocol';
import { VaultService } from '../services/protocolServices';

export const VaultManager = () => {
  // Demo mode - always authenticated
  const authenticated = true;
  const [balance, setBalance] = useState<number>(1250.75); // Sample balance
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

  const handleDeposit = async () => {
    if (!depositAmount) return;
    
    setLoading(true);
    setMessage('');
    
    // Simulate deposit process
    setTimeout(() => {
      const depositValue = parseFloat(depositAmount);
      setBalance(prev => prev + depositValue);
      setMessage(`Deposit successful: ${depositValue} ICP added to your vault`);
      setDepositAmount('');
      setLoading(false);
    }, 2000);
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount) return;
    
    const withdrawValue = parseFloat(withdrawAmount);
    if (withdrawValue > balance) {
      setMessage('Insufficient balance for withdrawal');
      return;
    }
    
    setLoading(true);
    setMessage('');
    
    // Simulate withdrawal process
    setTimeout(() => {
      setBalance(prev => prev - withdrawValue);
      setMessage(`Withdrawal successful: ${withdrawValue} ICP withdrawn from your vault`);
      setWithdrawAmount('');
      setLoading(false);
    }, 2000);
  };

  if (!authenticated) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Please connect your wallet to access vault features.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Vault Manager</h2>
      
      <div className="mb-6">
        <div className="text-lg">
          <span className="text-gray-600">Current Balance:</span>
          <span className="ml-2 font-semibold">{balance.toLocaleString()} ICP</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Deposit Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Deposit</h3>
          <div className="space-y-2">
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="Amount to deposit"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleDeposit}
              disabled={loading || !depositAmount}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Depositing...' : 'Deposit'}
            </button>
          </div>
        </div>

        {/* Withdraw Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Withdraw</h3>
          <div className="space-y-2">
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Amount to withdraw"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleWithdraw}
              disabled={loading || !withdrawAmount}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Withdrawing...' : 'Withdraw'}
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div className="mt-4 p-3 bg-gray-100 border border-gray-300 rounded-lg">
          <p className="text-sm">{message}</p>
        </div>
      )}
    </div>
  );
};
