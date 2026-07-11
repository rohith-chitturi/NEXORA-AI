'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle2, ChevronRight, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

type Order = {
  id: string;
  createdAt: string;
  status: string;
  totalAmount: number;
  trackingNumber: string | null;
  items: {
    id: string;
    product: { name: string; image: string };
    quantity: number;
    unitPrice: number;
  }[];
};

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:4000/api/user/orders')
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch orders:", err);
        setLoading(false);
      });
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'DELIVERED': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'PROCESSING': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'SHIPPED': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'DELIVERED': return <CheckCircle2 className="w-4 h-4" />;
      case 'PROCESSING': return <Clock className="w-4 h-4" />;
      case 'SHIPPED': return <Package className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500 border-r-2 border-r-transparent"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-32 pb-16 px-6 max-w-5xl mx-auto">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-white mb-2">Order History</h1>
        <p className="text-gray-400">Track and manage your recent purchases.</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/10 flex flex-col items-center">
          <ShoppingBag className="w-16 h-16 text-gray-600 mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2">No orders yet</h2>
          <p className="text-gray-400 max-w-md mx-auto mb-8">When you buy something, your order will appear here.</p>
          <Link href="/" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-full transition-colors">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order, idx) => (
            <motion.div 
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden hover-glow"
            >
              {/* Order Header */}
              <div className="bg-white/5 p-6 border-b border-white/10 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-8">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Order Placed</p>
                    <p className="text-sm text-gray-200">{new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Total</p>
                    <p className="text-sm text-gray-200">${order.totalAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Order #</p>
                    <p className="text-sm text-gray-200">{order.id}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className={`px-3 py-1 rounded-full border flex items-center gap-2 text-xs font-bold tracking-wide uppercase ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)} {order.status}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6">
                <div className="space-y-6">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-start gap-6">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white/5 shrink-0 border border-white/5">
                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-1 hover:text-purple-400 transition-colors cursor-pointer">{item.product.name}</h3>
                          <p className="text-gray-400 text-sm mb-2">Qty: {item.quantity}</p>
                          <div className="text-purple-400 font-bold">${item.unitPrice.toFixed(2)}</div>
                        </div>
                        <div className="flex gap-3">
                          <button className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-white text-sm font-semibold hover:bg-white/10 transition-colors">
                            Buy it again
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {order.trackingNumber && (
                  <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                    <p className="text-sm text-gray-400">Tracking Number: <span className="text-white font-mono bg-white/5 px-2 py-1 rounded">{order.trackingNumber}</span></p>
                    <button className="text-sm text-purple-400 font-semibold hover:text-purple-300 flex items-center gap-1 transition-colors">
                      Track Package <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </main>
  );
}
