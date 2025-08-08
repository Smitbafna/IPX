'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navigation } from '../../components/ipx/Navigation';

interface UserProfile {
  address: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  isKYCVerified: boolean;
  kycLevel: 'none' | 'basic' | 'advanced';
  joinDate: string;
  totalTokensCreated: number;
  totalTokensOwned: number;
  totalEarnings: number;
  verificationScore: number;
}

interface KYCDocument {
  id: string;
  type: 'identity' | 'address' | 'income';
  name: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadDate: string;
  expiryDate?: string;
}

interface Notification {
  id: string;
  type: 'royalty' | 'license' | 'system' | 'kyc';
  title: string;
  message: string;
  date: string;
  read: boolean;
  actionUrl?: string;
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'kyc' | 'notifications' | 'settings'>('overview');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [kycDocuments, setKycDocuments] = useState<KYCDocument[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [editProfile, setEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    bio: ''
  });

  useEffect(() => {
    // Load user data from localStorage or API
    const savedUser = localStorage.getItem('ipx_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      
      const mockProfile: UserProfile = {
        address: userData.address,
        name: 'IP Creator',
        email: 'creator@example.com',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.address}`,
        bio: 'Passionate intellectual property creator specializing in digital art and music composition.',
        isKYCVerified: userData.isKYCVerified,
        kycLevel: userData.isKYCVerified ? 'advanced' : 'basic',
        joinDate: '2024-01-15',
        totalTokensCreated: Math.floor(Math.random() * 20) + 5,
        totalTokensOwned: Math.floor(Math.random() * 50) + 10,
        totalEarnings: Math.floor(Math.random() * 10000) + 1000,
        verificationScore: Math.floor(Math.random() * 40) + 60
      };

      setProfile(mockProfile);
      setProfileForm({
        name: mockProfile.name,
        email: mockProfile.email,
        bio: mockProfile.bio
      });
    }

    // Mock KYC documents
    const mockKycDocs: KYCDocument[] = [
      {
        id: 'kyc_1',
        type: 'identity',
        name: 'Government ID',
        status: 'approved',
        uploadDate: '2024-01-20',
        expiryDate: '2026-01-20'
      },
      {
        id: 'kyc_2',
        type: 'address',
        name: 'Proof of Address',
        status: 'approved',
        uploadDate: '2024-01-21'
      },
      {
        id: 'kyc_3',
        type: 'income',
        name: 'Income Verification',
        status: 'pending',
        uploadDate: '2024-08-05'
      }
    ];

    // Mock notifications
    const mockNotifications: Notification[] = [
      {
        id: 'notif_1',
        type: 'royalty',
        title: 'Royalty Payment Received',
        message: 'You received 150 HBAR from "Digital Art #5" royalties',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: false
      },
      {
        id: 'notif_2',
        type: 'license',
        title: 'New License Request',
        message: 'Someone requested a license for "Music Track #3"',
        date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        read: false,
        actionUrl: '/license'
      },
      {
        id: 'notif_3',
        type: 'system',
        title: 'Token Verification Complete',
        message: 'Your "Code Library #1" has been verified and is now live',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        read: true
      },
      {
        id: 'notif_4',
        type: 'kyc',
        title: 'KYC Document Approved',
        message: 'Your identity verification has been approved',
        date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        read: true
      }
    ];

    setKycDocuments(mockKycDocs);
    setNotifications(mockNotifications);
  }, []);

  const handleSaveProfile = () => {
    if (profile) {
      const updatedProfile = {
        ...profile,
        ...profileForm
      };
      setProfile(updatedProfile);
      setEditProfile(false);
      
      // Save to localStorage
      localStorage.setItem('ipx_profile', JSON.stringify(updatedProfile));
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === notificationId 
        ? { ...notif, read: true }
        : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const handleKycUpload = (type: KYCDocument['type']) => {
    // Mock document upload
    const newDoc: KYCDocument = {
      id: `kyc_${Date.now()}`,
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Document`,
      status: 'pending',
      uploadDate: new Date().toISOString().split('T')[0] || ''
    };
    
    setKycDocuments(prev => [...prev, newDoc]);
    alert(`${type} document uploaded successfully! Processing time: 24-48 hours.`);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'royalty': return '💰';
      case 'license': return '📄';
      case 'system': return '⚙️';
      case 'kyc': return '✅';
      default: return '📢';
    }
  };

  const getKycStatusColor = (status: KYCDocument['status']) => {
    switch (status) {
      case 'approved': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'rejected': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      <div className="pt-24 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 
              className="text-4xl md:text-6xl text-white font-bold mb-4"
              style={{ fontFamily: "Holtwood One SC, serif" }}
            >
              👤 Profile
            </h1>
            <p className="text-xl text-gray-400">
              Manage your account, verification, and preferences
            </p>
          </div>

          {/* Profile Header */}
          <div className="bg-gray-900 rounded-2xl p-8 mb-8 border border-gray-700">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <img
                src={profile.avatar}
                alt="Profile"
                className="w-24 h-24 rounded-full bg-gray-700"
              />
              
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl text-white font-bold mb-2">{profile.name}</h2>
                <p className="text-gray-400 mb-4">{profile.bio}</p>
                
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${profile.isKYCVerified ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    <span className="text-white text-sm">
                      {profile.isKYCVerified ? 'KYC Verified' : 'KYC Pending'}
                    </span>
                  </div>
                  <div className="text-gray-400 text-sm">
                    Member since {new Date(profile.joinDate).toLocaleDateString()}
                  </div>
                  <div className="text-purple-400 text-sm">
                    Verification Score: {profile.verificationScore}%
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">{profile.totalTokensCreated}</div>
                  <div className="text-gray-400 text-sm">Created</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400">{profile.totalTokensOwned}</div>
                  <div className="text-gray-400 text-sm">Owned</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">{profile.totalEarnings}</div>
                  <div className="text-gray-400 text-sm">HBAR Earned</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex justify-center gap-4 mb-8">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'kyc', label: 'KYC Verification', icon: '🔒' },
              { id: 'notifications', label: 'Notifications', icon: '🔔' },
              { id: 'settings', label: 'Settings', icon: '⚙️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-white text-black'
                    : 'border-2 border-white text-white hover:bg-white hover:text-black'
                }`}
                style={{ fontFamily: "Holtwood One SC, serif" }}
              >
                {tab.icon} {tab.label}
                {tab.id === 'notifications' && notifications.filter(n => !n.read).length > 0 && (
                  <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
                    <h3 className="text-xl text-white font-bold mb-6">Account Statistics</h3>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Account Status</span>
                        <span className={`px-3 py-1 rounded-full text-xs ${
                          profile.isKYCVerified 
                            ? 'bg-green-500 text-green-900' 
                            : 'bg-yellow-500 text-yellow-900'
                        }`}>
                          {profile.isKYCVerified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">Wallet Address</span>
                        <span className="text-white font-mono text-sm">{profile.address}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">KYC Level</span>
                        <span className="text-purple-400 capitalize">{profile.kycLevel}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Transactions</span>
                        <span className="text-white">{profile.totalTokensCreated + profile.totalTokensOwned}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">Member Since</span>
                        <span className="text-white">{new Date(profile.joinDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
                    <h3 className="text-xl text-white font-bold mb-6">Recent Activity</h3>
                    
                    <div className="space-y-4">
                      {notifications.slice(0, 4).map((notification) => (
                        <div key={notification.id} className="flex items-start gap-3 p-3 bg-gray-800 rounded-xl">
                          <div className="text-xl">{getNotificationIcon(notification.type)}</div>
                          <div className="flex-1">
                            <div className="text-white font-medium text-sm">{notification.title}</div>
                            <div className="text-gray-400 text-xs">
                              {new Date(notification.date).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <button
                        onClick={() => setActiveTab('notifications')}
                        className="w-full py-2 text-purple-400 hover:text-purple-300 text-sm transition-colors"
                      >
                        View all notifications →
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* KYC Tab */}
            {activeTab === 'kyc' && (
              <motion.div
                key="kyc"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="bg-gray-900 rounded-2xl p-8 border border-gray-700">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl text-white font-bold">KYC Verification</h3>
                    <div className={`px-4 py-2 rounded-full ${
                      profile.isKYCVerified 
                        ? 'bg-green-500 text-green-900' 
                        : 'bg-yellow-500 text-yellow-900'
                    }`}>
                      {profile.isKYCVerified ? '✅ Verified' : '⏳ Pending'}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-lg text-white font-semibold mb-4">Required Documents</h4>
                      
                      <div className="space-y-4">
                        {[
                          { type: 'identity' as const, label: 'Government ID', required: true },
                          { type: 'address' as const, label: 'Proof of Address', required: true },
                          { type: 'income' as const, label: 'Income Verification', required: false }
                        ].map((docType) => {
                          const existingDoc = kycDocuments.find(doc => doc.type === docType.type);
                          
                          return (
                            <div key={docType.type} className="flex items-center justify-between p-4 bg-gray-800 rounded-xl">
                              <div>
                                <div className="text-white font-medium">{docType.label}</div>
                                <div className="text-sm text-gray-400">
                                  {docType.required ? 'Required' : 'Optional'}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                {existingDoc ? (
                                  <div className={`px-3 py-1 rounded-full text-xs ${
                                    existingDoc.status === 'approved' ? 'bg-green-500 text-green-900' :
                                    existingDoc.status === 'pending' ? 'bg-yellow-500 text-yellow-900' :
                                    'bg-red-500 text-red-900'
                                  }`}>
                                    {existingDoc.status}
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleKycUpload(docType.type)}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
                                  >
                                    Upload
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg text-white font-semibold mb-4">Uploaded Documents</h4>
                      
                      <div className="space-y-4">
                        {kycDocuments.map((doc) => (
                          <div key={doc.id} className="p-4 bg-gray-800 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-white font-medium">{doc.name}</div>
                              <div className={`text-sm ${getKycStatusColor(doc.status)}`}>
                                {doc.status}
                              </div>
                            </div>
                            
                            <div className="text-sm text-gray-400">
                              Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
                              {doc.expiryDate && (
                                <span className="ml-2">
                                  • Expires: {new Date(doc.expiryDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {kycDocuments.length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                          No documents uploaded yet
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="bg-gray-900 rounded-2xl border border-gray-700 overflow-hidden">
                  <div className="p-6 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl text-white font-bold">Notifications</h3>
                      <button
                        onClick={markAllAsRead}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
                      >
                        Mark All Read
                      </button>
                    </div>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-800 hover:bg-gray-800/50 transition-colors cursor-pointer ${
                          !notification.read ? 'bg-blue-500/5 border-l-4 border-l-blue-500' : ''
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-4">
                          <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="text-white font-medium">{notification.title}</div>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              )}
                            </div>
                            <div className="text-gray-400 text-sm mb-2">{notification.message}</div>
                            <div className="text-gray-500 text-xs">
                              {new Date(notification.date).toLocaleString()}
                            </div>
                          </div>
                          {notification.actionUrl && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(notification.actionUrl, '_self');
                              }}
                              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs transition-colors"
                            >
                              View
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="bg-gray-900 rounded-2xl p-8 border border-gray-700">
                  <h3 className="text-2xl text-white font-bold mb-6">Account Settings</h3>
                  
                  {!editProfile ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-gray-400 text-sm mb-2">Name</label>
                          <div className="text-white">{profile.name}</div>
                        </div>
                        <div>
                          <label className="block text-gray-400 text-sm mb-2">Email</label>
                          <div className="text-white">{profile.email}</div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Bio</label>
                        <div className="text-white">{profile.bio}</div>
                      </div>
                      
                      <button
                        onClick={() => setEditProfile(true)}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors"
                      >
                        Edit Profile
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-white font-medium mb-2">Name</label>
                          <input
                            type="text"
                            value={profileForm.name}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-white font-medium mb-2">Email</label>
                          <input
                            type="email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-white font-medium mb-2">Bio</label>
                        <textarea
                          value={profileForm.bio}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                          rows={4}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:border-purple-500 focus:outline-none resize-none"
                        />
                      </div>
                      
                      <div className="flex gap-4">
                        <button
                          onClick={handleSaveProfile}
                          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={() => setEditProfile(false)}
                          className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-xl transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
