'use client';

import { ArrowLeft, Upload, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProduct() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      router.push('/vendor/products');
    }, 1500);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div>
        <Link href="/vendor/products" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Products
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Add New Product</h1>
        <p className="text-gray-400">Fill in the details to list your product on NEXORA AI.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl hover-glow space-y-6"
        >
          <h2 className="text-xl font-bold text-white mb-4">Basic Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Product Name</label>
              <input required type="text" className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500 transition-colors" placeholder="Premium Ergonomic Chair" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
              <textarea required rows={4} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500 transition-colors custom-scrollbar" placeholder="Describe the product in detail..."></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                <select className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500 transition-colors appearance-none">
                  <option value="electronics">Electronics</option>
                  <option value="furniture">Furniture</option>
                  <option value="clothing">Clothing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Tags</label>
                <input type="text" className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500 transition-colors" placeholder="office, ergonomic, desk (comma separated)" />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl hover-glow space-y-6"
        >
          <h2 className="text-xl font-bold text-white mb-4">Pricing & Inventory</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Base Price ($)</label>
              <input required type="number" step="0.01" className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500 transition-colors" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Stock Quantity</label>
              <input required type="number" className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500 transition-colors" placeholder="100" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl hover-glow space-y-6"
        >
          <h2 className="text-xl font-bold text-white mb-4">Media</h2>
          <div className="border-2 border-dashed border-white/20 rounded-2xl p-12 flex flex-col items-center justify-center text-gray-400 hover:text-white hover:border-purple-500/50 transition-colors cursor-pointer bg-black/20">
            <Upload className="w-8 h-8 mb-4 opacity-50" />
            <p className="font-medium mb-1">Click to upload or drag and drop</p>
            <p className="text-xs opacity-60">SVG, PNG, JPG or GIF (max. 800x400px)</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-end pt-4"
        >
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] border border-purple-500/50 py-6 px-8 text-lg font-semibold min-w-[200px]"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2 animate-pulse">
                Publishing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Publish Product
              </span>
            )}
          </Button>
        </motion.div>
      </form>
    </div>
  );
}
