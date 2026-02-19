import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import API_CONFIG, { apiCall } from '../../config/api';
import { Mail, Lock, UserCircle } from 'lucide-react';
import gsap from 'gsap';

export default function EmployeeLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const bgRef = useRef(null);

  // 🎥 Subtle 3D floating background animation
  useEffect(() => {
    if (bgRef.current) {
      gsap.to(bgRef.current, {
        scale: 1.1,
        duration: 20,
        ease: "none",
        repeat: -1,
        yoyo: true
      });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(email, password);
      
      if (result.success) {
        const token = localStorage.getItem('authToken');
        if (token) {
          const { response, data } = await apiCall(API_CONFIG.ENDPOINTS.ME, {
            method: 'GET',
          });
          
          if (response.ok && data.success && data.data) {
            const userRole = data.data.user.role;
            if (userRole === 'employee' || userRole === '3') {
              navigate('/face-attendance');
            } else {
              navigate('/dashboard');
            }
          } else {
            navigate('/dashboard');
          }
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* 🌆 Background Image */}
      <div
        ref={bgRef}
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2070&auto=format&fit=crop')"
        }}
      />

      {/* 🎨 Gradient Overlay */}
      {/* <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-indigo-950/80 to-slate-900/90 backdrop-blur-[2px]" /> */}

      {/* 🔤 Giant Background Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <h1 className="text-[14vw] font-black uppercase tracking-widest text-white/5">
          Employee
        </h1>
      </div>

      {/* 🔑 Login Card */}
      <div className="relative z-10 bg-white/95 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20 m-4">
        <div className="text-center mb-8">
          <div className="mx-auto bg-blue-950 text-white w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <UserCircle size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Employee Login</h1>
          <p className="text-slate-500 mt-2">Face Attendance System</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <Mail size={16}/> Email Address testinggggg
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              placeholder="Enter your email"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <Lock size={16}/> Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-950 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-indigo-600 hover:text-indigo-500 text-sm font-medium">
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
}
