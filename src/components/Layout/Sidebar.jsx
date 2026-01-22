import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaTachometerAlt, FaUsers, FaCog, FaCalendarAlt, FaUser, FaSignOutAlt } from 'react-icons/fa';

const Sidebar = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Define menu items based on user role
  const getMenuItems = () => {
    if (user?.role === 'employee') {
      return [
        {
          name: 'Face Attendance',
          icon: <FaCalendarAlt />,
          path: '/face-attendance'
        }
      ];
    }

    return [
      {
        name: 'Dashboard',
        icon: <FaTachometerAlt />,
        path: '/dashboard'
      },
      {
        name: 'Employee Management',
        icon: <FaUsers />,
        path: '/employees'
      },
      {
        name: 'Shift Management',
        icon: <FaCog />,
        path: '/shifts'
      },
      {
        name: 'Face Attendance',
        icon: <FaCalendarAlt />,
        path: '/face-attendance'
      },
      {
        name: 'Settings',
        icon: <FaCog />,
        path: '/settings'
      },
      {
        name: 'Profile',
        icon: <FaUser />,
        path: '/profile'
      }
    ];
  };

  const menuItems = getMenuItems();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-blue-600 text-white"
      >
        {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Sidebar backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div 
        className={`fixed top-0 left-0 h-full bg-gray-800 text-white w-64 transform transition-transform duration-300 ease-in-out z-50
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">Face Attendance System</h1>
          <p className="text-sm text-gray-400 mt-1">Welcome, {user?.name}</p>
        </div>

        <nav className="mt-4">
          <ul>
            {menuItems.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.path}
                  onClick={closeSidebar}
                  className={`flex items-center px-6 py-3 text-sm transition-colors duration-200 ${
                    isActive(item.path)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200"
          >
            <span className="mr-3"><FaSignOutAlt /></span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={closeSidebar}
        ></div>
      )}
    </>
  );
};

export default Sidebar;