'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Star, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CATEGORIES = ["All", "Electronics", "Furniture", "Clothing", "Fitness", "Home"];

const DUMMY_PRODUCTS = [
  { id: 1, name: "Ergonomic Office Chair X1", price: 299.99, category: "Furniture", rating: 4.8, image: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&w=800&q=80" },
  { id: 2, name: "Noise Cancelling Headphones", price: 349.00, category: "Electronics", rating: 4.9, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80" },
  { id: 3, name: "Minimalist Mechanical Keyboard", price: 129.50, category: "Electronics", rating: 4.7, image: "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80" },
  { id: 4, name: "Adjustable Standing Desk", price: 499.00, category: "Furniture", rating: 4.6, image: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=800&q=80" },
  { id: 5, name: "Smart Fitness Watch", price: 199.99, category: "Fitness", rating: 4.5, image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80" },
  { id: 6, name: "Premium Cotton T-Shirt", price: 29.00, category: "Clothing", rating: 4.4, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80" },
  { id: 7, name: "Ultra-Wide Monitor 34\"", price: 799.00, category: "Electronics", rating: 4.9, image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80" },
  { id: 8, name: "Aromatherapy Diffuser", price: 45.00, category: "Home", rating: 4.2, image: "https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&w=800&q=80" },
];

export default function Home() {
  return (
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {DUMMY_PRODUCTS.map((product, i) => (
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
                <Button className="rounded-full bg-white text-black hover:bg-gray-200">
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
    </main>
  );
}
