import { Plus, Search, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs/server";

export default async function VendorProducts() {
  let products = [];
  try {
    const { getToken } = await auth();
    const token = await getToken();
    const res = await fetch('http://localhost:4000/api/vendor/products', { 
      cache: 'no-store',
      headers: { ...(token && { Authorization: `Bearer ${token}` }) }
    });
    if (res.ok) {
      products = await res.json();
    }
  } catch (error) {
    console.error("Failed to fetch vendor products");
  }
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Products</h1>
          <p className="text-gray-400">Manage your store's inventory and listings.</p>
        </div>
        <Link href="/vendor/products/new">
          <Button className="bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.3)] border border-purple-500/50">
            <Plus className="w-4 h-4 mr-2" /> Add New Product
          </Button>
        </Link>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl hover-glow">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-400 uppercase bg-black/40 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-medium rounded-tl-xl">Product Name</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right rounded-tr-xl">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No products found. Add your first product to get started!
                  </td>
                </tr>
              )}
              {products.map((product: any) => (
                <tr key={product.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/10 shrink-0"></div>
                    <span className="line-clamp-1">{product.name}</span>
                  </td>
                  <td className="px-6 py-4">{product.category}</td>
                  <td className="px-6 py-4 text-white">₹{product.price.toFixed(2)}</td>
                  <td className="px-6 py-4">{product.stock}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                      product.status === 'Active' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                      product.status === 'Low Stock' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                      'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
