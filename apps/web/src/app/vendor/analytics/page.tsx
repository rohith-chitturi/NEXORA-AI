'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, ShoppingBag } from 'lucide-react';

const COLORS = ['#a855f7', '#ec4899', '#3b82f6', '#10b981'];

export default function VendorAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        const res = await fetch('http://localhost:4000/api/vendor/analytics', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [getToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500 border-r-2 border-r-transparent"></div>
      </div>
    );
  }

  if (!data) return <div className="text-gray-400">Failed to load analytics.</div>;

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Advanced Analytics</h1>
        <p className="text-gray-400">Deep dive into your store's performance metrics.</p>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm font-medium">30-Day Revenue</p>
              <h3 className="text-3xl font-bold text-white">₹{data.totalRevenue.toFixed(2)}</h3>
            </div>
          </div>
          <div className="absolute -right-6 -bottom-6 opacity-5">
            <TrendingUp className="w-32 h-32 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <ShoppingBag className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm font-medium">Conversion Rate</p>
              <h3 className="text-3xl font-bold text-white">4.8%</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center border border-pink-500/30">
              <Users className="w-6 h-6 text-pink-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm font-medium">Unique Customers</p>
              <h3 className="text-3xl font-bold text-white">1,204</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Timeseries */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-white mb-6">Revenue Velocity (30 Days)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#ffffff50" 
                  fontSize={12} 
                  tickFormatter={(val) => {
                    const d = new Date(val);
                    return `${d.getMonth()+1}/${d.getDate()}`;
                  }} 
                />
                <YAxis stroke="#ffffff50" fontSize={12} tickFormatter={(val) => `₹${val}`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#000000', borderColor: '#ffffff20', borderRadius: '8px' }}
                  itemStyle={{ color: '#a855f7' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Demographics */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Customer Demographics</h3>
          <div className="h-[300px] w-full flex flex-col items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.demographics}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.demographics.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#000000', borderColor: '#ffffff20', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute flex flex-col items-center justify-center pointer-events-none">
              <span className="text-sm text-gray-400">Top Age Group</span>
              <span className="text-2xl font-bold text-white">25-34</span>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {data.demographics.map((entry: any, idx: number) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-xs text-gray-400">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
