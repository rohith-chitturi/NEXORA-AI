'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Star, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/useCartStore';

const CATEGORIES = ["All", "Electronics", "Furniture", "Clothing", "Fitness", "Home"];

import { useEffect, useState } from 'react';

type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  rating: number;
  image: string;
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    fetch('http://localhost:4000/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch products", err);
        setLoading(false);
      });
  }, []);
    <main className="relative pt-24 pb-16 px-6 max-w-7xl mx-auto min-h-screen">
      {/* Featured Hero Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full h-[400px] rounded-3xl bg-gradient-to-tr from-purple-900/40 via-black to-blue-900/40 border border-white/10 overflow-hidden relative flex items-center px-12 mb-12"
      >
        <div className="max-w-xl z-10">
          <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-xs font-medium text-purple-300 mb-4 border border-purple-500/30">New Arrival</span>
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">The Future of Productivity.</h1>
          <p className="text-gray-400 text-lg mb-8">Experience the next generation of ergonomic workspaces, engineered perfectly for your comfort.</p>
          <Button size="lg" className="rounded-full bg-white text-black hover:bg-gray-200">
            Shop Collection <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
        
        {/* Abstract shapes for visual interest */}
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-black/20 to-transparent" />
        <div className="absolute right-12 top-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-purple-500/20 blur-[80px]" />
      </motion.div>

      {/* Categories Bar */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-8 custom-scrollbar">
        {CATEGORIES.map((cat, i) => (
          <button 
            key={cat}
            className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
              i === 0 
                ? 'bg-white text-black' 
                : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass-panel rounded-2xl h-72 animate-pulse bg-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={product.id}
            className="group glass-panel rounded-2xl overflow-hidden flex flex-col hover:border-purple-500/50 transition-all hover:shadow-2xl hover:shadow-purple-500/10 cursor-pointer"
          >
            <div className={`w-full h-48 relative flex items-center justify-center overflow-hidden`}>
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              />
              
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                <Button 
                  className="rounded-full bg-white text-black hover:bg-gray-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    addItem({ id: product.id, name: product.name, price: product.price, image: product.image, quantity: 1 });
                  }}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
                </Button>
              </div>
            </div>
            
            <div className="p-5 flex flex-col gap-2">
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-semibold text-sm text-gray-200 line-clamp-2">{product.name}</h3>
                <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md shrink-0">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  <span className="text-xs font-medium">{product.rating}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500">{product.category}</p>
              <div className="mt-2 text-lg font-bold text-white">
                ${product.price.toFixed(2)}
              </div>
            </div>
          </motion.div>
          ))}
        </div>
      )}
    </main>
  );
}
