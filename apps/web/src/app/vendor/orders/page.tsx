'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Search, Filter, ChevronDown, CheckCircle2, Clock, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';

type VendorOrder = {
  id: string;
  date: string;
  customerName: string;
  product: string;
  image: string;
  quantity: number;
  total: number;
  status: string;
};

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:4000/api/vendor/orders')
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch vendor orders:", err);
        setLoading(false);
      });
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SHIPPED': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'PROCESSING': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'DELIVERED': return 'text-green-400 bg-green-400/10 border-green-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SHIPPED': return <Truck className="w-4 h-4" />;
      case 'PROCESSING': return <Clock className="w-4 h-4" />;
      case 'DELIVERED': return <CheckCircle2 className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const markAsShipped = (orderId: string) => {
    // Optimistic UI update for the demo
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: 'SHIPPED' } : order
    ));
  };

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Order Management</h1>
          <p className="text-gray-400">View and fulfill orders for your products.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search orders..." 
              className="pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-white focus:border-purple-500 focus:outline-none w-64"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-black/40 border border-white/10 rounded-xl text-white hover:bg-white/5 transition-colors">
            <Filter className="w-4 h-4" /> Filter <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500 border-r-2 border-r-transparent"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-24 flex flex-col items-center">
            <Package className="w-16 h-16 text-gray-600 mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">No orders yet</h2>
            <p className="text-gray-400 max-w-md mx-auto mb-8">When customers purchase your products, the orders will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Order Details</th>
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Product</th>
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((order, idx) => (
                  <motion.tr 
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="p-4">
                      <div className="font-medium text-white mb-1">{order.id}</div>
                      <div className="text-xs text-gray-500">{new Date(order.date).toLocaleDateString()}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center font-bold text-white text-xs">
                          {order.customerName[0]}
                        </div>
                        <span className="text-gray-300">{order.customerName}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3 max-w-[200px]">
                        <img src={order.image} alt={order.product} className="w-10 h-10 rounded-lg object-cover bg-white/5" />
                        <div className="truncate">
                          <span className="text-white text-sm block truncate">{order.product}</span>
                          <span className="text-xs text-gray-500">Qty: {order.quantity}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-white font-medium">₹{order.total.toFixed(2)}</span>
                    </td>
                    <td className="p-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)} {order.status}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      {order.status === 'PENDING' || order.status === 'PROCESSING' ? (
                        <Button 
                          size="sm" 
                          onClick={() => markAsShipped(order.id)}
                          className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all hover:scale-105"
                        >
                          Mark Shipped
                        </Button>
                      ) : (
                        <span className="text-gray-500 text-sm font-medium">Fulfilled</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
