import { create } from 'zustand';
import axios from '../lib/axios';
import type { Book } from '../types/book';

interface CartItem {
  book: Book;
  quantity: number;
  price: number;
  image?: string;
}

interface CartState {
  cart: CartItem[];
  loading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addToCart: (bookId: string, quantity: number, price: number, image?: string) => Promise<void>;
  removeFromCart: (bookId: string) => Promise<void>;
  updateQuantity: (bookId: string, newQuantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  total: () => number;
  getCartCount: () => number;
}

const useCartStore = create<CartState>((set, get) => ({
  cart: [],
  loading: false,
  error: null,

  fetchCart: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get('/api/cart');
      set({ cart: response.data.items, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch cart', loading: false });
    }
  },

  addToCart: async (bookId, quantity, price, image) => {
    set({ loading: true, error: null });
    try {
      await axios.post('/api/cart', { bookId, quantity, price, image });
      await get().fetchCart();
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to add to cart', loading: false });
    }
  },

  removeFromCart: async (bookId) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`/api/cart/${bookId}`);
      await get().fetchCart();
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to remove from cart', loading: false });
    }
  },

  updateQuantity: async (bookId, newQuantity) => {
    set({ loading: true, error: null });
    try {
      await axios.put(`/api/cart/${bookId}`, { quantity: newQuantity });
      await get().fetchCart();
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to update quantity', loading: false });
    }
  },

  clearCart: async () => {
    set({ loading: true, error: null });
    try {
      await axios.delete('/api/cart');
      await get().fetchCart();
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to clear cart', loading: false });
    }
  },

  total: () => {
    return get().cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  },

  getCartCount: () => {
    return get().cart.reduce((total, item) => total + item.quantity, 0);
  },
}));

export default useCartStore;