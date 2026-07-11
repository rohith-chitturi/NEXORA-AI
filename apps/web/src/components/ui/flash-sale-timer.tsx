'use client';

import { useState, useEffect } from 'react';
import { Clock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export function FlashSaleTimer({ endTime }: { endTime: string }) {
  const calculateTimeLeft = () => {
    const difference = +new Date(endTime) - +new Date();
    let timeLeft = {
      hours: 0,
      minutes: 0,
      seconds: 0
    };

    if (difference > 0) {
      timeLeft = {
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  if (!mounted) return null;

  // If time is up, don't show the timer or show expired
  if (timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
    return (
      <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-3 py-1 rounded-full text-xs font-bold w-fit">
        Flash Sale Ended
      </div>
    );
  }

  const formatTime = (time: number) => {
    return time < 10 ? `0${time}` : time;
  };

  return (
    <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl w-fit relative overflow-hidden">
      <motion.div 
        className="absolute inset-0 bg-red-500 opacity-10"
        animate={{ opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      
      <div className="flex items-center gap-1.5 text-red-500 z-10">
        <Zap className="w-4 h-4 fill-red-500" />
        <span className="font-bold text-sm tracking-wide uppercase">Flash Sale Ends In</span>
      </div>
      
      <div className="flex items-center gap-1 font-mono text-white font-bold z-10 text-lg">
        <div className="bg-black/50 px-2 rounded min-w-[32px] text-center">{formatTime(timeLeft.hours)}</div>
        <span className="text-red-500 animate-pulse">:</span>
        <div className="bg-black/50 px-2 rounded min-w-[32px] text-center">{formatTime(timeLeft.minutes)}</div>
        <span className="text-red-500 animate-pulse">:</span>
        <div className="bg-black/50 px-2 rounded min-w-[32px] text-center">{formatTime(timeLeft.seconds)}</div>
      </div>
    </div>
  );
}
