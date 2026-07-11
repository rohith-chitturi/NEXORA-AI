'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Star, ShieldCheck, Truck, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/useCartStore';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';

export default function ProductPage() {
  const { id } = useParams();
  const { isSignedIn } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(true);
  const [isSubscription, setIsSubscription] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    Promise.all([
      fetch(`http://localhost:4000/api/products/${id}`).then(res => res.json()),
      fetch(`http://localhost:4000/api/products/${id}/reviews`).then(res => res.json())
    ]).then(([productData, reviewsData]) => {
      setProduct(productData);
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      setLoading(false);
      
      // Fetch wishlist status
      fetch('http://localhost:4000/api/wishlist')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setIsWishlisted(data.some(item => item.id === id));
          }
          setWishlistLoading(false);
        })
        .catch(() => setWishlistLoading(false));
    }).catch(err => {
      console.error("Failed to fetch product data", err);
      setLoading(false);
      setWishlistLoading(false);
    });
  }, [id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const res = await fetch(`http://localhost:4000/api/products/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview)
      });
      if (res.ok) {
        const addedReview = await res.json();
        setReviews([addedReview, ...reviews]);
        setNewReview({ rating: 5, comment: '' });
      }
    } catch (error) {
      console.error("Failed to post review", error);
    }
    setSubmittingReview(false);
  };

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
            <div className="text-3xl font-bold text-white">₹{product.price.toFixed(2)}</div>
            <div className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full border border-white/10">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium text-gray-200">{product.rating}</span>
            </div>
          </div>

          <p className="text-gray-400 text-lg mb-8 leading-relaxed">
            {product.description || "Experience the pinnacle of design and functionality. This premium product is crafted to seamlessly integrate into your workflow and elevate your productivity."}
          </p>
          
          {/* Subscribe & Save Toggle */}
          <div className="mb-8 p-4 rounded-2xl border border-white/10 bg-white/5 flex flex-col gap-4">
            <label className={`relative flex items-center p-4 rounded-xl cursor-pointer border transition-all ${!isSubscription ? 'bg-purple-500/20 border-purple-500/50' : 'bg-transparent border-white/5 hover:border-white/20'}`}>
              <input type="radio" name="purchaseType" className="w-5 h-5 text-purple-600 bg-black border-white/20 focus:ring-purple-600 focus:ring-offset-gray-900" checked={!isSubscription} onChange={() => setIsSubscription(false)} />
              <div className="ml-4 flex-1">
                <p className="text-white font-semibold">One-time purchase</p>
                <p className="text-sm text-gray-400">₹{product.price.toFixed(2)}</p>
              </div>
            </label>
            
            <label className={`relative flex items-center p-4 rounded-xl cursor-pointer border transition-all ${isSubscription ? 'bg-purple-500/20 border-purple-500/50' : 'bg-transparent border-white/5 hover:border-white/20'}`}>
              <input type="radio" name="purchaseType" className="w-5 h-5 text-purple-600 bg-black border-white/20 focus:ring-purple-600 focus:ring-offset-gray-900" checked={isSubscription} onChange={() => setIsSubscription(true)} />
              <div className="ml-4 flex-1">
                <p className="text-white font-semibold flex items-center gap-2">
                  Subscribe & Save 15% 
                  <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">Best Value</span>
                </p>
                <p className="text-sm text-gray-400">₹{(product.price * 0.85).toFixed(2)} / delivery</p>
              </div>
            </label>
          </div>

          <div className="flex gap-4 mb-8">
            <Button 
              size="lg" 
              className="rounded-full bg-white text-black hover:bg-gray-200 flex-1 px-12 py-6 text-lg font-semibold shadow-xl shadow-white/10 transition-all hover:scale-105"
              onClick={() => addItem({ 
                id: product.id, 
                name: product.name, 
                price: isSubscription ? product.price * 0.85 : product.price, 
                image: product.image, 
                quantity: 1,
                isSubscription
              })}
            >
              <ShoppingCart className="w-5 h-5 mr-3" /> Add to Cart
            </Button>
            <Button 
              size="lg"
              variant="outline"
              disabled={wishlistLoading}
              className={`rounded-full py-6 px-6 border-white/10 transition-all hover:scale-105 ${isWishlisted ? 'bg-pink-500/10 border-pink-500/50' : 'bg-white/5 hover:bg-white/10'}`}
              onClick={async () => {
                try {
                  const res = await fetch(`http://localhost:4000/api/wishlist/${id}`, { method: 'POST' });
                  if (res.ok) setIsWishlisted(!isWishlisted);
                } catch (err) {
                  console.error(err);
                }
              }}
            >
              <Heart className={`w-6 h-6 ${isWishlisted ? 'text-pink-500 fill-pink-500' : 'text-gray-300'}`} />
            </Button>
          </div>

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
            <div className="space-y-4">
              {product.features?.map((feature: string, idx: number) => (
                <div key={idx} className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                    <span className="text-purple-400 font-bold">{idx + 1}</span>
                  </div>
                  <p className="text-gray-300">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* RELATED PRODUCTS */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <div className="mt-24 max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">You Might Also Like</h2>
              <p className="text-gray-400">Discover similar premium products from our catalog.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {product.relatedProducts.map((rp: any, idx: number) => (
              <motion.div 
                key={rp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group glass-panel rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] bg-black/40 flex flex-col h-80"
              >
                <Link href={`/product/${rp.id}`} className="block relative h-48 overflow-hidden bg-white/5">
                  <img 
                    src={rp.image} 
                    alt={rp.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white border border-white/10 uppercase tracking-wider">
                    {rp.category}
                  </div>
                  
                  {/* Quick Add Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addItem({ id: rp.id, name: rp.name, price: rp.price, image: rp.image, quantity: 1 });
                      }}
                      className="bg-white text-black px-6 py-2 rounded-full font-bold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all hover:bg-gray-200 hover:scale-105"
                    >
                      <ShoppingCart className="w-4 h-4" /> Quick Add
                    </button>
                  </div>
                </Link>
                <div className="p-5 flex-1 flex flex-col justify-between relative z-10">
                  <div>
                    <h3 className="text-white font-semibold line-clamp-1 mb-1 group-hover:text-purple-400 transition-colors">{rp.name}</h3>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                    <span className="text-xl font-bold text-white">₹{rp.price.toFixed(2)}</span>
                    <button 
                      onClick={() => addItem({ id: rp.id, name: rp.name, price: rp.price, image: rp.image, quantity: 1 })}
                      className="w-10 h-10 rounded-full bg-white/5 hover:bg-purple-600 flex items-center justify-center transition-colors text-white border border-white/10 hover:border-purple-500"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* REVIEWS SECTION */}
      <div className="mt-24 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-8">Customer Reviews</h2>
        
        {/* Write a review form */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-12 backdrop-blur-sm relative overflow-hidden">
          {!isSignedIn && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
              <Star className="w-8 h-8 text-yellow-500/50 mb-3" />
              <h4 className="text-white font-bold mb-2">Please Sign In to Review</h4>
              <p className="text-gray-400 text-sm">Join our community to share your thoughts.</p>
            </div>
          )}
          <h3 className="text-xl font-bold text-white mb-4">Write a Review</h3>
          <form onSubmit={handleSubmitReview} className={`space-y-6 ${!isSignedIn ? 'opacity-30 pointer-events-none' : ''}`}>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button 
                    key={star} 
                    type="button" 
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star className={`w-8 h-8 ${newReview.rating >= star ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Comment</label>
              <textarea 
                value={newReview.comment}
                onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                rows={4}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all resize-none"
                placeholder="What did you think of this product?"
                required
              />
            </div>
            <Button 
              type="submit" 
              disabled={submittingReview}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-8"
            >
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </Button>
          </form>
        </div>

        {/* Display Reviews */}
        <div className="space-y-6">
          {reviews.length > 0 ? reviews.map((review: any) => (
            <div key={review.id} className="bg-black/40 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center font-bold text-white">
                    {review.user?.firstName?.[0] || 'U'}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{review.user?.firstName} {review.user?.lastName}</h4>
                    <span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`} />
                  ))}
                </div>
              </div>
              <p className="text-gray-300">{review.comment}</p>
            </div>
          )) : (
            <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
              <Star className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">No Reviews Yet</h3>
              <p className="text-gray-400">Be the first to review this product!</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
