import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaBars, FaTimes, FaTachometerAlt, FaUsers, FaCog, FaCalendarAlt,
  FaUser, FaSignOutAlt, FaBuilding, FaAngleDoubleLeft, FaAngleDoubleRight, FaGlobe,
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

/**
 * `collapsed` is a desktop-only concept: at lg+ the sidebar shrinks to an
 * icon-only rail. On mobile it stays a full-width off-canvas drawer, so every
 * label is hidden with `lg:hidden` rather than plain `hidden`.
 */
const Sidebar = ({ user, collapsed = false, onToggleCollapse }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { logout, company } = useAuth();

  const closeMobile = () => setMobileOpen(false);

  // The signed-in company brands the sidebar; the product name is the fallback
  // for accounts with no company or no logo uploaded yet.
  const brandName = company?.name || 'Face Attendance System';
  const brandLogo = company?.logo || '';
  const brandInitials =
    (company?.name || 'Face Attendance')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase() || 'FA';

  const isActive = (path) => location.pathname === path;

  // Define menu items based on user role
  const getMenuItems = () => {
    // Employees read their own attendance and nothing else. No face attendance
    // entry on purpose: punching happens at the kiosk, never from a personal
    // login. (attendanceapp accounts never render a sidebar at all.)
    if (user?.role === 'employee' || user?.role === 'user') {
      return [
        {
          name: 'My Dashboard',
          icon: <FaTachometerAlt />,
          path: '/my-dashboard'
        },
        {
          name: 'My Profile',
          icon: <FaUser />,
          path: '/profile'
        }
      ];
    }

    const baseItems = [
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
      }
    ];

    // Superadmins get the cross-company console first, then company management
    if (user?.role === 'superadmin') {
      baseItems.unshift({
        name: 'System Overview',
        icon: <FaGlobe />,
        path: '/superadmin'
      });
      baseItems.splice(2, 0, {
        name: 'Company Management',
        icon: <FaBuilding />,
        path: '/company-register'
      });
    }

    // Add settings and profile for non-employees
    if (user?.role !== 'employee') {
      baseItems.push(
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
      );
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  // Labels collapse only from lg upwards, so the mobile drawer keeps its text
  const labelClass = collapsed ? 'ml-3 lg:hidden' : 'ml-3';

  return (
    <>
      {/* Mobile menu button - only show when the drawer is closed */}
      {!mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="fixed left-4 top-4 z-50 rounded-md bg-blue-600 p-2 text-white shadow-lg lg:hidden"
        >
          <FaBars size={20} />
        </button>
      )}

      {/* Backdrop for the mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-64 flex-col bg-gray-800 text-white transition-all duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
          ${collapsed ? 'lg:w-16' : 'lg:w-64'}`}
      >
        {/* Header - company branded */}
        <div className={`shrink-0 border-b border-gray-700 p-4 ${collapsed ? 'lg:px-2' : ''}`}>
          <div className={collapsed ? 'lg:hidden' : ''}>
            <div className="flex items-center gap-3">
              {brandLogo ? (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
                  <img src={brandLogo} alt="" className="h-full w-full object-contain p-1" />
                </span>
              ) : (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold">
                  {brandInitials}
                </span>
              )}
              <h1 className="min-w-0 truncate text-lg font-bold leading-tight" title={brandName}>
                {brandName}
              </h1>
            </div>
            <p className="mt-2 truncate text-sm text-gray-400">Welcome, {user?.name}</p>
          </div>

          {/* Compact mark shown in place of the title when collapsed */}
          {collapsed && (
            <div className="hidden justify-center lg:flex" title={brandName}>
              {brandLogo ? (
                <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-white">
                  <img src={brandLogo} alt="" className="h-full w-full object-contain p-0.5" />
                </span>
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold">
                  {brandInitials}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="mt-4 flex-1 overflow-y-auto">
          <ul>
            {menuItems.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.path}
                  onClick={closeMobile}
                  title={collapsed ? item.name : undefined}
                  className={`flex items-center py-3 text-sm transition-colors duration-200
                    ${collapsed ? 'px-6 lg:justify-center lg:px-0' : 'px-6'}
                    ${isActive(item.path)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                >
                  <span className="shrink-0 text-base">{item.icon}</span>
                  <span className={labelClass}>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer - logout, with the collapse toggle beside it */}
        <div className={`shrink-0 border-t border-gray-700 p-3 ${collapsed ? 'lg:px-2' : ''}`}>
          <div className={`flex gap-2 ${collapsed ? 'lg:flex-col' : 'flex-row'}`}>
            <button
              onClick={handleLogout}
              title={collapsed ? 'Logout' : undefined}
              className={`flex items-center rounded-md px-3 py-2 text-sm text-gray-300 transition-colors duration-200 hover:bg-gray-700 hover:text-white
                ${collapsed ? 'flex-1 lg:w-full lg:flex-none lg:justify-center lg:px-0' : 'flex-1'}`}
            >
              <span className="shrink-0"><FaSignOutAlt /></span>
              <span className={labelClass}>Logout</span>
            </button>

            {/* Desktop collapse / expand toggle */}
            <button
              onClick={onToggleCollapse}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="hidden items-center justify-center rounded-md p-2 text-gray-400 transition-colors duration-200 hover:bg-gray-700 hover:text-white lg:flex"
            >
              {collapsed ? <FaAngleDoubleRight size={16} /> : <FaAngleDoubleLeft size={16} />}
            </button>

            {/* Mobile close button */}
            <button
              onClick={closeMobile}
              aria-label="Close menu"
              className="flex items-center justify-center rounded-md p-2 text-gray-400 transition-colors duration-200 hover:bg-gray-700 hover:text-white lg:hidden"
            >
              <FaTimes size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
