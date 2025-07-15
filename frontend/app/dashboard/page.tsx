'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Campaign {
  id: number;
  title: string;
  creator: string;
  category: string;
  fundingGoal: number;
  currentFunding: number;
  investors: number;
  monthlyRevenue: number;
  status: 'active' | 'funded' | 'pending';
}

interface Investment {
  id: number;
  campaignTitle: string;
  shares: number;
  initialInvestment: number;
  monthlyEarnings: number;
  totalEarnings: number;
  currentValue: number;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [walletConnected, setWalletConnected] = useState(false);

  // Mock data
  const campaigns: Campaign[] = [
    {
      id: 1,
      title: "Midnight Vibes Album",
      creator: "Luna Echo",
      category: "Music",
      fundingGoal: 75000,
      currentFunding: 52000,
      investors: 104,
      monthlyRevenue: 8500,
      status: 'active'
    },
    {
      id: 2,
      title: "TaskFlow Mobile App",
      creator: "DevStudio Inc",
      category: "Software",
      fundingGoal: 150000,
      currentFunding: 150000,
      investors: 67,
      monthlyRevenue: 12000,
      status: 'funded'
    }
  ];

  const investments: Investment[] = [
    {
      id: 1,
      campaignTitle: "Midnight Vibes Album",
      shares: 10,
      initialInvestment: 750,
      monthlyEarnings: 85,
      totalEarnings: 680,
      currentValue: 850
    },
    {
      id: 2,
      campaignTitle: "Crypto Trading Course",
      shares: 5,
      initialInvestment: 250,
      monthlyEarnings: 21,
      totalEarnings: 147,
      currentValue: 275
    }
  ];

  const portfolioStats = {
    totalInvested: investments.reduce((sum, inv) => sum + inv.initialInvestment, 0),
    totalValue: investments.reduce((sum, inv) => sum + inv.currentValue, 0),
    monthlyIncome: investments.reduce((sum, inv) => sum + inv.monthlyEarnings, 0),
    totalEarnings: investments.reduce((sum, inv) => sum + inv.totalEarnings, 0)
  };

  if (!walletConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8 bg-gray-800/50 rounded-lg backdrop-blur">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center">
            <span className="text-3xl">🔗</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">Connect Your Wallet</h1>
          <p className="text-gray-300 mb-8">
            Connect your Internet Identity to access the IPX Protocol dashboard
          </p>
          <button
            onClick={() => setWalletConnected(true)}
            className="w-full bg-purple-600 hover:bg-purple-700 py-3 px-6 rounded-lg font-semibold transition-colors mb-4"
          >
            Connect Internet Identity
          </button>
          <Link href="/" className="text-purple-400 hover:text-purple-300 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white">
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-700">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            IPX Protocol
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-gray-400">Balance:</span>
              <span className="ml-2 font-bold">10,000 ICP</span>
            </div>
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-800/50 p-1 rounded-lg w-fit">
          {['overview', 'campaigns', 'investments', 'create'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-semibold capitalize transition-colors ${
                activeTab === tab ? 'bg-purple-600 text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Portfolio Stats */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h3 className="text-sm text-gray-400 mb-2">Total Invested</h3>
                <p className="text-2xl font-bold">${portfolioStats.totalInvested.toLocaleString()}</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h3 className="text-sm text-gray-400 mb-2">Portfolio Value</h3>
                <p className="text-2xl font-bold text-green-400">${portfolioStats.totalValue.toLocaleString()}</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h3 className="text-sm text-gray-400 mb-2">Monthly Income</h3>
                <p className="text-2xl font-bold text-blue-400">${portfolioStats.monthlyIncome.toLocaleString()}</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h3 className="text-sm text-gray-400 mb-2">Total Earnings</h3>
                <p className="text-2xl font-bold text-yellow-400">${portfolioStats.totalEarnings.toLocaleString()}</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-6">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-4">
                      <span className="text-sm">💰</span>
                    </div>
                    <div>
                      <p className="font-semibold">Revenue Payment Received</p>
                      <p className="text-sm text-gray-400">From Midnight Vibes Album</p>
                    </div>
                  </div>
                  <span className="text-green-400 font-bold">+$85</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                      <span className="text-sm">📈</span>
                    </div>
                    <div>
                      <p className="font-semibold">New Investment</p>
                      <p className="text-sm text-gray-400">10 shares in TaskFlow App</p>
                    </div>
                  </div>
                  <span className="text-blue-400 font-bold">-$750</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mr-4">
                      <span className="text-sm">🎵</span>
                    </div>
                    <div>
                      <p className="font-semibold">Campaign Fully Funded</p>
                      <p className="text-sm text-gray-400">Midnight Vibes Album reached goal</p>
                    </div>
                  </div>
                  <span className="text-gray-400 text-sm">2 days ago</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Available Campaigns</h2>
              <div className="flex gap-2">
                <select className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2">
                  <option>All Categories</option>
                  <option>Music</option>
                  <option>Software</option>
                  <option>Education</option>
                </select>
                <select className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2">
                  <option>Sort by Recent</option>
                  <option>Sort by Funding</option>
                  <option>Sort by Revenue</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="bg-gray-800/50 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      campaign.status === 'active' ? 'bg-blue-500' :
                      campaign.status === 'funded' ? 'bg-green-500' : 'bg-yellow-500'
                    }`}>
                      {campaign.status.toUpperCase()}
                    </span>
                    <span className="bg-purple-600 px-2 py-1 rounded text-xs">{campaign.category}</span>
                  </div>
                  
                  <h3 className="text-lg font-bold mb-2">{campaign.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">by {campaign.creator}</p>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round((campaign.currentFunding / campaign.fundingGoal) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full" 
                        style={{ width: `${(campaign.currentFunding / campaign.fundingGoal) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>${campaign.currentFunding.toLocaleString()}</span>
                      <span>${campaign.fundingGoal.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm mb-4">
                    <span>Investors: {campaign.investors}</span>
                    <span className="text-green-400">Revenue: ${campaign.monthlyRevenue.toLocaleString()}/mo</span>
                  </div>
                  
                  <button className="w-full bg-purple-600 hover:bg-purple-700 py-2 px-4 rounded-lg font-semibold transition-colors">
                    {campaign.status === 'funded' ? 'View Details' : 'Invest Now'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Investments Tab */}
        {activeTab === 'investments' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">My Investments</h2>
            
            <div className="bg-gray-800/50 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Campaign</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Shares</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Investment</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Current Value</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Monthly Income</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Total Earnings</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {investments.map((investment) => (
                      <tr key={investment.id} className="border-t border-gray-700">
                        <td className="px-6 py-4 font-semibold">{investment.campaignTitle}</td>
                        <td className="px-6 py-4">{investment.shares}</td>
                        <td className="px-6 py-4">${investment.initialInvestment}</td>
                        <td className="px-6 py-4 text-green-400">${investment.currentValue}</td>
                        <td className="px-6 py-4 text-blue-400">${investment.monthlyEarnings}</td>
                        <td className="px-6 py-4 text-yellow-400">${investment.totalEarnings}</td>
                        <td className="px-6 py-4">
                          <button className="text-purple-400 hover:text-purple-300 text-sm">
                            Trade Shares
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Create Tab */}
        {activeTab === 'create' && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-center">Create New Campaign</h2>
            
            <div className="bg-gray-800/50 rounded-lg p-8">
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Project Title</label>
                  <input
                    type="text"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                    placeholder="Enter your project title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2">
                    <option>Select category</option>
                    <option>Music</option>
                    <option>Software</option>
                    <option>Education</option>
                    <option>Gaming</option>
                    <option>Content</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 h-32"
                    placeholder="Describe your intellectual property"
                  ></textarea>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Funding Goal ($)</label>
                    <input
                      type="number"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                      placeholder="50000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Total Shares</label>
                    <input
                      type="number"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                      placeholder="1000"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Revenue Sources</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Streaming/Downloads
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Licensing
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Subscriptions
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Merchandise
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">IP Documentation</label>
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                    <div className="text-gray-400 mb-2">📄</div>
                    <p className="text-gray-400">Upload your IP documentation, contracts, or proof of ownership</p>
                    <button type="button" className="mt-4 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm">
                      Choose Files
                    </button>
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 py-3 px-6 rounded-lg font-semibold transition-all"
                >
                  Create Campaign
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
