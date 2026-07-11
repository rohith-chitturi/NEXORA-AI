'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Star, ShieldCheck, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/useCartStore';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    fetch(`http://localhost:4000/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch product", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <main className="pt-24 pb-16 px-6 max-w-7xl mx-auto min-h-screen">
        <div className="animate-pulse flex flex-col md:flex-row gap-12">
          <div className="w-full md:w-1/2 h-[500px] bg-white/5 rounded-3xl" />
          <div className="w-full md:w-1/2 space-y-6">
            <div className="h-12 w-3/4 bg-white/5 rounded-xl" />
            <div className="h-6 w-1/4 bg-white/5 rounded-xl" />
            <div className="h-32 w-full bg-white/5 rounded-xl" />
            <div className="h-16 w-full bg-white/5 rounded-full" />
          </div>
        </div>
      </main>
    );
  }

  if (!product || product.error) {
    return (
      <main className="pt-24 pb-16 px-6 max-w-7xl mx-auto min-h-screen flex items-center justify-center text-white">
        Product not found.
      </main>
    );
  }

  return (
    <main className="pt-24 pb-16 px-6 max-w-7xl mx-auto min-h-screen">
      <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-8">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Products
      </Link>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Product Image */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-1/2 h-[500px] glass-panel rounded-3xl overflow-hidden flex items-center justify-center p-8 bg-gradient-to-tr from-white/5 to-transparent"
        >
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-contain filter drop-shadow-2xl" 
          />
        </motion.div>

        {/* Product Details */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-1/2 flex flex-col justify-center"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
            <span className="inline-block bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full w-fit">
              {product.category}
            </span>
            {product.vendor && (
              <Link href={`/store/${product.vendor.id}`} className="group flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors bg-white/5 border border-white/10 hover:border-purple-500/30 px-3 py-1 rounded-full w-fit">
                <span>Sold by</span>
                <span className="font-medium text-purple-300 group-hover:text-purple-400">{product.vendor.storeName}</span>
              </Link>
            )}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">{product.name}</h1>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="text-3xl font-bold text-white">${product.price.toFixed(2)}</div>
            <div className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full border border-white/10">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium text-gray-200">{product.rating}</span>
            </div>
          </div>

          <p className="text-gray-400 text-lg mb-8 leading-relaxed">
            {product.description || "Experience the pinnacle of design and functionality. This premium product is crafted to seamlessly integrate into your workflow and elevate your productivity."}
          </p>

          <Button 
            size="lg" 
            className="rounded-full bg-white text-black hover:bg-gray-200 w-full md:w-auto px-12 py-6 text-lg font-semibold shadow-xl shadow-white/10 transition-all hover:scale-105 mb-8"
            onClick={() => addItem({ id: product.id, name: product.name, price: product.price, image: product.image, quantity: 1 })}
          >
            <ShoppingCart className="w-5 h-5 mr-3" /> Add to Cart
          </Button>

          <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-8">
            <div className="flex items-center gap-3 text-gray-300">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-purple-400">
                <Truck className="w-5 h-5" />
              </div>
              <div className="text-sm">
                <p className="font-medium text-white">Free Shipping</p>
                <p className="text-gray-500">2-3 business days</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-blue-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-sm">
                <p className="font-medium text-white">2 Year Warranty</p>
                <p className="text-gray-500">Full coverage</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
