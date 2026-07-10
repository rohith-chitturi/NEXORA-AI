import { DollarSign, Package, ShoppingCart, Star } from "lucide-react";
import { auth } from "@clerk/nextjs/server";

export default async function VendorDashboard() {
  let stats = {
    totalRevenue: 0,
    activeProducts: 0,
    pendingOrders: 0,
    storeRating: 0
  };

  try {
    const { getToken } = await auth();
    const token = await getToken();
    const res = await fetch('http://localhost:4000/api/vendor/stats', { 
      cache: 'no-store',
      headers: { ...(token && { Authorization: `Bearer ${token}` }) }
    });
    if (res.ok) {
      stats = await res.json();
    }
  } catch (error) {
    console.error("Failed to fetch vendor stats");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Dashboard</h1>
        <p className="text-gray-400">Welcome back to NEXORA Vendor Portal.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric Cards */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover-glow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 text-sm font-medium">Total Revenue</span>
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">${stats.totalRevenue.toLocaleString()}</div>
          <div className="text-sm text-green-400 mt-2 flex items-center">
            <span>+20.1% from last month</span>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover-glow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 text-sm font-medium">Active Products</span>
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{stats.activeProducts}</div>
          <div className="text-sm text-gray-400 mt-2 flex items-center">
            <span>+3 new this week</span>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover-glow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 text-sm font-medium">Pending Orders</span>
            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-orange-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{stats.pendingOrders}</div>
          <div className="text-sm text-red-400 mt-2 flex items-center">
            <span>Requires action</span>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover-glow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 text-sm font-medium">Store Rating</span>
            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{stats.storeRating.toFixed(1)}</div>
          <div className="text-sm text-gray-400 mt-2 flex items-center">
            <span>Based on 1,024 reviews</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl hover-glow">
          <h2 className="text-xl font-bold text-white mb-6">Recent Orders</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-lg shrink-0"></div>
                  <div>
                    <h4 className="text-white font-medium text-sm">Order #ORD-{Math.floor(Math.random() * 10000)}</h4>
                    <p className="text-xs text-gray-400">2 items • John Doe</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">${(Math.random() * 500).toFixed(2)}</div>
                  <div className="text-xs text-purple-400 mt-1">Processing</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl hover-glow">
          <h2 className="text-xl font-bold text-white mb-6">Top Products</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="w-12 h-12 bg-white/10 rounded-lg shrink-0"></div>
                <div className="flex-1">
                  <h4 className="text-white font-medium text-sm line-clamp-1">Premium Product {i}</h4>
                  <p className="text-xs text-gray-400 mt-1">{Math.floor(Math.random() * 100)} sales</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
