import React, { useState } from 'react';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = () => {
    if (email.trim()) {
      // Handle newsletter subscription
      console.log('Subscribing email:', email);
      setEmail('');
      alert('Subscribed to ghostly updates! 👻');
    }
  };

  const SubtleGrid = () => (
    <div className="absolute inset-0 opacity-5">
      <svg width="100%" height="100%" className="absolute inset-0">
        <defs>
          <pattern
            id="footergrid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="rgb(147 51 234 / 0.3)"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#footergrid)" />
      </svg>
    </div>
  );

  return (
    <footer className="relative border-t border-purple-500/20 bg-gradient-to-br from-black via-gray-900 to-purple-950 text-white overflow-hidden">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Holtwood+One+SC&display=swap');
        
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .gradient-text {
          background: linear-gradient(-45deg, #8b5cf6, #a78bfa, #c4b5fd, #8b5cf6);
          background-size: 400% 400%;
          animation: gradient-shift 3s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        
        .floating-ghost {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>

      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-purple-950" />
        <SubtleGrid />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-purple-500/5 to-transparent" />
        
        {/* Floating Ghost Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute text-2xl opacity-10 floating-ghost"
              style={{
                left: `${10 + (i * 12)}%`,
                top: `${20 + (i % 4) * 20}%`,
                animationDelay: `${i * 0.8}s`,
                animationDuration: `${4 + (i % 3)}s`
              }}
            >
              {['👻', '🔮', '💀', '🌫️', '⚡', '🔥', '🌙', '✨'][i]}
            </div>
          ))}
        </div>
      </div>
      
      <div className="relative z-10 container mx-auto px-6 pt-16 pb-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <h3 
                className="text-3xl font-bold gradient-text mb-4"
                style={{ fontFamily: "Holtwood One SC, serif" }}
              >
                👻 Ghost NFTs
              </h3>
              <p 
                className="text-gray-300 mb-6 leading-relaxed"
                style={{ fontFamily: "Holtwood One SC, serif", letterSpacing: "0.03rem" }}
              >
                Enter the supernatural realm where ghosts possess wallets and create blockchain chaos. Summon, battle, and breed your ghostly companions.
              </p>
            </div>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 group">
                <svg className="w-5 h-5 text-purple-300 group-hover:animate-bounce" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 group">
                <svg className="w-5 h-5 text-purple-300 group-hover:animate-bounce" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5685 21H20.8131L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.0956Z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 group">
                <span className="text-purple-300 text-lg group-hover:animate-spin">👻</span>
              </a>
              <a href="#" className="w-10 h-10 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 group">
                <span className="text-purple-300 text-lg group-hover:animate-pulse">🔮</span>
              </a>
            </div>
          </div>

          {/* Ghost Features */}
          <div>
            <h4 
              className="text-lg font-semibold text-white mb-6"
              style={{ fontFamily: "Holtwood One SC, serif" }}
            >
              👻 Ghost Features
            </h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href="/summon-ghost" 
                  className="text-gray-300 hover:text-purple-300 transition-colors flex items-center gap-2 group"
                  style={{ fontFamily: "Holtwood One SC, serif", letterSpacing: "0.03rem" }}
                >
                  <span className="group-hover:animate-bounce">👻</span>
                  Summon Ghosts
                </a>
              </li>
              <li>
                <a 
                  href="/map" 
                  className="text-gray-300 hover:text-purple-300 transition-colors flex items-center gap-2 group"
                  style={{ fontFamily: "Holtwood One SC, serif", letterSpacing: "0.03rem" }}
                >
                  <span className="group-hover:animate-spin">🗺️</span>
                  Haunting Map
                </a>
              </li>
              <li>
                <a 
                  href="/meme-mating" 
                  className="text-gray-300 hover:text-purple-300 transition-colors flex items-center gap-2 group"
                  style={{ fontFamily: "Holtwood One SC, serif", letterSpacing: "0.03rem" }}
                >
                  <span className="group-hover:animate-pulse">💞</span>
                  Meme Mating
                </a>
              </li>
              <li>
                <a 
                  href="/map" 
                  className="text-gray-300 hover:text-purple-300 transition-colors flex items-center gap-2 group"
                  style={{ fontFamily: "Holtwood One SC, serif", letterSpacing: "0.03rem" }}
                >
                  <span className="group-hover:animate-bounce">🔥</span>
                  Exorcism Challenges
                </a>
              </li>
              <li>
                <a 
                  href="/battles" 
                  className="text-gray-300 hover:text-purple-300 transition-colors flex items-center gap-2 group"
                  style={{ fontFamily: "Holtwood One SC, serif", letterSpacing: "0.03rem" }}
                >
                  <span className="group-hover:animate-spin">⚔️</span>
                  Ghost Battles
                </a>
              </li>
              <li>
                <a 
                  href="/achievements" 
                  className="text-gray-300 hover:text-purple-300 transition-colors flex items-center gap-2 group"
                  style={{ fontFamily: "Holtwood One SC, serif", letterSpacing: "0.03rem" }}
                >
                  <span className="group-hover:animate-pulse">🏆</span>
                  Achievements
                </a>
              </li>
            </ul>
          </div>

          {/* Ghost Types */}
          <div>
            <h4 
              className="text-lg font-semibold text-white mb-6"
              style={{ fontFamily: "Holtwood One SC, serif" }}
            >
              🌟 Ghost Types
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <span className="text-2xl">👻</span>
                <div>
                  <div 
                    className="text-blue-300 font-medium"
                    style={{ fontFamily: "Holtwood One SC, serif" }}
                  >
                    Whisper
                  </div>
                  <div 
                    className="text-xs text-gray-400"
                    style={{ fontFamily: "Holtwood One SC, serif" }}
                  >
                    Silent Possession
                  </div>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-2xl">🔮</span>
                <div>
                  <div 
                    className="text-purple-300 font-medium"
                    style={{ fontFamily: "Holtwood One SC, serif" }}
                  >
                    Poltergeist
                  </div>
                  <div 
                    className="text-xs text-gray-400"
                    style={{ fontFamily: "Holtwood One SC, serif" }}
                  >
                    Asset Disruption
                  </div>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-2xl">💀</span>
                <div>
                  <div 
                    className="text-red-300 font-medium"
                    style={{ fontFamily: "Holtwood One SC, serif" }}
                  >
                    Banshee
                  </div>
                  <div 
                    className="text-xs text-gray-400"
                    style={{ fontFamily: "Holtwood One SC, serif" }}
                  >
                    Network Haunting
                  </div>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-2xl">🌫️</span>
                <div>
                  <div 
                    className="text-green-300 font-medium"
                    style={{ fontFamily: "Holtwood One SC, serif" }}
                  >
                    Wraith
                  </div>
                  <div 
                    className="text-xs text-gray-400"
                    style={{ fontFamily: "Holtwood One SC, serif" }}
                  >
                    Soul Binding
                  </div>
                </div>
              </li>
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div>
            <h4 
              className="text-lg font-semibold text-white mb-6"
              style={{ fontFamily: "Holtwood One SC, serif" }}
            >
              📮 Supernatural Updates
            </h4>
            <p 
              className="text-gray-300 mb-4 leading-relaxed"
              style={{ fontFamily: "Holtwood One SC, serif", letterSpacing: "0.03rem" }}
            >
              Get haunted with the latest ghost drops, breeding events, and supernatural rewards.
            </p>
            <div className="space-y-3">
              <div className="flex">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email..."
                  className="flex-1 px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-l-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:bg-gray-800/50 transition-all backdrop-blur-sm"
                  style={{ fontFamily: "Holtwood One SC, serif" }}
                />
                <button 
                  onClick={handleSubscribe}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold rounded-r-lg hover:from-purple-700 hover:to-violet-700 transition-all duration-300 hover:scale-105 flex items-center gap-2"
                  style={{ fontFamily: "Holtwood One SC, serif" }}
                >
                  <span className="animate-pulse">👻</span>
                  Subscribe
                </button>
              </div>
              <p 
                className="text-xs text-gray-400"
                style={{ fontFamily: "Holtwood One SC, serif" }}
              >
                No spam, only ghostly goodness. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>

        {/* Support & Community Section */}
        <div className="border-t border-purple-500/20 pt-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div>
              <h5 
                className="text-white font-semibold mb-3 flex items-center gap-2"
                style={{ fontFamily: "Holtwood One SC, serif" }}
              >
                <span className="animate-pulse">📞</span>
                Contact the Spirits
              </h5>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span style={{ fontFamily: "Holtwood One SC, serif" }}>haunt@ghostnfts.io</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span style={{ fontFamily: "Holtwood One SC, serif" }}>Haunting Globally</span>
                </div>
              </div>
            </div>

            {/* Support Links */}
            <div>
              <h5 
                className="text-white font-semibold mb-3 flex items-center gap-2"
                style={{ fontFamily: "Holtwood One SC, serif" }}
              >
                <span className="animate-bounce">🆘</span>
                Ghost Support
              </h5>
              <div className="space-y-2 text-sm">
                <a 
                  href="#" 
                  className="block text-gray-300 hover:text-purple-300 transition-colors"
                  style={{ fontFamily: "Holtwood One SC, serif" }}
                >
                  Spirit Guide Center
                </a>
                <a 
                  href="#" 
                  className="block text-gray-300 hover:text-purple-300 transition-colors"
                  style={{ fontFamily: "Holtwood One SC, serif" }}
                >
                  Exorcism Support
                </a>
                <a 
                  href="#" 
                  className="block text-gray-300 hover:text-purple-300 transition-colors"
                  style={{ fontFamily: "Holtwood One SC, serif" }}
                >
                  Report a Haunting
                </a>
                <a 
                  href="#" 
                  className="block text-gray-300 hover:text-purple-300 transition-colors"
                  style={{ fontFamily: "Holtwood One SC, serif" }}
                >
                  Ghost Security
                </a>
              </div>
            </div>

            {/* Legal Links */}
            <div>
              <h5 
                className="text-white font-semibold mb-3 flex items-center gap-2"
                style={{ fontFamily: "Holtwood One SC, serif" }}
              >
                <span className="animate-pulse">⚖️</span>
                Supernatural Law
              </h5>
              <div className="space-y-2 text-sm">
                <a 
                  href="#" 
                  className="block text-gray-300 hover:text-purple-300 transition-colors"
                  style={{ fontFamily: "Holtwood One SC, serif" }}
                >
                  Spirit Privacy Policy
                </a>
                <a 
                  href="#" 
                  className="block text-gray-300 hover:text-purple-300 transition-colors"
                  style={{ fontFamily: "Holtwood One SC, serif" }}
                >
                  Haunting Terms
                </a>
                <a 
                  href="#" 
                  className="block text-gray-300 hover:text-purple-300 transition-colors"
                  style={{ fontFamily: "Holtwood One SC, serif" }}
                >
                  Ghost Code of Conduct
                </a>
                <a 
                  href="#" 
                  className="block text-gray-300 hover:text-purple-300 transition-colors"
                  style={{ fontFamily: "Holtwood One SC, serif" }}
                >
                  Blockchain Compliance
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-purple-500/20 pt-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div 
            className="text-sm text-gray-400 flex items-center gap-2"
            style={{ fontFamily: "Holtwood One SC, serif" }}
          >
            <span className="animate-pulse">👻</span>
            © 2025 Ghost NFTs. All spirits reserved.
          </div>
          <div 
            className="flex items-center space-x-4 text-sm text-gray-400"
            style={{ fontFamily: "Holtwood One SC, serif" }}
          >
            <span className="flex items-center gap-2">
              Built with 
              <span className="animate-pulse text-purple-400">🔮</span> 
              for the supernatural community
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;