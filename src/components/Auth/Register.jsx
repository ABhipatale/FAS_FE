import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import FloatingParticles from "../3D/FloatingParticles";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const { success, message: responseMessage } = await register(
      formData.name,
      formData.email,
      formData.password
    );

    if (success) {
      setMessage(responseMessage);
      // Redirect to login after successful registration
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } else {
      setError(responseMessage);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020c1d] p-4">
      <FloatingParticles/>
       <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none">
        <h1 className="text-[4vw] mb-[74vh] font-extrabold uppercase tracking-widest text-white/40 sm:top-0">
          Let's Register first!
        </h1>
        <p className="max-w-xl mt-10 text-sm md:text-base text-white/30">
          Create your account and start building your workspace in seconds.
        </p>
      </div>


      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mt-14">
        <h2 className="text-2xl font-bold text-center mb-6 uppercase">Register</h2>

        {/* Success/Error Messages */}
        {message && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="Enter full name"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="Enter email address"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="Enter password"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="Confirm password"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded transition ${loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="mt-4 text-center space-y-2">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:underline">
              Login here
            </a>
          </p>
          <p className="text-sm text-gray-600">
            Want to register a company?{' '}
            <a href="/company-register" className="text-blue-600 hover:underline">
              Register company
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}