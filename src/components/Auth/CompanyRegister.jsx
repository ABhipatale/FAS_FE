import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Building2,
  Mail,
  MapPin,
  Phone,
  User,
  Lock,
  CheckCircle,
  AlertCircle
} from "lucide-react";

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

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.company_name.trim()) newErrors.company_name = 'Company name is required';
    if (!formData.company_email.trim()) newErrors.company_email = 'Company email is required';
    if (formData.company_email && !/\S+@\S+\.\S+/.test(formData.company_email)) {
      newErrors.company_email = 'Invalid email format';
    }
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
        headers: { 'Content-Type': 'application/json' },
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
        setTimeout(() => navigate('/login'), 3000);
      } else {
        if (data.errors) {
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
    <div className="relative min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 overflow-hidden">

      {/* 🌆 Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab')",
          animation: "bgZoom 30s ease-in-out infinite alternate"
        }}
      />

      {/* Awwwards Giant Background Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none z-0">
        <h1 className="text-[14vw] font-black uppercase tracking-widest text-white/50 leading-none">
          Company
        </h1>
        <p className="max-w-xl mt-6 text-sm md:text-base text-white px-6">
          Build, manage, and scale your organization with a secure and modern workspace.
        </p>
      </div>


      {/* 🎨 Gradient Overlay */}
      {/* <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-indigo-950/80 to-slate-900/95 backdrop-blur-[2px]" /> */}

      {/* 🔑 Page Content */}
      <div className="relative z-10 m-4">

        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-bold text-blue-950">
            Register Your Company
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Build your organization and assign your first administrator.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white/95 backdrop-blur p-8 shadow-2xl rounded-2xl">

            {successMessage && (
              <div className="mb-4 rounded-lg bg-emerald-100 p-4 flex items-center gap-2 text-emerald-700">
                <CheckCircle size={18} /> {successMessage}
              </div>
            )}

            {errors.general && (
              <div className="mb-4 rounded-lg bg-rose-100 p-4 flex items-center gap-2 text-rose-700">
                <AlertCircle size={18} /> {errors.general}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Company Information */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Building2 size={18} /> Company Information
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <Building2 size={16} /> Company Name *
                    </label>
                    <input
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${errors.company_name ? 'border-rose-300' : 'border-slate-300'} rounded-lg focus:ring-2 focus:ring-indigo-400`}
                    />
                    {errors.company_name && <p className="text-rose-600 text-sm">{errors.company_name}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <Mail size={16} /> Company Email *
                    </label>
                    <input
                      name="company_email"
                      type="email"
                      value={formData.company_email}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${errors.company_email ? 'border-rose-300' : 'border-slate-300'} rounded-lg focus:ring-2 focus:ring-indigo-400`}
                    />
                    {errors.company_email && <p className="text-rose-600 text-sm">{errors.company_email}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <MapPin size={16} /> Company Address
                    </label>
                    <textarea
                      name="company_address"
                      rows="2"
                      value={formData.company_address}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <Phone size={16} /> Phone Number
                    </label>
                    <input
                      name="company_phone"
                      value={formData.company_phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                </div>
              </div>
              {/* Admin Section */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <User size={18} /> Admin User Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <User size={16} /> Admin Name *
                    </label>
                    <input
                      name="admin_name"
                      value={formData.admin_name}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${errors.admin_name ? 'border-rose-300' : 'border-slate-300'} rounded-lg focus:ring-2 focus:ring-indigo-400`}
                    />
                    {errors.admin_name && <p className="text-rose-600 text-sm">{errors.admin_name}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <Mail size={16} /> Admin Email *
                    </label>
                    <input
                      name="admin_email"
                      type="email"
                      value={formData.admin_email}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${errors.admin_email ? 'border-rose-300' : 'border-slate-300'} rounded-lg focus:ring-2 focus:ring-indigo-400`}
                    />
                    {errors.admin_email && <p className="text-rose-600 text-sm">{errors.admin_email}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <Lock size={16} /> Password *
                    </label>
                    <input
                      name="admin_password"
                      type="password"
                      value={formData.admin_password}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${errors.admin_password ? 'border-rose-300' : 'border-slate-300'} rounded-lg focus:ring-2 focus:ring-indigo-400`}
                    />
                    {errors.admin_password && <p className="text-rose-600 text-sm">{errors.admin_password}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <Lock size={16} /> Confirm Password *
                    </label>
                    <input
                      name="confirm_password"
                      type="password"
                      value={formData.confirm_password}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${errors.confirm_password ? 'border-rose-300' : 'border-slate-300'} rounded-lg focus:ring-2 focus:ring-indigo-400`}
                    />
                    {errors.confirm_password && <p className="text-rose-600 text-sm">{errors.confirm_password}</p>}
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition disabled:opacity-50"
              >
                {loading ? 'Registering...' : 'Register Company'}
              </button>
            </form>
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/login')}
                className="text-indigo-600 hover:underline text-sm"
              >
                Sign in to existing account
              </button>

            </div>

          </div>
        </div>
      </div>

      {/* 🎬 Inline Keyframes (no external CSS needed) */}
      <style>
        {`
          @keyframes bgZoom {
            0% { transform: scale(1.1); }
            100% { transform: scale(1.25); }
          }
        `}
      </style>
    </div>
  );
};

export default CompanyRegister;
