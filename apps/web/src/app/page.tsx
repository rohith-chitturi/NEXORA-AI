'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ShoppingCart, Zap, ShieldCheck, Gem, Tv, Sofa, Shirt, Dumbbell, Home as HomeIcon, LayoutGrid, Star, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/useCartStore';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { FlashSaleTimer } from '@/components/ui/flash-sale-timer';

const CATEGORIES = [
  { name: "All", icon: LayoutGrid },
  { name: "Electronics", icon: Tv },
  { name: "Furniture", icon: Sofa },
  { name: "Clothing", icon: Shirt },
  { name: "Fitness", icon: Dumbbell },
  { name: "Home", icon: HomeIcon }
];

const HERO_SLIDES = [
  {
    title: "The Future of Productivity.",
    subtitle: "Experience the next generation of ergonomic workspaces, engineered perfectly for your comfort.",
    image: "https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=1600&q=80",
    tag: "New Arrival",
    color: "from-purple-900/80 to-black"
  },
  {
    title: "Minimalist Living.",
    subtitle: "Curated premium furniture that brings peace and elegance to your modern home.",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1600&q=80",
    tag: "Trending",
    color: "from-blue-900/80 to-black"
  },
  {
    title: "Uncompromising Audio.",
    subtitle: "Immersive soundscapes with industry-leading active noise cancellation.",
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=1600&q=80",
    tag: "Premium",
    color: "from-emerald-900/80 to-black"
  }
];

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
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState("default");
  const [flashSales, setFlashSales] = useState<any[]>([]);
  const { isSignedIn } = useAuth();
  const addItem = useCartStore((state) => state.addItem);

  // Auto-advance hero carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (currentPage === 1) setLoading(true);
    let url = `http://localhost:4000/api/products?category=${selectedCategory}&page=${currentPage}&limit=8`;
    if (sortBy !== 'default') {
      url += `&sortBy=${sortBy}`;
    }
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (currentPage === 1) {
          setProducts(data.products || []);
        } else {
          setProducts(prev => {
            // Filter out duplicates just in case
            const existingIds = new Set(prev.map(p => p.id));
            const newProducts = (data.products || []).filter((p: any) => !existingIds.has(p.id));
            return [...prev, ...newProducts];
          });
        }
        setTotalPages(data.totalPages || 1);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch products", err);
        setLoading(false);
      });
  }, [selectedCategory, currentPage, sortBy]);

  useEffect(() => {
    // Fetch wishlist IDs to light up the hearts
    fetch('http://localhost:4000/api/wishlist')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setWishlistIds(new Set(data.map(item => item.id)));
        }
      })
      .catch(console.error);

    // Fetch Flash Sales
    fetch('http://localhost:4000/api/products?isFlashSale=true')
      .then(res => res.json())
      .then(data => {
        if (data && data.products) setFlashSales(data.products);
      })
      .catch(console.error);
  }, []);

  const toggleWishlist = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch(`http://localhost:4000/api/wishlist/${productId}`, { method: 'POST' });
      if (res.ok) {
        setWishlistIds(prev => {
          const next = new Set(prev);
          if (next.has(productId)) next.delete(productId);
          else next.add(productId);
          return next;
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };
  
  return (
    <main className="relative pt-24 pb-16 px-6 max-w-7xl mx-auto min-h-screen">
      
      {/* Dynamic Hero Carousel */}
      <div className="w-full h-[500px] rounded-[2rem] overflow-hidden relative mb-16 shadow-2xl shadow-purple-500/10 border border-white/10 group">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${HERO_SLIDES[currentSlide].image})` }}
            />
            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${HERO_SLIDES[currentSlide].color} opacity-90`} />
            
            {/* Content */}
            <div className="relative h-full flex flex-col justify-center px-12 z-10 max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <span className="inline-block py-1.5 px-4 rounded-full bg-white/10 text-xs font-bold text-white mb-6 border border-white/20 backdrop-blur-md uppercase tracking-wider">
                  {HERO_SLIDES[currentSlide].tag}
                </span>
                <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight">
                  {HERO_SLIDES[currentSlide].title}
                </h1>
                <p className="text-gray-300 text-lg md:text-xl mb-10 leading-relaxed font-light">
                  {HERO_SLIDES[currentSlide].subtitle}
                </p>
                <Button size="lg" className="rounded-full bg-white text-black hover:bg-gray-200 hover:scale-105 transition-transform px-8 h-14 text-lg">
                  Shop Collection <ArrowRight className="ml-3 w-5 h-5" />
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentSlide === idx ? 'w-8 bg-white' : 'w-2 bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold mb-1">Autonomous AI Shopping</h3>
            <p className="text-sm text-gray-400">Let our advanced AI assistant find and purchase the perfect items for you.</p>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
            <Gem className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold mb-1">Premium Vendors Only</h3>
            <p className="text-sm text-gray-400">Shop from hand-curated stores guaranteeing top-tier quality and authenticity.</p>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold mb-1">Secure & Fast Delivery</h3>
            <p className="text-sm text-gray-400">Encrypted payments and guaranteed next-day delivery on all premium items.</p>
          </div>
        </div>
      </div>

      {/* Flash Sales Section */}
      {flashSales.length > 0 && (
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              ⚡ Flash Sales
            </h2>
            <FlashSaleTimer endTime={flashSales[0].flashSaleEndTime} />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {flashSales.map((product, idx) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group glass-panel rounded-2xl overflow-hidden hover:border-red-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(239,68,68,0.15)] bg-black/40 flex flex-col relative"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500 z-30" />
                <Link href={`/product/${product.id}`} className="block relative h-48 overflow-hidden bg-white/5">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-3 left-3 bg-red-600 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
                    HOT SALE
                  </div>
                  
                  <button 
                    onClick={(e) => toggleWishlist(e, product.id)}
                    className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                  >
                    <Heart className={`w-4 h-4 transition-colors ${wishlistIds.has(product.id) ? 'text-pink-500 fill-pink-500' : 'text-gray-300'}`} />
                  </button>

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
                    <h3 className="text-white font-semibold line-clamp-1 mb-1 group-hover:text-red-400 transition-colors">{product.name}</h3>
                    <div className="flex items-center gap-1 mb-3">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs text-gray-400 font-medium">{product.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
                    <div>
                      <span className="text-xl font-bold text-white drop-shadow-[0_2px_10px_rgba(239,68,68,0.5)]">₹{product.basePrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Trending Products</h2>
          <p className="text-gray-400">Discover our most popular premium items.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Sort by:</span>
          <select 
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50 appearance-none min-w-[140px] cursor-pointer"
          >
            <option value="default">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating_desc">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Enhanced Categories Bar */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-8 custom-scrollbar">
        {CATEGORIES.map((cat) => (
          <button 
            key={cat.name}
            onClick={() => handleCategoryClick(cat.name)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-medium transition-all duration-300 ${
              selectedCategory === cat.name
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25 border border-transparent' 
                : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10 hover:border-white/20'
            }`}
          >
            <cat.icon className="w-4 h-4" />
            {cat.name}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {loading && currentPage === 1 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="rounded-2xl h-80 animate-pulse bg-white/5 border border-white/5" />
          ))}
        </div>
      ) : products.length > 0 ? (
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
                
                <button 
                  onClick={(e) => toggleWishlist(e, product.id)}
                  className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                  title="Toggle Wishlist"
                >
                  <Heart className={`w-4 h-4 transition-colors ${wishlistIds.has(product.id) ? 'text-pink-500 fill-pink-500' : 'text-gray-300'}`} />
                </button>

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
        <div className="text-center py-24 bg-white/5 rounded-2xl border border-white/10">
          <p className="text-gray-400 text-lg">No products found in this category.</p>
        </div>
      )}

      {/* Load More */}
      {currentPage < totalPages && (
        <div className="mt-12 flex justify-center">
          <button
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={loading}
            className="bg-white/5 hover:bg-purple-600 text-white font-medium py-3 px-8 rounded-full border border-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && currentPage > 1 ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white border-r-2 border-r-transparent"></div>
            ) : null}
            {loading && currentPage > 1 ? 'Loading...' : 'Load More Products'}
          </button>
        </div>
      )}
    </main>
  );
}
