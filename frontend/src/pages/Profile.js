import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api, endpoints } from '../services/api';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  LockClosedIcon,
  KeyIcon,
  DocumentTextIcon,
  ClockIcon,
  CameraIcon,
  ShieldCheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

const Profile = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const { data: user, isLoading } = useQuery(
    'user-profile',
    () => api.get(endpoints.AUTH.ME).then(res => res.data),
    {
      refetchOnWindowFocus: false,
    }
  );

  // Profile image upload mutation
  const uploadProfileImage = useMutation(
    (file) => {
      const formData = new FormData();
      formData.append('file', file);
      return api.post(endpoints.AUTH.UPLOAD_PROFILE_IMAGE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    {
      onSuccess: (response) => {
        toast.success('Profile image uploaded successfully');
        // Refresh user data
        queryClient.invalidateQueries('user-profile');
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Failed to upload profile image');
      },
    }
  );


  // Change password mutation
  const changePassword = useMutation(
    (passwordData) => api.post(endpoints.AUTH.CHANGE_PASSWORD, passwordData),
    {
      onSuccess: () => {
        toast.success('Password changed successfully');
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: '',
        });
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Failed to change password');
      },
    }
  );

  const tabs = [
    { id: 'personal', name: 'Personal Information', icon: UserIcon },
    { id: 'security', name: 'Security', icon: LockClosedIcon },
    { id: 'activity', name: 'Activity Log', icon: ClockIcon },
  ];

  const handleEdit = () => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      });
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    // In a real implementation, this would make an API call to update the user profile
    console.log('Saving profile:', formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadProfileImage.mutate(file);
    }
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    changePassword.mutate(passwordData);
  };


  if (isLoading) {
    return <Loader text="Loading profile..." />;
  }

  if (!user) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your profile information.
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-red-500">Error loading profile. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your profile information.
        </p>
      </div>

      {/* Profile Header */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-8 sm:p-8">
          <div className="flex items-center">
            <div className="flex-shrink-0 relative">
              {user.profile_image ? (
                <img
                  className="h-16 w-16 rounded-full object-cover"
                  src={user.profile_image.startsWith('http') ? user.profile_image : `http://localhost:8000${user.profile_image}`}
                  alt={user.full_name}
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-800 text-xl font-bold">
                    {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
              )}
              <label className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md cursor-pointer">
                <CameraIcon className="h-4 w-4 text-gray-600" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadProfileImage.isLoading}
                />
              </label>
            </div>
            <div className="ml-5">
              <h2 className="text-lg font-medium text-gray-900">
                {user.full_name || 'N/A'}
              </h2>
              <p className="text-sm text-gray-500">
                @{user.username}
              </p>
              <div className="mt-1">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  user.role === 'admin' ? 'bg-red-100 text-red-800' :
                  user.role === 'cashier' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              </div>
            </div>
            <div className="ml-auto">
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'personal' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      id="full_name"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">
                      {user.full_name || 'N/A'}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      id="email"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">
                      {user.email || 'N/A'}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      id="phone"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">
                      {user.phone || 'N/A'}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  {isEditing ? (
                    <textarea
                      id="address"
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">
                      {user.address || 'N/A'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Update your password to keep your account secure.
                  </p>
                  <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="current_password" className="block text-sm font-medium text-gray-700">
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="current_password"
                        value={passwordData.current_password}
                        onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">
                        New Password
                      </label>
                      <input
                        type="password"
                        id="new_password"
                        value={passwordData.new_password}
                        onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirm_password"
                        value={passwordData.confirm_password}
                        onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <button
                        type="submit"
                        disabled={changePassword.isLoading}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                      >
                        {changePassword.isLoading ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </form>
                </div>

              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
              <div className="flow-root">
                <ul className="-mb-8">
                  <li>
                    <div className="relative pb-8">
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center ring-8 ring-white">
                            <UserIcon className="h-4 w-4 text-white" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              <span className="font-medium text-gray-900">
                                {user.username}
                              </span>{' '}
                              logged in
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                              {new Date().toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            <span className="text-green-600 font-medium">Success</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="relative pb-8">
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center ring-8 ring-white">
                            <DocumentTextIcon className="h-4 w-4 text-white" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              <span className="font-medium text-gray-900">
                                {user.username}
                              </span>{' '}
                              viewed patient list
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                              {new Date(Date.now() - 3600000).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            <span className="text-green-600 font-medium">Success</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="relative pb-8">
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center ring-8 ring-white">
                            <LockClosedIcon className="h-4 w-4 text-white" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              <span className="font-medium text-gray-900">
                                {user.username}
                              </span>{' '}
                              changed password
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                              {new Date(Date.now() - 86400000).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            <span className="text-green-600 font-medium">Success</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;