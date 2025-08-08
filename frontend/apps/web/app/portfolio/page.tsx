'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navigation } from '../../components/ipx/Navigation';

interface OwnedToken {
  id: string;
  name: string;
  type: 'Music' | 'Art' | 'Patent' | 'Code' | 'Video' | 'Writing';
  shares: number;
  totalSupply: number;
  currentValue: number;
  purchasePrice: number;
  totalEarnings: number;
  recentEarnings: number;
  status: 'active' | 'pending' | 'expired';
  image: string;
  royaltyRate: number;
  lastPayout: string;
}

interface Transaction {
  id: string;
  type: 'purchase' | 'sale' | 'royalty' | 'withdrawal';
  tokenName: string;
  amount: number;
  date: string;
  txHash: string;
  status: 'completed' | 'pending' | 'failed';
}

const ipTypes = {
  'Music': { emoji: '🎵', color: 'text-purple-400' },
  'Art': { emoji: '🎨', color: 'text-blue-400' },
  'Patent': { emoji: '🔬', color: 'text-green-400' },
  'Code': { emoji: '💻', color: 'text-cyan-400' },
  'Video': { emoji: '🎬', color: 'text-red-400' },
  'Writing': { emoji: '📖', color: 'text-yellow-400' }
};

export default function PortfolioPage() {
  const [ownedTokens, setOwnedTokens] = useState<OwnedToken[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedToken, setSelectedToken] = useState<OwnedToken | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'tokens' | 'transactions' | 'earnings'>('overview');
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    // Generate mock portfolio data
    const mockTokens: OwnedToken[] = Array.from({ length: 8 }, (_, i) => {
      const types = Object.keys(ipTypes) as (keyof typeof ipTypes)[];
      const randomType = types[Math.floor(Math.random() * types.length)] as keyof typeof ipTypes;
      const purchasePrice = Math.floor(Math.random() * 5000) + 500;
      const currentValue = purchasePrice + (Math.random() - 0.5) * 1000;
      
      return {
        id: `owned_${i + 1}`,
        name: `${randomType} Asset #${i + 1}`,
        type: randomType,
        shares: Math.floor(Math.random() * 500) + 50,
        totalSupply: Math.floor(Math.random() * 5000) + 1000,
        currentValue: Math.max(100, currentValue),
        purchasePrice,
        totalEarnings: Math.floor(Math.random() * 2000),
        recentEarnings: Math.floor(Math.random() * 200),
        status: Math.random() > 0.1 ? 'active' : 'pending',
        image: `https://picsum.photos/300/200?random=${i + 100}`,
        royaltyRate: Math.floor(Math.random() * 15) + 5,
        lastPayout: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
    });

    const mockTransactions: Transaction[] = Array.from({ length: 20 }, (_, i) => {
      const types: Transaction['type'][] = ['purchase', 'sale', 'royalty', 'withdrawal'];
      const statuses: Transaction['status'][] = ['completed', 'pending', 'failed'];
      
      return {
        id: `tx_${i + 1}`,
        type: types[Math.floor(Math.random() * types.length)],
        tokenName: `Asset #${Math.floor(Math.random() * 10) + 1}`,
        amount: Math.floor(Math.random() * 1000) + 10,
        date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        txHash: `0x${Math.random().toString(16).substr(2, 16)}...`,
        status: i < 2 ? 'pending' : statuses[Math.floor(Math.random() * statuses.length)]
      };
    });

    setOwnedTokens(mockTokens);
    setTransactions(mockTransactions);
  }, []);

  const totalPortfolioValue = ownedTokens.reduce((sum, token) => sum + token.currentValue, 0);
  const totalInvestment = ownedTokens.reduce((sum, token) => sum + token.purchasePrice, 0);
  const totalEarnings = ownedTokens.reduce((sum, token) => sum + token.totalEarnings, 0);
  const portfolioROI = totalInvestment > 0 ? ((totalPortfolioValue + totalEarnings - totalInvestment) / totalInvestment) * 100 : 0;

  const recentRoyalties = transactions.filter(tx => tx.type === 'royalty' && tx.status === 'completed');
  const pendingWithdrawals = transactions.filter(tx => tx.type === 'withdrawal' && tx.status === 'pending');

  const handleWithdraw = () => {
    // Mock withdrawal
    alert('Withdrawal request submitted! Funds will be processed within 24 hours.');
  };

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'purchase': return '🛒';
      case 'sale': return '💰';
      case 'royalty': return '💎';
      case 'withdrawal': return '🏦';
      default: return '📝';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      case 'active': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      <div className="pt-24 pb-20 px-6">
        <div className="container mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 
              className="text-4xl md:text-6xl text-white font-bold mb-4"
              style={{ fontFamily: "Holtwood One SC, serif" }}
            >
              💼 Portfolio
            </h1>
            <p className="text-xl text-gray-400">
              Track your IP token investments and royalty earnings
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center gap-4 mb-8">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'tokens', label: 'My Tokens', icon: '🎨' },
              { id: 'transactions', label: 'Transactions', icon: '📜' },
              { id: 'earnings', label: 'Earnings', icon: '💰' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-white text-black'
                    : 'border-2 border-white text-white hover:bg-white hover:text-black'
                }`}
                style={{ fontFamily: "Holtwood One SC, serif" }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Portfolio Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
                    <div className="text-3xl mb-2">💼</div>
                    <div className="text-2xl font-bold text-white">{totalPortfolioValue.toLocaleString()} HBAR</div>
                    <div className="text-gray-400">Portfolio Value</div>
                  </div>
                  
                  <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
                    <div className="text-3xl mb-2">📈</div>
                    <div className={`text-2xl font-bold ${portfolioROI >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {portfolioROI >= 0 ? '+' : ''}{portfolioROI.toFixed(1)}%
                    </div>
                    <div className="text-gray-400">Total ROI</div>
                  </div>
                  
                  <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
                    <div className="text-3xl mb-2">💎</div>
                    <div className="text-2xl font-bold text-purple-400">{totalEarnings.toLocaleString()} HBAR</div>
                    <div className="text-gray-400">Total Earnings</div>
                  </div>
                  
                  <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
                    <div className="text-3xl mb-2">🎨</div>
                    <div className="text-2xl font-bold text-blue-400">{ownedTokens.length}</div>
                    <div className="text-gray-400">Owned Tokens</div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Top Performing Tokens */}
                  <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
                    <h3 className="text-xl text-white font-bold mb-4">🚀 Top Performers</h3>
                    <div className="space-y-4">
                      {ownedTokens
                        .sort((a, b) => ((b.currentValue - b.purchasePrice) / b.purchasePrice) - ((a.currentValue - a.purchasePrice) / a.purchasePrice))
                        .slice(0, 3)
                        .map((token) => {
                          const profit = token.currentValue - token.purchasePrice;
                          const profitPercent = (profit / token.purchasePrice) * 100;
                          
                          return (
                            <div key={token.id} className="flex items-center gap-4 p-3 bg-gray-800 rounded-xl">
                              <img 
                                src={token.image} 
                                alt={token.name}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <div className="text-white font-medium">{token.name}</div>
                                <div className="text-sm text-gray-400">
                                  {token.shares}/{token.totalSupply} shares
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {profit >= 0 ? '+' : ''}{profit.toFixed(0)} HBAR
                                </div>
                                <div className={`text-sm ${profitPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {profitPercent >= 0 ? '+' : ''}{profitPercent.toFixed(1)}%
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Recent Royalties */}
                  <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl text-white font-bold">💰 Recent Royalties</h3>
                      <button
                        onClick={handleWithdraw}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
                      >
                        Withdraw All
                      </button>
                    </div>
                    <div className="space-y-3">
                      {recentRoyalties.slice(0, 4).map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="text-xl">💎</div>
                            <div>
                              <div className="text-white font-medium">{tx.tokenName}</div>
                              <div className="text-sm text-gray-400">
                                {new Date(tx.date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-green-400 font-bold">
                            +{tx.amount} HBAR
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tokens Tab */}
            {activeTab === 'tokens' && (
              <motion.div
                key="tokens"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ownedTokens.map((token) => (
                    <motion.div
                      key={token.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden hover:border-purple-500 transition-all duration-300 cursor-pointer"
                      onClick={() => setSelectedToken(token)}
                    >
                      <div className="relative">
                        <img
                          src={token.image}
                          alt={token.name}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-3 left-3">
                          <div className={`px-2 py-1 rounded-full text-xs ${
                            token.status === 'active' ? 'bg-green-500 text-green-900' :
                            token.status === 'pending' ? 'bg-yellow-500 text-yellow-900' :
                            'bg-gray-500 text-gray-900'
                          }`}>
                            {token.status}
                          </div>
                        </div>
                        <div className="absolute top-3 right-3">
                          <div className={`text-2xl ${ipTypes[token.type].color}`}>
                            {ipTypes[token.type].emoji}
                          </div>
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="text-white font-bold text-lg mb-2">{token.name}</h3>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="text-sm text-gray-400">Your Shares</div>
                            <div className="text-white font-medium">
                              {token.shares}/{token.totalSupply}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">Current Value</div>
                            <div className="text-white font-medium">
                              {token.currentValue.toFixed(0)} HBAR
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">Total Earnings</div>
                            <div className="text-green-400 font-medium">
                              +{token.totalEarnings} HBAR
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">Royalty Rate</div>
                            <div className="text-purple-400 font-medium">
                              {token.royaltyRate}%
                            </div>
                          </div>
                        </div>

                        <div className="text-xs text-gray-400">
                          Last payout: {token.lastPayout}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <motion.div
                key="transactions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="bg-gray-900 rounded-2xl border border-gray-700 overflow-hidden">
                  <div className="p-6 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl text-white font-bold">Transaction History</h3>
                      <select
                        value={timeframe}
                        onChange={(e) => setTimeframe(e.target.value as any)}
                        className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm"
                      >
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                        <option value="1y">Last year</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="p-4 border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-2xl">{getTransactionIcon(tx.type)}</div>
                            <div>
                              <div className="text-white font-medium">
                                {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)} - {tx.tokenName}
                              </div>
                              <div className="text-sm text-gray-400">
                                {new Date(tx.date).toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500">
                                {tx.txHash}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className={`font-bold ${
                              tx.type === 'purchase' || tx.type === 'withdrawal' 
                                ? 'text-red-400' 
                                : 'text-green-400'
                            }`}>
                              {tx.type === 'purchase' || tx.type === 'withdrawal' ? '-' : '+'}
                              {tx.amount} HBAR
                            </div>
                            <div className={`text-sm ${getStatusColor(tx.status)}`}>
                              {tx.status}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Earnings Tab */}
            {activeTab === 'earnings' && (
              <motion.div
                key="earnings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
                      <h3 className="text-xl text-white font-bold mb-6">Earnings by Token</h3>
                      <div className="space-y-4">
                        {ownedTokens
                          .sort((a, b) => b.totalEarnings - a.totalEarnings)
                          .map((token) => (
                            <div key={token.id} className="flex items-center gap-4 p-4 bg-gray-800 rounded-xl">
                              <img 
                                src={token.image} 
                                alt={token.name}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <div className="text-white font-medium mb-1">{token.name}</div>
                                <div className="text-sm text-gray-400">
                                  {token.royaltyRate}% royalty • {token.shares} shares
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                                  <div 
                                    className="bg-purple-600 h-2 rounded-full" 
                                    style={{ 
                                      width: `${Math.min(100, (token.totalEarnings / Math.max(...ownedTokens.map(t => t.totalEarnings))) * 100)}%` 
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-green-400">
                                  {token.totalEarnings.toLocaleString()} HBAR
                                </div>
                                <div className="text-sm text-gray-400">
                                  +{token.recentEarnings} this month
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
                      <h4 className="text-lg text-white font-bold mb-4">💰 Available Balance</h4>
                      <div className="text-3xl font-bold text-green-400 mb-4">
                        {recentRoyalties.reduce((sum, tx) => sum + tx.amount, 0).toLocaleString()} HBAR
                      </div>
                      <button
                        onClick={handleWithdraw}
                        className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors"
                      >
                        Withdraw Earnings
                      </button>
                    </div>

                    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
                      <h4 className="text-lg text-white font-bold mb-4">📊 Earnings Stats</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">This Month:</span>
                          <span className="text-white font-medium">
                            {ownedTokens.reduce((sum, token) => sum + token.recentEarnings, 0)} HBAR
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Average per Token:</span>
                          <span className="text-white font-medium">
                            {ownedTokens.length > 0 ? (totalEarnings / ownedTokens.length).toFixed(0) : 0} HBAR
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Best Performer:</span>
                          <span className="text-green-400 font-medium">
                            {ownedTokens.sort((a, b) => b.totalEarnings - a.totalEarnings)[0]?.name.split(' ')[0] || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Token Detail Modal */}
      <AnimatePresence>
        {selectedToken && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6"
            onClick={() => setSelectedToken(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gray-900 rounded-2xl border border-gray-700 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-6 mb-6">
                <img
                  src={selectedToken.image}
                  alt={selectedToken.name}
                  className="w-48 h-32 object-cover rounded-xl"
                />
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-white">{selectedToken.name}</h2>
                    <div className="text-2xl">{ipTypes[selectedToken.type].emoji}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-400">Your Investment</div>
                      <div className="text-xl font-bold text-white">{selectedToken.purchasePrice} HBAR</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Current Value</div>
                      <div className="text-xl font-bold text-blue-400">{selectedToken.currentValue.toFixed(0)} HBAR</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Total Earnings</div>
                      <div className="text-xl font-bold text-green-400">{selectedToken.totalEarnings} HBAR</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Your Shares</div>
                      <div className="text-white">{selectedToken.shares}/{selectedToken.totalSupply}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => alert('Sell functionality coming soon!')}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors"
                  style={{ fontFamily: "Holtwood One SC, serif" }}
                >
                  💸 Sell Shares
                </button>
                <button
                  onClick={() => setSelectedToken(null)}
                  className="px-6 py-3 border-2 border-gray-600 text-gray-300 hover:border-white hover:text-white rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
