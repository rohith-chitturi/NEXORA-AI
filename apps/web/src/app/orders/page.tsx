import { Package, Truck, CheckCircle2, Clock, ChevronRight } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function CustomerOrdersPage() {
  const { userId, getToken } = await auth();
  
  if (!userId) {
    redirect("/");
  }

  let orders = [];

  try {
    const token = await getToken();
    const res = await fetch('http://localhost:4000/api/orders', { 
      cache: 'no-store',
      headers: { ...(token && { Authorization: `Bearer ${token}` }) }
    });
    if (res.ok) {
      orders = await res.json();
    }
  } catch (error) {
    console.error("Failed to fetch customer orders");
  }

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'PENDING': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'SHIPPED': return <Truck className="w-4 h-4 text-blue-400" />;
      case 'DELIVERED': return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      default: return <Package className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case 'PENDING': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'SHIPPED': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'DELIVERED': return 'bg-green-500/10 text-green-400 border-green-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 lg:py-24">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Your Orders</h1>
        <p className="text-gray-400">View and track your recent purchases.</p>
      </div>

      <div className="space-y-6">
        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl">
            <Package className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No orders yet</h3>
            <p className="text-gray-400 mb-6">Looks like you haven't made any purchases.</p>
            <Link href="/" className="inline-flex items-center justify-center h-10 px-6 rounded-full bg-white text-black font-medium hover:bg-gray-200 transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : (
          orders.map((order: any) => (
            <div key={order.id} className="bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl overflow-hidden hover-glow">
              <div className="px-6 py-4 bg-black/40 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm">
                  <div>
                    <span className="text-gray-500 block">Order Placed</span>
                    <span className="text-white font-medium">{new Date(order.date).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Total</span>
                    <span className="text-white font-medium">${order.totalAmount.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Order ID</span>
                    <span className="text-white font-medium font-mono text-xs">#ORD-{order.id.split('-')[0]}</span>
                  </div>
                </div>
                
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(order.status)}`}>
                  {getStatusIcon(order.status)}
                  {order.status}
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-6">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-20 h-20 rounded-xl bg-white/5 border border-white/10 overflow-hidden shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium line-clamp-1">{item.name}</h4>
                        <div className="mt-1 flex items-center gap-2 text-sm">
                          <span className="text-gray-400">Qty: {item.quantity}</span>
                          <span className="text-gray-600">•</span>
                          <span className="text-white font-medium">${item.price.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="hidden sm:block">
                        <Link href={`/product/${item.id}`} className="text-sm text-purple-400 hover:text-purple-300 font-medium inline-flex items-center gap-1">
                          View Item <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
