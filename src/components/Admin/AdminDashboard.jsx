import { Link } from 'react-router-dom';

export default function AdminDashboard() {

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Face Attendance System</h1>
        
        <div className="space-y-4">
          <p className="text-gray-600 mb-6">
            Welcome to the Face Attendance System. Please login or register to continue.
          </p>
          
          <div className="flex flex-col space-y-4">
            <Link 
              to="/login" 
              className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition text-center"
            >
              Login
            </Link>
            
            <Link 
              to="/register" 
              className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 transition text-center"
            >
              Register
            </Link>
            
            <Link 
              to="/face-attendance" 
              className="w-full bg-purple-600 text-white py-3 rounded hover:bg-purple-700 transition text-center"
            >
              Face Attendance
            </Link>
            
            <Link 
              to="/face-registration" 
              className="w-full bg-yellow-600 text-white py-3 rounded hover:bg-yellow-700 transition text-center"
            >
              Register Face
            </Link>
            
            <Link 
              to="/user-management" 
              className="w-full bg-indigo-600 text-white py-3 rounded hover:bg-indigo-700 transition text-center"
            >
              Manage Users
            </Link>
            
            <Link 
              to="/employee-login" 
              className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 transition text-center"
            >
              Employee Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
