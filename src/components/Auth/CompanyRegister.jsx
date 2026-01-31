import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const CompanyRegister = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    company_name: '',
    company_email: '',
    company_address: '',
    company_phone: '',
    admin_name: '',
    admin_email: '',
    admin_password: '',
    confirm_password: '',
    role: 'admin'
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Company validation
    if (!formData.company_name.trim()) newErrors.company_name = 'Company name is required';
    if (!formData.company_email.trim()) newErrors.company_email = 'Company email is required';
    if (formData.company_email && !/\S+@\S+\.\S+/.test(formData.company_email)) {
      newErrors.company_email = 'Invalid email format';
    }
    
    // Admin validation
    if (!formData.admin_name.trim()) newErrors.admin_name = 'Admin name is required';
    if (!formData.admin_email.trim()) newErrors.admin_email = 'Admin email is required';
    if (formData.admin_email && !/\S+@\S+\.\S+/.test(formData.admin_email)) {
      newErrors.admin_email = 'Invalid email format';
    }
    if (!formData.admin_password) newErrors.admin_password = 'Password is required';
    if (formData.admin_password && formData.admin_password.length < 6) {
      newErrors.admin_password = 'Password must be at least 6 characters';
    }
    if (formData.admin_password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setErrors({});
    setSuccessMessage('');
    
    try {
      const response = await fetch('http://localhost:8000/api/companies/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_name: formData.company_name,
          company_email: formData.company_email,
          company_address: formData.company_address,
          company_phone: formData.company_phone,
          admin_name: formData.admin_name,
          admin_email: formData.admin_email,
          admin_password: formData.admin_password,
          role: formData.role
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSuccessMessage('Company registered successfully! You can now log in with your admin credentials.');
        // Reset form
        setFormData({
          company_name: '',
          company_email: '',
          company_address: '',
          company_phone: '',
          admin_name: '',
          admin_email: '',
          admin_password: '',
          confirm_password: '',
          role: 'admin'
        });
        
        // Auto redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        if (data.errors) {
          // Handle validation errors from backend
          const backendErrors = {};
          Object.keys(data.errors).forEach(key => {
            backendErrors[key] = data.errors[key][0];
          });
          setErrors(backendErrors);
        } else {
          setErrors({ general: data.message || 'Registration failed' });
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Register Your Company
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Create your company account and admin user
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {successMessage && (
            <div className="mb-4 rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">{successMessage}</h3>
                </div>
              </div>
            </div>
          )}
          
          {errors.general && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{errors.general}</h3>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Company Information Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
                    Company Name *
                  </label>
                  <input
                    id="company_name"
                    name="company_name"
                    type="text"
                    required
                    value={formData.company_name}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.company_name ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                  {errors.company_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.company_name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="company_email" className="block text-sm font-medium text-gray-700">
                    Company Email *
                  </label>
                  <input
                    id="company_email"
                    name="company_email"
                    type="email"
                    required
                    value={formData.company_email}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.company_email ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                  {errors.company_email && (
                    <p className="mt-1 text-sm text-red-600">{errors.company_email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="company_address" className="block text-sm font-medium text-gray-700">
                    Company Address
                  </label>
                  <textarea
                    id="company_address"
                    name="company_address"
                    rows="2"
                    value={formData.company_address}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="company_phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    id="company_phone"
                    name="company_phone"
                    type="tel"
                    value={formData.company_phone}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Admin User Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Admin User Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="admin_name" className="block text-sm font-medium text-gray-700">
                    Admin Name *
                  </label>
                  <input
                    id="admin_name"
                    name="admin_name"
                    type="text"
                    required
                    value={formData.admin_name}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.admin_name ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                  {errors.admin_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.admin_name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="admin_email" className="block text-sm font-medium text-gray-700">
                    Admin Email *
                  </label>
                  <input
                    id="admin_email"
                    name="admin_email"
                    type="email"
                    required
                    value={formData.admin_email}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.admin_email ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                  {errors.admin_email && (
                    <p className="mt-1 text-sm text-red-600">{errors.admin_email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="admin_password" className="block text-sm font-medium text-gray-700">
                    Password *
                  </label>
                  <input
                    id="admin_password"
                    name="admin_password"
                    type="password"
                    required
                    value={formData.admin_password}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.admin_password ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                  {errors.admin_password && (
                    <p className="mt-1 text-sm text-red-600">{errors.admin_password}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
                    Confirm Password *
                  </label>
                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    required
                    value={formData.confirm_password}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.confirm_password ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  />
                  {errors.confirm_password && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirm_password}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Registering...' : 'Register Company'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => navigate('/login')}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign in to existing account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyRegister;