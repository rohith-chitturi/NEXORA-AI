'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, ShoppingCart, Info } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import Link from 'next/link';

export default function DiscoverFeedPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore(state => state.addItem);
  const openDrawer = useCartStore(state => state.openDrawer);

  useEffect(() => {
    fetch('http://localhost:4000/api/products')
      .then(res => res.json())
      .then(data => {
        // Randomize products for the feed
        const shuffled = data.sort(() => 0.5 - Math.random());
        setProducts(shuffled);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500 border-r-2 border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="bg-black h-screen w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth pb-16">
      {products.map((product, idx) => (
        <div key={product.id} className="h-screen w-full snap-start relative flex justify-center items-center bg-black">
          {/* Background blurred image */}
          <div 
            className="absolute inset-0 opacity-20 blur-3xl scale-110" 
            style={{ backgroundImage: `url(${product.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          />

          <div className="relative w-full max-w-md h-[90vh] md:h-[80vh] md:rounded-3xl overflow-hidden shadow-2xl flex flex-col bg-[#0a0a0a] border border-white/10 mx-auto">
            
            {/* Main Product Display */}
            <div className="flex-1 relative flex items-center justify-center p-8">
              <motion.img 
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-contain filter drop-shadow-2xl" 
              />
              
              {/* Floating Interactions Bar (Right side) */}
              <div className="absolute right-4 bottom-32 flex flex-col items-center gap-6 z-20">
                <button className="flex flex-col items-center gap-1 group">
                  <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white group-hover:text-pink-500 transition-colors">
                    <Heart className="w-6 h-6" />
                  </div>
                  <span className="text-white text-xs font-bold drop-shadow-md">{Math.floor(Math.random() * 5000) + 100}</span>
                </button>

                <Link href={`/product/${product.id}`} className="flex flex-col items-center gap-1 group">
                  <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white group-hover:text-blue-400 transition-colors">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <span className="text-white text-xs font-bold drop-shadow-md">Review</span>
                </Link>

                <button className="flex flex-col items-center gap-1 group">
                  <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white group-hover:text-green-400 transition-colors">
                    <Share2 className="w-6 h-6" />
                  </div>
                  <span className="text-white text-xs font-bold drop-shadow-md">Share</span>
                </button>
              </div>
            </div>

            {/* Bottom Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent z-10 pt-20">
              <div className="flex items-end justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 rounded bg-white/20 backdrop-blur-md text-xs font-bold text-white uppercase tracking-wider">
                      {product.category}
                    </span>
                    <span className="text-yellow-400 text-sm font-bold flex items-center gap-1 drop-shadow-md">
                      ★ {product.rating}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-white leading-tight drop-shadow-lg line-clamp-2 mb-1">{product.name}</h2>
                  <p className="text-gray-300 text-sm line-clamp-2 drop-shadow-md mb-2">{product.description}</p>
                  
                  {/* Price and Action */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-3xl font-black text-white drop-shadow-[0_2px_10px_rgba(168,85,247,0.5)]">
                      ₹{product.price.toFixed(2)}
                    </div>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        addItem({ 
                          id: product.id, 
                          name: product.name, 
                          price: product.price, 
                          image: product.image, 
                          quantity: 1 
                        });
                        openDrawer();
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center gap-2 hover:scale-105 transition-all"
                    >
                      <ShoppingCart className="w-5 h-5" /> Buy Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
