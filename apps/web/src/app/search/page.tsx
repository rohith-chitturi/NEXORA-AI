'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, ShoppingCart, Star } from 'lucide-react';
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

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:4000/api/products?q=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch search results:", err);
        setLoading(false);
      });
  }, [query]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-16 px-6 max-w-7xl mx-auto flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500 border-r-2 border-r-transparent"></div>
      </div>
    );
  }

  return (
    <main className="pt-32 pb-16 px-6 max-w-7xl mx-auto min-h-screen">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-white mb-2">Search Results</h1>
        <p className="text-gray-400 text-lg">
          {products.length} {products.length === 1 ? 'result' : 'results'} found for <span className="text-purple-400 font-semibold">"{query}"</span>
        </p>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product, idx) => (
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
                    ₹{product.price.toFixed(2)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/10 flex flex-col items-center">
          <Search className="w-16 h-16 text-gray-600 mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2">No products found</h2>
          <p className="text-gray-400 max-w-md mx-auto">We couldn't find any products matching your search query. Try checking your spelling or using more general terms.</p>
        </div>
      )}
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-32 pb-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500 border-r-2 border-r-transparent"></div>
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}
