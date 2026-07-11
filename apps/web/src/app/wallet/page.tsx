'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Copy, CheckCircle2, ArrowRight, Share2, Users } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';

export default function WalletPage() {
  const [wallet, setWallet] = useState<{ walletBalance: number, referralCode: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    if (isSignedIn) {
      fetchWallet();
    }
  }, [isSignedIn]);

  const fetchWallet = async () => {
    try {
      const token = await getToken();
      const res = await fetch('http://localhost:4000/api/user/wallet', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setWallet(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (!wallet) return;
    navigator.clipboard.writeText(`http://localhost:3000/?ref=${wallet.referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-black pt-24 flex items-center justify-center">
        <div className="text-center p-8 bg-white/5 border border-white/10 rounded-3xl">
          <Wallet className="w-16 h-16 text-purple-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Sign in to view your Wallet</h2>
          <p className="text-gray-400">Earn NEXORA Cash by referring friends.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500 border-r-2 border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">NEXORA Wallet</h1>
          <p className="text-xl text-gray-400">Manage your earnings and invite friends.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Balance Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border border-purple-500/30 rounded-3xl p-8 relative overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.15)]"
          >
            <div className="absolute top-0 right-0 p-8 opacity-20">
              <Wallet className="w-32 h-32 text-purple-400" />
            </div>
            
            <p className="text-purple-300 font-semibold mb-2 uppercase tracking-wider text-sm">Available Balance</p>
            <h2 className="text-5xl font-black text-white mb-2 drop-shadow-lg">
              ₹{wallet?.walletBalance?.toFixed(2)}
            </h2>
            <p className="text-gray-400 text-sm mb-8">NEXORA Cash automatically applies at checkout.</p>
            
            <Link href="/" className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors">
              Start Shopping <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Referral Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8"
          >
            <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/30">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-2">Refer & Earn 5%</h3>
            <p className="text-gray-400 mb-6">
              Share your unique referral link. When friends buy through your link, you instantly get 5% of their order value added to your wallet!
            </p>
            
            <div className="bg-black/50 border border-white/10 rounded-xl p-2 flex items-center justify-between">
              <span className="font-mono text-purple-400 px-4 truncate">
                http://localhost:3000/?ref={wallet?.referralCode}
              </span>
              <button 
                onClick={copyLink}
                className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg transition-colors flex items-center gap-2"
              >
                {copied ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
