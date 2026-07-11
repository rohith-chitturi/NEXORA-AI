'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Store, Star, ShoppingCart } from 'lucide-react';
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

type StoreData = {
  storeName: string;
  description: string;
  logoUrl: string | null;
  products: Product[];
};

export default function PublicStorePage() {
  const params = useParams();
  const storeId = params.id as string;
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:4000/api/vendor/store/${storeId}`)
      .then(res => {
        if (!res.ok) throw new Error("Store not found or inactive.");
        return res.json();
      })
      .then(data => {
        setStoreData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch store:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [storeId]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500 border-r-2 border-r-transparent"></div>
      </div>
    );
  }

  if (error || !storeData) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-8 rounded-2xl flex flex-col items-center">
          <Store className="w-12 h-12 mb-4" />
          <h2 className="text-xl font-bold mb-2">Store Not Found</h2>
          <p>{error || "This store doesn't exist or is currently inactive."}</p>
          <Link href="/" className="mt-6 text-white bg-red-500/20 px-6 py-2 rounded-full hover:bg-red-500/30 transition-colors">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="relative pt-24 pb-16 px-6 max-w-7xl mx-auto min-h-screen">
      {/* Store Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full relative overflow-hidden rounded-3xl bg-black/40 border border-white/10 mb-12 shadow-2xl backdrop-blur-md p-8 md:p-12 flex flex-col md:flex-row items-center gap-8"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="shrink-0 relative z-10">
          {storeData.logoUrl ? (
            <img src={storeData.logoUrl} alt={storeData.storeName} className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-2xl border-2 border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.2)]" />
          ) : (
            <div className="w-32 h-32 md:w-40 md:h-40 bg-purple-500/10 rounded-2xl border-2 border-purple-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.2)]">
              <Store className="w-12 h-12 text-purple-400" />
            </div>
          )}
        </div>
        
        <div className="flex-1 text-center md:text-left relative z-10">
          <span className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-purple-300 uppercase tracking-widest mb-3">
            Official Partner Store
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            {storeData.storeName}
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto md:mx-0">
            {storeData.description || "Welcome to our store! We provide premium quality products hand-selected for Nexora AI customers."}
          </p>
        </div>
      </motion.div>

      {/* Products Section Title */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Store Products</h2>
          <p className="text-gray-400 text-sm">Showing all {storeData.products.length} items from {storeData.storeName}</p>
        </div>
      </div>

      {/* Product Grid */}
      {storeData.products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {storeData.products.map((product, idx) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group glass-panel rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] bg-black/40 flex flex-col"
            >
              <Link href={`/product/${product.id}`} className="block relative h-48 overflow-hidden bg-white/5">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white border border-white/10 uppercase tracking-wider">
                  {product.category}
                </div>
                
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
                    ${product.price.toFixed(2)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white/5 rounded-2xl border border-white/10">
          <Store className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No Products Yet</h3>
          <p className="text-gray-400">This vendor hasn't published any active products yet.</p>
        </div>
      )}
    </main>
  );
}
