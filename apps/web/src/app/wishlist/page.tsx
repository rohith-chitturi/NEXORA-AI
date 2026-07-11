'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';

type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  rating: number;
  image: string;
};

export default function WishlistPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  const fetchWishlist = () => {
    setLoading(true);
    fetch('http://localhost:4000/api/wishlist')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch wishlist:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const removeFromWishlist = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await fetch(`http://localhost:4000/api/wishlist/${productId}`, { method: 'POST' });
      // Optimistically remove from state
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (err) {
      console.error("Failed to remove from wishlist", err);
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
    <main className="min-h-screen pt-32 pb-16 px-6 max-w-7xl mx-auto">
      <div className="mb-12 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center">
          <Heart className="w-6 h-6 text-pink-400 fill-pink-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Your Wishlist</h1>
          <p className="text-gray-400 text-lg">
            {products.length} {products.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product, idx) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group glass-panel rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] bg-black/40 flex flex-col relative"
            >
              <button 
                onClick={(e) => removeFromWishlist(e, product.id)}
                className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                title="Remove from wishlist"
              >
                <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
              </button>
              
              <Link href={`/product/${product.id}`} className="block relative h-48 overflow-hidden bg-white/5">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Quick Add Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addItem({ ...product, quantity: 1 });
                    }}
                    className="bg-white text-black px-6 py-2 rounded-full font-bold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all hover:bg-gray-200 hover:scale-105"
                  >
                    <ShoppingCart className="w-4 h-4" /> Quick Add
                  </button>
                </div>
              </Link>
              <div className="p-5 flex-1 flex flex-col justify-between relative z-10">
                <div>
                  <h3 className="text-white font-semibold line-clamp-1 mb-1 group-hover:text-purple-400 transition-colors">{product.name}</h3>
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs text-gray-400 font-medium">{product.rating}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                    ₹{product.price.toFixed(2)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/10 flex flex-col items-center">
          <Heart className="w-16 h-16 text-gray-600 mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2">Your wishlist is empty</h2>
          <p className="text-gray-400 max-w-md mx-auto mb-8">Save items you love and keep them all in one place. Just click the heart icon on any product.</p>
          <Link href="/" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-full transition-colors">
            Start Exploring
          </Link>
        </div>
      )}
    </main>
  );
}
