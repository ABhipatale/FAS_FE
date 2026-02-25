
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useLocation } from "react-router-dom";                         
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
import EnhancedDashboard from './components/Dashboard/EnhancedDashboard';
import Profile from './components/Profile/Profile'
import Settings from './components/Profile/Settings';


// Custom protected route that checks user role
const RoleProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();

  // console.log("RoleGuard:", { loading, isAuthenticated, user });

  // ⛔ Wait until auth finishes loading
  if (loading) return null;

  // ⛔ Not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ⛔ User not loaded yet
  if (!user) return null;

  // ⛔ Role restriction
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    console.warn("Access denied for role:", user.role);

    if (user.role === "employee") {
      return <Navigate to="/face-attendance" replace />;
    }

    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Main App wrapper with sidebar for authenticated users
const AppWrapper = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // console.log("AppWrapper mounted", { loading, isAuthenticated, user });

  if (loading) return null;

  if (!isAuthenticated) return <>{children}</>;

  // ✅ Employee layout
  if (user?.role === "employee") {
    return (
      <div className="flex">
        <div className="flex-1">
          <main className="p-4">{children}</main>
        </div>
      </div>
    );
  }

  // ✅ Admin / Superadmin layout
  return (
    <div className="flex">
      <Sidebar
        user={user}
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <main className="p-4">{children}</main>
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
              <RoleProtectedRoute allowedRoles={['superadmin', 'user']}>
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
              <RoleProtectedRoute allowedRoles={['admin', 'superadmin', 'employee','user']}>
                <AppWrapper>
                  {/* <Dashboard />  */}
                  <EnhancedDashboard/>
                </AppWrapper>
              </RoleProtectedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/face-attendance" element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['admin', 'superadmin', 'employee' , 'user']}>
                <AppWrapper>
                  <FaceAttendance />
                </AppWrapper>
              </RoleProtectedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/admin-dashboard" element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['admin', 'superadmin', 'user']}>
                <AppWrapper>
                  <AdminDashboard />
                </AppWrapper>
              </RoleProtectedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/face-registration" element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['admin', 'superadmin', 'employee', 'user']}>
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
              <RoleProtectedRoute allowedRoles={['admin', 'superadmin', 'user']}>
                <AppWrapper>
                  <EmployeeAttendanceDetail />
                </AppWrapper>
              </RoleProtectedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/shifts" element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['admin', 'superadmin', 'user']}>
                <AppWrapper>
                  <ShiftManagement />
                </AppWrapper>
              </RoleProtectedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/employees" element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['admin', 'superadmin', 'user']}>
                <AppWrapper>
                  <EmployeeManagement />
                </AppWrapper>
              </RoleProtectedRoute>
            </ProtectedRoute>
          } />
          
          {/* Default route - redirect based on user role */}
          <Route path="/" element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['admin', 'superadmin', 'employee', 'user']}>
                <AppWrapper>
                  <Dashboard />
                </AppWrapper>
              </RoleProtectedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['admin', 'superadmin', 'user']}>
                <AppWrapper>
                  <Settings/>
                </AppWrapper>
              </RoleProtectedRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['admin', 'superadmin', 'user']}>
                <AppWrapper>
                  <Profile/>
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
