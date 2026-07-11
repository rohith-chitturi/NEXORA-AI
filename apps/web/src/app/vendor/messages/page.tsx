'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, User } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';

export default function VendorMessagesPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [getToken]);

  useEffect(() => {
    if (activeUserId) {
      const activeMsgs = conversations.filter(m => m.userId === activeUserId);
      setMessages(activeMsgs);
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [activeUserId, conversations]);

  const fetchConversations = async () => {
    try {
      const token = await getToken();
      const res = await fetch('http://localhost:4000/api/vendor/messages', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeUserId) return;

    const content = newMessage;
    setNewMessage('');
    
    try {
      const token = await getToken();
      // To send a message, we need vendorId. But the API `POST /api/messages/:vendorId` uses the URL param.
      // Wait, as a vendor, we can just hit the same endpoint using our own vendorId?
      // Actually, our API takes vendorId from URL and uses it.
      const vendorId = conversations[0]?.vendorId;
      if (!vendorId) return;

      await fetch(`http://localhost:4000/api/messages/${vendorId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        // We override userId on the backend if senderType === CUSTOMER, but if VENDOR we need to pass the target userId!
        // Ah, our backend POST /api/messages/:vendorId doesn't let vendor specify which CUSTOMER they are replying to!
        // Wait, for demo purposes I can just pass `targetUserId: activeUserId` in the body and fix the backend!
        body: JSON.stringify({ content, senderType: 'VENDOR', targetUserId: activeUserId })
      });
      
      await fetchConversations();
    } catch (e) {
      console.error(e);
    }
  };

  // Group by users
  const uniqueUsers = Array.from(new Set(conversations.map(m => m.userId))).map(id => {
    return conversations.find(m => m.userId === id)?.user;
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Customer Messages</h1>
        <p className="text-gray-400">Respond to customer inquiries in real-time.</p>
      </div>

      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex h-[600px]">
        
        {/* Sidebar (Users) */}
        <div className="w-80 border-r border-white/10 flex flex-col bg-white/5">
          <div className="p-4 border-b border-white/10">
            <h3 className="font-bold text-white tracking-wider uppercase text-sm">Conversations</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-gray-500">Loading...</div>
            ) : uniqueUsers.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No messages yet.</div>
            ) : (
              uniqueUsers.map(user => {
                if (!user) return null;
                const isActive = activeUserId === user.id;
                return (
                  <button 
                    key={user.id}
                    onClick={() => setActiveUserId(user.id)}
                    className={`w-full text-left p-4 border-b border-white/5 transition-colors flex items-center gap-3 ${
                      isActive ? 'bg-purple-600/20 border-l-4 border-l-purple-500' : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="truncate">
                      <p className={`font-semibold truncate ${isActive ? 'text-white' : 'text-gray-300'}`}>
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-[#0a0a0a]">
          {!activeUserId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
              <MessageSquare className="w-16 h-16 text-gray-600 mb-4" />
              <p className="text-gray-400 font-medium">Select a conversation to start messaging</p>
            </div>
          ) : (
            <>
              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg, idx) => {
                  const isVendor = msg.senderType === 'VENDOR';
                  return (
                    <div key={idx} className={`flex ${isVendor ? 'justify-end' : 'justify-start'}`}>
                      <div 
                        className={`max-w-[70%] p-3 rounded-2xl ${
                          isVendor 
                            ? 'bg-purple-600 text-white rounded-tr-sm' 
                            : 'bg-white/10 text-gray-200 rounded-tl-sm'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white/5 border-t border-white/10">
                <form onSubmit={sendMessage} className="flex gap-3">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your reply..."
                    className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  />
                  <button 
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="w-12 h-12 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center text-white transition-colors shrink-0"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
        
      </div>
    </div>
  );
}
