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
  isUsedForBreeding?: boolean;
}

interface OffspringGhost extends Ghost {
  parentIds: string[];
  generation: number;
  chaos: number;
  cuteness: number;
  weirdness: number;
  fusedTraits: string[];
}

const ghostTypes = {
  'Whisper': { emoji: '👻', color: 'text-blue-300' },
  'Poltergeist': { emoji: '🔮', color: 'text-purple-300' },
  'Banshee': { emoji: '💀', color: 'text-red-300' },
  'Wraith': { emoji: '🌫️', color: 'text-green-300' }
};

const memeEmojis = ['👾', '🤖', '🦄', '🐙', '🌟', '⚡', '🔥', '❄️', '🌈', '💎', '🎭', '🎪', '🚀', '🌙', '☄️'];

export default function MemeMating() {
  const [userGhosts, setUserGhosts] = useState<Ghost[]>([]);
  const [selectedGhost1, setSelectedGhost1] = useState<Ghost | null>(null);
  const [selectedGhost2, setSelectedGhost2] = useState<Ghost | null>(null);
  const [isBreeding, setIsBreeding] = useState(false);
  const [newOffspring, setNewOffspring] = useState<OffspringGhost | null>(null);
  const [breedingStep, setBreedingStep] = useState<'selection' | 'breeding' | 'reveal' | 'complete'>('selection');
  const [offspringCollection, setOffspringCollection] = useState<OffspringGhost[]>([]);
  const [showCollection, setShowCollection] = useState(false);

// Load user ghosts and offspring collection
useEffect(() => {
  // Load ghosts from localStorage instead of clearing them
  const savedGhosts = localStorage.getItem('ghostCollection');
  if (savedGhosts) {
    setUserGhosts(JSON.parse(savedGhosts));
  }

  // Load offspring collection
  const savedOffspring = localStorage.getItem('offspringCollection');
  if (savedOffspring) {
    setOffspringCollection(JSON.parse(savedOffspring));
  }
}, []);

  // Save offspring to localStorage
  useEffect(() => {
    localStorage.setItem('offspringCollection', JSON.stringify(offspringCollection));
  }, [offspringCollection]);

  // Generate mashup name
  const generateMashupName = (name1: string, name2: string): string => {
    const mashups = [
      // First half of name1 + second half of name2
      name1.slice(0, Math.ceil(name1.length / 2)) + name2.slice(Math.floor(name2.length / 2)),
      // First half of name2 + second half of name1
      name2.slice(0, Math.ceil(name2.length / 2)) + name1.slice(Math.floor(name1.length / 2)),
      // Creative combinations
      name1.slice(0, 3) + name2.slice(-3),
      name2.slice(0, 3) + name1.slice(-3),
      // Type-based mashups
      `${name1}${name2.slice(-4)}`,
      `${name2}${name1.slice(-4)}`
    ];

    return mashups[Math.floor(Math.random() * mashups.length)];
  };

  // Generate fusion type
  const generateFusionType = (type1: string, type2: string): string => {
    const fusions: { [key: string]: string } = {
      'Whisper-Poltergeist': 'Whisptergeist',
      'Whisper-Banshee': 'Whispshee',
      'Whisper-Wraith': 'Whispraith',
      'Poltergeist-Banshee': 'Polbanshee',
      'Poltergeist-Wraith': 'Polterwraith',
      'Banshee-Wraith': 'Banwraith'
    };

    const key1 = `${type1}-${type2}`;
    const key2 = `${type2}-${type1}`;
    
    return fusions[key1] || fusions[key2] || `${type1}${type2}`;
  };

  // Create offspring ghost
  const createOffspring = (parent1: Ghost, parent2: Ghost): OffspringGhost => {
    const mashupName = generateMashupName(parent1.name, parent2.name);
    const fusionType = generateFusionType(parent1.type, parent2.type);
    
    // Random emoji or mix of parent emojis
    const newEmoji = Math.random() > 0.5 
      ? memeEmojis[Math.floor(Math.random() * memeEmojis.length)]
      : Math.random() > 0.5 ? parent1.emoji : parent2.emoji;

    // Blend stats with some randomness
    const blendStat = (stat1: number, stat2: number) => {
      const average = (stat1 + stat2) / 2;
      const variation = (Math.random() - 0.5) * 20; // ±10 variation
      return Math.max(1, Math.min(100, Math.floor(average + variation)));
    };

    // Generate new unique stats
    const chaos = Math.floor(Math.random() * 100) + 1;
    const cuteness = Math.floor(Math.random() * 100) + 1;
    const weirdness = Math.floor(Math.random() * 100) + 1;

    // Determine rarity based on parents
    const rarityScores = { 'Common': 1, 'Rare': 2, 'Epic': 3, 'Legendary': 4 };
    const parentRaritySum = rarityScores[parent1.rarity] + rarityScores[parent2.rarity];
    let newRarity: OffspringGhost['rarity'] = 'Common';
    
    if (parentRaritySum >= 7) newRarity = 'Legendary';
    else if (parentRaritySum >= 5) newRarity = 'Epic';
    else if (parentRaritySum >= 3) newRarity = 'Rare';

    // Add chance for rarity upgrade
    const rarityBonus = Math.random();
    if (rarityBonus > 0.95) newRarity = 'Legendary';
    else if (rarityBonus > 0.85) newRarity = 'Epic';
    else if (rarityBonus > 0.7) newRarity = 'Rare';

    return {
      id: `offspring_${Date.now()}`,
      name: mashupName,
      type: fusionType as any,
      emoji: newEmoji,
      haunting: blendStat(parent1.haunting, parent2.haunting),
      mischief: blendStat(parent1.mischief, parent2.mischief),
      charisma: blendStat(parent1.charisma, parent2.charisma),
      rarity: newRarity,
      timestamp: Date.now(),
      txHash: '0x' + Math.random().toString(16).substr(2, 64),
      parentIds: [parent1.id, parent2.id],
      generation: 2, // First generation offspring
      chaos,
      cuteness,
      weirdness,
      fusedTraits: [
        `${parent1.type} Heritage`,
        `${parent2.type} Essence`,
        `Chaos Level ${Math.floor(chaos / 10) + 1}`,
        cuteness > 80 ? 'Extremely Cute' : cuteness > 60 ? 'Pretty Cute' : 'Mildly Cute',
        weirdness > 90 ? 'Reality-Breaking Weird' : weirdness > 70 ? 'Very Weird' : 'Somewhat Weird'
      ]
    };
  };

  // Handle breeding process
  const handleBreeding = async () => {
    if (!selectedGhost1 || !selectedGhost2) return;

    setIsBreeding(true);
    setBreedingStep('breeding');

    // Simulate breeding animation time
    setTimeout(() => {
      const offspring = createOffspring(selectedGhost1, selectedGhost2);
      setNewOffspring(offspring);
      setBreedingStep('reveal');

      // Optional: Mark parents as used for breeding (comment out if you want unlimited breeding)
      // const updatedGhosts = userGhosts.map(ghost => 
      //   ghost.id === selectedGhost1.id || ghost.id === selectedGhost2.id
      //     ? { ...ghost, isUsedForBreeding: true }
      //     : ghost
      // );
      // setUserGhosts(updatedGhosts);
      // localStorage.setItem('ghostCollection', JSON.stringify(updatedGhosts));

      // Add to offspring collection
      setOffspringCollection(prev => [...prev, offspring]);

      setTimeout(() => {
        setBreedingStep('complete');
        setIsBreeding(false);
      }, 3000);
    }, 4000);
  };

  // Reset breeding process
  const handleBreedAgain = () => {
    setSelectedGhost1(null);
    setSelectedGhost2(null);
    setNewOffspring(null);
    setBreedingStep('selection');
  };

  // Share functionality
  const handleShare = () => {
    if (newOffspring) {
      const shareText = `🎉 I just bred a new ghost: ${newOffspring.name} ${newOffspring.emoji}\n\nStats: Chaos ${newOffspring.chaos}% | Cuteness ${newOffspring.cuteness}% | Weirdness ${newOffspring.weirdness}%\n\n#GhostBreeding #NFT #Memes`;
      
      if (navigator.share) {
        navigator.share({
          title: 'New Ghost Offspring!',
          text: shareText,
          url: window.location.href
        });
      } else {
        navigator.clipboard.writeText(shareText);
        alert('Copied to clipboard!');
      }
    }
  };

  const availableGhosts = userGhosts.filter(ghost => ghost.isUsedForBreeding !== true);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
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

      {/* Floating hearts during breeding */}
      {isBreeding && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-3xl"
              initial={{ 
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
                y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 50,
                rotate: 0,
                scale: 0.5
              }}
              animate={{ 
                y: -50, 
                rotate: 360,
                scale: [0.5, 1, 0.5],
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200)
              }}
              transition={{ 
                duration: Math.random() * 4 + 3,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            >
              💕
            </motion.div>
          ))}
        </div>
      )}

      <div className="container mx-auto px-6 py-20 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 
            className="text-4xl md:text-6xl text-white font-bold mb-4"
            style={{ fontFamily: "Holtwood One SC, serif" }}
          >
            💞 Meme Mating Season
          </h1>
          <p 
            className="text-xl text-gray-400 mb-6"
            style={{ fontFamily: "Holtwood One SC, serif" }}
          >
            Breed your ghosts to create hilarious supernatural offspring
          </p>

          {/* Tab-like buttons */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setShowCollection(false)}
              className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                !showCollection 
                  ? 'bg-pink-600 text-white' 
                  : 'border-2 border-pink-600 text-pink-400 hover:bg-pink-600 hover:text-white'
              }`}
              style={{ fontFamily: "Holtwood One SC, serif" }}
            >
              💞 Breeding Lab
            </button>
            <button
              onClick={() => setShowCollection(true)}
              className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                showCollection 
                  ? 'bg-purple-600 text-white' 
                  : 'border-2 border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white'
              }`}
              style={{ fontFamily: "Holtwood One SC, serif" }}
            >
              👶 Offspring ({offspringCollection.length})
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!showCollection ? (
            // Breeding Lab
            <motion.div
              key="breeding"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {availableGhosts.length < 2 ? (
                // Not enough ghosts
                <div className="text-center">
                  <div className="bg-gray-900 rounded-2xl p-12 border border-gray-700 max-w-2xl mx-auto">
                    <div className="text-8xl mb-8">😢</div>
                    <h2 
                      className="text-3xl text-gray-400 mb-6 font-bold"
                      style={{ fontFamily: "Holtwood One SC, serif" }}
                    >
                      Not Enough Ghosts to Breed
                    </h2>
                    <p className="text-gray-500 mb-8 text-lg">
                      You need at least 2 ghosts to start the mating process. 
                      Go summon more ghosts first!
                    </p>
                    <button
                      onClick={() => window.location.href = '/summon-ghost'}
                      className="px-12 py-4 bg-white text-black font-bold rounded-xl text-xl transition-all duration-300 hover:scale-105"
                      style={{ fontFamily: "Holtwood One SC, serif" }}
                    >
                      👻 Summon Ghosts
                    </button>
                  </div>
                </div>
              ) : (
                <div className="max-w-6xl mx-auto">
                  <AnimatePresence mode="wait">
                    {breedingStep === 'selection' && (
                      <motion.div
                        key="selection"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                          {/* Ghost 1 Selection */}
                          <div className="bg-gray-900/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                            <h3 className="text-xl font-bold text-pink-400 mb-4" style={{ fontFamily: "Holtwood One SC, serif" }}>
                              👻 Select Parent Ghost 1
                            </h3>
                            
                            {selectedGhost1 ? (
                              <div className="text-center p-6 bg-gray-800 rounded-xl border border-pink-500">
                                <div className="text-4xl mb-3">{selectedGhost1.emoji}</div>
                                <div className="text-lg font-bold text-white mb-2">{selectedGhost1.name}</div>
                                <div className="text-sm text-gray-400 mb-4">{selectedGhost1.type}</div>
                                <button
                                  onClick={() => setSelectedGhost1(null)}
                                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300"
                                >
                                  Change
                                </button>
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                                {availableGhosts.map((ghost) => (
                                  <button
                                    key={ghost.id}
                                    onClick={() => setSelectedGhost1(ghost)}
                                    disabled={selectedGhost2?.id === ghost.id}
                                    className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                                      selectedGhost2?.id === ghost.id
                                        ? 'border-gray-600 text-gray-500 cursor-not-allowed'
                                        : 'border-gray-600 text-white hover:border-pink-400 hover:bg-pink-400/10'
                                    }`}
                                  >
                                    <div className="text-2xl mb-1">{ghost.emoji}</div>
                                    <div className="text-sm font-bold">{ghost.name}</div>
                                    <div className="text-xs text-gray-400">{ghost.type}</div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Ghost 2 Selection */}
                          <div className="bg-gray-900/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                            <h3 className="text-xl font-bold text-purple-400 mb-4" style={{ fontFamily: "Holtwood One SC, serif" }}>
                              👻 Select Parent Ghost 2
                            </h3>
                            
                            {selectedGhost2 ? (
                              <div className="text-center p-6 bg-gray-800 rounded-xl border border-purple-500">
                                <div className="text-4xl mb-3">{selectedGhost2.emoji}</div>
                                <div className="text-lg font-bold text-white mb-2">{selectedGhost2.name}</div>
                                <div className="text-sm text-gray-400 mb-4">{selectedGhost2.type}</div>
                                <button
                                  onClick={() => setSelectedGhost2(null)}
                                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300"
                                >
                                  Change
                                </button>
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                                {availableGhosts.map((ghost) => (
                                  <button
                                    key={ghost.id}
                                    onClick={() => setSelectedGhost2(ghost)}
                                    disabled={selectedGhost1?.id === ghost.id}
                                    className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                                      selectedGhost1?.id === ghost.id
                                        ? 'border-gray-600 text-gray-500 cursor-not-allowed'
                                        : 'border-gray-600 text-white hover:border-purple-400 hover:bg-purple-400/10'
                                    }`}
                                  >
                                    <div className="text-2xl mb-1">{ghost.emoji}</div>
                                    <div className="text-sm font-bold">{ghost.name}</div>
                                    <div className="text-xs text-gray-400">{ghost.type}</div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Breeding Button */}
                        {selectedGhost1 && selectedGhost2 && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center"
                          >
                            <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl p-8 border border-pink-500 max-w-md mx-auto">
                              <h3 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "Holtwood One SC, serif" }}>
                                Ready to Breed!
                              </h3>
                              <div className="flex justify-center items-center gap-4 mb-6">
                                <div className="text-3xl">{selectedGhost1.emoji}</div>
                                <div className="text-2xl">💕</div>
                                <div className="text-3xl">{selectedGhost2.emoji}</div>
                              </div>
                              <button
                                onClick={handleBreeding}
                                className="px-12 py-4 bg-white text-black font-bold rounded-xl text-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
                                style={{ fontFamily: "Holtwood One SC, serif" }}
                              >
                                💞 Start Breeding
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    )}

                    {breedingStep === 'breeding' && (
                      <motion.div
                        key="breeding"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center"
                      >
                        <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl p-12 border border-pink-500 max-w-2xl mx-auto">
                          <h2 className="text-3xl font-bold text-white mb-8" style={{ fontFamily: "Holtwood One SC, serif" }}>
                            💞 Breeding in Progress...
                          </h2>
                          
                          <div className="flex justify-center items-center gap-8 mb-8">
                            <motion.div
                              className="text-6xl"
                              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              {selectedGhost1?.emoji}
                            </motion.div>
                            
                            <motion.div
                              className="text-4xl"
                              animate={{ scale: [1, 1.5, 1] }}
                              transition={{ duration: 0.8, repeat: Infinity }}
                            >
                              💕
                            </motion.div>
                            
                            <motion.div
                              className="text-6xl"
                              animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              {selectedGhost2?.emoji}
                            </motion.div>
                          </div>

                          <p className="text-xl text-pink-100 mb-6">
                            The spirits are combining their essences...
                          </p>

                          <div className="flex justify-center gap-2">
                            {[...Array(4)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="w-3 h-3 bg-white rounded-full"
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

                    {breedingStep === 'reveal' && newOffspring && (
                      <motion.div
                        key="reveal"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="text-center"
                      >
                        <div className="bg-gradient-to-r from-yellow-500 to-pink-500 rounded-2xl p-12 border border-yellow-400 max-w-3xl mx-auto">
                          <h2 className="text-4xl font-bold text-white mb-8" style={{ fontFamily: "Holtwood One SC, serif" }}>
                            🎉 New Offspring Born!
                          </h2>
                          
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                            className="text-8xl mb-6"
                          >
                            {newOffspring.emoji}
                          </motion.div>
                          
                          <h3 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "Holtwood One SC, serif" }}>
                            {newOffspring.name}
                          </h3>
                          
                          <div className="text-xl text-yellow-100 mb-6">
                            {newOffspring.type} • Generation {newOffspring.generation}
                          </div>

                          <div className="grid grid-cols-3 gap-6 mb-6">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-white">{newOffspring.chaos}%</div>
                              <div className="text-sm text-yellow-100">Chaos</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-white">{newOffspring.cuteness}%</div>
                              <div className="text-sm text-yellow-100">Cuteness</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-white">{newOffspring.weirdness}%</div>
                              <div className="text-sm text-yellow-100">Weirdness</div>
                            </div>
                          </div>

                          <div className={`text-lg font-bold mb-6 ${
                            newOffspring.rarity === 'Legendary' ? 'text-yellow-300' :
                            newOffspring.rarity === 'Epic' ? 'text-purple-300' :
                            newOffspring.rarity === 'Rare' ? 'text-blue-300' : 'text-gray-300'
                          }`}>
                            {newOffspring.rarity} Rarity
                          </div>

                          <p className="text-yellow-100 text-lg">
                            Your new ghost is manifesting its supernatural powers...
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {breedingStep === 'complete' && newOffspring && (
                      <motion.div
                        key="complete"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="text-center"
                      >
                        <div className="bg-gray-900 rounded-2xl p-8 border border-green-500 max-w-4xl mx-auto">
                          <div className="text-6xl mb-6">{newOffspring.emoji}</div>
                          
                          <h2 className="text-4xl text-green-400 mb-4 font-bold" style={{ fontFamily: "Holtwood One SC, serif" }}>
                            🎉 {newOffspring.name} Successfully Created!
                          </h2>

                          {/* Detailed Stats */}
                          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
                            <div className="text-center">
                              <div className="text-xl font-bold text-white">{newOffspring.haunting}%</div>
                              <div className="text-sm text-gray-400">Haunting</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xl font-bold text-white">{newOffspring.mischief}%</div>
                              <div className="text-sm text-gray-400">Mischief</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xl font-bold text-white">{newOffspring.charisma}%</div>
                              <div className="text-sm text-gray-400">Charisma</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xl font-bold text-pink-400">{newOffspring.chaos}%</div>
                              <div className="text-sm text-gray-400">Chaos</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xl font-bold text-pink-400">{newOffspring.cuteness}%</div>
                              <div className="text-sm text-gray-400">Cuteness</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xl font-bold text-pink-400">{newOffspring.weirdness}%</div>
                              <div className="text-sm text-gray-400">Weirdness</div>
                            </div>
                          </div>

                          {/* Fused Traits */}
                          <div className="mb-8">
                            <h4 className="text-lg font-bold text-white mb-3">🧬 Fused Traits:</h4>
                            <div className="flex flex-wrap justify-center gap-2">
                              {newOffspring.fusedTraits.map((trait, index) => (
                                <span 
                                  key={index}
                                  className="px-3 py-1 bg-purple-600/20 border border-purple-500 rounded-full text-sm text-purple-300"
                                >
                                  {trait}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Transaction Simulation */}
                          <div className="bg-black rounded-lg p-6 mb-8 border border-green-500">
                            <div className="text-green-400 text-lg mb-3">✅ NFT Successfully Minted!</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div className="text-left">
                                <div className="text-gray-400 mb-1">Transaction Hash:</div>
                                <div className="text-green-400 font-mono break-all text-xs">{newOffspring.txHash}</div>
                              </div>
                              <div className="text-left">
                                <div className="text-gray-400 mb-1">Token ID:</div>
                                <div className="text-white">#{newOffspring.id.split('_')[1]}</div>
                                <div className="text-gray-400 mt-2 mb-1">Parents:</div>
                                <div className="text-white text-xs">
                                  {selectedGhost1?.name} + {selectedGhost2?.name}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                              onClick={handleShare}
                              className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl text-lg transition-all duration-300 hover:scale-105"
                              style={{ fontFamily: "Holtwood One SC, serif" }}
                            >
                              📱 Share Your Creation
                            </button>
                            <button
                              onClick={handleBreedAgain}
                              className="px-8 py-4 bg-white text-black font-bold rounded-xl text-lg transition-all duration-300 hover:scale-105"
                              style={{ fontFamily: "Holtwood One SC, serif" }}
                            >
                              💞 Breed Another
                            </button>
                            <button
                              onClick={() => setShowCollection(true)}
                              className="px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-black font-bold rounded-xl text-lg transition-all duration-300 hover:scale-105"
                              style={{ fontFamily: "Holtwood One SC, serif" }}
                            >
                              👶 View Collection ({offspringCollection.length})
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
            // Offspring Collection
            <motion.div
              key="collection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {offspringCollection.length === 0 ? (
                <div className="text-center">
                  <div className="bg-gray-900 rounded-2xl p-12 border border-gray-700 max-w-2xl mx-auto">
                    <div className="text-8xl mb-8">👶</div>
                    <h2 className="text-3xl text-gray-400 mb-6 font-bold" style={{ fontFamily: "Holtwood One SC, serif" }}>
                      No Offspring Yet
                    </h2>
                    <p className="text-gray-500 mb-8 text-lg">
                      You haven't bred any ghost offspring yet. Start the mating process to create unique supernatural hybrids!
                    </p>
                    <button
                      onClick={() => setShowCollection(false)}
                      className="px-12 py-4 bg-pink-600 text-white font-bold rounded-xl text-xl transition-all duration-300 hover:scale-105"
                      style={{ fontFamily: "Holtwood One SC, serif" }}
                    >
                      💞 Start Breeding
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {offspringCollection.map((offspring, index) => (
                      <motion.div
                        key={offspring.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-pink-500 transition-all duration-300"
                      >
                        <div className="text-center">
                          <div className="text-5xl mb-4">{offspring.emoji}</div>
                          <h3 className="text-xl font-bold text-pink-400 mb-2" style={{ fontFamily: "Holtwood One SC, serif" }}>
                            {offspring.name}
                          </h3>
                          <div className="text-gray-400 text-sm mb-4">
                            {offspring.type} • Gen {offspring.generation}
                          </div>
                          
                          {/* Special Stats */}
                          <div className="grid grid-cols-3 gap-2 mb-4">
                            <div className="text-center">
                              <div className="text-lg font-bold text-red-400">{offspring.chaos}%</div>
                              <div className="text-xs text-gray-400">Chaos</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-pink-400">{offspring.cuteness}%</div>
                              <div className="text-xs text-gray-400">Cuteness</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-purple-400">{offspring.weirdness}%</div>
                              <div className="text-xs text-gray-400">Weirdness</div>
                            </div>
                          </div>

                          {/* Rarity */}
                          <div className={`text-sm font-bold mb-3 ${
                            offspring.rarity === 'Legendary' ? 'text-yellow-400' :
                            offspring.rarity === 'Epic' ? 'text-purple-400' :
                            offspring.rarity === 'Rare' ? 'text-blue-400' : 'text-gray-400'
                          }`}>
                            {offspring.rarity}
                          </div>

                          {/* Creation Date */}
                          <div className="text-xs text-gray-500">
                            Created: {new Date(offspring.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
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