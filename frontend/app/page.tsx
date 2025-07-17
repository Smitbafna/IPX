'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [activeDemo, setActiveDemo] = useState('creator');

  const demoProjects = [
    {
      id: 1,
      title: "Midnight Vibes Album",
      creator: "Luna Echo",
      category: "Music",
      fundingGoal: 75000,
      currentFunding: 52000,
      investors: 104,
      monthlyRevenue: 8500,
      image: "/api/placeholder/300/200",
      description: "Independent electronic album with dreamy synthwave aesthetics"
    },
    {
      id: 2,
      title: "TaskFlow Mobile App",
      creator: "DevStudio Inc",
      category: "Software",
      fundingGoal: 150000,
      currentFunding: 89000,
      investors: 67,
      monthlyRevenue: 12000,
      image: "/api/placeholder/300/200",
      description: "AI-powered productivity app for remote teams"
    },
    {
      id: 3,
      title: "Crypto Trading Course",
      creator: "FinanceGuru",
      category: "Education",
      fundingGoal: 25000,
      currentFunding: 25000,
      investors: 156,
      monthlyRevenue: 4200,
      image: "/api/placeholder/300/200",
      description: "Complete cryptocurrency trading masterclass series"
    }
  ];

  const investorPortfolio = [
    { project: "Midnight Vibes Album", shares: 10, monthlyEarnings: 85, totalEarnings: 680 },
    { project: "TaskFlow Mobile App", shares: 5, monthlyEarnings: 60, totalEarnings: 420 },
    { project: "Indie Game Studio", shares: 15, monthlyEarnings: 45, totalEarnings: 315 },
    { project: "Podcast Network", shares: 8, monthlyEarnings: 32, totalEarnings: 224 }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative px-6 py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gray-900">
            Transform IP into 
            <br />Liquid Assets
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-600 max-w-3xl mx-auto">
            IPX Protocol enables fractional ownership of intellectual property. 
            Creators raise capital, investors earn revenue share automatically.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/create-campaign" className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-lg font-semibold text-lg transition-all shadow-lg text-white">
              Start Campaign (Creator)
            </Link>
            <Link href="/explore" className="border-2 border-blue-600 hover:bg-blue-50 px-8 py-4 rounded-lg font-semibold text-lg transition-all text-blue-600">
              Explore Campaigns (Supporter)
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-20 bg-blue-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">How IPX Protocol Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">Creators Tokenize IP</h3>
              <p className="text-gray-600">Upload your intellectual property and create fractional ownership shares as NFTs</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">Investors Buy Shares</h3>
              <p className="text-gray-600">Purchase fractional NFT shares to own a percentage of future revenue streams</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">Automatic Revenue</h3>
              <p className="text-gray-600">Oracle tracks earnings and distributes payments proportionally in real-time</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">Experience the Platform</h2>
          
          {/* Demo Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-gray-100 p-1 rounded-lg border border-gray-200">
              <button
                onClick={() => setActiveDemo('creator')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeDemo === 'creator' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Creator View
              </button>
              <button
                onClick={() => setActiveDemo('investor')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeDemo === 'investor' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Investor View
              </button>
            </div>
          </div>

          {/* Creator Demo */}
          {activeDemo === 'creator' && (
            <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-lg">
              <h3 className="text-2xl font-bold mb-6 text-blue-600">Active Campaigns</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {demoProjects.map((project) => (
                  <div key={project.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-blue-300 transition-all">
                    <div className="w-full h-32 bg-blue-600 rounded-lg mb-4"></div>
                    <h4 className="font-bold text-lg mb-2 text-gray-900">{project.title}</h4>
                    <p className="text-gray-600 text-sm mb-4">{project.description}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Progress:</span>
                        <span className="text-blue-600 font-semibold">${project.currentFunding.toLocaleString()} / ${project.fundingGoal.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(project.currentFunding / project.fundingGoal) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Investors:</span>
                        <span className="text-gray-900 font-semibold">{project.investors}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monthly Revenue:</span>
                        <span className="text-green-600 font-semibold">${project.monthlyRevenue.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Investor Demo */}
          {activeDemo === 'investor' && (
            <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-lg">
              <h3 className="text-2xl font-bold mb-6 text-blue-600">Investment Portfolio</h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-bold mb-4 text-gray-900">Holdings</h4>
                  <div className="space-y-4">
                    {investorPortfolio.map((holding, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-gray-900">{holding.project}</span>
                          <span className="text-sm text-gray-600">{holding.shares} shares</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Monthly: <span className="text-green-600 font-semibold">${holding.monthlyEarnings}</span></span>
                          <span className="text-gray-600">Total: <span className="text-blue-600 font-semibold">${holding.totalEarnings}</span></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-bold mb-4 text-gray-900">Revenue Analytics</h4>
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monthly Revenue:</span>
                        <span className="text-green-600 font-bold">$222</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Earned:</span>
                        <span className="text-blue-600 font-bold">$1,639</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Portfolio Value:</span>
                        <span className="text-blue-600 font-bold">$8,500</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">ROI:</span>
                        <span className="text-green-600 font-bold">19.3%</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-600 mb-2">Next Payment: 2 days</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-6 py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">Why Choose IPX Protocol</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-lg mx-auto mb-4 flex items-center justify-center shadow-lg">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="font-bold mb-2 text-gray-900">Instant Funding</h3>
              <p className="text-gray-600 text-sm">Raise capital without debt or giving up control</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-lg mx-auto mb-4 flex items-center justify-center shadow-lg">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="font-bold mb-2 text-gray-900">Passive Income</h3>
              <p className="text-gray-600 text-sm">Earn revenue share automatically from IP performance</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-lg mx-auto mb-4 flex items-center justify-center shadow-lg">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="font-bold mb-2 text-gray-900">Transparent</h3>
              <p className="text-gray-600 text-sm">All transactions and revenue tracked on-chain</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-lg mx-auto mb-4 flex items-center justify-center shadow-lg">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="font-bold mb-2 text-gray-900">Automated</h3>
              <p className="text-gray-600 text-sm">Smart contracts handle all revenue distribution</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-gray-900">Ready to Transform Your IP?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join the future of intellectual property monetization on the Internet Computer
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/demo" className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-lg font-semibold text-lg transition-all shadow-lg text-white">
              Try Interactive Demo
            </Link>
            <Link href="/dashboard" className="border-2 border-blue-600 hover:bg-blue-50 px-8 py-4 rounded-lg font-semibold text-lg transition-all text-blue-600">
              Connect Wallet
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 px-6 py-8 bg-gray-50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold text-blue-600">IPX Protocol</h3>
            <p className="text-gray-600">Fractional IP ownership on Internet Computer</p>
          </div>
          
          <div className="flex space-x-6">
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Documentation</a>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">GitHub</a>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Discord</a>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}