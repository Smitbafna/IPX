'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import MyCustomComponent from '../../components/FLoatingDock';

interface GhostMetadata {
  id: string;
  name: string;
  type: 'Whisper' | 'Poltergeist' | 'Banshee' | 'Wraith';
  emoji: string;
  haunting: number;
  mischief: number;
  charisma: number;
  backstory: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  timestamp: number;
  txHash: string;
}

const ghostTypes = [
  { 
    type: 'Whisper', 
    emoji: '👻', 
    color: 'text-blue-300',
    backstory: 'A silent spirit that whispers secrets through the blockchain',
    rarityWeight: 40
  },
  { 
    type: 'Poltergeist', 
    emoji: '🔮', 
    color: 'text-purple-300',
    backstory: 'A mischievous entity that disrupts smart contracts',
    rarityWeight: 30
  },
  { 
    type: 'Banshee', 
    emoji: '💀', 
    color: 'text-red-300',
    backstory: 'A wailing spirit that haunts entire DAOs',
    rarityWeight: 20
  },
  { 
    type: 'Wraith', 
    emoji: '🌫️', 
    color: 'text-green-300',
    backstory: 'An ancient soul that binds wallets together',
    rarityWeight: 10
  }
];

export default function SummonGhost() {
  const [step, setStep] = useState<'ready' | 'summoning' | 'minting' | 'naming' | 'complete' | 'collection'>('ready');
  const [summonedGhost, setSummonedGhost] = useState<GhostMetadata | null>(null);
  const [ghostName, setGhostName] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [ritualCircleRotation, setRitualCircleRotation] = useState(0);
  const [mintingProgress, setMintingProgress] = useState(0);
  const [mintingStage, setMintingStage] = useState('');
  const [ghostCollection, setGhostCollection] = useState<GhostMetadata[]>([]);

  // Load ghosts from localStorage on component mount
  useEffect(() => {
    const savedGhosts = localStorage.getItem('ghostCollection');
    if (savedGhosts) {
      setGhostCollection(JSON.parse(savedGhosts));
    }
  }, []);

  // Save ghosts to localStorage whenever collection changes
  useEffect(() => {
    localStorage.setItem('ghostCollection', JSON.stringify(ghostCollection));
  }, [ghostCollection]);

  // Ritual circle animation
  useEffect(() => {
    if (step === 'summoning') {
      const interval = setInterval(() => {
        setRitualCircleRotation(prev => prev + 2);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [step]);

  // Minting simulation
  useEffect(() => {
    if (step === 'minting') {
      const stages = [
        { stage: 'Preparing transaction...', progress: 0 },
        { stage: 'Validating ghost essence...', progress: 20 },
        { stage: 'Generating metadata...', progress: 40 },
        { stage: 'Uploading to IPFS...', progress: 60 },
        { stage: 'Confirming on blockchain...', progress: 80 },
        { stage: 'Finalizing mint...', progress: 100 }
      ];

      let currentStageIndex = 0;
      const interval = setInterval(() => {
        if (currentStageIndex < stages.length) {
          setMintingStage(stages[currentStageIndex].stage);
          setMintingProgress(stages[currentStageIndex].progress);
          currentStageIndex++;
        } else {
          clearInterval(interval);
          setStep('naming');
        }
      }, 800);

      return () => clearInterval(interval);
    }
  }, [step]);

  const generateRandomGhost = (): GhostMetadata => {
    // Weighted random selection
    const random = Math.random() * 100;
    let cumulativeWeight = 0;
    let selectedType = ghostTypes[0];
    
    for (const ghostType of ghostTypes) {
      cumulativeWeight += ghostType.rarityWeight;
      if (random <= cumulativeWeight) {
        selectedType = ghostType;
        break;
      }
    }

    const rarity = 
      selectedType.rarityWeight <= 10 ? 'Legendary' :
      selectedType.rarityWeight <= 20 ? 'Epic' :
      selectedType.rarityWeight <= 30 ? 'Rare' : 'Common';

    return {
      id: `ghost_${Date.now()}`,
      name: '',
      type: selectedType.type as any,
      emoji: selectedType.emoji,
      haunting: Math.floor(Math.random() * 40) + 60,
      mischief: Math.floor(Math.random() * 40) + 60,
      charisma: Math.floor(Math.random() * 40) + 60,
      backstory: selectedType.backstory,
      rarity,
      timestamp: Date.now(),
      txHash: '0x' + Math.random().toString(16).substr(2, 64)
    };
  };

  const handleSummonGhost = () => {
    setStep('summoning');
    setIsAnimating(true);
    
    // Simulate summoning ritual
    setTimeout(() => {
      const newGhost = generateRandomGhost();
      setSummonedGhost(newGhost);
      setStep('minting');
      setIsAnimating(false);
      setMintingProgress(0);
      setMintingStage('');
    }, 4000);
  };

  const handleNameGhost = () => {
    if (summonedGhost && ghostName.trim()) {
      const namedGhost = {
        ...summonedGhost,
        name: ghostName.trim()
      };
      setSummonedGhost(namedGhost);
      
      // Add to collection
      setGhostCollection(prev => [...prev, namedGhost]);
      
      setStep('complete');
    }
  };

  const handleSummonAnother = () => {
    setStep('ready');
    setSummonedGhost(null);
    setGhostName('');
    setRitualCircleRotation(0);
    setMintingProgress(0);
    setMintingStage('');
  };

  const handleViewCollection = () => {
    setStep('collection');
  };

  const handleBackToSummon = () => {
    setStep('ready');
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
       <MyCustomComponent/>
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="h-full w-full" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Floating particles during summoning */}
      {step === 'summoning' && (
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl opacity-60"
              initial={{ 
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
                y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 50,
                rotate: 0 
              }}
              animate={{ 
                y: -50, 
                rotate: 360,
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200)
              }}
              transition={{ 
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            >
              ✨
            </motion.div>
          ))}
        </div>
      )}

      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 
              className="text-4xl md:text-6xl text-white font-bold mb-4"
              style={{ fontFamily: "Holtwood One SC, serif" }}
            >
              {step === 'collection' ? 'My Ghost Collection' : 'Summon Your Ghost'}
            </h1>
            <p 
              className="text-xl text-gray-400"
              style={{ fontFamily: "Holtwood One SC, serif" }}
            >
              {step === 'collection' 
                ? `You have summoned ${ghostCollection.length} supernatural spirit${ghostCollection.length !== 1 ? 's' : ''}`
                : 'Perform the ancient ritual to mint your supernatural NFT'
              }
            </p>
          </div>

          <AnimatePresence mode="wait">
            {/* Ghost Collection View */}
            {step === 'collection' && (
              <motion.div
                key="collection"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {ghostCollection.length === 0 ? (
                  <div className="text-center">
                    <div className="bg-gray-900 rounded-2xl p-12 border border-gray-700 max-w-2xl mx-auto">
                      <div className="text-8xl mb-8">👻</div>
                      <h2 
                        className="text-3xl text-gray-400 mb-6 font-bold"
                        style={{ fontFamily: "Holtwood One SC, serif" }}
                      >
                        No Ghosts Summoned Yet
                      </h2>
                      <p className="text-gray-500 mb-8 text-lg">
                        Your collection is empty. Summon your first ghost to begin your supernatural journey!
                      </p>
                      <button
                        onClick={handleBackToSummon}
                        className="px-12 py-4 bg-white text-black font-bold rounded-xl text-xl transition-all duration-300 hover:scale-105"
                        style={{ fontFamily: "Holtwood One SC, serif" }}
                      >
                        👻 Summon First Ghost
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {ghostCollection.map((ghost, index) => (
                        <motion.div
                          key={ghost.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-gray-500 transition-all duration-300"
                        >
                          <div className="text-center">
                            <div className="text-4xl mb-4">{ghost.emoji}</div>
                            <h3 
                              className={`text-xl font-bold mb-2 ${ghostTypes.find(g => g.type === ghost.type)?.color}`}
                              style={{ fontFamily: "Holtwood One SC, serif" }}
                            >
                              {ghost.name}
                            </h3>
                            <div className="text-gray-400 text-sm mb-4">{ghost.type}</div>
                            
                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-2 mb-4">
                              <div className="text-center">
                                <div className="text-lg font-bold text-white">{ghost.haunting}%</div>
                                <div className="text-xs text-gray-400">Haunting</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-white">{ghost.mischief}%</div>
                                <div className="text-xs text-gray-400">Mischief</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-white">{ghost.charisma}%</div>
                                <div className="text-xs text-gray-400">Charisma</div>
                              </div>
                            </div>

                            {/* Rarity */}
                            <div className={`text-sm font-bold mb-2 ${
                              ghost.rarity === 'Legendary' ? 'text-yellow-400' :
                              ghost.rarity === 'Epic' ? 'text-purple-400' :
                              ghost.rarity === 'Rare' ? 'text-blue-400' : 'text-gray-400'
                            }`}>
                              {ghost.rarity}
                            </div>

                            {/* Timestamp */}
                            <div className="text-xs text-gray-500">
                              Summoned: {new Date(ghost.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="text-center">
                      <button
                        onClick={handleBackToSummon}
                        className="px-8 py-4 bg-white text-black font-bold rounded-xl text-lg transition-all duration-300 hover:scale-105 mr-4"
                        style={{ fontFamily: "Holtwood One SC, serif" }}
                      >
                        👻 Summon Another
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 1: Ready to Summon */}
            {step === 'ready' && (
              <motion.div
                key="ready"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <div className="bg-gray-900 rounded-2xl p-12 border border-gray-700 max-w-2xl mx-auto">
                  <div className="text-8xl mb-8">🔮</div>
                  <h2 
                    className="text-3xl text-white mb-6 font-bold"
                    style={{ fontFamily: "Holtwood One SC, serif" }}
                  >
                    Begin the Summoning Ritual
                  </h2>
                  <p className="text-gray-400 mb-8 text-lg">
                    The spirits await your call from the blockchain depths. 
                    Are you ready to summon your supernatural companion?
                  </p>
                  
               

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={handleSummonGhost}
                      className="px-12 py-4 bg-white text-black font-bold rounded-xl text-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
                      style={{ fontFamily: "Holtwood One SC, serif" }}
                    >
                      👻 Begin Summoning Ritual
                    </button>
                    
                    {ghostCollection.length > 0 && (
                      <button
                        onClick={handleViewCollection}
                        className="px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-black font-bold rounded-xl text-lg transition-all duration-300 hover:scale-105"
                        style={{ fontFamily: "Holtwood One SC, serif" }}
                      >
                        🔮 View My Ghosts ({ghostCollection.length})
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Summoning Animation */}
            {step === 'summoning' && (
              <motion.div
                key="summoning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <div className="relative max-w-2xl mx-auto">
                  {/* Ritual Circle */}
                  <div className="relative w-96 h-96 mx-auto mb-8">
                    <motion.div
                      className="absolute inset-0 border-4 border-purple-500 rounded-full opacity-60"
                      animate={{ rotate: ritualCircleRotation }}
                      style={{ transformOrigin: 'center' }}
                    />
                    <motion.div
                      className="absolute inset-4 border-2 border-blue-400 rounded-full opacity-40"
                      animate={{ rotate: -ritualCircleRotation * 1.5 }}
                      style={{ transformOrigin: 'center' }}
                    />
                    <motion.div
                      className="absolute inset-8 border border-white rounded-full opacity-30"
                      animate={{ rotate: ritualCircleRotation * 2 }}
                      style={{ transformOrigin: 'center' }}
                    />
                    
                    {/* Center ghost */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        className="text-8xl"
                        animate={{ 
                          scale: [1, 1.2, 1],
                          rotate: [0, 10, -10, 0]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        👻
                      </motion.div>
                    </div>
                  </div>

                  <h2 
                    className="text-3xl text-white mb-4 font-bold"
                    style={{ fontFamily: "Holtwood One SC, serif" }}
                  >
                    Summoning in Progress...
                  </h2>
                  <p className="text-gray-400 text-lg">
                    The spirits are gathering from the blockchain depths
                  </p>

                  {/* Progress indicator */}
                  <div className="flex justify-center gap-2 mt-8">
                    {[...Array(4)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-3 h-3 bg-purple-500 rounded-full"
                        animate={{ 
                          scale: [1, 1.5, 1],
                          opacity: [0.3, 1, 0.3]
                        }}
                        transition={{ 
                          duration: 1, 
                          repeat: Infinity, 
                          delay: i * 0.2 
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Minting Transaction */}
            {step === 'minting' && (
              <motion.div
                key="minting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <div className="bg-gray-900 rounded-2xl p-8 border border-blue-500 max-w-2xl mx-auto">
                  <div className="text-6xl mb-6">⚡</div>
                  
                  <h2 
                    className="text-3xl text-blue-400 mb-6 font-bold"
                    style={{ fontFamily: "Holtwood One SC, serif" }}
                  >
                    Minting Your Ghost NFT
                  </h2>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="w-full bg-gray-700 rounded-full h-4 mb-4">
                      <motion.div 
                        className="bg-blue-500 h-4 rounded-full"
                        initial={{ width: '0%' }}
                        animate={{ width: `${mintingProgress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <div className="text-blue-400 text-lg font-bold mb-2">{mintingProgress}%</div>
                    <div className="text-gray-400">{mintingStage}</div>
                  </div>

                  {/* Transaction Details */}
                  <div className="bg-black rounded-lg p-4 border border-gray-700 text-left">
                    <div className="text-sm text-gray-400 mb-1">Transaction Hash:</div>
                    <div className="text-xs text-blue-400 mb-3 font-mono break-all">
                      {summonedGhost?.txHash}
                    </div>
                    <div className="text-sm text-gray-400 mb-1">Network:</div>
                    <div className="text-xs text-white mb-3">Ethereum Mainnet</div>
                    <div className="text-sm text-gray-400 mb-1">Gas Price:</div>
                    <div className="text-xs text-green-400">0 ETH (Gasless)</div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Name Your Ghost */}
            {step === 'naming' && summonedGhost && (
              <motion.div
                key="naming"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center"
              >
                <div className="bg-gray-900 rounded-2xl p-8 border border-gray-700 max-w-2xl mx-auto">
                  <div className="text-6xl mb-6">{summonedGhost.emoji}</div>
                  
                  <h2 
                    className="text-3xl text-white mb-4 font-bold"
                    style={{ fontFamily: "Holtwood One SC, serif" }}
                  >
                    A {summonedGhost.type} Has Been Summoned!
                  </h2>
                  
                  <div className={`text-xl mb-6 ${ghostTypes.find(g => g.type === summonedGhost.type)?.color}`}>
                    {summonedGhost.backstory}
                  </div>

                  <div className="mb-8">
                    <label className="block text-white text-lg mb-3 font-bold">
                      Name Your Ghost:
                    </label>
                    <input
                      type="text"
                      value={ghostName}
                      onChange={(e) => setGhostName(e.target.value)}
                      placeholder="Enter ghost name..."
                      className="w-full px-4 py-3 bg-black border border-gray-600 rounded-lg text-white text-center text-xl focus:border-white focus:outline-none"
                      style={{ fontFamily: "Holtwood One SC, serif" }}
                    />
                  </div>

                  <button
                    onClick={handleNameGhost}
                    disabled={!ghostName.trim()}
                    className={`px-12 py-4 font-bold rounded-xl text-xl transition-all duration-300 ${
                      ghostName.trim() 
                        ? 'bg-white text-black hover:scale-105' 
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                    style={{ fontFamily: "Holtwood One SC, serif" }}
                  >
                    ✨ Bind Ghost Spirit
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 5: Complete */}
            {step === 'complete' && summonedGhost && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <div className="bg-gray-900 rounded-2xl p-8 border border-green-500 max-w-3xl mx-auto">
                  <div className="text-6xl mb-6">{summonedGhost.emoji}</div>
                  
                  <h2 
                    className="text-4xl text-green-400 mb-4 font-bold"
                    style={{ fontFamily: "Holtwood One SC, serif" }}
                  >
                    🎉 {summonedGhost.name} Successfully Summoned!
                  </h2>

                  {/* Ghost Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{summonedGhost.haunting}%</div>
                      <div className="text-sm text-gray-400">Haunting</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{summonedGhost.mischief}%</div>
                      <div className="text-sm text-gray-400">Mischief</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{summonedGhost.charisma}%</div>
                      <div className="text-sm text-gray-400">Charisma</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-bold ${
                        summonedGhost.rarity === 'Legendary' ? 'text-yellow-400' :
                        summonedGhost.rarity === 'Epic' ? 'text-purple-400' :
                        summonedGhost.rarity === 'Rare' ? 'text-blue-400' : 'text-gray-400'
                      }`}>
                        {summonedGhost.rarity}
                      </div>
                      <div className="text-sm text-gray-400">Rarity</div>
                    </div>
                  </div>

                  {/* Final Transaction Confirmation */}
                  <div className="bg-black rounded-lg p-6 mb-8 border border-green-500">
                    <div className="text-green-400 text-lg mb-3">✅ NFT Successfully Minted!</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="text-left">
                        <div className="text-gray-400 mb-1">Transaction Hash:</div>
                        <div className="text-green-400 font-mono break-all text-xs">{summonedGhost.txHash}</div>
                      </div>
                      <div className="text-left">
                        <div className="text-gray-400 mb-1">Token ID:</div>
                        <div className="text-white">#{summonedGhost.id.split('_')[1]}</div>
                        <div className="text-gray-400 mt-2 mb-1">Gas Used:</div>
                        <div className="text-green-400">0 ETH (Gasless)</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={handleSummonAnother}
                      className="px-8 py-4 bg-white text-black font-bold rounded-xl text-lg transition-all duration-300 hover:scale-105"
                      style={{ fontFamily: "Holtwood One SC, serif" }}
                    >
                      👻 Summon Another
                    </button>
                    <button
                      onClick={handleViewCollection}
                      className="px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-black font-bold rounded-xl text-lg transition-all duration-300 hover:scale-105"
                      style={{ fontFamily: "Holtwood One SC, serif" }}
                    >
                      🔮 View My Collection ({ghostCollection.length})
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Holtwood+One+SC&display=swap');
      `}</style>
    </div>
  );
}