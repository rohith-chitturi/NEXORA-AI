'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Store } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';

export function VendorChatWidget({ vendorId, storeName }: { vendorId: string, storeName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { getToken, isSignedIn } = useAuth();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && isSignedIn) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen, isSignedIn]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:4000/api/messages/${vendorId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setMessages(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !isSignedIn) return;

    const content = newMessage;
    setNewMessage('');
    setLoading(true);

    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:4000/api/messages/${vendorId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content, senderType: 'CUSTOMER' })
      });
      if (res.ok) {
        await fetchMessages();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:scale-105 transition-all flex items-center justify-center"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-96 max-h-[600px] h-[80vh] bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white leading-tight">{storeName}</h3>
                  <p className="text-xs text-blue-200">Usually replies in a few hours</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center text-white hover:bg-black/40 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {!isSignedIn ? (
                <div className="h-full flex items-center justify-center text-center">
                  <p className="text-gray-400">Please sign in to message this vendor.</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-50">
                  <MessageSquare className="w-12 h-12 text-gray-500" />
                  <p className="text-gray-400 text-sm max-w-[200px]">Send a message to ask about this product!</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isVendor = msg.senderType === 'VENDOR';
                  return (
                    <div key={idx} className={`flex ${isVendor ? 'justify-start' : 'justify-end'}`}>
                      <div 
                        className={`max-w-[80%] p-3 rounded-2xl ${
                          isVendor 
                            ? 'bg-white/10 text-white rounded-tl-sm' 
                            : 'bg-purple-600 text-white rounded-tr-sm'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white/5 border-t border-white/10">
              <form onSubmit={sendMessage} className="flex gap-2">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={!isSignedIn || loading}
                  placeholder="Type a message..."
                  className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-purple-500 disabled:opacity-50"
                />
                <button 
                  type="submit"
                  disabled={!isSignedIn || !newMessage.trim() || loading}
                  className="w-10 h-10 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center text-white transition-colors shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
