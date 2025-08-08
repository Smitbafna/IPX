'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navigation } from '../../components/ipx/Navigation';

interface IPToken {
  id: string;
  name: string;
  description: string;
  creator: string;
  price: number;
  royaltyRate: number;
  type: 'Music' | 'Art' | 'Patent' | 'Code' | 'Video' | 'Writing';
  image: string;
  verified: boolean;
  totalSupply: number;
  availableSupply: number;
  lastSalePrice?: number;
  trending: boolean;
  recentRoyalty: number;
}

const ipTypes = {
  'Music': { emoji: '🎵', color: 'text-purple-400' },
  'Art': { emoji: '🎨', color: 'text-blue-400' },
  'Patent': { emoji: '🔬', color: 'text-green-400' },
  'Code': { emoji: '💻', color: 'text-cyan-400' },
  'Video': { emoji: '🎬', color: 'text-red-400' },
  'Writing': { emoji: '📖', color: 'text-yellow-400' }
};

export default function MarketplacePage() {
  const [tokens, setTokens] = useState<IPToken[]>([]);
  const [filteredTokens, setFilteredTokens] = useState<IPToken[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'price' | 'royalty' | 'trending' | 'recent'>('trending');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedToken, setSelectedToken] = useState<IPToken | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const tokensPerPage = 12;

  // Generate mock data
  useEffect(() => {
    const mockTokens: IPToken[] = Array.from({ length: 50 }, (_, i) => {
      const types = Object.keys(ipTypes) as (keyof typeof ipTypes)[];
      const randomType = types[Math.floor(Math.random() * types.length)] as keyof typeof ipTypes;
      
      return {
        id: `token_${i + 1}`,
        name: `${randomType} Asset #${i + 1}`,
        description: `High-quality ${randomType.toLowerCase()} intellectual property with proven market value and strong licensing potential.`,
        creator: `0x${Math.random().toString(16).substr(2, 8)}...`,
        price: Math.floor(Math.random() * 9000) + 1000, // 1000-10000
        royaltyRate: Math.floor(Math.random() * 15) + 5, // 5-20%
        type: randomType,
        image: `https://picsum.photos/400/300?random=${i}`,
        verified: Math.random() > 0.3,
        totalSupply: Math.floor(Math.random() * 9000) + 1000,
        availableSupply: Math.floor(Math.random() * 500) + 100,
        lastSalePrice: Math.random() > 0.5 ? Math.floor(Math.random() * 5000) + 500 : undefined,
        trending: Math.random() > 0.7,
        recentRoyalty: Math.floor(Math.random() * 500)
      };
    });

    setTokens(mockTokens);
    setFilteredTokens(mockTokens);
  }, []);

  // Filter and sort tokens
  useEffect(() => {
    let filtered = tokens.filter(token => {
      const matchesSearch = token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          token.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === 'all' || token.type === selectedType;
      const matchesPrice = token.price >= priceRange.min && token.price <= priceRange.max;
      
      return matchesSearch && matchesType && matchesPrice;
    });

    // Sort tokens
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'royalty':
          return b.royaltyRate - a.royaltyRate;
        case 'trending':
          return (b.trending ? 1 : 0) - (a.trending ? 1 : 0);
        case 'recent':
          return b.recentRoyalty - a.recentRoyalty;
        default:
          return 0;
      }
    });

    setFilteredTokens(filtered);
    setCurrentPage(1);
  }, [tokens, searchQuery, selectedType, sortBy, priceRange]);

  const paginatedTokens = filteredTokens.slice(
    (currentPage - 1) * tokensPerPage,
    currentPage * tokensPerPage
  );

  const totalPages = Math.ceil(filteredTokens.length / tokensPerPage);

  const handlePurchase = (token: IPToken) => {
    // Mock purchase logic
    alert(`Purchasing ${token.name} for ${token.price} HBAR`);
    setSelectedToken(null);
  };

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      {/* Header */}
      <div className="pt-24 pb-8 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h1 
              className="text-4xl md:text-6xl text-white font-bold mb-4"
              style={{ fontFamily: "Holtwood One SC, serif" }}
            >
              🏪 IP Marketplace
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Discover, invest in, and trade intellectual property tokens from creators worldwide
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search IP tokens..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-12 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔍
                </div>
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-colors"
              >
                🔧 Filters
              </button>
            </div>

            {/* Filters Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-gray-900 rounded-xl p-6 border border-gray-700"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* IP Type Filter */}
                    <div>
                      <label className="text-white font-medium mb-2 block">IP Type</label>
                      <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                      >
                        <option value="all">All Types</option>
                        {Object.keys(ipTypes).map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    {/* Sort By */}
                    <div>
                      <label className="text-white font-medium mb-2 block">Sort By</label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                      >
                        <option value="trending">Trending</option>
                        <option value="price">Price (Low to High)</option>
                        <option value="royalty">Royalty Rate</option>
                        <option value="recent">Recent Payouts</option>
                      </select>
                    </div>

                    {/* Price Range */}
                    <div>
                      <label className="text-white font-medium mb-2 block">
                        Price Range (HBAR): {priceRange.min} - {priceRange.max}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="range"
                          min="0"
                          max="10000"
                          value={priceRange.min}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) }))}
                          className="flex-1"
                        />
                        <input
                          type="range"
                          min="0"
                          max="10000"
                          value={priceRange.max}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    {/* Results Count */}
                    <div className="flex items-end">
                      <div className="text-gray-400">
                        <div className="text-2xl font-bold text-white">{filteredTokens.length}</div>
                        <div className="text-sm">Results found</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Token Grid */}
      <div className="px-6 pb-20">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedTokens.map((token) => (
              <motion.div
                key={token.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden hover:border-purple-500 transition-all duration-300 cursor-pointer group"
                onClick={() => setSelectedToken(token)}
              >
                {/* Token Image */}
                <div className="relative aspect-video">
                  <img
                    src={token.image}
                    alt={token.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {token.verified && (
                      <div className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                        ✓ Verified
                      </div>
                    )}
                    {token.trending && (
                      <div className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                        🔥 Trending
                      </div>
                    )}
                  </div>

                  {/* Type Badge */}
                  <div className="absolute top-3 right-3">
                    <div className={`text-2xl ${ipTypes[token.type].color}`}>
                      {ipTypes[token.type].emoji}
                    </div>
                  </div>
                </div>

                {/* Token Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-bold text-lg group-hover:text-purple-400 transition-colors">
                      {token.name}
                    </h3>
                    <div className="text-right">
                      <div className="text-white font-bold">{token.price} HBAR</div>
                      <div className="text-green-400 text-sm">{token.royaltyRate}% royalty</div>
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {token.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>Creator: {token.creator}</span>
                    <span>{token.availableSupply}/{token.totalSupply} available</span>
                  </div>

                  {token.lastSalePrice && (
                    <div className="text-xs text-gray-400 mb-2">
                      Last sale: {token.lastSalePrice} HBAR
                    </div>
                  )}

                  <button className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
                    View Details
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-12 gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = currentPage - 2 + i;
                if (pageNum < 1 || pageNum > totalPages) return null;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === pageNum
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          )}
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
                  
                  <p className="text-gray-400 mb-4">{selectedToken.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-400">Price</div>
                      <div className="text-xl font-bold text-white">{selectedToken.price} HBAR</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Royalty Rate</div>
                      <div className="text-xl font-bold text-green-400">{selectedToken.royaltyRate}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Available Supply</div>
                      <div className="text-white">{selectedToken.availableSupply}/{selectedToken.totalSupply}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Recent Royalty</div>
                      <div className="text-white">{selectedToken.recentRoyalty} HBAR</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => handlePurchase(selectedToken)}
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors"
                  style={{ fontFamily: "Holtwood One SC, serif" }}
                >
                  💰 Purchase Token
                </button>
                <button
                  onClick={() => setSelectedToken(null)}
                  className="px-6 py-3 border-2 border-gray-600 text-gray-300 hover:border-white hover:text-white rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
