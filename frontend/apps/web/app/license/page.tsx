'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navigation } from '../../components/ipx/Navigation';

interface LicenseableToken {
  id: string;
  name: string;
  type: 'Music' | 'Art' | 'Patent' | 'Code' | 'Video' | 'Writing';
  creator: string;
  image: string;
  description: string;
  royaltyRate: number;
  licenseTerms: string;
  availableLicenses: number;
  price: number;
  duration: string;
  verified: boolean;
}

interface UserLicense {
  id: string;
  tokenId: string;
  tokenName: string;
  type: 'Music' | 'Art' | 'Patent' | 'Code' | 'Video' | 'Writing';
  licenseType: 'Standard Commercial' | 'Non-Commercial' | 'Exclusive Commercial';
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'pending';
  downloadUrl?: string;
  accessCount: number;
  maxAccess: number;
  image: string;
}

const ipTypes = {
  'Music': { emoji: '🎵', color: 'text-purple-400' },
  'Art': { emoji: '🎨', color: 'text-blue-400' },
  'Patent': { emoji: '🔬', color: 'text-green-400' },
  'Code': { emoji: '💻', color: 'text-cyan-400' },
  'Video': { emoji: '🎬', color: 'text-red-400' },
  'Writing': { emoji: '📖', color: 'text-yellow-400' }
};

const licenseTypes = [
  {
    name: 'Standard Commercial',
    description: 'Commercial use with attribution',
    duration: '1 year',
    features: ['Commercial use allowed', 'Attribution required', 'Modify allowed', 'Redistribute allowed']
  },
  {
    name: 'Non-Commercial',
    description: 'Personal and educational use only',
    duration: '6 months',
    features: ['Personal use only', 'Educational use allowed', 'No commercial use', 'Attribution required']
  },
  {
    name: 'Exclusive Commercial',
    description: 'Exclusive commercial rights',
    duration: '2 years',
    features: ['Exclusive rights', 'Full commercial use', 'No attribution needed', 'Resale rights']
  }
];

export default function LicensePage() {
  const [activeTab, setActiveTab] = useState<'browse' | 'my-licenses'>('browse');
  const [licenseableTokens, setLicenseableTokens] = useState<LicenseableToken[]>([]);
  const [userLicenses, setUserLicenses] = useState<UserLicense[]>([]);
  const [selectedToken, setSelectedToken] = useState<LicenseableToken | null>(null);
  const [selectedLicense, setSelectedLicense] = useState<UserLicense | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showLicenseRequest, setShowLicenseRequest] = useState(false);
  const [licenseRequestForm, setLicenseRequestForm] = useState({
    licenseType: '',
    duration: '',
    customTerms: '',
    paymentMethod: 'HBAR'
  });

  useEffect(() => {
    // Generate mock licenseable tokens
    const mockTokens: LicenseableToken[] = Array.from({ length: 15 }, (_, i) => {
      const types = Object.keys(ipTypes) as (keyof typeof ipTypes)[];
      const randomType = types[Math.floor(Math.random() * types.length)] as keyof typeof ipTypes;
      
      return {
        id: `license_${i + 1}`,
        name: `${randomType} Asset #${i + 1}`,
        type: randomType,
        creator: `0x${Math.random().toString(16).substr(2, 8)}...`,
        image: `https://picsum.photos/400/300?random=${i + 200}`,
        description: `Premium ${randomType.toLowerCase()} content available for licensing with flexible terms and competitive rates.`,
        royaltyRate: Math.floor(Math.random() * 15) + 5,
        licenseTerms: 'Standard licensing terms apply. Custom terms available upon request.',
        availableLicenses: Math.floor(Math.random() * 50) + 10,
        price: Math.floor(Math.random() * 500) + 50,
        duration: ['1 month', '3 months', '6 months', '1 year'][Math.floor(Math.random() * 4)] || '1 month',
        verified: Math.random() > 0.2
      };
    });

    // Generate mock user licenses
    const mockUserLicenses: UserLicense[] = Array.from({ length: 5 }, (_, i) => {
      const types = Object.keys(ipTypes) as (keyof typeof ipTypes)[];
      const randomType = types[Math.floor(Math.random() * types.length)] as keyof typeof ipTypes;
      const startDate = new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000);
      const endDate = new Date(startDate.getTime() + Math.random() * 365 * 24 * 60 * 60 * 1000);
      
      return {
        id: `user_license_${i + 1}`,
        tokenId: `token_${i + 1}`,
        tokenName: `Licensed ${randomType} #${i + 1}`,
        type: randomType,
        licenseType: (licenseTypes[Math.floor(Math.random() * licenseTypes.length)]?.name || 'Standard Commercial') as any,
        startDate: startDate.toISOString().split('T')[0] || '',
        endDate: endDate.toISOString().split('T')[0] || '',
        status: endDate > new Date() ? 'active' : 'expired',
        downloadUrl: Math.random() > 0.3 ? `https://ipx.storage/download/${i + 1}` : undefined,
        accessCount: Math.floor(Math.random() * 50),
        maxAccess: 100,
        image: `https://picsum.photos/300/200?random=${i + 300}`
      };
    });

    setLicenseableTokens(mockTokens);
    setUserLicenses(mockUserLicenses);
  }, []);

  const filteredTokens = licenseableTokens.filter(token => {
    const matchesSearch = token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         token.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || token.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleLicenseRequest = () => {
    if (!selectedToken || !licenseRequestForm.licenseType) return;
    
    // Mock license request
    alert(`License request submitted for ${selectedToken.name}!\nType: ${licenseRequestForm.licenseType}\nProcessing time: 24-48 hours`);
    
    setShowLicenseRequest(false);
    setSelectedToken(null);
    setLicenseRequestForm({
      licenseType: '',
      duration: '',
      customTerms: '',
      paymentMethod: 'HBAR'
    });
  };

  const handleDownload = (license: UserLicense) => {
    if (license.downloadUrl) {
      // Mock download
      alert(`Downloading ${license.tokenName}...\nAccess count: ${license.accessCount + 1}/${license.maxAccess}`);
      
      // Update access count
      setUserLicenses(prev => prev.map(l => 
        l.id === license.id 
          ? { ...l, accessCount: l.accessCount + 1 }
          : l
      ));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'expired': return 'text-red-400';
      case 'pending': return 'text-yellow-400';
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
              📄 Licenses
            </h1>
            <p className="text-xl text-gray-400">
              License IP content or manage your existing licenses
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                activeTab === 'browse'
                  ? 'bg-white text-black'
                  : 'border-2 border-white text-white hover:bg-white hover:text-black'
              }`}
              style={{ fontFamily: "Holtwood One SC, serif" }}
            >
              🔍 Browse Licenses
            </button>
            <button
              onClick={() => setActiveTab('my-licenses')}
              className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                activeTab === 'my-licenses'
                  ? 'bg-white text-black'
                  : 'border-2 border-white text-white hover:bg-white hover:text-black'
              }`}
              style={{ fontFamily: "Holtwood One SC, serif" }}
            >
              📋 My Licenses ({userLicenses.length})
            </button>
          </div>

          <AnimatePresence mode="wait">
            {/* Browse Tab */}
            {activeTab === 'browse' && (
              <motion.div
                key="browse"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
                  <div className="relative flex-1 max-w-md">
                    <input
                      type="text"
                      placeholder="Search licenseable content..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-3 pl-12 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                      🔍
                    </div>
                  </div>

                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white"
                  >
                    <option value="all">All Types</option>
                    {Object.keys(ipTypes).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Licenseable Tokens Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTokens.map((token) => (
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
                        
                        <div className="absolute top-3 left-3 flex gap-2">
                          {token.verified && (
                            <div className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                              ✓ Verified
                            </div>
                          )}
                        </div>

                        <div className="absolute top-3 right-3">
                          <div className={`text-2xl ${ipTypes[token.type].color}`}>
                            {ipTypes[token.type].emoji}
                          </div>
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="text-white font-bold text-lg mb-2">{token.name}</h3>
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                          {token.description}
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="text-sm text-gray-400">License Price</div>
                            <div className="text-white font-bold">{token.price} HBAR</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">Duration</div>
                            <div className="text-purple-400">{token.duration}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">Royalty</div>
                            <div className="text-green-400">{token.royaltyRate}%</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">Available</div>
                            <div className="text-blue-400">{token.availableLicenses}</div>
                          </div>
                        </div>

                        <div className="text-xs text-gray-400 mb-3">
                          Creator: {token.creator}
                        </div>

                        <button className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
                          Request License
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* My Licenses Tab */}
            {activeTab === 'my-licenses' && (
              <motion.div
                key="my-licenses"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {userLicenses.map((license) => (
                    <motion.div
                      key={license.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden"
                    >
                      <div className="flex">
                        <img
                          src={license.image}
                          alt={license.tokenName}
                          className="w-32 h-32 object-cover"
                        />
                        
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-white font-bold text-lg">{license.tokenName}</h3>
                              <div className="text-sm text-gray-400">{license.licenseType}</div>
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs ${
                              license.status === 'active' ? 'bg-green-500 text-green-900' :
                              license.status === 'expired' ? 'bg-red-500 text-red-900' :
                              'bg-yellow-500 text-yellow-900'
                            }`}>
                              {license.status}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <div className="text-xs text-gray-400">Start Date</div>
                              <div className="text-white text-sm">{license.startDate}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-400">End Date</div>
                              <div className="text-white text-sm">{license.endDate}</div>
                            </div>
                          </div>

                          <div className="mb-4">
                            <div className="text-xs text-gray-400">Access Usage</div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-purple-600 h-2 rounded-full" 
                                  style={{ width: `${(license.accessCount / license.maxAccess) * 100}%` }}
                                />
                              </div>
                              <div className="text-sm text-white">
                                {license.accessCount}/{license.maxAccess}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            {license.downloadUrl && license.status === 'active' && (
                              <button
                                onClick={() => handleDownload(license)}
                                className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                              >
                                📥 Download
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedLicense(license)}
                              className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
                            >
                              📄 View Terms
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {userLicenses.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📄</div>
                    <h3 className="text-2xl text-white font-bold mb-2">No Licenses Yet</h3>
                    <p className="text-gray-400 mb-6">
                      Start browsing licenseable content to build your license portfolio
                    </p>
                    <button
                      onClick={() => setActiveTab('browse')}
                      className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors"
                    >
                      Browse Licenses
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* License Request Modal */}
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
              {!showLicenseRequest ? (
                // Token Details View
                <div>
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
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-400">License Price</div>
                          <div className="text-xl font-bold text-white">{selectedToken.price} HBAR</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Duration</div>
                          <div className="text-xl font-bold text-purple-400">{selectedToken.duration}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Royalty Rate</div>
                          <div className="text-xl font-bold text-green-400">{selectedToken.royaltyRate}%</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Available</div>
                          <div className="text-xl font-bold text-blue-400">{selectedToken.availableLicenses}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg text-white font-bold mb-3">License Terms</h3>
                    <div className="bg-gray-800 rounded-xl p-4">
                      <p className="text-gray-300 text-sm">{selectedToken.licenseTerms}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setShowLicenseRequest(true)}
                      className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors"
                      style={{ fontFamily: "Holtwood One SC, serif" }}
                    >
                      📝 Request License
                    </button>
                    <button
                      onClick={() => setSelectedToken(null)}
                      className="px-6 py-3 border-2 border-gray-600 text-gray-300 hover:border-white hover:text-white rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // License Request Form
                <div>
                  <h3 className="text-2xl text-white font-bold mb-6">Request License</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-white font-medium mb-2">License Type</label>
                      <div className="grid grid-cols-1 gap-3">
                        {licenseTypes.map((type) => (
                          <button
                            key={type.name}
                            onClick={() => setLicenseRequestForm(prev => ({ ...prev, licenseType: type.name }))}
                            className={`p-4 border-2 rounded-xl text-left transition-colors ${
                              licenseRequestForm.licenseType === type.name
                                ? 'border-purple-500 bg-purple-500/10'
                                : 'border-gray-600 hover:border-gray-500'
                            }`}
                          >
                            <h4 className="text-white font-semibold mb-2">{type.name}</h4>
                            <p className="text-gray-400 text-sm mb-2">{type.description}</p>
                            <div className="text-xs text-gray-500">
                              Duration: {type.duration} • Features: {type.features.join(', ')}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">Custom Terms (Optional)</label>
                      <textarea
                        value={licenseRequestForm.customTerms}
                        onChange={(e) => setLicenseRequestForm(prev => ({ ...prev, customTerms: e.target.value }))}
                        placeholder="Add any specific requirements or modifications to the standard terms"
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">Payment Method</label>
                      <select
                        value={licenseRequestForm.paymentMethod}
                        onChange={(e) => setLicenseRequestForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                      >
                        <option value="HBAR">HBAR</option>
                        <option value="USDC">USDC (Stablecoin)</option>
                        <option value="ETH">ETH</option>
                      </select>
                    </div>

                    <div className="bg-gray-800 rounded-xl p-4">
                      <h4 className="text-white font-semibold mb-2">Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">License Price:</span>
                          <span className="text-white">{selectedToken.price} {licenseRequestForm.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Platform Fee (5%):</span>
                          <span className="text-white">{(selectedToken.price * 0.05).toFixed(2)} {licenseRequestForm.paymentMethod}</span>
                        </div>
                        <hr className="border-gray-600" />
                        <div className="flex justify-between font-bold">
                          <span className="text-white">Total:</span>
                          <span className="text-white">{(selectedToken.price * 1.05).toFixed(2)} {licenseRequestForm.paymentMethod}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <button
                      onClick={handleLicenseRequest}
                      disabled={!licenseRequestForm.licenseType}
                      className={`flex-1 py-3 text-white font-bold rounded-xl transition-colors ${
                        licenseRequestForm.licenseType
                          ? 'bg-purple-600 hover:bg-purple-700'
                          : 'bg-gray-600 cursor-not-allowed'
                      }`}
                      style={{ fontFamily: "Holtwood One SC, serif" }}
                    >
                      📝 Submit Request
                    </button>
                    <button
                      onClick={() => setShowLicenseRequest(false)}
                      className="px-6 py-3 border-2 border-gray-600 text-gray-300 hover:border-white hover:text-white rounded-xl transition-colors"
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* License Details Modal */}
      <AnimatePresence>
        {selectedLicense && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6"
            onClick={() => setSelectedLicense(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gray-900 rounded-2xl border border-gray-700 p-8 max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl text-white font-bold mb-6">License Agreement</h3>
              
              <div className="space-y-4">
                <div>
                  <span className="text-gray-400">Token:</span>
                  <span className="text-white ml-2">{selectedLicense.tokenName}</span>
                </div>
                <div>
                  <span className="text-gray-400">License Type:</span>
                  <span className="text-white ml-2">{selectedLicense.licenseType}</span>
                </div>
                <div>
                  <span className="text-gray-400">Valid Period:</span>
                  <span className="text-white ml-2">
                    {selectedLicense.startDate} to {selectedLicense.endDate}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Status:</span>
                  <span className={`ml-2 ${getStatusColor(selectedLicense.status)}`}>
                    {selectedLicense.status}
                  </span>
                </div>
              </div>

              <div className="mt-6 bg-gray-800 rounded-xl p-4">
                <h4 className="text-white font-semibold mb-2">Terms & Conditions</h4>
                <p className="text-gray-300 text-sm">
                  This license grants you the rights specified in the {selectedLicense.licenseType} agreement. 
                  Please ensure compliance with all terms during the license period.
                </p>
              </div>

              <button
                onClick={() => setSelectedLicense(null)}
                className="w-full mt-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
