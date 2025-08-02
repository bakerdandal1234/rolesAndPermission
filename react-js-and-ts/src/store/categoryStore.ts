import { create } from 'zustand';
import axios from '../lib/axios';
import type { Category } from '../types/book';

interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
  getCategories: () => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  loading: false,
  error: null,
  getCategories: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get('/api/categories');
      set({ categories: response.data, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch categories', loading: false });
    }
  },
}));
