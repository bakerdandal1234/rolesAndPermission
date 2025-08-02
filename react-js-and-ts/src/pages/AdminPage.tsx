import React, { useState, useEffect } from 'react';
import axios from '../lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useAuthStore } from '../store/authStore';
import { useBookStore } from '../store/bookStore'; // Import the book store
import { useCategoryStore } from '../store/categoryStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "../components/ui/dialog";
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Book } from '../types/book'; // Import Book type

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
}

// The Book interface is now imported from types/book.ts

const AdminPage = () => {
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();

  // Book state from Zustand store
  const { books, loading: loadingBooks, error: booksError, getBooks, createBook, updateBook, deleteBook } = useBookStore();
  const { categories, getCategories } = useCategoryStore();

  // Dialog states
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user', permissions: [] as string[] });

  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [isCreateBookDialogOpen, setIsCreateBookDialogOpen] = useState(false);
  // Use a more complete state for the new book form
  const [newBook, setNewBook] = useState<{ title: string; author: string; summary: string; price: number; stock: number; media?: File[], category: string }>({ title: '', author: '', summary: '', price: 0, stock: 0, category: '' });


  // --- Queries ---

  // Fetch users
  const { data: users = [], isLoading: loadingUsers, isError: usersError, error: usersFetchError } = useQuery<User[], Error>({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await axios.get('/users');
      return res.data.users;
    }
  });

  // Fetch books using the store
  useEffect(() => {
    getBooks();
    getCategories();
  }, [getBooks, getCategories]);


  // --- Mutations ---

  // Update user role and permissions
  const updateUserMutation = useMutation({
    mutationFn: (user: { _id: string; role: string; permissions: string[] }) =>
      axios.put(`/users/${user._id}/role`, { role: user.role, permissions: user.permissions }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setEditingUser(null);
    }
  });

  // Delete user
  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => axios.delete(`/users/${userId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] })
  });

  // Create user
  const createUserMutation = useMutation({
    mutationFn: (userData: typeof newUser) => axios.post('/admin/users', userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsCreateUserDialogOpen(false);
      setNewUser({ name: '', email: '', password: '', role: 'user', permissions: [] });
    }
  });

  // Book mutations are now handled by the bookStore

  // --- Handlers ---

  // User handlers
  const handleEditUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    updateUserMutation.mutate({
      _id: editingUser._id,
      role: editingUser.role,
      permissions: editingUser.permissions
    });
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUserMutation.mutate(newUser);
  };

  // Book handlers using the store
  const handleEditBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook) return;
    const formData = new FormData();
    formData.append('title', editingBook.title);
    formData.append('author', editingBook.author);
    formData.append('summary', editingBook.summary);
    formData.append('price', editingBook.price.toString());
    formData.append('stock', editingBook.stock.toString());
    formData.append('category', editingBook.category?._id || ''); // Add this line
    if (editingBook.media) {
      editingBook.media.forEach((image) => {
        formData.append('media', image);
      });
    }
    const success = await updateBook(editingBook._id, formData);
    if (success) {
      setEditingBook(null);
    }
  };

  const handleDeleteBook = (bookId: string) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      deleteBook(bookId);
    }
  };

  const handleCreateBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', newBook.title);
    formData.append('author', newBook.author);
    formData.append('summary', newBook.summary);
    formData.append('price', newBook.price.toString());
    formData.append('stock', newBook.stock.toString());
    formData.append('category', newBook.category); // Add this line
    if (newBook.media) {
      newBook.media.forEach((image) => {
        formData.append('media', image);
      });
    }
    const success = await createBook(formData);
    if (success) {
      setIsCreateBookDialogOpen(false);
      setNewBook({ title: '', author: '', summary: '', price: 0, stock: 0, media: undefined,category: '' });
    }
  };

  // Input change handlers
  const handleEditUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditingUser(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleEditUserPermissionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setEditingUser(prev => {
      if (!prev) return null;
      const newPermissions = checked
        ? [...prev.permissions, value]
        : prev.permissions.filter(p => p !== value);
      return { ...prev, permissions: newPermissions };
    });
  };

  const handleCreateUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateUserPermissionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setNewUser(prev => {
      const newPermissions = checked
        ? [...prev.permissions, value]
        : prev.permissions.filter(p => p !== value);
      return { ...prev, permissions: newPermissions };
    });
  };

  const handleEditBookChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const parsedValue = e.target.type === 'number' ? parseInt(value, 10) || 0 : value;
    setEditingBook(prev => prev ? { ...prev, [name]: parsedValue } : null);
  };

  const handleEditBookImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setEditingBook(prev => prev ? { ...prev, media: newFiles } : null);
    }
  };

  const handleCreateBookChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const parsedValue = e.target.type === 'number' ? parseInt(value, 10) || 0 : value;
    setNewBook(prev => ({ ...prev, [name]: parsedValue }));
  };

  const handleCreateBookImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setNewBook(prev => ({ ...prev, media: [...(prev.media || []), ...newFiles] }));
    }
  };

  if (loadingUsers) return <div className="text-center py-8">Loading Users...</div>;
  if (usersError) return <div className="text-center py-8 text-red-500">Error loading users: {usersFetchError?.message}</div>;


  const canUpdate = currentUser?.permissions?.includes('update');
  const canDelete = currentUser?.permissions?.includes('delete');
  const canCreate = currentUser?.permissions?.includes('write');

  return (
    <div className="w-full px-4 py-8 dark:bg-gray-900 dark:text-white min-h-screen space-y-8">
      {/* --- User Management Card --- */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold dark:text-white">User Management</CardTitle>
          {canCreate && (
            <div className="flex justify-center mt-4">
              <Button onClick={() => setIsCreateUserDialogOpen(true)}>Add User</Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-900 rounded-lg shadow-md">
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-200 uppercase text-sm">
                  <th className="py-3 px-6 text-left">Name</th>
                  <th className="py-3 px-6 text-left">Email</th>
                  <th className="py-3 px-6 text-left">Role</th>
                  <th className="py-3 px-6 text-left">Permissions</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 dark:text-gray-300 text-sm">
                {users.map((user) => (
                  <tr key={user._id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <td className="py-3 px-6 text-left">{user.name}</td>
                    <td className="py-3 px-6 text-left">{user.email}</td>
                    <td className="py-3 px-6 text-left">{user.role}</td>
                    <td className="py-3 px-6 text-left">{(user.permissions || []).join(', ')}</td>
                    <td className="py-3 px-6 text-center">
                      <div className="flex item-center justify-center">
                        {canUpdate && <Button onClick={() => setEditingUser(user)} variant="default" className="mr-2">Edit</Button>}
                        {canDelete && <Button onClick={() => handleDeleteUser(user._id)} variant="destructive">Delete</Button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* --- Book Management Card --- */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold dark:text-white">Book Management</CardTitle>
          {canCreate && (
            <div className="flex justify-center mt-4">
              <Button onClick={() => setIsCreateBookDialogOpen(true)}>Add Book</Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {loadingBooks && <div className="text-center py-8">Loading Books...</div>}
          {booksError && <div className="text-center py-8 text-red-500">Error loading books: {booksError}</div>}
          {!loadingBooks && !booksError && (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-gray-900 rounded-lg shadow-md">
                <thead>
                  <tr className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-200 uppercase text-sm">
                    <th className="py-3 px-6 text-left">Image</th>
                    <th className="py-3 px-6 text-left">Title</th>
                    <th className="py-3 px-6 text-left">Author</th>
                    <th className="py-3 px-6 text-left">Summary</th>
                    <th className="py-3 px-6 text-left">Price</th>
                    <th className="py-3 px-6 text-left">stock</th>
                    <th className="py-3 px-6 text-left">Category</th>
                    <th className="py-3 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 dark:text-gray-300 text-sm">
                  {books.map((book) => (
                    <tr key={book._id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
                      <td className="py-3 px-6 text-left">
                        {book.media && book.media.length > 0 && <img src={book.media[0].url} alt={book.title} className="h-16 w-16 object-cover" />}
                      </td>
                      <td className="py-3 px-6 text-left">{book.title}</td>
                      <td className="py-3 px-6 text-left">{book.author}</td>
                      <td className="py-3 px-6 text-left max-w-xs truncate">{book.summary}</td>
                      <td className="py-3 px-6 text-left">{book.price}</td>
                      <td className="py-3 px-6 text-left">{book.stock}</td>
                      <td className="py-3 px-6 text-left">{book.category?.name}</td>
                      <td className="py-3 px-6 text-center">
                        <div className="flex item-center justify-center">
                          {canUpdate && <Button onClick={() => setEditingBook(book)} variant="default" className="mr-2">Edit</Button>}
                          {canDelete && <Button onClick={() => handleDeleteBook(book._id)} variant="destructive">Delete</Button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* --- Dialogs --- */}
      {/* Edit User Dialog */}
      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit User: {editingUser.name}</DialogTitle></DialogHeader>
            <form onSubmit={handleEditUserSubmit} className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium">Role</label>
                <select name="role" value={editingUser.role} onChange={handleEditUserChange} className="w-full p-2 border rounded bg-gray-700 text-white">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Permissions</label>
                {['read', 'write', 'update', 'delete'].map(p => (
                  <div key={p} className="flex items-center">
                    <input type="checkbox" id={`perm-${p}`} value={p} checked={editingUser.permissions.includes(p)} onChange={handleEditUserPermissionsChange} className="mr-2" />
                    <label htmlFor={`perm-${p}`}>{p}</label>
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={updateUserMutation.isPending}>
                  {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
                <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Create User Dialog */}
      <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create New User</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateUserSubmit} className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium">Name</label>
              <Input name="name" value={newUser.name} onChange={handleCreateUserChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium">Email</label>
              <Input name="email" type="email" value={newUser.email} onChange={handleCreateUserChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium">Password</label>
              <Input name="password" type="password" value={newUser.password} onChange={handleCreateUserChange} required />
            </div>
            <div>
                <label className="block text-sm font-medium">Role</label>
                <select name="role" value={newUser.role} onChange={handleCreateUserChange} className="w-full p-2 border rounded bg-gray-700 text-white">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium">Permissions</label>
                {['read', 'write', 'update', 'delete'].map(p => (
                  <div key={p} className="flex items-center">
                    <input type="checkbox" id={`new-perm-${p}`} value={p} checked={newUser.permissions.includes(p)} onChange={handleCreateUserPermissionsChange} className="mr-2" />
                    <label htmlFor={`new-perm-${p}`}>{p}</label>
                  </div>
                ))}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createUserMutation.isPending}>
                {createUserMutation.isPending ? 'Creating...' : 'Create User'}
              </Button>
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Book Dialog */}
      {editingBook && (
        <Dialog open={!!editingBook} onOpenChange={(open) => !open && setEditingBook(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Book: {editingBook.title}</DialogTitle></DialogHeader>
            <form onSubmit={handleEditBookSubmit} className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium">Title</label>
                <Input name="title" value={editingBook.title} onChange={handleEditBookChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium">Author</label>
                <Input name="author" value={editingBook.author} onChange={handleEditBookChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium">Summary</label>
                <Textarea name="summary" value={editingBook.summary} onChange={handleEditBookChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium">Price</label>
                <Input name="price" type="number" value={editingBook.price} onChange={handleEditBookChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium">Stock</label>
                <Input name="stock" type="number" value={editingBook.stock || 0} onChange={handleEditBookChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium">Category</label>
                <select name="category" value={editingBook.category?._id} onChange={handleEditBookChange} className="w-full p-2 border rounded bg-gray-700 text-white">
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>{category.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Images</label>
                <input name="media" type="file" multiple onChange={handleEditBookImageChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" />
                {editingBook.media && editingBook.media.length > 0 && (
                  <div className="flex flex-wrap mt-2">
                    {editingBook.media.map((img, index) => (
                      <img key={index} src={typeof img === 'string' ? img : ('url' in img ? img.url : URL.createObjectURL(img))} alt={`Current ${index}`} className="h-16 w-16 object-cover mr-2 mb-2" />
                    ))}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={loadingBooks}>
                  {loadingBooks ? 'Saving...' : 'Save Changes'}
                </Button>
                <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Book Dialog */}
      <Dialog open={isCreateBookDialogOpen} onOpenChange={setIsCreateBookDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create New Book</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateBookSubmit} className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium">Title</label>
              <Input name="title" value={newBook.title} onChange={handleCreateBookChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium">Author</label>
              <Input name="author" value={newBook.author} onChange={handleCreateBookChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium">Summary</label>
              <Textarea name="summary" value={newBook.summary} onChange={handleCreateBookChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium">Price</label>
              <Input name="price" type="number" value={newBook.price} onChange={handleCreateBookChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium">Stock</label>
              <Input name="stock" type="number" value={newBook.stock} onChange={handleCreateBookChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium">Category</label>
              <select name="category" value={newBook.category} onChange={handleCreateBookChange} className="w-full p-2 border rounded bg-gray-700 text-white">
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Images</label>
              <input name="media" type="file" multiple onChange={handleCreateBookImageChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loadingBooks}>
                {loadingBooks ? 'Creating...' : 'Create Book'}
              </Button>
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;
