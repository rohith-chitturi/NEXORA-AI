'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, User, Bot, ShoppingCart, Loader2 } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  products?: any[];
};

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: "Hi! I'm NEXORA, your AI shopping assistant. What are you looking for today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const addItem = useCartStore((state) => state.addItem);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // 1. Send query to Python AI Engine
      const aiRes = await fetch('http://localhost:8001/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Using a hardcoded user_id for now; could use Clerk's user id in production
        body: JSON.stringify({ query: userMsg.content, user_id: 'guest_user' })
      });
      
      if (!aiRes.ok) throw new Error("AI Engine failed");
      const data = await aiRes.json();

      let fetchedProducts = [];
      
      // 2. If AI returns product IDs, fetch their details from Node API
      if (data.products && data.products.length > 0) {
        for (const pid of data.products) {
          try {
            const prodRes = await fetch(`http://localhost:4000/api/products/${pid}`);
            if (prodRes.ok) {
              const product = await prodRes.json();
              fetchedProducts.push(product);
            }
          } catch (err) {
            console.error(`Failed to fetch product ${pid}`, err);
          }
        }
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reasoning || "Here's what I found for you:",
        products: fetchedProducts.length > 0 ? fetchedProducts : undefined
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'assistant', 
        content: "I'm sorry, I'm having trouble connecting to my brain right now. Please try again later." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: isOpen ? 0 : 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-full shadow-[0_0_30px_rgba(168,85,247,0.5)] text-white"
      >
        <Sparkles className="w-6 h-6" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] h-[600px] max-h-[80vh] flex flex-col bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">NEXORA AI</h3>
                  <p className="text-xs text-purple-400">Powered by LangGraph</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === 'user' ? 'bg-purple-600' : 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${
                    msg.role === 'user' 
                      ? 'bg-purple-600 text-white rounded-tr-sm' 
                      : 'bg-white/10 text-gray-200 rounded-tl-sm'
                  }`}>
                    <p className="leading-relaxed">{msg.content}</p>
                    
                    {/* Render Products if AI returned any */}
                    {msg.products && (
                      <div className="mt-4 space-y-3">
                        {msg.products.map(product => (
                          <div key={product.id} className="bg-black/40 border border-white/10 rounded-xl p-2 flex gap-3">
                            <img src={product.images?.[0]?.url || product.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"} alt={product.name} className="w-16 h-16 rounded-lg object-cover" />
                            <div className="flex flex-col justify-between flex-1">
                              <h4 className="text-xs font-semibold text-white line-clamp-2">{product.name}</h4>
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-purple-400">${product.basePrice || product.price}</span>
                                <button 
                                  onClick={() => addItem({
                                    id: product.id,
                                    name: product.name,
                                    price: parseFloat(product.basePrice || product.price),
                                    category: product.category?.name || "AI Pick",
                                    rating: 4.5,
                                    image: product.images?.[0]?.url || product.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
                                    quantity: 1
                                  })}
                                  className="w-6 h-6 bg-white text-black rounded-full flex items-center justify-center hover:bg-gray-200"
                                >
                                  <ShoppingCart className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </div>
                  <div className="bg-white/5 rounded-2xl rounded-tl-sm p-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 bg-white/5">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask for recommendations..."
                  className="w-full bg-black/40 border border-white/10 rounded-full pl-4 pr-12 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white hover:bg-purple-700 disabled:opacity-50 disabled:hover:bg-purple-600 transition-colors"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
