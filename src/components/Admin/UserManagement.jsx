import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import FaceRegistrationModal from '../Face/FaceRegistrationModal';
import API_CONFIG, { apiCall } from '../../config/api';

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showFaceRegistrationModal, setShowFaceRegistrationModal] = useState(false);

  // Fetch all users
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { response, data } = await apiCall(API_CONFIG.ENDPOINTS.USERS, {
        method: 'GET',
      });

      if (response.ok && data.success) {
        // Add face registration status and shift information to each user
        const usersWithStatus = await Promise.all(data.data.map(async (user) => {
          try {
            const faceDescResponse = await apiCall(`${API_CONFIG.ENDPOINTS.FACE_DESCRIPTOR}/${user.id}`, {
              method: 'GET',
            });
            
            // Get shift information if shift_id exists
            let shiftInfo = null;
            if (user.shift_id) {
              try {
                const shiftResponse = await apiCall(API_CONFIG.ENDPOINTS.SHIFT_DETAIL(user.shift_id), {
                  method: 'GET',
                });
                if (shiftResponse.success) {
                  shiftInfo = shiftResponse.data;
                }
              } catch (shiftErr) {
                console.error('Error fetching shift info:', shiftErr);
              }
            }
            
            return {
              ...user,
              faceRegistered: faceDescResponse.success && faceDescResponse.data && faceDescResponse.data.face_descriptor && faceDescResponse.data.face_descriptor.length > 0,
              shift: shiftInfo ? shiftInfo.shift_name : 'Not Assigned'
            };
          } catch (err) {
            // If there's an error fetching face descriptor, assume not registered
            return {
              ...user,
              faceRegistered: false,
              shift: user.shift_id ? 'Unknown Shift' : 'Not Assigned'
            };
          }
        }));
        
        setUsers(usersWithStatus);
      } else {
        setError(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'superadmin')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Access Denied! </strong>
          <span className="block sm:inline">You must be an admin to access this page.</span>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
            <button
              onClick={() => setShowAddUserForm(!showAddUserForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              {showAddUserForm ? 'Cancel' : 'Add User'}
            </button>
            {showFaceRegistrationModal && (
              <FaceRegistrationModal 
                userId={selectedUser?.id}
                userName={selectedUser?.name}
                onClose={() => {
                  setShowFaceRegistrationModal(false);
                  setSelectedUser(null);
                }}
                onRegistrationComplete={fetchUsers}
              />
            )}
          </div>

          {/* Add User Form */}
          {showAddUserForm && <AddUserForm onSuccess={fetchUsers} onCancel={() => setShowAddUserForm(false)} />}

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Name</th>
                  <th className="py-3 px-6 text-left">Email</th>
                  <th className="py-3 px-6 text-left">Shift</th>
                  <th className="py-3 px-6 text-left">Face Reg</th>
                  <th className="py-3 px-6 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm">
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-6 text-left whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-6 text-left">{user.email}</td>
                    <td className="py-3 px-6 text-left">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-800">
                        {user.shift || 'Not Assigned'}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-left">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        user.faceRegistered ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                      }`}>
                        {user.faceRegistered ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-left">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          Edit
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedUser(user);
                            setShowFaceRegistrationModal(true);
                          }}
                          className="text-green-600 hover:text-green-900"
                        >
                          {user.faceRegistered ? 'Update Face' : 'Register Face'}
                        </button>
                        <button 
                          onClick={() => navigate(`/employee/${user.id}`)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Preview
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No users found. Add a user to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Add User Form Component
const AddUserForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { response, data } = await apiCall(API_CONFIG.ENDPOINTS.REGISTER, {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (response.ok && data.success) {
        setFormData({ name: '', email: '', password: '', role: 'user' });
        onSuccess();
        alert('User added successfully!');
      } else {
        setError(data.message || 'Failed to add user');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error adding user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
      <h2 className="text-xl font-semibold mb-4">Add New User</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="name">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="role">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex space-x-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add User'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserManagement;