'use client';

import { useState, useEffect } from 'react';
import { Box, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

// Extending JSX IntrinsicElements for model-viewer since it's a web component
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any;
    }
  }
}

export function ARViewer({ src, alt }: { src: string, alt: string }) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dynamically load Google's model-viewer script
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js';
    document.head.appendChild(script);
    
    setMounted(true);
    
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative w-full h-[500px] bg-black/40 rounded-3xl border border-white/10 overflow-hidden group shadow-2xl flex items-center justify-center">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10 backdrop-blur-sm">
          <RefreshCw className="w-8 h-8 text-purple-500 animate-spin mb-4" />
          <p className="text-purple-300 font-bold tracking-widest text-sm uppercase animate-pulse">Loading 3D AR Model...</p>
        </div>
      )}
      
      <model-viewer
        src={src}
        alt={alt}
        auto-rotate
        camera-controls
        ar
        ar-modes="webxr scene-viewer quick-look"
        shadow-intensity="1"
        environment-image="neutral"
        exposure="1"
        style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
        onLoad={() => setLoading(false)}
      >
        <button slot="ar-button" className="absolute bottom-6 right-6 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center gap-2 hover:scale-105 transition-all z-20">
          <Box className="w-5 h-5" /> View in Space (AR)
        </button>
      </model-viewer>
      
      {/* Decorative scanning line effect overlay */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/10 to-transparent w-full h-[20%] pointer-events-none z-10"
        animate={{ top: ['-20%', '120%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}
