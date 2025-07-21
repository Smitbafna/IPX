'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Ghost {
  id: string;
  name: string;
  type: 'Whisper' | 'Poltergeist' | 'Banshee' | 'Wraith';
  emoji: string;
  haunting: number;
  mischief: number;
  charisma: number;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  timestamp: number;
  txHash: string;
}

interface Possession {
  id: string;
  ghostId: string;
  ghostName: string;
  ghostEmoji: string;
  ghostType: string;
  targetWallet: string;
  targetENS?: string;
  timestamp: number;
  duration: number; // in hours
  chaosLevel: number;
  effects: string[];
  isActive: boolean;
  exorcismReward: number;
}

interface PossessionHistory {
  id: string;
  action: 'possessed' | 'exorcised' | 'challenged';
  ghostName: string;
  targetWallet: string;
  timestamp: number;
  reward?: number;
}

export default function PossessionPage() {
  const [userGhosts, setUserGhosts] = useState<Ghost[]>([]);
  const [selectedGhost, setSelectedGhost] = useState<Ghost | null>(null);
  const [targetWallet, setTargetWallet] = useState('');
  const [isPossessing, setIsPossessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'select' | 'target' | 'possessing' | 'success'>('select');
  const [activePossessions, setActivePossessions] = useState<Possession[]>([]);
  const [possessionHistory, setPossessionHistory] = useState<PossessionHistory[]>([]);
  const [newPossession, setNewPossession] = useState<Possession | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [chaosMode, setChaosMode] = useState(false);

  // Load data on mount
  useEffect(() => {
    const savedGhosts = localStorage.getItem('ghostCollection');
    const savedPossessions = localStorage.getItem('activePossessions');
    const savedHistory = localStorage.getItem('possessionHistory');

    if (savedGhosts) {
      setUserGhosts(JSON.parse(savedGhosts));
    }
    if (savedPossessions) {
      setActivePossessions(JSON.parse(savedPossessions));
    }
    if (savedHistory) {
      setPossessionHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save possessions to localStorage
  useEffect(() => {
    localStorage.setItem('activePossessions', JSON.stringify(activePossessions));
  }, [activePossessions]);

  useEffect(() => {
    localStorage.setItem('possessionHistory', JSON.stringify(possessionHistory));
  }, [possessionHistory]);

  // Generate possession effects based on ghost type
  const generatePossessionEffects = (ghost: Ghost, wallet: string): string[] => {
    const baseEffects = [
      "Wallet UI glitches and flickers",
      "Transaction confirmations appear spooky",
      "Balance displays show ghostly animations"
    ];

    const typeEffects = {
      'Whisper': [
        "Silent transactions appear without notifications",
        "Wallet whispers cryptic messages",
        "Interface becomes translucent and ethereal"
      ],
      'Poltergeist': [
        "Buttons randomly move around the interface",
        "DeFi protocols show chaotic price movements",
        "Wallet throws phantom error messages"
      ],
      'Banshee': [
        "Wallet emits otherworldly sounds",
        "Warning messages appear in ancient script",
        "Network connections become unstable"
      ],
      'Wraith': [
        "Wallet appears to drain energy from other apps",
        "Dark shadows appear around transaction history",
        "Soul-bound tokens become more prominent"
      ]
    };

    return [...baseEffects, ...typeEffects[ghost.type]];
  };

  // Calculate chaos level based on ghost stats
  const calculateChaosLevel = (ghost: Ghost): number => {
    const baseLevel = (ghost.haunting + ghost.mischief) / 2;
    const rarityMultiplier = {
      'Common': 1,
      'Rare': 1.2,
      'Epic': 1.5,
      'Legendary': 2
    };
    return Math.min(100, Math.floor(baseLevel * rarityMultiplier[ghost.rarity]));
  };

  // Validate wallet address
  const isValidWallet = (address: string): boolean => {
    // Basic ETH address validation
    const ethRegex = /^0x[a-fA-F0-9]{40}$/;
    // ENS domain validation
    const ensRegex = /^[a-z0-9\-]+\.eth$/;
    
    return ethRegex.test(address) || ensRegex.test(address.toLowerCase());
};

  // Handle possession process
  const handlePossession = async () => {
    if (!selectedGhost || !targetWallet || !isValidWallet(targetWallet)) return;

    setIsPossessing(true);
    setCurrentStep('possessing');

    // Simulate possession process
    setTimeout(() => {
      const chaosLevel = calculateChaosLevel(selectedGhost);
      const effects = generatePossessionEffects(selectedGhost, targetWallet);
      const duration = Math.floor(Math.random() * 48) + 24; // 24-72 hours
      const exorcismReward = Math.floor(chaosLevel * 0.1) + 5; // 5-15 tokens

      const possession: Possession = {
        id: `possession_${Date.now()}`,
        ghostId: selectedGhost.id,
        ghostName: selectedGhost.name,
        ghostEmoji: selectedGhost.emoji,
        ghostType: selectedGhost.type,
        targetWallet,
        targetENS: targetWallet.endsWith('.eth') ? targetWallet : undefined,
        timestamp: Date.now(),
        duration,
        chaosLevel,
        effects,
        isActive: true,
        exorcismReward
      };

      setNewPossession(possession);
      setActivePossessions(prev => [...prev, possession]);

      // Add to history
      const historyEntry: PossessionHistory = {
        id: `history_${Date.now()}`,
        action: 'possessed',
        ghostName: selectedGhost.name,
        targetWallet,
        timestamp: Date.now()
      };
      setPossessionHistory(prev => [...prev, historyEntry]);

      setCurrentStep('success');
      setIsPossessing(false);
      setChaosMode(true);

      // Reset chaos mode after animation
      setTimeout(() => setChaosMode(false), 3000);
    }, 4000);
  };

  // Handle exorcism
  const handleExorcism = (possessionId: string) => {
    const possession = activePossessions.find(p => p.id === possessionId);
    if (!possession) return;

    // Remove from active possessions
    setActivePossessions(prev => prev.filter(p => p.id !== possessionId));

    // Add to history with reward
    const historyEntry: PossessionHistory = {
      id: `history_${Date.now()}`,
      action: 'exorcised',
      ghostName: possession.ghostName,
      targetWallet: possession.targetWallet,
      timestamp: Date.now(),
      reward: possession.exorcismReward
    };
    setPossessionHistory(prev => [...prev, historyEntry]);

    alert(`Exorcism successful! Earned ${possession.exorcismReward} Spirit Tokens! 👻💰`);
  };

  // Reset possession flow
  const resetPossession = () => {
    setSelectedGhost(null);
    setTargetWallet('');
    setNewPossession(null);
    setCurrentStep('select');
  };

  const availableGhosts = userGhosts.filter(ghost => 
    !activePossessions.some(p => p.ghostId === ghost.id && p.isActive)
  );

  return (
    <div className={`min-h-screen bg-black relative overflow-hidden transition-all duration-1000 ${
      chaosMode ? 'animate-pulse' : ''
    }`}>
      {/* Chaos Mode Effects */}
      {chaosMode && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-red-500/10 animate-pulse" />
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-4xl"
              initial={{ 
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
                rotate: 0,
                scale: 0
              }}
              animate={{ 
                rotate: 360,
                scale: [0, 1, 0],
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800)
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                delay: Math.random() * 1
              }}
            >
              {['👻', '🔥', '⚡', '💀', '🌫️', '👁️'][Math.floor(Math.random() * 6)]}
            </motion.div>
          ))}
        </div>
      )}

      {/* Background Effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="h-full w-full" style={{
          backgroundImage: `
            linear-gradient(rgba(255,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="container mx-auto px-6 py-20 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 
            className="text-4xl md:text-6xl text-white font-bold mb-4"
            style={{ fontFamily: "Holtwood One SC, serif" }}
          >
            🎭 Wallet Possession
          </h1>
          <p 
            className="text-xl text-gray-400 mb-6"
            style={{ fontFamily: "Holtwood One SC, serif" }}
          >
            Unleash DeFi chaos by possessing other wallets
          </p>

          {/* Navigation Tabs */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setShowHistory(false)}
              className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                !showHistory 
                  ? 'bg-red-600 text-white' 
                  : 'border-2 border-red-600 text-red-400 hover:bg-red-600 hover:text-white'
              }`}
              style={{ fontFamily: "Holtwood One SC, serif" }}
            >
              🎭 Possess Wallet
            </button>
            <button
              onClick={() => setShowHistory(true)}
              className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                showHistory 
                  ? 'bg-purple-600 text-white' 
                  : 'border-2 border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white'
              }`}
              style={{ fontFamily: "Holtwood One SC, serif" }}
            >
              📜 Possessions ({activePossessions.length})
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!showHistory ? (
            // Possession Interface
            <motion.div
              key="possession"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {availableGhosts.length === 0 ? (
                // No ghosts available
                <div className="text-center">
                  <div className="bg-gray-900 rounded-2xl p-12 border border-red-700 max-w-2xl mx-auto">
                    <div className="text-8xl mb-8">👻</div>
                    <h2 
                      className="text-3xl text-gray-400 mb-6 font-bold"
                      style={{ fontFamily: "Holtwood One SC, serif" }}
                    >
                      No Ghosts Available for Possession
                    </h2>
                    <p className="text-gray-500 mb-8 text-lg">
                      All your ghosts are already possessing wallets, or you need to summon more spirits!
                    </p>
                    <button
                      onClick={() => window.location.href = '/summon-ghost'}
                      className="px-12 py-4 bg-white text-black font-bold rounded-xl text-xl transition-all duration-300 hover:scale-105"
                      style={{ fontFamily: "Holtwood One SC, serif" }}
                    >
                      👻 Summon More Ghosts
                    </button>
                  </div>
                </div>
              ) : (
                <div className="max-w-4xl mx-auto">
                  <AnimatePresence mode="wait">
                    {currentStep === 'select' && (
                      <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="bg-gray-900/90 backdrop-blur-sm rounded-2xl p-8 border border-red-500/30">
                          <h3 
                            className="text-2xl font-bold text-red-400 mb-6 text-center"
                            style={{ fontFamily: "Holtwood One SC, serif" }}
                          >
                            👻 Select Your Ghost
                          </h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {availableGhosts.map((ghost) => (
                              <button
                                key={ghost.id}
                                onClick={() => {
                                  setSelectedGhost(ghost);
                                  setCurrentStep('target');
                                }}
                                className="p-6 bg-gray-800 rounded-xl border-2 border-gray-600 hover:border-red-400 transition-all duration-300 hover:bg-red-400/10 group"
                              >
                                <div className="text-4xl mb-3 group-hover:animate-bounce">{ghost.emoji}</div>
                                <div className="text-lg font-bold text-white mb-2" style={{ fontFamily: "Holtwood One SC, serif" }}>
                                  {ghost.name}
                                </div>
                                <div className="text-sm text-gray-400 mb-3">{ghost.type}</div>
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                  <div>
                                    <div className="text-white font-bold">{ghost.haunting}%</div>
                                    <div className="text-gray-400">Haunting</div>
                                  </div>
                                  <div>
                                    <div className="text-white font-bold">{ghost.mischief}%</div>
                                    <div className="text-gray-400">Mischief</div>
                                  </div>
                                  <div>
                                    <div className="text-white font-bold">{ghost.charisma}%</div>
                                    <div className="text-gray-400">Charisma</div>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {currentStep === 'target' && selectedGhost && (
                      <motion.div key="target" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="bg-gray-900/90 backdrop-blur-sm rounded-2xl p-8 border border-red-500/30">
                          <div className="text-center mb-8">
                            <div className="text-6xl mb-4">{selectedGhost.emoji}</div>
                            <h3 
                              className="text-2xl font-bold text-red-400 mb-2"
                              style={{ fontFamily: "Holtwood One SC, serif" }}
                            >
                              {selectedGhost.name} Ready to Possess
                            </h3>
                            <p className="text-gray-400">Chaos Level: {calculateChaosLevel(selectedGhost)}%</p>
                          </div>

                          <div className="max-w-md mx-auto">
                            <label 
                              className="block text-white font-bold mb-4"
                              style={{ fontFamily: "Holtwood One SC, serif" }}
                            >
                              🎯 Target Wallet Address or ENS
                            </label>
                            <input
                              type="text"
                              value={targetWallet}
                              onChange={(e) => setTargetWallet(e.target.value)}
                              placeholder="0x... or username.eth"
                              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 mb-4"
                              style={{ fontFamily: "Holtwood One SC, serif" }}
                            />
                            
                            {targetWallet && !isValidWallet(targetWallet) && (
                              <p className="text-red-400 text-sm mb-4">
                                ⚠️ Invalid wallet address or ENS domain
                              </p>
                            )}

                            {targetWallet && isValidWallet(targetWallet) && (
                              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
                                <h4 className="text-red-300 font-bold mb-2" style={{ fontFamily: "Holtwood One SC, serif" }}>
                                  🔥 Predicted Chaos Effects:
                                </h4>
                                <ul className="text-sm text-gray-300 space-y-1">
                                  {generatePossessionEffects(selectedGhost, targetWallet).slice(0, 3).map((effect, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                      <span className="text-red-400">▪</span>
                                      <span style={{ fontFamily: "Holtwood One SC, serif" }}>{effect}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            <div className="flex gap-4">
                              <button
                                onClick={() => setCurrentStep('select')}
                                className="flex-1 px-6 py-3 border-2 border-gray-600 text-gray-400 rounded-lg hover:border-gray-400 hover:text-white transition-all duration-300"
                                style={{ fontFamily: "Holtwood One SC, serif" }}
                              >
                                ← Back
                              </button>
                              <button
                                onClick={handlePossession}
                                disabled={!targetWallet || !isValidWallet(targetWallet)}
                                className="flex-1 px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed"
                                style={{ fontFamily: "Holtwood One SC, serif" }}
                              >
                                🎭 Possess Wallet
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {currentStep === 'possessing' && selectedGhost && (
                      <motion.div key="possessing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="bg-gradient-to-r from-red-900 to-purple-900 rounded-2xl p-12 border border-red-500 max-w-2xl mx-auto text-center">
                          <h2 className="text-3xl font-bold text-white mb-8" style={{ fontFamily: "Holtwood One SC, serif" }}>
                            🎭 Possession in Progress...
                          </h2>
                          
                          <div className="flex justify-center items-center gap-8 mb-8">
                            <motion.div
                              className="text-6xl"
                              animate={{ 
                                scale: [1, 1.2, 1],
                                rotate: [0, 360],
                                filter: ["hue-rotate(0deg)", "hue-rotate(360deg)"]
                              }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              {selectedGhost.emoji}
                            </motion.div>
                            
                            <motion.div
                              className="text-4xl"
                              animate={{ scale: [1, 1.5, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              ⚡
                            </motion.div>
                            
                            <motion.div
                              className="text-6xl"
                              animate={{ 
                                scale: [1, 0.8, 1],
                                opacity: [1, 0.5, 1]
                              }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              💼
                            </motion.div>
                          </div>

                          <p className="text-xl text-red-100 mb-6">
                            {selectedGhost.name} is infiltrating the target wallet...
                          </p>
                          <p className="text-red-200">
                            Preparing DeFi chaos protocols...
                          </p>

                          <div className="flex justify-center gap-2 mt-8">
                            {[...Array(5)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="w-3 h-3 bg-red-400 rounded-full"
                                animate={{ 
                                  scale: [1, 1.5, 1],
                                  opacity: [0.3, 1, 0.3]
                                }}
                                transition={{ 
                                  duration: 1.5, 
                                  repeat: Infinity, 
                                  delay: i * 0.2 
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {currentStep === 'success' && newPossession && (
                      <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                        <div className="bg-gradient-to-r from-red-600 to-purple-600 rounded-2xl p-8 border border-red-400 max-w-3xl mx-auto">
                          <div className="text-center mb-8">
                            <motion.div
                              className="text-8xl mb-4"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.5, type: 'spring' }}
                            >
                              🎭
                            </motion.div>
                            <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: "Holtwood One SC, serif" }}>
                              Possession Successful!
                            </h2>
                            <p className="text-xl text-red-100">
                              {newPossession.ghostName} has possessed the target wallet
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-black/30 rounded-xl p-6">
                              <h4 className="text-white font-bold mb-3" style={{ fontFamily: "Holtwood One SC, serif" }}>
                                🎯 Target Details
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div><span className="text-gray-300">Wallet:</span> <span className="text-white font-mono">{newPossession.targetWallet}</span></div>
                                <div><span className="text-gray-300">Duration:</span> <span className="text-white">{newPossession.duration} hours</span></div>
                                <div><span className="text-gray-300">Chaos Level:</span> <span className="text-red-300">{newPossession.chaosLevel}%</span></div>
                              </div>
                            </div>

                            <div className="bg-black/30 rounded-xl p-6">
                              <h4 className="text-white font-bold mb-3" style={{ fontFamily: "Holtwood One SC, serif" }}>
                                🔥 Active Effects
                              </h4>
                              <div className="space-y-1 text-sm">
                                {newPossession.effects.slice(0, 3).map((effect, index) => (
                                  <div key={index} className="flex items-start gap-2">
                                    <span className="text-red-400 text-xs mt-1">▪</span>
                                    <span className="text-gray-300">{effect}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="bg-black/30 rounded-xl p-6 mb-8">
                            <h4 className="text-white font-bold mb-3" style={{ fontFamily: "Holtwood One SC, serif" }}>
                              💰 Exorcism Bounty Available
                            </h4>
                            <p className="text-gray-300 mb-2">
                              Other players can now attempt to exorcise this possession for <span className="text-yellow-400">{newPossession.exorcismReward} Spirit Tokens</span>
                            </p>
                            <p className="text-sm text-gray-400">
                              The higher the chaos level, the more challenging the exorcism will be!
                            </p>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                              onClick={() => window.location.href = '/map'}
                              className="px-8 py-4 bg-white text-black font-bold rounded-xl text-lg transition-all duration-300 hover:scale-105"
                              style={{ fontFamily: "Holtwood One SC, serif" }}
                            >
                              🗺️ View on Map
                            </button>
                            <button
                              onClick={resetPossession}
                              className="px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-black font-bold rounded-xl text-lg transition-all duration-300 hover:scale-105"
                              style={{ fontFamily: "Holtwood One SC, serif" }}
                            >
                              🎭 Possess Another
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          ) : (
            // Possession History & Active Possessions
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="max-w-6xl mx-auto">
                {/* Active Possessions */}
                {activePossessions.length > 0 && (
                  <div className="mb-12">
                    <h3 
                      className="text-2xl font-bold text-red-400 mb-6"
                      style={{ fontFamily: "Holtwood One SC, serif" }}
                    >
                      🔥 Active Possessions ({activePossessions.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {activePossessions.map((possession) => (
                        <div key={possession.id} className="bg-gray-900 rounded-2xl p-6 border border-red-500/30">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <span className="text-3xl">{possession.ghostEmoji}</span>
                              <div>
                                <div className="text-lg font-bold text-white" style={{ fontFamily: "Holtwood One SC, serif" }}>
                                  {possession.ghostName}
                                </div>
                                <div className="text-sm text-gray-400">{possession.ghostType}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-red-400 font-bold">{possession.chaosLevel}%</div>
                              <div className="text-xs text-gray-400">Chaos</div>
                            </div>
                          </div>

                          <div className="mb-4">
                            <div className="text-gray-300 mb-1">
                              <span className="text-gray-400">Target:</span> {possession.targetWallet}
                            </div>
                            <div className="text-gray-300 mb-1">
                              <span className="text-gray-400">Duration:</span> {possession.duration} hours
                            </div>
                            <div className="text-gray-300">
                              <span className="text-gray-400">Started:</span> {new Date(possession.timestamp).toLocaleDateString()}
                            </div>
                          </div>

                          <div className="mb-4">
                            <h5 className="text-white font-bold mb-2" style={{ fontFamily: "Holtwood One SC, serif" }}>
                              Active Effects:
                            </h5>
                            <div className="space-y-1">
                              {possession.effects.slice(0, 2).map((effect, index) => (
                                <div key={index} className="flex items-start gap-2 text-sm">
                                  <span className="text-red-400">▪</span>
                                  <span className="text-gray-300">{effect}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <div className="text-sm">
                              <span className="text-yellow-400">💰 {possession.exorcismReward} tokens</span>
                              <div className="text-gray-400">Exorcism reward</div>
                            </div>
                            <button
                              onClick={() => handleExorcism(possession.id)}
                              className="px-4 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-all duration-300"
                              style={{ fontFamily: "Holtwood One SC, serif" }}
                            >
                              🔮 Self-Exorcise
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Possession History */}
                <div>
                  <h3 
                    className="text-2xl font-bold text-purple-400 mb-6"
                    style={{ fontFamily: "Holtwood One SC, serif" }}
                  >
                    📜 Possession History ({possessionHistory.length})
                  </h3>
                  
                  {possessionHistory.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">👻</div>
                      <p className="text-gray-400 text-lg" style={{ fontFamily: "Holtwood One SC, serif" }}>
                        No possession history yet. Start haunting some wallets!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {possessionHistory.slice().reverse().map((entry) => (
                        <div key={entry.id} className="bg-gray-900 rounded-xl p-4 border border-gray-700 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <span className="text-2xl">
                              {entry.action === 'possessed' ? '🎭' : entry.action === 'exorcised' ? '🔮' : '⚔️'}
                            </span>
                            <div>
                              <div className="text-white font-bold" style={{ fontFamily: "Holtwood One SC, serif" }}>
                                {entry.ghostName} {entry.action} {entry.targetWallet.slice(0, 10)}...
                              </div>
                              <div className="text-gray-400 text-sm">
                                {new Date(entry.timestamp).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          {entry.reward && (
                            <div className="text-yellow-400 font-bold">
                              +{entry.reward} tokens
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Holtwood+One+SC&display=swap');
      `}</style>
    </div>
  );
}