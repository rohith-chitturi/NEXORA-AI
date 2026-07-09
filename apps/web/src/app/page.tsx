'use client';

import { motion } from 'framer-motion';
import { Bot, Sparkles, Command, ArrowRight, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--background)]">
      {/* Abstract Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />

      {/* Navigation */}
      <nav className="fixed top-0 w-full border-b border-white/5 bg-black/20 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span className="font-bold text-lg tracking-tight">NEXORA</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Platform</a>
            <a href="#" className="hover:text-white transition-colors">Agents</a>
            <a href="#" className="hover:text-white transition-colors">Pricing</a>
            <a href="#" className="hover:text-white transition-colors">Changelog</a>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-sm font-medium hover:text-gray-300 transition-colors">Log in</button>
            <Button className="rounded-full bg-white text-black hover:bg-gray-200">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-32 pb-16 px-6 max-w-7xl mx-auto min-h-screen flex flex-col justify-between">
        <div className="flex flex-col items-center text-center mt-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 mb-8"
          >
            <Bot className="w-4 h-4 text-purple-400" />
            <span>Meet your autonomous AI Shopping Agent</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 max-w-4xl"
          >
            Shopping, <span className="gradient-text">Automated.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed"
          >
            NEXORA is a next-generation AI commerce platform. Tell the AI what you need, and it searches, compares, and purchases for you.
          </motion.p>
        </div>

        <ChatInterface />
      </main>
    </div>
  );
}

function ChatInterface() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello! I am your NEXORA Personal Shopping Agent. What are we looking for today?' }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:8001/api/v1/chat?query=${encodeURIComponent(userMsg)}`, {
        method: 'POST'
      });
      const data = await response.json();
      
      const assistantText = `I found that you are looking for: ${data.intent}. ${data.reasoning}. I've lined up these products: ${data.products.join(", ")}`;
      setMessages(prev => [...prev, { role: 'assistant', text: assistantText }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, the AI Engine is currently offline or unreachable.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.5 }}
      className="mt-10 w-full max-w-3xl mx-auto"
    >
      <div className="glass-panel rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        <div className="h-12 border-b border-white/10 flex items-center px-4 bg-white/5 shrink-0">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
          </div>
          <div className="mx-auto flex items-center gap-2 text-xs text-gray-500 bg-black/40 px-3 py-1 rounded-md">
            <ShoppingBag className="w-3 h-3" />
            nexora.ai / assistant
          </div>
        </div>
        
        <div className="p-6 h-[400px] flex flex-col gap-6 bg-black/40 overflow-y-auto">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 max-w-2xl ${msg.role === 'user' ? 'self-end flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-zinc-800' : 'bg-gradient-to-tr from-purple-500 to-blue-500'}`}>
                {msg.role === 'user' ? <span className="text-xs">You</span> : <Bot className="w-4 h-4 text-white" />}
              </div>
              <div className={`border rounded-2xl p-4 text-sm ${msg.role === 'user' ? 'bg-blue-600/20 border-blue-500/30 rounded-tr-sm text-gray-200' : 'bg-white/5 border-white/10 rounded-tl-sm text-gray-300'}`}>
                <p>{msg.text}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-4 max-w-3xl">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm p-4 text-sm text-gray-300 w-full space-y-4">
                <div className="flex items-center gap-2 text-purple-400">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-medium text-xs uppercase tracking-wider">Analyzing requirements & Scanning catalog</span>
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-white/10 rounded-full w-3/4 animate-pulse" />
                  <div className="h-2 bg-white/10 rounded-full w-1/2 animate-pulse" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-white/5 border-t border-white/10">
          <div className="relative flex items-center">
            <input 
              type="text" 
              placeholder="Ask NEXORA anything... (e.g. Find me a mechanical keyboard under $100)" 
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500/50 transition-colors"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSend();
                }
              }}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button size="icon" onClick={handleSend} className="absolute right-2 rounded-lg bg-white/10 hover:bg-white/20 text-white w-8 h-8">
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
