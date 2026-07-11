'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PackagePlus, Upload, DollarSign, Tag, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    stock: '',
    category: 'Electronics',
    imageUrl: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('http://localhost:4000/api/vendor/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error("Failed to add product");
      
      router.push('/vendor');
    } catch (error) {
      console.error(error);
      alert("Error adding product. Check console.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Add New Product</h1>
        <p className="text-gray-400">List a new item in your store catalog.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="glass-panel p-8 rounded-3xl space-y-6 bg-black/40 border border-white/10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <PackagePlus className="w-4 h-4 text-purple-400" /> Product Name
              </label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500/50"
                placeholder="e.g. Wireless Noise-Cancelling Headphones"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Tag className="w-4 h-4 text-blue-400" /> Category
              </label>
              <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500/50 appearance-none"
              >
                <option value="Electronics">Electronics</option>
                <option value="Apparel">Apparel</option>
                <option value="Home & Garden">Home & Garden</option>
                <option value="Beauty">Beauty</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-green-400" /> Description
            </label>
            <textarea 
              required
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              rows={4}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500/50 resize-none"
              placeholder="Describe your product's features and benefits..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-yellow-400" /> Base Price ($)
              </label>
              <input 
                type="number" 
                step="0.01"
                required
                value={formData.basePrice}
                onChange={e => setFormData({...formData, basePrice: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500/50"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <PackagePlus className="w-4 h-4 text-pink-400" /> Initial Stock
              </label>
              <input 
                type="number" 
                required
                value={formData.stock}
                onChange={e => setFormData({...formData, stock: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500/50"
                placeholder="e.g. 100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Upload className="w-4 h-4 text-indigo-400" /> Image URL
            </label>
            <input 
              type="url"
              required
              value={formData.imageUrl}
              onChange={e => setFormData({...formData, imageUrl: e.target.value})}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500/50"
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.push('/vendor')} className="rounded-xl px-6 py-6 border-white/10 hover:bg-white/5">
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="rounded-xl px-8 py-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-lg shadow-purple-500/20">
            {loading ? 'Publishing...' : 'Publish Product'}
          </Button>
        </div>
      </form>
    </div>
  );
}
