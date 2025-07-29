import { create } from 'zustand';
import type { Book, CartItem } from '../types/book';

interface CartState {
  cart: CartItem[];
  addToCart: (book: Book, quantity: number, selectedImage?: string) => void;
  removeFromCart: (bookId: string) => void;
  updateQuantity: (bookId: string, newQuantity: number) => void;
  clearCart: () => void;
  total: () => number;
  getCartCount: () => number;
}

const useCartStore = create<CartState>((set, get) => ({
  cart: [],

  addToCart: (book: Book, quantity: number, selectedImage?: string) =>
    set((state) => {
      const existing = state.cart.find((item) => item._id === book._id);
      if (existing) {
        return {
          cart: state.cart.map((item) =>
            item._id === book._id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      } else {
        return {
          cart: [...state.cart, { ...book, quantity, selectedImage }],
        };
      }
    }),

  removeFromCart: (bookId: string) =>
    set((state) => ({
      cart: state.cart.filter((item) => item._id !== bookId),
    })),

  updateQuantity: (bookId: string, newQuantity: number) =>
    set((state) => ({
      cart: state.cart
        .map((item) => {
          if (item._id === bookId) {
            const maxQuantity = item.stock || Infinity;
            const quantity = Math.min(Math.max(1, newQuantity), maxQuantity);
            return { ...item, quantity };
          }
          return item;
        })
        .filter((item) => item.quantity > 0),
    })),

  clearCart: () => set({ cart: [] }),

  total: () => {
    const state = get();
    return state.cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  },
  getCartCount: () => {
    return get().cart.reduce((total, item) => total + item.quantity, 0);
  },
}));

export default useCartStore;
