'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CheckoutSuccessPage() {
  const clearCart = useCartStore(state => state.clearCart);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Clear the cart when reaching the success page
    clearCart();
    setMounted(true);
  }, [clearCart]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen pt-32 pb-16 px-6 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-[80px] pointer-events-none" />
      
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="relative z-10 bg-white/5 border border-white/10 p-12 rounded-3xl backdrop-blur-xl text-center max-w-lg w-full shadow-2xl"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", bounce: 0.6 }}
          className="w-24 h-24 bg-gradient-to-tr from-green-500 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-500/30"
        >
          <CheckCircle className="w-12 h-12 text-white" />
        </motion.div>

        <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">Order Confirmed</h1>
        
        <p className="text-gray-400 mb-8 text-lg">
          Thank you for your purchase. We've received your order and will begin processing it shortly.
        </p>

        <div className="bg-black/40 rounded-2xl p-6 border border-white/5 mb-8 text-left">
          <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
            <span className="text-sm text-gray-500">Order Number</span>
            <span className="text-sm font-mono text-white">#NEX-{Math.floor(Math.random() * 1000000)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Estimated Delivery</span>
            <span className="text-sm text-white font-medium">In 2-3 business days</span>
          </div>
        </div>

        <Link href="/">
          <Button className="w-full rounded-full py-6 text-lg font-semibold bg-white text-black hover:bg-gray-200 flex items-center justify-center gap-2 transition-all hover:gap-4">
            <ShoppingBag className="w-5 h-5" /> Continue Shopping <ArrowRight className="w-5 h-5" />
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
