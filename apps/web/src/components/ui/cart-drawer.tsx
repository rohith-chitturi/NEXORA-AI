'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Plus, Minus, ArrowRight, Trash2 } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { Button } from './button';
import { useRouter } from 'next/navigation';

export function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, updateQuantity, removeItem, getTotalPrice, getTotalItems } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0); // e.g. 0.20 for 20%
  const [promoMsg, setPromoMsg] = useState({ text: '', isError: false });
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const applyPromo = () => {
    if (promoCode.toUpperCase() === 'NEXORA20') {
      setDiscount(0.20);
      setPromoMsg({ text: '20% discount applied!', isError: false });
    } else if (promoCode.trim() !== '') {
      setDiscount(0);
      setPromoMsg({ text: 'Invalid promo code', isError: true });
    }
  };

  const finalTotal = getTotalPrice() * (1 - discount);

  const handleCheckout = async () => {
    try {
      const payload: any = { items };
      if (discount > 0) payload.discountCode = promoCode.toUpperCase();
      
      const res = await fetch('http://localhost:4000/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No checkout URL returned");
        alert("Checkout failed. Please try again.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Checkout failed. Please try again.");
    }
  };

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-zinc-950 border-l border-white/10 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-semibold text-white">Your Cart</h2>
                <span className="bg-white/10 text-xs text-white px-2 py-0.5 rounded-full ml-2">
                  {getTotalItems()}
                </span>
              </div>
              <button 
                onClick={closeDrawer}
                className="text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar flex flex-col gap-4">
              <AnimatePresence initial={false}>
              {items.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full text-gray-400"
                >
                  <ShoppingBag className="w-12 h-12 mb-4 opacity-20" />
                  <p>Your cart is empty.</p>
                  <Button 
                    variant="outline" 
                    className="mt-6 border-white/10 text-white"
                    onClick={closeDrawer}
                  >
                    Continue Shopping
                  </Button>
                </motion.div>
              ) : (
                items.map((item) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    key={item.id} 
                    className="flex gap-4 bg-white/5 border border-white/5 rounded-2xl p-3 hover-glow"
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-white/10">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover bg-white" />
                    </div>
                    <div className="flex flex-col justify-between flex-1">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="text-sm font-medium text-white line-clamp-2">{item.name}</h3>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-gray-500 hover:text-red-400 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-purple-400 font-semibold">₹{item.price.toFixed(2)}</span>
                        
                        <div className="flex items-center gap-3 bg-black/40 rounded-full px-2 py-1 border border-white/10">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="text-gray-400 hover:text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs text-white font-medium w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="text-gray-400 hover:text-white"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-white/10 bg-black/20 backdrop-blur-lg">
                <div className="mb-6">
                  <div className="flex gap-2 mb-2">
                    <input 
                      type="text" 
                      placeholder="Promo Code (Try NEXORA20)" 
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-purple-500 focus:outline-none uppercase"
                    />
                    <Button onClick={applyPromo} variant="outline" className="border-white/10 text-white rounded-xl">Apply</Button>
                  </div>
                  {promoMsg.text && (
                    <p className={`text-xs font-medium ${promoMsg.isError ? 'text-red-400' : 'text-green-400'}`}>
                      {promoMsg.text}
                    </p>
                  )}
                </div>
                
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Subtotal</span>
                  <span className={`text-xl font-bold ${discount > 0 ? 'text-gray-500 line-through' : 'text-white'}`}>
                    ₹{getTotalPrice().toFixed(2)}
                  </span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between items-center mb-2 text-green-400">
                    <span>Discount (20%)</span>
                    <span>-₹{(getTotalPrice() * discount).toFixed(2)}</span>
                  </div>
                )}
                
                {discount > 0 && (
                  <div className="flex justify-between items-center mb-4 border-t border-white/10 pt-2">
                    <span className="text-gray-300 font-bold">Total</span>
                    <span className="text-2xl font-bold text-white">₹{finalTotal.toFixed(2)}</span>
                  </div>
                )}
                
                <p className="text-xs text-gray-500 mb-6 mt-2">Shipping and taxes calculated at checkout.</p>
                
                <Button 
                  onClick={handleCheckout}
                  className="w-full rounded-full bg-white text-black hover:bg-gray-200 py-6 text-lg font-semibold flex items-center justify-center gap-2"
                >
                  Proceed to Checkout <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
