'use client';

import { motion } from 'framer-motion';
import { XCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutCancelPage() {
  return (
    <main className="min-h-screen pt-32 pb-16 px-6 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl text-center"
      >
        <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-red-400" />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-4">Checkout Cancelled</h1>
        <p className="text-gray-400 mb-8 leading-relaxed">
          Your payment process was cancelled and you haven't been charged. Your items are still saved in your cart.
        </p>

        <Link 
          href="/" 
          className="w-full bg-white/5 hover:bg-white/10 text-white font-semibold py-4 rounded-xl border border-white/10 transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" /> Return to Store
        </Link>
      </motion.div>
    </main>
  );
}
