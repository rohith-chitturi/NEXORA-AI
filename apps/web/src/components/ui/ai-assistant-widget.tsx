'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, ArrowRight, Sparkles, X, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/nextjs';
import { useCartStore } from '@/store/useCartStore';

export function AIAssistantWidget() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<any[]>([
    { role: 'assistant', text: 'Hello! I am your NEXORA AI. Need help finding a product?' }
  ]);
  const [loading, setLoading] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:8001/api/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: userMsg,
          user_id: user?.id || 'anonymous_user'
        })
      });
      const data = await response.json();
      
      const assistantText = `I found that you are looking for: ${data.intent}. ${data.reasoning}.`;
      setMessages(prev => [...prev, { role: 'assistant', text: assistantText, products: data.products }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, the AI Engine is currently offline or unreachable.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 shadow-2xl shadow-purple-500/20 flex items-center justify-center text-white z-50 hover:scale-105 transition-transform"
          >
            <Sparkles className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating Chat Widget */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-[400px] z-50"
          >
            <div className="glass-panel rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-white/20 bg-black/80 backdrop-blur-2xl">
              {/* Header */}
              <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-white/5 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">NEXORA AI</h3>
                    <p className="text-[10px] text-gray-400">Autonomous Shopping Agent</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Messages Area */}
              <div className="p-4 h-[400px] flex flex-col gap-4 overflow-y-auto custom-scrollbar">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : ''}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 ${msg.role === 'user' ? 'bg-zinc-700' : 'bg-gradient-to-tr from-purple-500 to-blue-500'}`}>
                      {msg.role === 'user' ? <span className="text-[10px]">You</span> : <Bot className="w-3 h-3 text-white" />}
                    </div>
                    <div className={`rounded-2xl p-3 text-sm ${msg.role === 'user' ? 'bg-blue-600/20 border border-blue-500/30 rounded-tr-sm text-white' : 'bg-white/5 border border-white/10 rounded-tl-sm text-gray-200'}`}>
                      <p>{msg.text}</p>
                      
                      {/* Product Cards Grid inside chat */}
                      {msg.products && msg.products.length > 0 && (
                        <div className="mt-3 flex flex-col gap-2">
                          {msg.products.map((product: any, idx: number) => (
                            <div key={idx} className="bg-black/40 border border-white/10 rounded-xl p-2 flex gap-3 hover:border-purple-500/30 transition-colors">
                              <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex flex-col justify-between flex-1 min-w-0">
                                <div>
                                  <h4 className="text-xs font-semibold text-white truncate">{product.name}</h4>
                                  <p className="text-[10px] text-purple-400 font-bold mt-0.5">${product.price.toFixed(2)}</p>
                                </div>
                                <button 
                                  onClick={() => addItem({ ...product, quantity: 1 })}
                                  className="text-[10px] bg-white/10 hover:bg-white/20 text-white rounded px-2 py-1 flex items-center justify-center gap-1 mt-1 transition-colors w-fit"
                                >
                                  <ShoppingCart className="w-3 h-3" /> Add
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm p-3 w-full space-y-3">
                      <div className="flex items-center gap-2 text-purple-400">
                        <Sparkles className="w-3 h-3" />
                        <span className="font-medium text-[10px] uppercase tracking-wider">Analyzing</span>
                      </div>
                      <div className="space-y-2">
                        <div className="h-1.5 bg-white/10 rounded-full w-3/4 animate-pulse" />
                        <div className="h-1.5 bg-white/10 rounded-full w-1/2 animate-pulse" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-3 bg-white/5 border-t border-white/10">
                <div className="relative flex items-center">
                  <input 
                    type="text" 
                    placeholder="Ask AI to find products..." 
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500/50 transition-colors"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSend();
                    }}
                  />
                  <Button size="icon" onClick={handleSend} className="absolute right-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white w-7 h-7">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
