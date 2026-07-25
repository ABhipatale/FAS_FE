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
import EmployeeDashboard from './components/Employee/EmployeeDashboard';
import { homePathFor, KIOSK_ONLY_ROLE, KIOSK_PATH } from './config/roles';

// Custom protected route that checks user role
const RoleProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // For role restrictions
  if (user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to={homePathFor(user.role)} replace />;
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
  
  // Kiosk accounts get exactly one screen: no sidebar, and any other path
  // bounces straight back to it.
  if (user?.role === KIOSK_ONLY_ROLE) {
    if (window.location.pathname !== KIOSK_PATH) {
      return <Navigate to={KIOSK_PATH} replace />;
    }

    return (
      <div className="min-h-screen">
        <main className="p-4">{children}</main>
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

// "/" is not a page of its own - it forwards to whatever this role's home is
const RoleHome = () => {
  const { user } = useAuth();
  return <Navigate to={homePathFor(user?.role)} replace />;
};

// Public route that sends an already-signed-in user to their own home page
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={homePathFor(user?.role)} replace />;
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
              <RoleProtectedRoute allowedRoles={['admin', 'superadmin']}>
                <AppWrapper>
                  <Dashboard />
                </AppWrapper>
              </RoleProtectedRoute>
            </ProtectedRoute>
          } />

          {/* An employee's own attendance dashboard */}
          <Route path="/my-dashboard" element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['employee', 'user']}>
                <AppWrapper>
                  <EmployeeDashboard />
                </AppWrapper>
              </RoleProtectedRoute>
            </ProtectedRoute>
          } />

          {/* Punching is a kiosk/admin action only. Employees are deliberately
              barred: they must not be able to mark their own attendance from
              their personal login - they only ever read it on /my-dashboard. */}
          <Route path="/face-attendance" element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['admin', 'superadmin', 'attendanceapp']}>
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
              <RoleProtectedRoute allowedRoles={['admin', 'superadmin']}>
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
          
          {/* Default route - hand each role to its own home page */}
          <Route path="/" element={
            <ProtectedRoute>
              <RoleHome />
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
              <RoleProtectedRoute allowedRoles={['admin', 'superadmin', 'employee', 'user']}>
                <AppWrapper>
                  <Profile />
                </AppWrapper>
              </RoleProtectedRoute>
            </ProtectedRoute>
          } />

          {/* Unknown path: signed in -> role home, signed out -> login.
              This is what keeps a kiosk account from ever landing anywhere
              other than the attendance screen. */}
          <Route path="*" element={
            <ProtectedRoute>
              <RoleHome />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;