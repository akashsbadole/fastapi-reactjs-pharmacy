import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { authAPI, endpoints } from '../../services/api';
import {
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  ClockIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import Loader from '../../components/Loader';

const Users = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const { data: users, isLoading } = useQuery(
    'users',
    () => authAPI.get(endpoints.AUTH.USERS).then(res => res.data),
    {
      refetchOnWindowFocus: false,
    }
  );

  const filteredUsers = users?.filter(user => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  }) || [];

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'cashier':
        return 'bg-blue-100 text-blue-800';
      case 'pharmacist':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <ShieldCheckIcon className="h-4 w-4 text-red-500" />;
      case 'cashier':
        return <ClockIcon className="h-4 w-4 text-blue-500" />;
      case 'pharmacist':
        return <ShieldCheckIcon className="h-4 w-4 text-green-500" />;
      default:
        return <UserGroupIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage system users and permissions.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            to="/app/users/create"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add User
          </Link>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700">
            Search
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              name="search"
              id="search"
              className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search by name, email, or username"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            Role
          </label>
          <select
            id="role"
            name="role"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="admin">Administrator</option>
            <option value="cashier">Cashier</option>
            <option value="pharmacist">Pharmacist</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      User
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Role
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Last Login
                    </th>
                    <th
                      scope="col"
                      className="relative px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center">
                        <Loader text="Loading users..." />
                      </td>
                    </tr>
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                <span className="text-primary-800 font-medium">
                                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.full_name || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500">
                                @{user.username || 'unknown'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getRoleIcon(user.role)}
                            <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role)}`}>
                              {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Unknown'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(user.status)}`}>
                            {user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Link
                              to={`/app/users/${user.id}`}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              View
                            </Link>
                            <Link
                              to={`/app/users/${user.id}/edit`}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              Edit
                            </Link>
                            <button className="text-gray-600 hover:text-gray-900">
                              <EllipsisVerticalIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;