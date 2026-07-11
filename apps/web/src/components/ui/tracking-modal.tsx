'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Truck, CheckCircle2, Clock, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';

export function TrackingModal({ 
  isOpen, 
  onClose, 
  order 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  order: any;
}) {
  const [activeStep, setActiveStep] = useState(0);

  // Mapping DB status to timeline steps
  const getStepForStatus = (status: string) => {
    switch (status) {
      case 'PENDING': return 0;
      case 'CONFIRMED': return 1;
      case 'PROCESSING': return 1;
      case 'SHIPPED': return 2;
      case 'OUT_FOR_DELIVERY': return 3;
      case 'DELIVERED': return 4;
      default: return 0;
    }
  };

  useEffect(() => {
    if (order) {
      const targetStep = getStepForStatus(order.status);
      
      // Animate progress visually for demo effect
      setActiveStep(0);
      let current = 0;
      const interval = setInterval(() => {
        if (current < targetStep) {
          current++;
          setActiveStep(current);
        } else {
          clearInterval(interval);
        }
      }, 400);
      
      return () => clearInterval(interval);
    }
  }, [order, isOpen]);

  if (!isOpen || !order) return null;

  const steps = [
    { title: 'Order Placed', icon: Clock, desc: 'We have received your order.' },
    { title: 'Processing', icon: Package, desc: 'Your items are being packed.' },
    { title: 'Shipped', icon: Truck, desc: 'Package is on the way.' },
    { title: 'Out for Delivery', icon: MapPin, desc: 'Arriving today!' },
    { title: 'Delivered', icon: CheckCircle2, desc: 'Package dropped off.' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />
        
        {/* Modal Content */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-[#0a0a0a] border border-white/10 shadow-[0_0_50px_rgba(168,85,247,0.15)] rounded-3xl w-full max-w-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Track Package</h2>
              <p className="text-sm text-gray-400 font-mono tracking-wider">ID: {order.trackingNumber || order.id.slice(0,12)}</p>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Timeline UI */}
          <div className="p-8 py-12">
            <div className="relative">
              {/* Vertical Progress Line (Background) */}
              <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-white/10" />
              
              {/* Vertical Progress Line (Active Fill) */}
              <motion.div 
                className="absolute left-6 top-6 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                initial={{ height: "0%" }}
                animate={{ height: `${(activeStep / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />

              <div className="space-y-12 relative">
                {steps.map((step, idx) => {
                  const isActive = idx <= activeStep;
                  const isCurrent = idx === activeStep;
                  
                  return (
                    <div key={idx} className="flex gap-6 items-start">
                      {/* Node Icon */}
                      <div className="relative z-10 shrink-0">
                        <motion.div 
                          initial={{ scale: 0.8, opacity: 0.5 }}
                          animate={{ 
                            scale: isActive ? 1 : 0.8,
                            opacity: isActive ? 1 : 0.5,
                            boxShadow: isCurrent ? '0 0 20px rgba(168,85,247,0.4)' : 'none'
                          }}
                          className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors duration-500 ${
                            isActive 
                              ? 'bg-black border-purple-500 text-purple-400' 
                              : 'bg-black border-white/10 text-gray-600'
                          }`}
                        >
                          <step.icon className={`w-5 h-5 ${isCurrent ? 'animate-pulse' : ''}`} />
                        </motion.div>
                      </div>
                      
                      {/* Node Text */}
                      <div className="pt-2">
                        <h3 className={`text-lg font-bold transition-colors duration-500 ${isActive ? 'text-white' : 'text-gray-500'}`}>
                          {step.title}
                        </h3>
                        <p className={`text-sm mt-1 transition-colors duration-500 ${isActive ? 'text-gray-400' : 'text-gray-600'}`}>
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Footer map placeholder */}
          <div className="h-48 bg-white/5 relative overflow-hidden border-t border-white/10 flex items-center justify-center">
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'radial-gradient(circle at 50% 50%, #ffffff 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}></div>
            <div className="text-center z-10">
              <MapPin className="w-8 h-8 text-purple-500 mx-auto mb-2 opacity-50" />
              <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Live GPS Tracking (Demo)</p>
            </div>
            {/* Pulsing beacon if Out for delivery */}
            {activeStep === 3 && (
              <motion.div 
                className="absolute w-4 h-4 bg-purple-500 rounded-full"
                animate={{ scale: [1, 4], opacity: [0.8, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
