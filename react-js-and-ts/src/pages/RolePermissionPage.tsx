
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

interface Permission {
  id: string;
  name: string;
}

interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

const initialRoles: Role[] = [
  {
    id: '1',
    name: 'Admin',
    permissions: [
      { id: 'p1', name: 'manage_users' },
      { id: 'p2', name: 'manage_roles' },
      { id: 'p3', name: 'view_reports' },
    ],
  },
  {
    id: '2',
    name: 'Editor',
    permissions: [
      { id: 'p4', name: 'create_content' },
      { id: 'p5', name: 'edit_content' },
    ],
  },
  {
    id: '3',
    name: 'Viewer',
    permissions: [{ id: 'p6', name: 'view_content' }],
  },
];

const RolePermissionPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [newRoleName, setNewRoleName] = useState<string>('');
  const [newPermissionName, setNewPermissionName] = useState<string>('');
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  const handleAddRole = () => {
    if (newRoleName.trim() === '') return;
    const newRole: Role = {
      id: String(roles.length + 1),
      name: newRoleName.trim(),
      permissions: [],
    };
    setRoles([...roles, newRole]);
    setNewRoleName('');
  };

  const handleAddPermissionToRole = () => {
    if (!selectedRoleId || newPermissionName.trim() === '') return;

    setRoles((prevRoles) =>
      prevRoles.map((role) =>
        role.id === selectedRoleId
          ? {
              ...role,
              permissions: [
                ...role.permissions,
                { id: `p${role.permissions.length + 1}`, name: newPermissionName.trim() },
              ],
            }
          : role
      )
    );
    setNewPermissionName('');
  };

  const handleDeleteRole = (roleId: string) => {
    setRoles((prevRoles) => prevRoles.filter((role) => role.id !== roleId));
    if (selectedRoleId === roleId) {
      setSelectedRoleId(null);
    }
  };

  const handleDeletePermission = (roleId: string, permissionId: string) => {
    setRoles((prevRoles) =>
      prevRoles.map((role) =>
        role.id === roleId
          ? {
              ...role,
              permissions: role.permissions.filter(
                (permission) => permission.id !== permissionId
              ),
            }
          : role
      )
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Role and Permission Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Role Management */}
        <Card>
          <CardHeader>
            <CardTitle>Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className="flex justify-between items-center p-2 border rounded-md"
                >
                  <span
                    className={`cursor-pointer ${selectedRoleId === role.id ? 'font-semibold' : ''}`}
                    onClick={() => setSelectedRoleId(role.id)}
                  >
                    {role.name}
                  </span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteRole(role.id)}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-4 flex space-x-2">
              <Input
                placeholder="New Role Name"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
              />
              <Button onClick={handleAddRole}>Add Role</Button>
            </div>
          </CardContent>
        </Card>

        {/* Permission Management */}
        <Card>
          <CardHeader>
            <CardTitle>Permissions for {selectedRoleId ? roles.find(r => r.id === selectedRoleId)?.name : 'Select a Role'}</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedRoleId ? (
              <div className="space-y-4">
                {roles.find((r) => r.id === selectedRoleId)?.permissions.map((permission) => (
                  <div
                    key={permission.id}
                    className="flex justify-between items-center p-2 border rounded-md"
                  >
                    <span>{permission.name}</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeletePermission(selectedRoleId, permission.id)}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
                <div className="mt-4 flex space-x-2">
                  <Input
                    placeholder="New Permission Name"
                    value={newPermissionName}
                    onChange={(e) => setNewPermissionName(e.target.value)}
                  />
                  <Button onClick={handleAddPermissionToRole}>Add Permission</Button>
                </div>
              </div>
            ) : (
              <p>Select a role from the left to manage its permissions.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RolePermissionPage;
