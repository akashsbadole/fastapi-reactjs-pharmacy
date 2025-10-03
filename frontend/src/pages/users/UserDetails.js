import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api, { endpoints } from '../../services/api';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`${endpoints.AUTH.USERS}/${id}`);
        setUser(response.data);
      } catch (err) {
        console.error('Error fetching user details:', err);
        setError('Failed to fetch user details');
        toast.error('Failed to fetch user details');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`${endpoints.AUTH.USERS}/${id}`);
        toast.success('User deleted successfully');
        navigate('/users');
      } catch (err) {
        console.error('Error deleting user:', err);
        toast.error('Failed to delete user');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-red-600">User not found</h2>
        <button 
          onClick={() => navigate('/users')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">User Details</h1>
          <div className="space-x-2">
            <button
              onClick={() => navigate('/users')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={() => navigate(`/users/${id}/edit`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">{user.full_name}</h2>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">Username:</span>
                    <span className="ml-2">{user.username}</span>
                  </div>
                  <div>
                    <span className="font-medium">Email:</span>
                    <span className="ml-2">{user.email}</span>
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span>
                    <span className="ml-2">{user.phone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="font-medium">Role:</span>
                    <span className="ml-2">{user.role}</span>
                  </div>
                  <div>
                    <span className="font-medium">Department:</span>
                    <span className="ml-2">{user.department || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Account Status</h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">Status:</span>
                    <span className={`ml-2 ${user.is_active ? 'text-green-600' : 'text-red-600'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Created:</span>
                    <span className="ml-2">{new Date(user.created_at).toLocaleDateString()}</span>
                  </div>
                  {user.last_login && (
                    <div>
                      <span className="font-medium">Last Login:</span>
                      <span className="ml-2">{new Date(user.last_login).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Address</h3>
              <p className="text-gray-700">{user.address || 'No address provided'}</p>
            </div>

            {user.notes && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Notes</h3>
                <p className="text-gray-700">{user.notes}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Activity</h3>
            <div className="text-gray-500">
              <p>No activity data available at this time.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;