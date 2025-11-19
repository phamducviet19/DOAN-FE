import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { CartItem } from '../types';
import api from '../services/api';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: CartItem[];
  loading: boolean;
  error: string | null;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
        setCart([]);
        return;
    };
    setLoading(true);
    try {
      const response = await api.get<{ message: string; cart: CartItem[] }>('/cart');
      setCart(response.cart || []);
      setError(null); // Clear previous errors on success
    } catch (err: any) {
      // Gracefully handle the specific case where the API might return an error for an empty cart.
      if (err.message && err.message.toLowerCase().includes('cart is empty')) {
        setCart([]);
        setError(null); // This is not a real error state for the user.
      } else {
        console.error("Failed to fetch cart:", err);
        setError(err.message || 'An unknown error occurred while fetching the cart.');
        setCart([]);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId: number, quantity: number) => {
    try {
      await api.post('/cart', { productId, quantity });
      await fetchCart();
    } catch (err: any) {
      setError(err.message || 'Failed to add item to cart.');
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    try {
      await api.put(`/cart/${productId}`, { quantity });
      await fetchCart();
    } catch (err: any) {
      setError(err.message || 'Failed to update item quantity.');
    }
  };

  const removeFromCart = async (productId: number) => {
    try {
      await api.delete(`/cart/${productId}`);
      await fetchCart();
    } catch (err: any) {
      setError(err.message || 'Failed to remove item from cart.');
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart');
      setCart([]);
    } catch (err: any) {
      setError(err.message || 'Failed to clear cart.');
    }
  };

  const value = {
    cart,
    loading,
    error,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    fetchCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};