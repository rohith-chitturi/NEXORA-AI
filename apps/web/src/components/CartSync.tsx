'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useCartStore } from '@/store/useCartStore';

export function CartSync() {
  const { isSignedIn, getToken } = useAuth();
  const { items, setCart } = useCartStore();
  const isFirstLoad = useRef(true);
  const previousItems = useRef(items);

  // Initial load from backend
  useEffect(() => {
    if (!isSignedIn) return;

    const loadCart = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const res = await fetch('http://localhost:4000/api/cart', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const backendCart = await res.json();
          // Merge logic: If local cart is empty but backend has items, take backend.
          // In a real app, you might want more complex merging.
          if (items.length === 0 && backendCart.length > 0) {
            setCart(backendCart);
          } else if (items.length > 0) {
            // Force a sync to backend of our local items if we just logged in
            // and had a local cart
            syncToBackend(items, token);
          }
        }
      } catch (e) {
        console.error("Failed to load cart from backend", e);
      } finally {
        isFirstLoad.current = false;
      }
    };

    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn]);

  const syncToBackend = async (cartItems: any[], token: string) => {
    try {
      await fetch('http://localhost:4000/api/cart/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ items: cartItems })
      });
    } catch (e) {
      console.error("Failed to sync cart to backend", e);
    }
  };

  // Sync to backend whenever items change (after first load)
  useEffect(() => {
    if (isFirstLoad.current || !isSignedIn) return;
    
    // Only sync if items actually changed
    if (JSON.stringify(items) !== JSON.stringify(previousItems.current)) {
      previousItems.current = items;
      
      getToken().then(token => {
        if (token) syncToBackend(items, token);
      });
    }
  }, [items, isSignedIn, getToken]);

  return null;
}
