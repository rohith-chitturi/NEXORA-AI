'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';

export default function CheckoutSuccessPage() {
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    // Clear the cart on successful checkout
    clearCart();
  }, [clearCart]);

  return (
    <main className="min-h-screen pt-32 pb-16 px-6 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl text-center"
      >
        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-4">Payment Successful!</h1>
        <p className="text-gray-400 mb-8 leading-relaxed">
          Thank you for your purchase. Your order has been processed and will be shipped shortly. You will receive an email confirmation soon.
        </p>

        <div className="flex flex-col gap-4">
          <Link 
            href="/orders" 
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-5 h-5" /> View Your Orders
          </Link>
          <Link 
            href="/" 
            className="w-full bg-white/5 hover:bg-white/10 text-white font-semibold py-4 rounded-xl border border-white/10 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
