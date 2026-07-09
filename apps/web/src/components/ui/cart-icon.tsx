'use client';

import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useEffect, useState } from "react";

export function CartIcon() {
  const [mounted, setMounted] = useState(false);
  const itemsCount = useCartStore((state) => state.getTotalItems());

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <a href="#" className="relative hover:text-white transition-colors flex flex-col items-center gap-1 group">
      <ShoppingCart className="w-4 h-4" />
      <span className="text-[10px]">Cart</span>
      {mounted && itemsCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-purple-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
          {itemsCount}
        </span>
      )}
    </a>
  );
}
