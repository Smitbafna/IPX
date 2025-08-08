'use client';
import { base } from 'viem/chains';
import styles from "./page.module.css";
import React from 'react';

import Footer from '../components/Footer';
import FeaturesSection from '../components/Features';
import HeroSection from '../components/Hero';
import { Navigation } from '../components/ipx/Navigation';


export default function Page() {
 

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      <Navigation />
     
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        
        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            ></div>
          ))}
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
          <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Moving Gradient Lines */}
        <div className="absolute inset-0">
          <div className="absolute h-px w-full bg-gradient-to-r from-transparent via-purple-500/50 to-transparent animate-pulse top-1/4"></div>
          <div className="absolute h-px w-full bg-gradient-to-r from-transparent via-blue-500/50 to-transparent animate-pulse top-2/3 delay-1000"></div>
          <div className="absolute w-px h-full bg-gradient-to-b from-transparent via-cyan-500/50 to-transparent animate-pulse left-1/4 delay-2000"></div>
          <div className="absolute w-px h-full bg-gradient-to-b from-transparent via-purple-500/50 to-transparent animate-pulse right-1/3 delay-500"></div>
        </div>
      </div>

      {/* IPX Landing Content */}
      <div className="relative z-10 pt-20">
        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 
              className="text-5xl md:text-7xl text-white font-bold mb-6"
              style={{ fontFamily: "Holtwood One SC, serif" }}
            >
              🔮 Tokenize Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Intellectual Property</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
              Transform your ideas into tradeable tokens. Create, invest, and earn royalties from intellectual property on the Hedera blockchain.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <a
                href="/create"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl text-lg transition-all duration-300 shadow-2xl hover:shadow-purple-500/25"
                style={{ fontFamily: "Holtwood One SC, serif" }}
              >
                ✨ Create IP Token
              </a>
              <a
                href="/marketplace"
                className="px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-black font-bold rounded-xl text-lg transition-all duration-300"
                style={{ fontFamily: "Holtwood One SC, serif" }}
              >
                🏪 Explore Marketplace
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">$2.5M+</div>
                <div className="text-gray-400">IP Value Tokenized</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">1,200+</div>
                <div className="text-gray-400">Tokens Created</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-green-400 mb-2">85%</div>
                <div className="text-gray-400">Creator Retention</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">24/7</div>
                <div className="text-gray-400">Royalty Payouts</div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 
              className="text-4xl md:text-5xl text-white font-bold mb-6"
              style={{ fontFamily: "Holtwood One SC, serif" }}
            >
              How IPX Works
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Three simple steps to transform your intellectual property into a revenue-generating asset
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center text-3xl text-white mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                📄
              </div>
              <h3 className="text-2xl text-white font-bold mb-4">1. Submit Proof</h3>
              <p className="text-gray-400 leading-relaxed">
                Upload your intellectual property documents, files, or proof of creation. Our verification system ensures authenticity and ownership.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl flex items-center justify-center text-3xl text-white mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                🪙
              </div>
              <h3 className="text-2xl text-white font-bold mb-4">2. Mint Token</h3>
              <p className="text-gray-400 leading-relaxed">
                Configure your token parameters including supply, royalty rates, and licensing terms. Deploy your IP token to the Hedera blockchain.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-yellow-600 rounded-2xl flex items-center justify-center text-3xl text-white mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                💰
              </div>
              <h3 className="text-2xl text-white font-bold mb-4">3. Earn Royalties</h3>
              <p className="text-gray-400 leading-relaxed">
                Receive automatic royalty payments when others license or invest in your IP. Monitor performance through your dashboard.
              </p>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 
              className="text-4xl md:text-5xl text-white font-bold mb-6"
              style={{ fontFamily: "Holtwood One SC, serif" }}
            >
              Perfect For All Creators
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Whether you're an artist, inventor, or developer, IPX helps you monetize your intellectual property
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Music */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 hover:border-purple-500 transition-all duration-300 group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🎵</div>
              <h3 className="text-xl text-white font-bold mb-3">Musicians & Composers</h3>
              <p className="text-gray-400 mb-4">
                Tokenize your tracks, albums, and compositions. Earn royalties from streaming, licensing, and investment.
              </p>
              <div className="text-purple-400 text-sm">• Automatic royalty distribution • License tracking • Fan investment</div>
            </div>

            {/* Digital Art */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 hover:border-blue-500 transition-all duration-300 group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🎨</div>
              <h3 className="text-xl text-white font-bold mb-3">Digital Artists</h3>
              <p className="text-gray-400 mb-4">
                Create fractional ownership of your artwork. Enable collectors to invest and earn from appreciation.
              </p>
              <div className="text-blue-400 text-sm">• Fractional ownership • Resale royalties • Authenticity proof</div>
            </div>

            {/* Developers */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 hover:border-green-500 transition-all duration-300 group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">💻</div>
              <h3 className="text-xl text-white font-bold mb-3">Software Developers</h3>
              <p className="text-gray-400 mb-4">
                Monetize your code libraries, algorithms, and software solutions through licensing and investment.
              </p>
              <div className="text-green-400 text-sm">• Code licensing • Usage tracking • Revenue sharing</div>
            </div>

            {/* Inventors */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 hover:border-yellow-500 transition-all duration-300 group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🔬</div>
              <h3 className="text-xl text-white font-bold mb-3">Inventors & Researchers</h3>
              <p className="text-gray-400 mb-4">
                Patent your innovations and create investment opportunities for breakthrough technologies.
              </p>
              <div className="text-yellow-400 text-sm">• Patent tokenization • Research funding • Innovation rewards</div>
            </div>

            {/* Content Creators */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 hover:border-red-500 transition-all duration-300 group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🎬</div>
              <h3 className="text-xl text-white font-bold mb-3">Content Creators</h3>
              <p className="text-gray-400 mb-4">
                Tokenize video content, courses, and media. Create subscription and licensing models.
              </p>
              <div className="text-red-400 text-sm">• Content licensing • Subscriber rewards • Media monetization</div>
            </div>

            {/* Writers */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 hover:border-purple-500 transition-all duration-300 group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">📖</div>
              <h3 className="text-xl text-white font-bold mb-3">Authors & Writers</h3>
              <p className="text-gray-400 mb-4">
                Transform your books, articles, and written works into investment opportunities and licensing deals.
              </p>
              <div className="text-purple-400 text-sm">• Publishing rights • Translation licensing • Reader investment</div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-sm rounded-3xl p-12 border border-gray-700">
              <h2 
                className="text-4xl md:text-5xl text-white font-bold mb-6"
                style={{ fontFamily: "Holtwood One SC, serif" }}
              >
                Ready to Tokenize Your IP?
              </h2>
              <p className="text-xl text-gray-300 mb-10">
                Join thousands of creators already earning passive income from their intellectual property
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/create"
                  className="px-10 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl text-lg transition-all duration-300 shadow-2xl hover:shadow-purple-500/25"
                  style={{ fontFamily: "Holtwood One SC, serif" }}
                >
                  🚀 Start Creating Now
                </a>
                <a
                  href="/marketplace"
                  className="px-10 py-4 border-2 border-white text-white hover:bg-white hover:text-black font-bold rounded-xl text-lg transition-all duration-300"
                  style={{ fontFamily: "Holtwood One SC, serif" }}
                >
                  📊 Explore Investment Opportunities
                </a>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Holtwood+One+SC&display=swap');
        
        @keyframes moveLight {
          0% {
            transform: translateX(-100px);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateX(calc(100vw + 100px));
            opacity: 0;
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        @keyframes glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
      `}</style>
    
    </div>
  );
}