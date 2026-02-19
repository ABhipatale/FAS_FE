import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Mail, Lock, LogIn } from "lucide-react";
import FloatingParticles from "../3D/FloatingParticles";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const { login } = useAuth();
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

    const { success, message: responseMessage } = await login(
      formData.email,
      formData.password
    );

    if (success) {
      setMessage(responseMessage);
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } else {
      setError(responseMessage);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <FloatingParticles/>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none">
        <h1 className="text-[4vw] mb-[54vh] font-extrabold uppercase tracking-widest text-white/40 sm:top-0">
          Let's Begin with Login
        </h1>
        <p className="max-w-xl mt-20 text-sm md:text-base text-white/30">
          Securely connect to your workspace and manage everything in one place.
        </p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-extrabold text-center uppercase mb-6 text-slate-800">
          Login
        </h2>

        {/* Success/Error Messages */}
        {message && (
          <div className="mb-4 p-3 bg-emerald-100 text-emerald-700 rounded">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="text-sm font-medium mb-1 flex items-center gap-2 text-slate-700">
              <Mail size={16} /> Email
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter email address"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium mb-1 flex items-center gap-2 text-slate-700">
              <Lock size={16} /> Password
            </label>
            <div className="relative">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter password"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 transition ${loading
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-blue-800 hover:bg-indigo-700 text-blue-50 border border-blue-950 font-extrabold"
              }`}
          >
            <LogIn size={18} />
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-4 text-center space-y-2">
          <p className="text-sm text-slate-600">
            Don't have an account?{" "}
            <a href="/register" className="text-indigo-600 hover:underline">
              Register here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
