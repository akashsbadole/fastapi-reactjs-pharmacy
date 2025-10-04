import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { api, endpoints } from '../../services/api';
import { useSettings } from '../../contexts/SettingsContext';
import {
  UserPlusIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  UserIcon,
  EyeIcon,
  DocumentTextIcon,
  CreditCardIcon,
  CubeIcon,
  ChartBarIcon,
  CogIcon,
} from '@heroicons/react/24/outline';

const UserRolesSettings = ({ onSettingsChange, onSave }) => {
  const { users, updateSettings, fetchSettings, isLoading } = useSettings() || {};
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [userList, setUserList] = useState([]);

  // Form states
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    role: 'cashier',
    is_active: true,
  });

  // Initialize role permissions state
  const [rolePermissions, setRolePermissions] = useState({});

  useEffect(() => {
    // Fetch users settings if not already loaded
    if (!users || !users.roles || !users.permissions) {
      fetchSettings('users');
    }
    // Fetch users list
    fetchUsers();
  }, []);

  // Fetch users list
  const fetchUsers = async () => {
    try {
      const response = await api.get(endpoints.SETTINGS.USERS_LIST);
      setUserList(response.data);
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to fetch users';
      toast.error(errorMessage);
      console.error('Error fetching users:', error);
    }
  };

  // Get roles and permissions from settings or use defaults
  const roles = users?.roles || [
    { id: 1, name: 'admin', description: 'Full system access' },
    { id: 2, name: 'pharmacist', description: 'Can manage prescriptions and inventory' },
    { id: 3, name: 'cashier', description: 'Can process sales and manage billing' },
    { id: 4, name: 'accountant', description: 'Can access financial reports' },
  ];

  const permissions = users?.permissions || [
    { id: 1, name: 'view_dashboard', description: 'View Dashboard', category: 'General' },
    { id: 2, name: 'view_patients', description: 'View Patients', category: 'Patients' },
    { id: 3, name: 'add_patients', description: 'Add Patients', category: 'Patients' },
    { id: 4, name: 'edit_patients', description: 'Edit Patients', category: 'Patients' },
    { id: 5, name: 'delete_patients', description: 'Delete Patients', category: 'Patients' },
    { id: 6, name: 'view_inventory', description: 'View Inventory', category: 'Inventory' },
    { id: 7, name: 'add_medicines', description: 'Add Medicines', category: 'Inventory' },
    { id: 8, name: 'edit_medicines', description: 'Edit Medicines', category: 'Inventory' },
    { id: 9, name: 'delete_medicines', description: 'Delete Medicines', category: 'Inventory' },
    { id: 10, name: 'view_prescriptions', description: 'View Prescriptions', category: 'Prescriptions' },
    { id: 11, name: 'create_prescriptions', description: 'Create Prescriptions', category: 'Prescriptions' },
    { id: 12, name: 'view_billing', description: 'View Billing', category: 'Billing' },
    { id: 13, name: 'create_invoices', description: 'Create Invoices', category: 'Billing' },
    { id: 14, name: 'process_payments', description: 'Process Payments', category: 'Billing' },
    { id: 15, name: 'view_reports', description: 'View Reports', category: 'Reports' },
    { id: 16, name: 'manage_users', description: 'Manage Users', category: 'Admin' },
    { id: 17, name: 'manage_settings', description: 'Manage Settings', category: 'Admin' },
  ];

  // Initialize role permissions when users settings are loaded
  useEffect(() => {
    if (users?.roles && users?.permissions) {
      const initialRolePermissions = {};
      users.roles.forEach(role => {
        initialRolePermissions[role.name] = {};
        users.permissions.forEach(permission => {
          // Check if permission is already set for this role
          if (permission[role.name] !== undefined) {
            initialRolePermissions[role.name][permission.id] = permission[role.name];
          } else {
            // Set default permissions based on role
            if (role.name === 'admin') {
              initialRolePermissions[role.name][permission.id] = true;
            } else if (role.name === 'pharmacist') {
              initialRolePermissions[role.name][permission.id] =
                !permission.name.includes('delete') &&
                !permission.name.includes('manage_users') &&
                !permission.name.includes('manage_settings');
            } else if (role.name === 'cashier') {
              initialRolePermissions[role.name][permission.id] =
                permission.category === 'Billing' ||
                permission.name === 'view_dashboard' ||
                permission.name === 'view_patients';
            } else if (role.name === 'accountant') {
              initialRolePermissions[role.name][permission.id] =
                permission.category === 'Billing' ||
                permission.category === 'Reports' ||
                permission.name === 'view_dashboard';
            }
          }
        });
      });
      setRolePermissions(initialRolePermissions);
    }
  }, [users]);

  const handleAddUser = async () => {
    // Validate form
    if (!newUser.username.trim()) {
      toast.error('Username is required');
      return;
    }
    if (!newUser.email.trim()) {
      toast.error('Email is required');
      return;
    }
    if (!newUser.full_name.trim()) {
      toast.error('Full name is required');
      return;
    }
    if (!newUser.password.trim()) {
      toast.error('Password is required');
      return;
    }
    if (newUser.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    try {
      setIsSaving(true);
      await api.post(endpoints.SETTINGS.USERS_CREATE, newUser);
      
      // Reset form
      setNewUser({
        username: '',
        email: '',
        full_name: '',
        password: '',
        role: 'cashier',
        is_active: true,
      });
      setShowAddUserModal(false);
      
      // Refresh users list
      fetchUsers();
      fetchSettings('users');
      
      toast.success('User added successfully!');
      onSettingsChange();
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to add user';
      toast.error(errorMessage);
      console.error('Error adding user:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(endpoints.SETTINGS.USER_DELETE(userId));
        
        // Refresh users list
        fetchUsers();
        fetchSettings('users');
        
        toast.success('User deleted successfully!');
        onSettingsChange();
      } catch (error) {
        const errorMessage = error.response?.data?.detail || 'Failed to delete user';
        toast.error(errorMessage);
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      await api.post(endpoints.SETTINGS.USER_TOGGLE_STATUS(userId));
      
      // Refresh users list
      fetchUsers();
      fetchSettings('users');
      
      toast.success('User status updated successfully!');
      onSettingsChange();
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to update user status';
      toast.error(errorMessage);
      console.error('Error toggling user status:', error);
    }
  };

  const handlePermissionChange = (roleName, permissionId, value) => {
    // Create a copy of the current permissions array
    const updatedPermissions = users.permissions.map(permission => {
      if (permission.id === permissionId) {
        // Update the permission for the specific role
        return {
          ...permission,
          [roleName]: value
        };
      }
      return permission;
    });
    
    // Update the settings
    updateSettings('users', { ...users, permissions: updatedPermissions });
    onSettingsChange();
  };

  const handleSaveRolePermissions = async () => {
    try {
      setIsSaving(true);
      await updateSettings('users', users);
      
      toast.success('Role permissions saved successfully!');
      // Notify parent component that settings have been saved
      onSave();
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to save role permissions';
      toast.error(errorMessage);
      console.error('Error saving role permissions:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <ShieldCheckIcon className="h-5 w-5 text-purple-500" />;
      case 'pharmacist':
        return <UserIcon className="h-5 w-5 text-blue-500" />;
      case 'cashier':
        return <CreditCardIcon className="h-5 w-5 text-green-500" />;
      case 'accountant':
        return <ChartBarIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <CogIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'General':
        return <EyeIcon className="h-4 w-4 text-gray-400" />;
      case 'Patients':
        return <UserIcon className="h-4 w-4 text-gray-400" />;
      case 'Inventory':
        return <CubeIcon className="h-4 w-4 text-gray-400" />;
      case 'Prescriptions':
        return <DocumentTextIcon className="h-4 w-4 text-gray-400" />;
      case 'Billing':
        return <CreditCardIcon className="h-4 w-4 text-gray-400" />;
      case 'Reports':
        return <ChartBarIcon className="h-4 w-4 text-gray-400" />;
      case 'Admin':
        return <CogIcon className="h-4 w-4 text-gray-400" />;
      default:
        return <CogIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">User & Role Management</h2>
        <p className="text-sm text-gray-500 mb-6">
          Manage users, roles, and permissions for your pharmacy system.
        </p>
      </div>

      {/* Users Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-medium text-gray-900">Users</h3>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <UserPlusIcon className="h-4 w-4 mr-1" />
              Add User
            </button>
          </div>

          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userList.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getRoleIcon(user.role)}
                        <span className="ml-2 text-sm text-gray-900 capitalize">{user.role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleToggleUserStatus(user.id)}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                      >
                        {user.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Role Permissions Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-medium text-gray-900">Role Permissions</h3>
            <button
              onClick={handleSaveRolePermissions}
              disabled={isSaving}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Permissions'}
            </button>
          </div>

          <div className="space-y-6">
            {roles.map((role) => (
              <div key={role.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  {getRoleIcon(role.name)}
                  <div className="ml-2">
                    <h4 className="text-sm font-medium text-gray-900 capitalize">{role.name}</h4>
                    <p className="text-xs text-gray-500">{role.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(
                    permissions.reduce((acc, permission) => {
                      if (!acc[permission.category]) {
                        acc[permission.category] = [];
                      }
                      acc[permission.category].push(permission);
                      return acc;
                    }, {})
                  ).map(([category, categoryPermissions]) => (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center">
                        {getCategoryIcon(category)}
                        <span className="ml-1 text-xs font-medium text-gray-700">{category}</span>
                      </div>
                      {categoryPermissions.map((permission) => (
                        <label key={permission.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={rolePermissions[role.name]?.[permission.id] || false}
                            onChange={(e) => handlePermissionChange(role.name, permission.id, e.target.checked)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-xs text-gray-600">{permission.description}</span>
                        </label>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Add New User
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                          Username
                        </label>
                        <input
                          type="text"
                          id="username"
                          value={newUser.username}
                          onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="full_name"
                          value={newUser.full_name}
                          onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                          Password
                        </label>
                        <input
                          type="password"
                          id="password"
                          value={newUser.password}
                          onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                          Role
                        </label>
                        <select
                          id="role"
                          value={newUser.role}
                          onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        >
                          <option value="admin">Admin</option>
                          <option value="pharmacist">Pharmacist</option>
                          <option value="cashier">Cashier</option>
                          <option value="accountant">Accountant</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleAddUser}
                  disabled={isSaving}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {isSaving ? 'Adding...' : 'Add User'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRolesSettings;