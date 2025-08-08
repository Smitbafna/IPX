'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { ConnectWallet } from './ConnectWallet';

interface User {
  address: string;
  isKYCVerified: boolean;
  notifications: number;
}

export const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const navItems = [
    { href: '/marketplace', label: 'Marketplace', icon: '🏪' },
    { href: '/create', label: 'Create IP Token', icon: '✨' },
    { href: '/portfolio', label: 'Portfolio', icon: '💼' },
    { href: '/license', label: 'Licenses', icon: '📄' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-gray-800">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="text-2xl">🔮</div>
            <h1 
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "Holtwood One SC, serif" }}
            >
              IPX
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-200"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            {user && (
              <Link href="/profile/notifications" className="relative">
                <div className="text-2xl text-gray-400 hover:text-white transition-colors">
                  🔔
                </div>
                {user.notifications > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                    {user.notifications}
                  </div>
                )}
              </Link>
            )}

            {/* KYC Status */}
            {user && (
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${user.isKYCVerified ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <span className="text-xs text-gray-400">
                  {user.isKYCVerified ? 'Verified' : 'Pending KYC'}
                </span>
              </div>
            )}

            {/* Wallet Connect */}
            <ConnectWallet onUserChange={setUser} />

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white text-2xl"
            >
              {isMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 pt-4 border-t border-gray-800"
            >
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 py-3 text-gray-300 hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};
