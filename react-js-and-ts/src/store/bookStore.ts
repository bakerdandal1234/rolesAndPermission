import { create } from 'zustand';
import axios from '../lib/axios';
import type { Book } from '../types/book';

interface BookState {
  books: Book[];
  loading: boolean;
  error: string | null;
  getBooks: () => Promise<void>;
  createBook: (bookData: FormData) => Promise<boolean>;
  updateBook: (bookId: string, bookData: FormData) => Promise<boolean>;
  deleteBook: (bookId: string) => Promise<void>;
}

export const useBookStore = create<BookState>((set, get) => ({
  books: [],
  loading: false,
  error: null,

  getBooks: async () => {
    try {
      set({ loading: true, error: null });
      const res = await axios.get('/api/books');
      set({ books: res.data, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch books', loading: false });
    }
  },

  createBook: async (formData) => {
    try {
      set({ loading: true, error: null });
      await axios.post('/api/books', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      await get().getBooks(); // Refresh the book list
      set({ loading: false });
      return true;
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to create book', loading: false });
      return false;
    }
  },

  updateBook: async (bookId, formData) => {
    try {
      set({ loading: true, error: null });
      const response = await axios.put(`/api/books/${bookId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const updatedBook = response.data;

      set((state) => ({
        books: state.books.map((b) => (b._id === updatedBook._id ? updatedBook : b)),
        loading: false,
      }));
      return true;
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to update book', loading: false });
      return false;
    }
  },

  deleteBook: async (bookId) => {
    try {
      set({ loading: true, error: null });
      await axios.delete(`/api/books/${bookId}`);
      await get().getBooks(); // Refresh the book list
      set({ loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to delete book', loading: false });
    }
  },
}));
