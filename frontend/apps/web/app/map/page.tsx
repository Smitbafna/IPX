'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import MyCustomComponent from '../../components/FLoatingDock';

interface Ghost {
  id: string;
  name: string;
  type: 'Whisper' | 'Poltergeist' | 'Banshee' | 'Wraith';
  emoji: string;
  x: number;
  y: number;
  haunting: number;
  mischief: number;
  charisma: number;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  owner: string;
  hauntScore: number;
  isHaunting: boolean;
}

interface HauntedArea {
  id: string;
  x: number;
  y: number;
  radius: number;
  intensity: number;
  ghostCount: number;
}

interface ExorcismChallenge {
  id: string;
  type: 'riddle' | 'pattern' | 'memory' | 'math';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  timeLimit: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface ExorcismState {
  isActive: boolean;
  challenge: ExorcismChallenge | null;
  timeRemaining: number;
  attempts: number;
  maxAttempts: number;
}

const ghostTypes = {
  'Whisper': { emoji: '👻', color: 'text-blue-300', bgColor: 'bg-blue-500' },
  'Poltergeist': { emoji: '🔮', color: 'text-purple-300', bgColor: 'bg-purple-500' },
  'Banshee': { emoji: '💀', color: 'text-red-300', bgColor: 'bg-red-500' },
  'Wraith': { emoji: '🌫️', color: 'text-green-300', bgColor: 'bg-green-500' }
};

export default function HauntingMap() {
  const [selectedGhost, setSelectedGhost] = useState<Ghost | null>(null);
  const [ghosts, setGhosts] = useState<Ghost[]>([]);
  const [hauntedAreas, setHauntedAreas] = useState<HauntedArea[]>([]);
  const [mapGlitch, setMapGlitch] = useState(false);
  const [hoveredArea, setHoveredArea] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(true);
  const [chaosIndex, setChaosIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'map' | 'leaderboard'>('map');
  
  // Exorcism states
  const [exorcismState, setExorcismState] = useState<ExorcismState>({
    isActive: false,
    challenge: null,
    timeRemaining: 0,
    attempts: 0,
    maxAttempts: 3
  });
  const [userAnswer, setUserAnswer] = useState('');
  const [exorcismResult, setExorcismResult] = useState<'success' | 'failure' | null>(null);

  // Generate random ghosts and haunted areas
  useEffect(() => {
    // Load user's ghosts from localStorage
    const savedGhosts = localStorage.getItem('ghostCollection');
    let userGhosts: any[] = [];
    if (savedGhosts) {
      userGhosts = JSON.parse(savedGhosts);
    }

    // Generate random other ghosts
    const randomGhosts: Ghost[] = Array.from({ length: 25 }, (_, i) => {
      const types = Object.keys(ghostTypes) as (keyof typeof ghostTypes)[];
      const randomType = types[Math.floor(Math.random() * types.length)];
      
      return {
        id: `ghost_${i}`,
        name: `Ghost ${i + 1}`,
        type: randomType,
        emoji: ghostTypes[randomType].emoji,
        x: Math.random() * 90 + 5, // 5-95% to avoid edges
        y: Math.random() * 90 + 5,
        haunting: Math.floor(Math.random() * 40) + 60,
        mischief: Math.floor(Math.random() * 40) + 60,
        charisma: Math.floor(Math.random() * 40) + 60,
        rarity: ['Common', 'Rare', 'Epic', 'Legendary'][Math.floor(Math.random() * 4)] as any,
        owner: `0x${Math.random().toString(16).substr(2, 8)}...`,
        hauntScore: Math.floor(Math.random() * 1000),
        isHaunting: Math.random() > 0.5
      };
    });

    // Convert user ghosts to map format
    const mappedUserGhosts: Ghost[] = userGhosts.map((ghost, i) => ({
      ...ghost,
      x: Math.random() * 90 + 5,
      y: Math.random() * 90 + 5,
      owner: 'You',
      hauntScore: ghost.haunting + ghost.mischief + ghost.charisma,
      isHaunting: true
    }));

    setGhosts([...mappedUserGhosts, ...randomGhosts]);

    // Generate haunted areas
    const areas: HauntedArea[] = Array.from({ length: 8 }, (_, i) => ({
      id: `area_${i}`,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      radius: Math.random() * 15 + 10,
      intensity: Math.random() * 100,
      ghostCount: Math.floor(Math.random() * 5) + 1
    }));

    setHauntedAreas(areas);

    // Calculate chaos index
    const totalChaos = randomGhosts.reduce((sum, ghost) => sum + ghost.mischief, 0);
    setChaosIndex(Math.floor(totalChaos / randomGhosts.length));
  }, []);

  // Random map glitches
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      setMapGlitch(true);
      setTimeout(() => setMapGlitch(false), 300);
    }, Math.random() * 15000 + 10000); // 10-25 seconds

    return () => clearInterval(glitchInterval);
  }, []);

  // Timer effect for exorcism
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (exorcismState.isActive && exorcismState.timeRemaining > 0) {
      timer = setTimeout(() => {
        setExorcismState(prev => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1
        }));
      }, 1000);
    } else if (exorcismState.isActive && exorcismState.timeRemaining === 0) {
      // Time's up - failed exorcism
      handleExorcismFailure();
    }
    
    return () => clearTimeout(timer);
  }, [exorcismState.timeRemaining, exorcismState.isActive]);

  // Challenge generation based on ghost type and difficulty
  const generateExorcismChallenge = (ghost: Ghost): ExorcismChallenge => {
    const challenges = {
      'Whisper': [
        {
          type: 'riddle' as const,
          question: "I speak without voice, reveal without showing. In silence I'm strongest. What am I?",
          correctAnswer: "secret",
          difficulty: 'easy' as const
        },
        {
          type: 'riddle' as const,
          question: "Born in darkness, I feed on fear. The more you ignore me, the stronger I appear. What am I?",
          correctAnswer: "doubt",
          difficulty: 'medium' as const
        }
      ],
      'Poltergeist': [
        {
          type: 'pattern' as const,
          question: "Complete the sequence: 👻 🔮 💀 🌫️ ?",
          options: ['👻', '🔮', '💀', '🌫️'],
          correctAnswer: '👻',
          difficulty: 'easy' as const
        },
        {
          type: 'math' as const,
          question: "If a ghost disrupts 3 contracts per hour, how many in 8 hours?",
          correctAnswer: "24",
          difficulty: 'medium' as const
        }
      ],
      'Banshee': [
        {
          type: 'memory' as const,
          question: "Remember this sequence for 3 seconds: 💀-🔥-⚡-🌙",
          correctAnswer: "💀🔥⚡🌙",
          difficulty: 'hard' as const
        },
        {
          type: 'riddle' as const,
          question: "I wail for the living, sing for the dead. My voice brings doom, my silence brings dread. What am I?",
          correctAnswer: "banshee",
          difficulty: 'medium' as const
        }
      ],
      'Wraith': [
        {
          type: 'riddle' as const,
          question: "I bind what cannot be touched, join what cannot be seen. In the blockchain I'm eternal. What am I?",
          correctAnswer: "soul",
          difficulty: 'hard' as const
        },
        {
          type: 'math' as const,
          question: "In hex, what is FF + 1?",
          correctAnswer: "100",
          difficulty: 'hard' as const
        }
      ]
    };

    const ghostChallenges = challenges[ghost.type] || challenges['Whisper'];
    const selectedChallenge = ghostChallenges[Math.floor(Math.random() * ghostChallenges.length)];
    
    const timeLimit = {
      'easy': 30,
      'medium': 45,
      'hard': 60
    }[selectedChallenge.difficulty];

    return {
      id: `challenge_${Date.now()}`,
      ...selectedChallenge,
      timeLimit
    };
  };

  const handleGhostClick = (ghost: Ghost) => {
    setSelectedGhost(ghost);
  };

  // Start exorcism process
  const handleExorcise = (ghost: Ghost) => {
    const challenge = generateExorcismChallenge(ghost);
    
    setExorcismState({
      isActive: true,
      challenge,
      timeRemaining: challenge.timeLimit,
      attempts: 0,
      maxAttempts: 3
    });
    
    setUserAnswer('');
    setExorcismResult(null);
  };

  // Handle answer submission
  const handleSubmitAnswer = () => {
    if (!exorcismState.challenge || !selectedGhost) return;
    
    const isCorrect = userAnswer.toLowerCase().trim() === 
      exorcismState.challenge.correctAnswer.toString().toLowerCase();
    
    if (isCorrect) {
      handleExorcismSuccess();
    } else {
      const newAttempts = exorcismState.attempts + 1;
      
      if (newAttempts >= exorcismState.maxAttempts) {
        handleExorcismFailure();
      } else {
        setExorcismState(prev => ({
          ...prev,
          attempts: newAttempts
        }));
        setUserAnswer('');
      }
    }
  };

  // Success logic
  const handleExorcismSuccess = () => {
    if (!selectedGhost) return;
    
    // Calculate success chance based on user's best ghost vs target ghost
    const userGhosts = ghosts.filter(g => g.owner === 'You');
    const bestUserGhost = userGhosts.reduce((best, current) => 
      current.charisma > (best?.charisma || 0) ? current : best, userGhosts[0]);
    
    const successChance = bestUserGhost 
      ? Math.min(90, (bestUserGhost.charisma / selectedGhost.haunting) * 100)
      : 50;
    
    const isSuccessful = Math.random() * 100 < successChance;
    
    if (isSuccessful) {
      // Remove ghost from map
      setGhosts(prev => prev.filter(g => g.id !== selectedGhost.id));
      
      // Award rewards
      const rewards = {
        xp: Math.floor(selectedGhost.haunting / 10) * 50,
        tokens: Math.floor(selectedGhost.mischief / 20),
        badge: selectedGhost.rarity === 'Legendary' ? 'Legendary Exorcist' : null
      };
      
      setExorcismResult('success');
      
      // Save rewards to localStorage
      const currentRewards = JSON.parse(localStorage.getItem('userRewards') || '{"xp": 0, "tokens": 0, "badges": []}');
      currentRewards.xp += rewards.xp;
      currentRewards.tokens += rewards.tokens;
      if (rewards.badge && !currentRewards.badges.includes(rewards.badge)) {
        currentRewards.badges.push(rewards.badge);
      }
      localStorage.setItem('userRewards', JSON.stringify(currentRewards));
      
    } else {
      // Ghost resists exorcism
      setExorcismResult('failure');
      
      // Maybe increase ghost's power
      setGhosts(prev => prev.map(g => 
        g.id === selectedGhost.id 
          ? { ...g, haunting: Math.min(100, g.haunting + 5), hauntScore: g.hauntScore + 100 }
          : g
      ));
    }
    
    // Reset exorcism state after showing result
    setTimeout(() => {
      setExorcismState({
        isActive: false,
        challenge: null,
        timeRemaining: 0,
        attempts: 0,
        maxAttempts: 3
      });
      setSelectedGhost(null);
      setExorcismResult(null);
    }, 3000);
  };

  // Failure logic
  const handleExorcismFailure = () => {
    setExorcismResult('failure');
    
    // Same timeout logic as success
    setTimeout(() => {
      setExorcismState({
        isActive: false,
        challenge: null,
        timeRemaining: 0,
        attempts: 0,
        maxAttempts: 3
      });
      setSelectedGhost(null);
      setExorcismResult(null);
    }, 3000);
  };

  const handleBattle = (ghostId: string) => {
    // Mock battle logic
    setGhosts(prev => prev.map(g => 
      g.id === ghostId 
        ? { ...g, hauntScore: g.hauntScore + Math.floor(Math.random() * 100) }
        : g
    ));
    setSelectedGhost(null);
  };

  const sortedGhosts = [...ghosts].sort((a, b) => b.hauntScore - a.hauntScore);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <MyCustomComponent/>
      {/* Background with glitch effect */}
      <div className={`absolute inset-0 transition-all duration-300 ${mapGlitch ? 'hue-rotate-180 saturate-200' : ''}`}>
        <div className="h-full w-full opacity-10" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Floating mist particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-gray-600 opacity-30"
            initial={{ 
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            }}
            animate={{ 
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            }}
            transition={{ 
              duration: Math.random() * 20 + 20,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            🌫️
          </motion.div>
        ))}
      </div>

      <div className="container mx-auto px-6 py-20 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 
            className="text-4xl md:text-6xl text-white font-bold mb-4"
            style={{ fontFamily: "Holtwood One SC, serif" }}
          >
            Haunting Map
          </h1>
          <p 
            className="text-xl text-gray-400 mb-6"
            style={{ fontFamily: "Holtwood One SC, serif" }}
          >
            Explore the supernatural realm where ghosts roam free
          </p>

          {/* Tabs */}
          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={() => setActiveTab('map')}
              className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                activeTab === 'map' 
                  ? 'bg-white text-black' 
                  : 'border-2 border-white text-white hover:bg-white hover:text-black'
              }`}
              style={{ fontFamily: "Holtwood One SC, serif" }}
            >
              🗺️ Map View
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                activeTab === 'leaderboard' 
                  ? 'bg-white text-black' 
                  : 'border-2 border-white text-white hover:bg-white hover:text-black'
              }`}
              style={{ fontFamily: "Holtwood One SC, serif" }}
            >
              👑 Leaderboard
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'map' && (
            <motion.div
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Stats Bar */}
              {showStats && (
                <div className="bg-gray-900/90 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-400">{ghosts.length}</div>
                      <div className="text-sm text-gray-400">Active Ghosts</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-400">{hauntedAreas.length}</div>
                      <div className="text-sm text-gray-400">Haunted Areas</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-400">{chaosIndex}%</div>
                      <div className="text-sm text-gray-400">Chaos Index</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-400">{ghosts.filter(g => g.owner === 'You').length}</div>
                      <div className="text-sm text-gray-400">Your Ghosts</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Map Container */}
              <div className="relative bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden">
                <div className="aspect-video relative">
                  {/* Haunted Areas */}
                  {hauntedAreas.map((area) => (
                    <motion.div
                      key={area.id}
                      className={`absolute rounded-full border-2 border-red-500/30 bg-red-500/10 cursor-pointer transition-all duration-500 ${
                        hoveredArea === area.id ? 'bg-red-500/20 border-red-500/50' : ''
                      }`}
                      style={{
                        left: `${area.x}%`,
                        top: `${area.y}%`,
                        width: `${area.radius}%`,
                        height: `${area.radius * 0.6}%`, // Adjust for aspect ratio
                        transform: 'translate(-50%, -50%)'
                      }}
                      onMouseEnter={() => setHoveredArea(area.id)}
                      onMouseLeave={() => setHoveredArea(null)}
                      animate={{
                        scale: hoveredArea === area.id ? 1.1 : 1,
                        opacity: [0.3, 0.6, 0.3]
                      }}
                      transition={{
                        opacity: { duration: 3, repeat: Infinity },
                        scale: { duration: 0.3 }
                      }}
                    >
                      {hoveredArea === area.id && (
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black px-2 py-1 rounded text-xs text-white whitespace-nowrap">
                          Haunted Area • {area.ghostCount} ghosts • {Math.floor(area.intensity)}% intensity
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {/* Ghosts */}
                  {ghosts.map((ghost) => (
                    <motion.div
                      key={ghost.id}
                      className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                      style={{
                        left: `${ghost.x}%`,
                        top: `${ghost.y}%`,
                      }}
                      whileHover={{ scale: 1.3, zIndex: 10 }}
                      animate={{
                        y: [0, -5, 0],
                        rotate: ghost.isHaunting ? [0, 5, -5, 0] : 0,
                      }}
                      transition={{
                        y: { duration: 2 + Math.random() * 2, repeat: Infinity },
                        rotate: { duration: 3, repeat: Infinity }
                      }}
                      onClick={() => handleGhostClick(ghost)}
                    >
                      <div className={`relative text-3xl ${ghost.owner === 'You' ? 'drop-shadow-lg' : ''}`}>
                        {ghost.emoji}
                        {ghost.owner === 'You' && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
                        )}
                        {ghost.isHaunting && (
                          <motion.div
                            className={`absolute inset-0 rounded-full blur-sm ${ghostTypes[ghost.type].bgColor} opacity-30`}
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {/* Map Glitch Overlay */}
                  {mapGlitch && (
                    <div className="absolute inset-0 bg-red-500/20 animate-pulse pointer-events-none" />
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-gray-900/90 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-700">
                  <h3 
                    className="text-2xl text-white font-bold"
                    style={{ fontFamily: "Holtwood One SC, serif" }}
                  >
                    👑 Ghost Leaderboard
                  </h3>
                  <p className="text-gray-400 mt-2">Top performing ghosts by haunt score</p>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {sortedGhosts.slice(0, 15).map((ghost, index) => (
                    <motion.div
                      key={ghost.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer transition-all duration-300 ${
                        ghost.owner === 'You' ? 'bg-yellow-500/10 border-yellow-500/20' : ''
                      }`}
                      onClick={() => handleGhostClick(ghost)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`text-2xl font-bold ${
                            index === 0 ? 'text-yellow-400' :
                            index === 1 ? 'text-gray-300' :
                            index === 2 ? 'text-orange-400' : 'text-gray-500'
                          }`}>
                            #{index + 1}
                          </div>
                          
                          <div className="text-2xl">{ghost.emoji}</div>
                          
                          <div>
                            <div className={`font-bold ${ghostTypes[ghost.type].color}`}>
                              {ghost.name}
                            </div>
                            <div className="text-sm text-gray-400">
                              {ghost.type} • Owner: {ghost.owner}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-bold text-white">
                            {ghost.hauntScore.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-400">Haunt Score</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ghost Detail Modal */}
        <AnimatePresence>
          {selectedGhost && !exorcismState.isActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6"
              onClick={() => setSelectedGhost(null)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-gray-900 rounded-2xl border border-gray-700 p-8 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">{selectedGhost.emoji}</div>
                  <h3 
                    className={`text-3xl font-bold mb-2 ${ghostTypes[selectedGhost.type].color}`}
                    style={{ fontFamily: "Holtwood One SC, serif" }}
                  >
                    {selectedGhost.name}
                  </h3>
                  <div className="text-gray-400 mb-4">{selectedGhost.type}</div>
                  <div className="text-sm text-gray-500">Owner: {selectedGhost.owner}</div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">{selectedGhost.haunting}%</div>
                    <div className="text-xs text-gray-400">Haunting</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">{selectedGhost.mischief}%</div>
                    <div className="text-xs text-gray-400">Mischief</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">{selectedGhost.charisma}%</div>
                    <div className="text-xs text-gray-400">Charisma</div>
                  </div>
                </div>

                <div className="text-center mb-6">
                  <div className="text-2xl font-bold text-yellow-400 mb-1">
                    {selectedGhost.hauntScore.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">Total Haunt Score</div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-center">
                  {selectedGhost.owner === 'You' ? (
                    <>
                      <button
                        onClick={() => handleBattle(selectedGhost.id)}
                        className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-all duration-300"
                        style={{ fontFamily: "Holtwood One SC, serif" }}
                      >
                        ⚔️ Battle
                      </button>
                      <button
                        onClick={() => setSelectedGhost(null)}
                        className="px-6 py-3 border-2 border-white text-white hover:bg-white hover:text-black font-bold rounded-xl transition-all duration-300"
                        style={{ fontFamily: "Holtwood One SC, serif" }}
                      >
                        📱 Manage
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleExorcise(selectedGhost)}
                        className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all duration-300"
                        style={{ fontFamily: "Holtwood One SC, serif" }}
                      >
                        🔥 Exorcise
                      </button>
                      <button
                        onClick={() => handleBattle(selectedGhost.id)}
                        className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all duration-300"
                        style={{ fontFamily: "Holtwood One SC, serif" }}
                      >
                        ⚔️ Challenge
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Exorcism Challenge Modal */}
        <AnimatePresence>
          {exorcismState.isActive && selectedGhost && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-6"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-gray-900 rounded-2xl border border-red-500 p-8 max-w-lg w-full"
              >
                {exorcismResult ? (
                  // Result Screen
                  <div className="text-center">
                    <div className="text-6xl mb-4">
                      {exorcismResult === 'success' ? '✅' : '❌'}
                    </div>
                    <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: "Holtwood One SC, serif" }}>
                      {exorcismResult === 'success' ? 'Exorcism Successful!' : 'Exorcism Failed!'}
                    </h3>
                    <p className="text-gray-400">
                      {exorcismResult === 'success' 
                        ? `${selectedGhost.name} has been banished from the realm!`
                        : `${selectedGhost.name} resisted your exorcism and grew stronger!`
                      }
                    </p>
                  </div>
                ) : (
                  // Challenge Screen
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-red-400" style={{ fontFamily: "Holtwood One SC, serif" }}>
                        🔥 Exorcising {selectedGhost.name}
                      </h3>
                      <div className="text-red-400 font-bold">
                        ⏰ {exorcismState.timeRemaining}s
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="text-lg text-white mb-4">
                        {exorcismState.challenge?.question}
                      </div>
                      
                      {exorcismState.challenge?.options ? (
                        // Multiple choice
                        <div className="grid grid-cols-2 gap-3">
                          {exorcismState.challenge.options.map((option, index) => (
                            <button
                              key={index}
                              onClick={() => setUserAnswer(option)}
                              className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                                userAnswer === option 
                                  ? 'border-white bg-white text-black' 
                                  : 'border-gray-600 text-white hover:border-white'
                              }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      ) : (
                        // Text input
                        <input
                          type="text"
                          value={userAnswer}
                          onChange={(e) => setUserAnswer(e.target.value)}
                          placeholder="Enter your answer..."
                          className="w-full px-4 py-3 bg-black border border-gray-600 rounded-lg text-white focus:border-red-400 focus:outline-none"
                          onKeyPress={(e) => e.key === 'Enter' && handleSubmitAnswer()}
                        />
                      )}
                    </div>

                    <div className="mb-4">
                      <div className="text-sm text-gray-400">
                        Attempts remaining: {exorcismState.maxAttempts - exorcismState.attempts}
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(exorcismState.timeRemaining / (exorcismState.challenge?.timeLimit || 30)) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={handleSubmitAnswer}
                        disabled={!userAnswer.trim()}
                        className={`px-6 py-3 font-bold rounded-xl transition-all duration-300 ${
                          userAnswer.trim()
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                        style={{ fontFamily: "Holtwood One SC, serif" }}
                      >
                        🔥 Submit Exorcism
                      </button>
                      
                      <button
                        onClick={() => {
                          setExorcismState(prev => ({ ...prev, isActive: false }));
                          setSelectedGhost(null);
                        }}
                        className="px-6 py-3 border-2 border-gray-600 text-gray-400 hover:border-white hover:text-white font-bold rounded-xl transition-all duration-300"
                        style={{ fontFamily: "Holtwood One SC, serif" }}
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
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