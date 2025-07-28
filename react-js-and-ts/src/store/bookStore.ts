import { create } from 'zustand';
import axios from '../lib/axios';
import type { Book } from '../types/book';

interface BookState {
  books: Book[];
  loading: boolean;
  error: string | null;
  getBooks: () => Promise<void>;
  createBook: (bookData: { title: string; author: string; summary: string; price: number; image?: File ;stock: number}) => Promise<boolean>;
  updateBook: (book: Book) => Promise<boolean>;
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

  createBook: async (bookData) => {
    try {
      set({ loading: true, error: null });
      const formData = new FormData();
      formData.append('title', bookData.title);
      formData.append('author', bookData.author);
      formData.append('summary', bookData.summary);
      formData.append('price', bookData.price.toString());
      formData.append('stock', bookData.stock.toString());
      if (bookData.image) {
        formData.append('image', bookData.image);
      }
      await axios.post('/api/books', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      await get().getBooks(); // Refresh the book list
      set({ loading: false });
      return true;
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to create book', loading: false });
      return false;
    }
  },

  updateBook: async (book) => {
    try {
      console.log(book);
      set({ loading: true, error: null });
      const formData = new FormData();
      formData.append('title', book.title);
      formData.append('author', book.author);
      formData.append('summary', book.summary);
      formData.append('price', book.price.toString());
      formData.append('stock', book.stock.toString());

      // Only append the image if it's a File object (i.e., a new image has been selected)
      if (book.image instanceof File) {
        formData.append('image', book.image);
      }

      const response = await axios.put(`/api/books/${book._id}`, formData, {
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
