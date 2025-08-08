'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface User {
  address: string;
  isKYCVerified: boolean;
  notifications: number;
}

interface ConnectWalletProps {
  onUserChange?: (user: User | null) => void;
}

export const ConnectWallet: React.FC<ConnectWalletProps> = ({ onUserChange }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Mock wallet connection for demo
  const connectWallet = async () => {
    setIsConnecting(true);
    
    try {
      // Simulate wallet connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockUser: User = {
        address: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`,
        isKYCVerified: Math.random() > 0.5,
        notifications: Math.floor(Math.random() * 5)
      };
      
      setUser(mockUser);
      onUserChange?.(mockUser);
      
      // Save to localStorage
      localStorage.setItem('ipx_user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setUser(null);
    onUserChange?.(null);
    localStorage.removeItem('ipx_user');
    setShowDropdown(false);
  };

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('ipx_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      onUserChange?.(parsedUser);
    }
  }, [onUserChange]);

  if (user) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-3 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-600 transition-all duration-200"
        >
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">
              {user.address.slice(2, 4).toUpperCase()}
            </span>
          </div>
          <div className="hidden md:block text-left">
            <div className="text-white text-sm font-medium">{user.address}</div>
            <div className={`text-xs ${user.isKYCVerified ? 'text-green-400' : 'text-yellow-400'}`}>
              {user.isKYCVerified ? '✓ Verified' : '⏳ Pending KYC'}
            </div>
          </div>
          <div className="text-gray-400">
            {showDropdown ? '▲' : '▼'}
          </div>
        </button>

        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl z-50"
          >
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {user.address.slice(2, 4).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="text-white font-medium">{user.address}</div>
                  <div className={`text-xs ${user.isKYCVerified ? 'text-green-400' : 'text-yellow-400'}`}>
                    {user.isKYCVerified ? '✓ KYC Verified' : '⏳ KYC Pending'}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => window.open('/profile', '_self')}
                  className="w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  👤 Profile
                </button>
                <button
                  onClick={() => window.open('/profile/settings', '_self')}
                  className="w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  ⚙️ Settings
                </button>
                <hr className="border-gray-600" />
                <button
                  onClick={disconnectWallet}
                  className="w-full text-left px-3 py-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  🔌 Disconnect
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      disabled={isConnecting}
      className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
        isConnecting
          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
          : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
      }`}
      style={{ fontFamily: "Holtwood One SC, serif" }}
    >
      {isConnecting ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          Connecting...
        </div>
      ) : (
        '🔗 Connect Wallet'
      )}
    </button>
  );
};
