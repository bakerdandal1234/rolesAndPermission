
import React, { useEffect, useState } from 'react';
import axios from '../lib/axios'; // Assuming you have a configured axios instance
import Navbar from '../components/Navbar'; // Adjust the import path as necessary 
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useAuth } from '../context/AuthContext'; // Import useAuth
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose
} from "../components/ui/dialog";
import { Input } from '../components/ui/input';

const AdminPage = () => {
  const { user: currentUser } = useAuth(); // Get the logged-in user from AuthContext
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null); // User being edited
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    permissions: [] as string[],
  });


  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/users');
      setUsers(response.data.users);
    } catch (err: unknown) {
      console.error("Error fetching users:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser({ ...user, permissions: user.permissions || [] }); // Ensure permissions is an array
  };

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

  const handleEditUserSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await axios.put(`/users/${editingUser._id}/role`, {
        role: editingUser.role,
        permissions: editingUser.permissions,
      });
      setEditingUser(null); // Close dialog on successful save
      fetchUsers(); // Refresh the user list
    } catch (err: unknown) {
      console.error("Error updating user:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    }
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/users/${userId}`);
        setUsers((prevUsers: User[]) => prevUsers.filter((user) => user._id !== userId));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err));
      }
    }
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

  const handleCreateUserSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axios.post('/admin/users', newUser);
      setIsCreateDialogOpen(false);
      setNewUser({ name: '', email: '', password: '', role: 'user', permissions: [] });
      fetchUsers(); // Refresh the user list
    } catch (err: unknown) {
      console.error("Error creating user:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    }
  };


  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;

  interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    permissions: string[];
  }

  const canUpdate = currentUser?.permissions?.includes('update');
  const canDelete = currentUser?.permissions?.includes('delete');
  const canCreate = currentUser?.permissions?.includes('write');
  console.log("Current User Permissions:", canCreate);

  return (
    <>
      <div className="w-full px-4 py-8 dark:bg-gray-900 dark:text-white min-h-screen">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold dark:text-white">Admin Dashboard</CardTitle>
            <div className="flex justify-center">
              {canCreate && (
                <Button onClick={() => setIsCreateDialogOpen(true)} className="mt-4">Add User</Button>
              )}
            </div>
            
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden">
                <thead>
                  <tr className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-200 uppercase text-sm leading-normal">
                    <th className="py-3 px-6 text-left">Name</th>
                    <th className="py-3 px-6 text-left">Email</th>
                    <th className="py-3 px-6 text-left">Role</th>
                    <th className="py-3 px-6 text-left">Permissions</th>
                    <th className="py-3 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 dark:text-gray-300 text-sm font-light">
                  {users.map((user: User) => (
                    <React.Fragment key={user._id}>
                      <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
                        <td className="py-3 px-6 text-left whitespace-nowrap">{user.name}</td>
                        <td className="py-3 px-6 text-left">{user.email}</td>
                        <td className="py-3 px-6 text-left">{user.role}</td>
                        <td className="py-3 px-6 text-left">{(user.permissions || []).join(', ')}</td>
                        <td className="py-3 px-6 text-center">
                          <div className="flex item-center justify-center">
                            {canUpdate && (
                              <Dialog open={editingUser?._id === user._id} onOpenChange={(open) => !open && setEditingUser(null)}>
                                <DialogTrigger style={{ padding: "6px 12px",margin:"6px"  }} asChild>
                                  <Button onClick={() => handleEdit(user)} className="mr-2" variant="default">Edit</Button>
                                </DialogTrigger>
                                {editingUser && editingUser._id === user._id && (
                                  <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader >
                                      <DialogTitle>Edit User: {editingUser.name}</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleEditUserSubmit} className="space-y-4 py-4">
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Role</label>
                                        <select
                                          name="role"
                                          value={editingUser.role}
                                          onChange={handleEditUserChange}
                                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                        >
                                          <option value="user">User</option>
                                          <option value="admin">Admin</option>
                                          <option value="superadmin">Superadmin</option>
                                        </select>
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Permissions</label>
                                        <div className="mt-1 space-y-2">
                                          <label className="inline-flex items-center">
                                            <input
                                              type="checkbox"
                                              value="read"
                                              checked={editingUser.permissions.includes('read')}
                                              onChange={handleEditUserPermissionsChange}
                                              className="form-checkbox dark:bg-gray-600 dark:border-gray-500"
                                            />
                                            <span className="ml-2 dark:text-gray-200">Read</span>
                                          </label>
                                           <label className="inline-flex items-center ml-4">
                                            <input
                                              type="checkbox"
                                              value="write"
                                              checked={editingUser.permissions.includes('write')}
                                              onChange={handleEditUserPermissionsChange}
                                              className="form-checkbox dark:bg-gray-600 dark:border-gray-500"
                                            />
                                            <span className="ml-2 dark:text-gray-200">Write</span>
                                          </label>
                                          <label className="inline-flex items-center ml-4">
                                            <input
                                              type="checkbox"
                                              value="update"
                                              checked={editingUser.permissions.includes('update')}
                                              onChange={handleEditUserPermissionsChange}
                                              className="form-checkbox dark:bg-gray-600 dark:border-gray-500"
                                            />
                                            <span className="ml-2 dark:text-gray-200">update</span>
                                          </label>
                                          <label className="inline-flex items-center ml-4">
                                            <input
                                              type="checkbox"
                                              value="delete"
                                              checked={editingUser.permissions.includes('delete')}
                                              onChange={handleEditUserPermissionsChange}
                                              className="form-checkbox dark:bg-gray-600 dark:border-gray-500"
                                            />
                                            <span className="ml-2 dark:text-gray-200">Delete</span>
                                          </label>
                                        </div>
                                      </div>
                                      <DialogFooter>
                                        <Button type="submit">Save Changes</Button>
                                        <DialogClose asChild>
                                          <Button type="button" variant="outline">Cancel</Button>
                                        </DialogClose>
                                      </DialogFooter>
                                    </form>
                                  </DialogContent>
                                )}
                              </Dialog>
                            )}
                            {canDelete && (
                              <Button style={{ padding: "6px 12px",margin:"6px"  }} onClick={() => handleDelete(user._id)} variant="destructive">Delete</Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateUserSubmit} className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Name</label>
                <Input
                  type="text"
                  name="name"
                  value={newUser.name}
                  onChange={handleCreateUserChange}
                  className="mt-1 block w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Email</label>
                <Input
                  type="email"
                  name="email"
                  value={newUser.email}
                  onChange={handleCreateUserChange}
                  className="mt-1 block w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Password</label>
                <Input
                  type="password"
                  name="password"
                  value={newUser.password}
                  onChange={handleCreateUserChange}
                  className="mt-1 block w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Role</label>
                <select
                  name="role"
                  value={newUser.role}
                  onChange={handleCreateUserChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Permissions</label>
                <div className="mt-1 space-y-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      value="read"
                      checked={newUser.permissions.includes('read')}
                      onChange={handleCreateUserPermissionsChange}
                      className="form-checkbox dark:bg-gray-600 dark:border-gray-500"
                    />
                    <span className="ml-2 dark:text-gray-200">Read</span>
                  </label>
                  <label className="inline-flex items-center ml-4">
                    <input
                      type="checkbox"
                      value="write"
                      checked={newUser.permissions.includes('write')}
                      onChange={handleCreateUserPermissionsChange}
                      className="form-checkbox dark:bg-gray-600 dark:border-gray-500"
                    />
                    <span className="ml-2 dark:text-gray-200">Write</span>
                  </label>
                  <label className="inline-flex items-center ml-4">
                    <input
                      type="checkbox"
                      value="update"
                      checked={newUser.permissions.includes('update')}
                      onChange={handleCreateUserPermissionsChange}
                      className="form-checkbox dark:bg-gray-600 dark:border-gray-500"
                    />
                    <span className="ml-2 dark:text-gray-200">Update</span>
                  </label>
                  <label className="inline-flex items-center ml-4">
                    <input
                      type="checkbox"
                      value="delete"
                      checked={newUser.permissions.includes('delete')}
                      onChange={handleCreateUserPermissionsChange}
                      className="form-checkbox dark:bg-gray-600 dark:border-gray-500"
                    />
                    <span className="ml-2 dark:text-gray-200">Delete</span>
                  </label>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create User</Button>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default AdminPage;
