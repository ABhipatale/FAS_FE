import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import FaceAttendance from "./components/Face/FaceAttendance";
import AdminDashboard from "./components/Admin/AdminDashboard";
import UserManagement from "./components/Admin/UserManagement";
import Login from "./components/Auth/Login";
import EmployeeLogin from "./components/Auth/EmployeeLogin";
import Register from "./components/Auth/Register";
import Logout from "./components/Auth/Logout";
import Dashboard from "./components/Dashboard/EnhancedDashboard";
import Navbar from "./components/Layout/Navbar";
import Sidebar from "./components/Layout/Sidebar";
import FaceRegistration from "./components/Face/FaceRegistrationModal";
import { useState } from 'react';
import EmployeeAttendanceDetail from './components/Dashboard/EmployeeAttendanceDetail';
import ShiftManagement from './components/Admin/ShiftManagement';
import EmployeeManagement from './components/Admin/EmployeeManagement';
import CompanyRegister from './components/Auth/CompanyRegister';
import SuperAdminDashboard from './components/Admin/SuperAdminDashboard';
import Settings from './components/Account/Settings';
import Profile from './components/Account/Profile';

// Custom protected route that checks user role
const RoleProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // For role restrictions
  if (user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // If user is not in allowed roles, redirect to their default page
    if (user.role === 'employee') {
      return <Navigate to="/face-attendance" />;
    } else {
      return <Navigate to="/dashboard" />;
    }
  }
  
  return children;
};

// Main App wrapper with sidebar for authenticated users
const AppWrapper = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  // Desktop sidebar collapse, remembered across reloads
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('sidebarCollapsed') === 'true'
  );

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      localStorage.setItem('sidebarCollapsed', String(!prev));
      return !prev;
    });
  };

  if (!isAuthenticated) {
    return <>{children}</>;
  }
  
  // For employee role, hide sidebar completely
  if (user?.role === 'employee') {
    // Redirect if trying to access non-allowed pages
    const isAllowedPage = window.location.pathname === '/face-attendance' || window.location.pathname === '/face-registration';
    
    if (!isAllowedPage) {
      // For non-allowed pages, redirect to face attendance
      return <Navigate to="/face-attendance" replace />;
    }
    
    return (
      <div className="flex">
        {/* No sidebar for employees */}
        <div className="min-w-0 flex-1">
          {/* No navbar for employees if you want to hide it completely */}
          <main className="p-4">
            {children}
          </main>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex">
      <Sidebar user={user} collapsed={collapsed} onToggleCollapse={toggleCollapsed} />
      {/* min-w-0 is required: without it this flex item refuses to shrink below
          its content, so a wide table widens the page and scrolls under the
          fixed sidebar instead of scrolling inside its own container. */}
      <div
        className={`min-w-0 flex-1 transition-all duration-300 ${
          collapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}
      >
        {/* <Navbar /> */}
        <main className="p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

// Public route that redirects to dashboard if authenticated
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes - only render if not authenticated */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/employee-login" element={
            <PublicRoute>
              <EmployeeLogin />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          
          {/* Superadmin system console - every company at a glance */}
          <Route path="/superadmin" element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['superadmin']}>
                <AppWrapper>
                  <SuperAdminDashboard />
                </AppWrapper>
              </RoleProtectedRoute>
            </ProtectedRoute>
          } />

          <Route path="/company-register" element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['superadmin']}>
                <AppWrapper>
                  <CompanyRegister />
                </AppWrapper>
              </RoleProtectedRoute>
            </ProtectedRoute>
          } />
          
          {/* Protected routes */}
          <Route path="/logout" element={
            <AppWrapper>
              <Logout />
            </AppWrapper>
          } />
          
          {/* Routes that require authentication */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['admin', 'superadmin', 'employee']}>
                <AppWrapper>
                  <Dashboard />
                </AppWrapper>
              </RoleProtectedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/face-attendance" element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['admin', 'superadmin', 'employee']}>
                <AppWrapper>
                  <FaceAttendance />
                </AppWrapper>
              </RoleProtectedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/admin-dashboard" element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['admin', 'superadmin']}>
                <AppWrapper>
                  <AdminDashboard />
                </AppWrapper>
              </RoleProtectedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/face-registration" element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['admin', 'superadmin', 'employee']}>
                <AppWrapper>
                  <FaceRegistration />
                </AppWrapper>
              </RoleProtectedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/user-management" element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['admin', 'superadmin']}>
                <AppWrapper>
                  <UserManagement />
                </AppWrapper>
              </RoleProtectedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/employee/:userId" element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['admin', 'superadmin']}>
                <AppWrapper>
                  <EmployeeAttendanceDetail />
                </AppWrapper>
              </RoleProtectedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/shifts" element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['admin', 'superadmin']}>
                <AppWrapper>
                  <ShiftManagement />
                </AppWrapper>
              </RoleProtectedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/employees" element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['admin', 'superadmin']}>
                <AppWrapper>
                  <EmployeeManagement />
                </AppWrapper>
              </RoleProtectedRoute>
            </ProtectedRoute>
          } />
          
          {/* Default route - redirect based on user role */}
          <Route path="/" element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['admin', 'superadmin', 'employee']}>
                <AppWrapper>
                  <Dashboard />
                </AppWrapper>
              </RoleProtectedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['admin', 'superadmin']}>
                <AppWrapper>
                  <Settings />
                </AppWrapper>
              </RoleProtectedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['admin', 'superadmin']}>
                <AppWrapper>
                  <Profile />
                </AppWrapper>
              </RoleProtectedRoute>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;