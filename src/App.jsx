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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
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
        <div className="flex-1">
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
      <Sidebar user={user} isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <main className="p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

// Public route that redirects to dashboard if authenticated
const PublicRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  
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
                  <div>Settings Page</div>
                </AppWrapper>
              </RoleProtectedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['admin', 'superadmin']}>
                <AppWrapper>
                  <div>Profile Page</div>
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