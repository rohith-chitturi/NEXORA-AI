'use client';

import { useState } from 'react';
import { Package, Truck, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useAuth } from "@clerk/nextjs";

export function OrderStatusSelector({ orderId, initialStatus }: { orderId: string, initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { getToken } = useAuth();

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

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setIsLoading(true);

    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:4000/api/vendor/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        router.refresh();
      } else {
        console.error("Failed to update order status");
        setStatus(initialStatus); // revert on error
      }
    } catch (error) {
      console.error("Error updating order status", error);
      setStatus(initialStatus);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`relative inline-flex items-center gap-1.5 pl-2.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(status)}`}>
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : getStatusIcon(status)}
      <select 
        value={status} 
        onChange={handleChange}
        disabled={isLoading}
        className="bg-transparent border-none outline-none text-inherit font-medium cursor-pointer appearance-none py-1 pr-6 pl-1 z-10"
      >
        <option value="PENDING" className="bg-black text-white">PENDING</option>
        <option value="CONFIRMED" className="bg-black text-white">CONFIRMED</option>
        <option value="PROCESSING" className="bg-black text-white">PROCESSING</option>
        <option value="SHIPPED" className="bg-black text-white">SHIPPED</option>
        <option value="OUT_FOR_DELIVERY" className="bg-black text-white">OUT_FOR_DELIVERY</option>
        <option value="DELIVERED" className="bg-black text-white">DELIVERED</option>
        <option value="CANCELLED" className="bg-black text-white">CANCELLED</option>
        <option value="REFUNDED" className="bg-black text-white">REFUNDED</option>
      </select>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}
