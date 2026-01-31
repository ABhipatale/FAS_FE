// import { Link } from "react-router-dom";
// import { useState } from 'react';
// import { useAuth } from '../../contexts/AuthContext';

// export default function Navbar() {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const { isAuthenticated, user, logout } = useAuth();

//   const handleLogout = async () => {
//     await logout();
//   };

//   const toggleSidebar = () => {
//     setSidebarOpen(!sidebarOpen);
//   };

//   return (
//     <>
//       {/* Mobile sidebar backdrop */}
//       {sidebarOpen && (
//         <div 
//           className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden transition-opacity duration-300"
//           onClick={toggleSidebar}
//         ></div>
//       )}
      
//       <nav className="relative bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white shadow-lg">
//         {/* Decorative top border */}
//         <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-indigo-300 to-blue-400"></div>
        
//         <div className="container mx-auto px-6 py-4">
//           <div className="flex justify-between items-center">
//             {/* Left section - Logo & Menu */}
//             <div className="flex items-center space-x-6">
//               <button 
//                 onClick={toggleSidebar}
//                 className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-all duration-200 active:scale-95"
//                 aria-label="Toggle menu"
//               >
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//                 </svg>
//               </button>
              
//               <Link to="/" className="flex items-center space-x-3 group">
//                 <div className="bg-white/10 backdrop-blur-sm p-2 rounded-xl group-hover:bg-white/20 transition-all duration-300 group-hover:scale-105">
//                   <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
//                   </svg>
//                 </div>
//                 <div className="hidden sm:block">
//                   <h1 className="text-2xl font-bold tracking-tight">FAS</h1>
//                   <p className="text-xs text-blue-100 -mt-1">Face Attendance System</p>
//                 </div>
//               </Link>
//             </div>

//             {/* Right section - User actions */}
//             <div className="flex items-center space-x-3">
//               {isAuthenticated ? (
//                 <>
//                   {/* User profile section */}
//                   <div className="hidden md:flex items-center space-x-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
//                     <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center font-semibold text-sm shadow-inner">
//                       {user?.name?.charAt(0).toUpperCase() || 'U'}
//                     </div>
//                     <span className="font-medium text-sm">{user?.name}</span>
//                   </div>
                  
//                   {/* Logout button */}
//                   <Link 
//                     to="/logout" 
//                     onClick={(e) => {
//                       e.preventDefault();
//                       handleLogout();
//                     }}
//                     className="flex items-center space-x-2 bg-white/10 hover:bg-red-500/90 backdrop-blur-sm px-5 py-2.5 rounded-full transition-all duration-300 border border-white/20 hover:border-red-400 hover:shadow-lg hover:scale-105 active:scale-95 group"
//                   >
//                     <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
//                     </svg>
//                     <span className="font-medium">Logout</span>
//                   </Link>
//                 </>
//               ) : (
//                 <>
//                   {/* Login button */}
//                   <Link 
//                     to="/login" 
//                     className="px-5 py-2.5 rounded-full font-medium transition-all duration-300 hover:bg-white/10 border border-white/30 hover:border-white/50 hover:shadow-lg hover:scale-105 active:scale-95 backdrop-blur-sm"
//                   >
//                     Login
//                   </Link>
                  
//                   {/* Register button */}
//                   <Link 
//                     to="/register" 
//                     className="px-5 py-2.5 rounded-full font-medium bg-white text-indigo-600 hover:bg-blue-50 transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105 active:scale-95"
//                   >
//                     Register
//                   </Link>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Bottom decorative gradient */}
//         <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
//       </nav>
//     </>
//   );
// }
import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

export default function Navbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-100 transform transition-transform duration-300 lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              FAS
            </div>
            <div>
              <div className="font-semibold leading-tight">Face Attendance</div>
              <div className="text-xs text-slate-400">Management System</div>
            </div>
          </Link>

          <button onClick={() => setSidebarOpen(false)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="px-4 py-6 space-y-1">
          <Link
            to="/dashboard"
            onClick={() => setSidebarOpen(false)}
            className="block px-4 py-3 rounded-md hover:bg-slate-800 transition"
          >
            Dashboard
          </Link>
          <Link
            to="/attendance"
            onClick={() => setSidebarOpen(false)}
            className="block px-4 py-3 rounded-md hover:bg-slate-800 transition"
          >
            Attendance Records
          </Link>
        </nav>

        {isAuthenticated && (
          <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
            <button
              onClick={handleLogout}
              className="w-full py-2.5 rounded-md bg-red-600 hover:bg-red-700 transition font-medium"
            >
              Logout
            </button>
          </div>
        )}
      </aside>

      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Left */}
          <div className="flex items-center gap-5">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md hover:bg-slate-100"
            >
              <svg className="w-7 h-7 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <Link to="/" className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold text-lg">
                FAS
              </div>
              <div className="hidden sm:block">
                <div className="text-lg font-semibold text-slate-900">
                  Face Attendance System
                </div>
                <div className="text-xs text-slate-500">
                  Secure & Automated Attendance
                </div>
              </div>
            </Link>
          </div>

          {/* Right */}
          <div className="flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <div className="hidden md:flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-semibold">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="leading-tight">
                    <div className="text-sm font-medium text-slate-900">
                      {user?.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {user?.email}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="px-5 py-2.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-slate-700 hover:text-slate-900 font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-medium transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
