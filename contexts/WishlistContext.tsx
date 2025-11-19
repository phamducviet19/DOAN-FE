import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { WishlistItem } from '../types';
import api from '../services/api';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlist: WishlistItem[];
  loading: boolean;
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
        setWishlist([]);
        return;
    };
    setLoading(true);
    try {
      const data = await api.get<WishlistItem[]>('/wishlist');
      setWishlist(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);
  
  const isInWishlist = (productId: number): boolean => {
    return wishlist.some(item => item.product_id === productId);
  };

  const addToWishlist = async (productId: number) => {
    if (isInWishlist(productId)) {
        removeFromWishlist(productId);
        return;
    }
    try {
      await api.post('/wishlist', { product_id: productId });
      await fetchWishlist();
    } catch (err: any) {
      alert(err.message || 'Failed to add item to wishlist.');
    }
  };

  const removeFromWishlist = async (productId: number) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      await fetchWishlist();
    } catch (err: any) {
       alert(err.message || 'Failed to remove item from wishlist.');
    }
  };

  const value = {
    wishlist,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
