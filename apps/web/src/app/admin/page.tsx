'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Store, PackageSearch, TrendingUp, ShieldAlert, ArrowRight } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { getToken } = useAuth();

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = await getToken();
        const res = await fetch('http://localhost:4000/api/admin/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!res.ok) {
          throw new Error('Unauthorized Access. You must be an Admin.');
        }
        
        const data = await res.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchStats();
  }, [getToken]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500 border-r-2 border-r-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-8 text-center flex flex-col items-center justify-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-gray-400 max-w-md">{error}</p>
        
        <button 
          onClick={async () => {
            // Secret button to elevate user to ADMIN
            try {
              const token = await getToken();
              const res = await fetch('http://localhost:4000/api/user/elevate', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (res.ok) {
                window.location.reload();
              }
            } catch (e) {
              console.error(e);
            }
          }}
          className="mt-8 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all flex items-center gap-2"
        >
          Elevate to Admin Mode <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  const cards = [
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/20' },
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    { label: 'Active Vendors', value: stats.totalVendors, icon: Store, color: 'text-purple-400', bg: 'bg-purple-500/20' },
    { label: 'Total Orders', value: stats.totalOrders, icon: PackageSearch, color: 'text-orange-400', bg: 'bg-orange-500/20' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Platform Overview</h1>
        <p className="text-gray-400">Master statistics across the entire NEXORA ecosystem.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-12">
        {cards.map((card, idx) => (
          <motion.div 
            key={card.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex items-center gap-6 shadow-2xl"
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${card.bg}`}>
              <card.icon className={`w-8 h-8 ${card.color}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">{card.label}</p>
              <h3 className="text-3xl font-bold text-white tracking-tight">{card.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-3xl p-8 flex items-start gap-4">
        <ShieldCheck className="w-8 h-8 text-blue-400 shrink-0 mt-1" />
        <div>
          <h3 className="text-xl font-bold text-white mb-2">God Mode Active</h3>
          <p className="text-gray-400">You are viewing real-time platform metrics. In a production environment, this dashboard allows you to ban abusive vendors, refund customer orders directly, and modify global platform configuration.</p>
        </div>
      </div>
    </div>
  );
}
