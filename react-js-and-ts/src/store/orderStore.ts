import { create } from 'zustand';
import axios from '../lib/axios';
import type { Book } from '../types/book';

interface OrderItem {
  book: Book;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  _id: string;
  user: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: string;
  paidAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  fetchMyOrders: () => Promise<void>;
  createOrder: (orderData: { shippingAddress: Order['shippingAddress']; paymentMethod: string }) => Promise<Order | null>;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  loading: false,
  error: null,

  fetchMyOrders: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get('/api/orders/myorders');
      set({ orders: response.data, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch orders', loading: false });
    }
  },

  createOrder: async (orderData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post('/api/orders', orderData);
      set((state) => ({
        orders: [...state.orders, response.data],
        loading: false,
      }));
      return response.data;
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to create order', loading: false });
      return null;
    }
  },
}));
