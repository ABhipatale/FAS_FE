import { Link } from "react-router-dom";
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
      
      <nav className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <button 
              onClick={toggleSidebar}
              className="mr-4 text-white lg:hidden"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="text-xl font-bold">
              <Link to="/">FAS</Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="hidden md:inline"> {user?.name}</span>
                {/* <Link 
                  to="/dashboard" 
                  className="hover:bg-blue-700 px-3 py-2 rounded transition"
                >
                  Dashboard
                </Link> */}
                {/* <Link 
                  to="/face-attendance" 
                  className="hover:bg-blue-700 px-3 py-2 rounded transition"
                >
                  Face Attendance
                </Link> */}
                {/* <Link 
                  to="/face-registration" 
                  className="hover:bg-blue-700 px-3 py-2 rounded transition"
                >
                  Register Face
                </Link> */}
                <Link 
                  to="/logout" 
                  onClick={(e) => {
                    e.preventDefault();
                    handleLogout();
                  }}
                  className="hover:bg-blue-700 px-3 py-2 rounded transition cursor-pointer"
                >
                  Logout
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="hover:bg-blue-700 px-3 py-2 rounded transition"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="hover:bg-blue-700 px-3 py-2 rounded transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}