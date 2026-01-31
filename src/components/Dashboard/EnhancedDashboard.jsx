// import { useState, useEffect } from 'react';
// import { useAuth } from '../../contexts/AuthContext';
// import API_CONFIG, { apiCall } from '../../config/api';
// import { useNavigate } from 'react-router-dom';

// export default function EnhancedDashboard() {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const [stats, setStats] = useState({
//     totalEmployees: 0,
//     todayPresent: 0,
//     todayAbsent: 0
//   });
//   const [attendanceData, setAttendanceData] = useState([]);
//   const [filter, setFilter] = useState('today');
//   const [dateRange, setDateRange] = useState({ start: '', end: '' });
//   const [loading, setLoading] = useState(true);

//   // Mock data for demonstration
//   useEffect(() => {
//     fetchDashboardData();
//   }, [filter]);

//   const fetchDashboardData = async () => {
//     try {
//       setLoading(true);

//       // Fetch real stats from backend
//       const statsResponse = await apiCall(API_CONFIG.ENDPOINTS.DASHBOARD_STATS);
//       if (statsResponse.data.success) {
//         setStats(statsResponse.data.data.stats);
//       }

//       // Fetch real attendance data from backend
//       const rawAttendanceResponse = await apiCall(`${API_CONFIG.ENDPOINTS.ATTENDANCE_RAW}?filter=${filter}`);
//       if (rawAttendanceResponse.data.success) {
//         // Transform the raw data to match the expected format
//         const transformedData = rawAttendanceResponse.data.data.map(record => ({
//           id: record.id,
//           name: record.user ? record.user.name : 'Unknown User',
//           email: record.user ? record.user.email : 'N/A',
//           shift: record.user && record.user.shift ? record.user.shift.shift_name : 'N/A',
//           faceRegistered: record.user ? (record.user.face_descriptor && record.user.face_descriptor.length > 0) : false,
//           punchIn: record.punch_in_time ? new Date(record.punch_in_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : null,
//           punchOut: record.punch_out_time ? new Date(record.punch_out_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : null,
//           status: record.status || 'absent'
//         }));
//         setAttendanceData(transformedData);
//       }
//     } catch (error) {
//       console.error('Error fetching dashboard data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDateFilter = () => {
//     if (dateRange.start && dateRange.end) {
//       setFilter('custom');
//       // Re-fetch data with custom date range
//       fetchDashboardData();
//     }
//   };

//   const getStatusColor = (status) => {
//     switch(status) {
//       case 'present': return 'bg-green-100 text-green-800';
//       case 'absent': return 'bg-red-100 text-red-800';
//       case 'late': return 'bg-yellow-100 text-yellow-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="container mx-auto px-4 py-8">
//         <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//           <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
//             <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Employees</h3>
//             <p className="text-3xl font-bold text-gray-800">{stats.totalEmployees}</p>
//           </div>

//           <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
//             <h3 className="text-lg font-semibold text-gray-600 mb-2">Today Present</h3>
//             <p className="text-3xl font-bold text-gray-800">{stats.todayPresent}</p>
//           </div>

//           <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
//             <h3 className="text-lg font-semibold text-gray-600 mb-2">Today Absent</h3>
//             <p className="text-3xl font-bold text-gray-800">{stats.todayAbsent}</p>
//           </div>
//         </div>

//         {/* Attendance Chart */}
//         <div className="bg-white p-6 rounded-lg shadow-md mb-8">
//           <h2 className="text-xl font-semibold text-gray-800 mb-4">Attendance Tracker</h2>
//           <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
//             <p className="text-gray-500">Attendance chart visualization would go here</p>
//           </div>
//         </div>

//         {/* Filter Buttons */}
//         <div className="bg-white p-4 rounded-lg shadow-md mb-6">
//           <div className="flex flex-wrap gap-2">
//             <button
//               onClick={() => setFilter('today')}
//               className={`px-4 py-2 rounded ${
//                 filter === 'today' 
//                   ? 'bg-blue-600 text-white' 
//                   : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//               }`}
//             >
//               Today
//             </button>
//             <button
//               onClick={() => setFilter('yesterday')}
//               className={`px-4 py-2 rounded ${
//                 filter === 'yesterday' 
//                   ? 'bg-blue-600 text-white' 
//                   : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//               }`}
//             >
//               Yesterday
//             </button>
//             <button
//               onClick={() => setFilter('week')}
//               className={`px-4 py-2 rounded ${
//                 filter === 'week' 
//                   ? 'bg-blue-600 text-white' 
//                   : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//               }`}
//             >
//               Last Week
//             </button>
//             <div className="flex gap-2 items-center">
//               <input
//                 type="date"
//                 value={dateRange.start}
//                 onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
//                 className="border rounded px-2 py-1"
//               />
//               <span>to</span>
//               <input
//                 type="date"
//                 value={dateRange.end}
//                 onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
//                 className="border rounded px-2 py-1"
//               />
//               <button
//                 onClick={handleDateFilter}
//                 className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//               >
//                 Apply
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Attendance Table */}
//         <div className="bg-white rounded-lg shadow-md overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shift</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Face Registered</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Punch In</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Punch Out</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {attendanceData.map((record) => (
//                   <tr key={record.id} className="hover:bg-gray-50">
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <button 
//                         onClick={() => navigate(`/employee/${record.id}`)}
//                         className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
//                       >
//                         {record.name}
//                       </button>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm text-gray-500">{record.email}</div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm text-gray-500">{record.shift}</div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                         record.faceRegistered ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//                       }`}>
//                         {record.faceRegistered ? 'Yes' : 'No'}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       {record.punchIn || '-'}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       {record.punchOut || '-'}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.status)}`}>
//                         {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                       <button 
//                         onClick={() => navigate(`/employee/${record.id}`)}
//                         className="text-blue-600 hover:text-blue-900 mr-3"
//                       >
//                         View
//                       </button>
//                       <button 
//                         onClick={() => navigate(`/employee/${record.id}`)}
//                         className="text-indigo-600 hover:text-indigo-900"
//                       >
//                         Preview
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import API_CONFIG, { apiCall } from '../../config/api';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function EnhancedDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalEmployees: 0,
    todayPresent: 0,
    todayAbsent: 0
  });
  const [attendanceData, setAttendanceData] = useState([]);
  const [filter, setFilter] = useState('today');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, [filter]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const statsResponse = await apiCall(API_CONFIG.ENDPOINTS.DASHBOARD_STATS);
      if (statsResponse.data.success) {
        setStats(statsResponse.data.data.stats);
      }

      const rawAttendanceResponse = await apiCall(`${API_CONFIG.ENDPOINTS.ATTENDANCE_RAW}?filter=${filter}`);
      if (rawAttendanceResponse.data.success) {
        const transformedData = rawAttendanceResponse.data.data.map(record => ({
          id: record.user ? record.user.id : null,
          name: record.user ? record.user.name : 'Unknown User',
          email: record.user ? record.user.email : 'N/A',
          shift: record.user && record.user.shift ? record.user.shift.shift_name : 'N/A',
          shiftStartTime: record.user && record.user.shift ? record.user.shift.punch_in_time : 'N/A',
          faceRegistered: record.user ? (record.user.face_descriptor && record.user.face_descriptor.length > 0) : false,
          punchIn: record.punch_in_time ? new Date(record.punch_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
          punchOut: record.punch_out_time ? new Date(record.punch_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
          status: record.status || 'absent'
        }));
        setAttendanceData(transformedData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // For last updating time
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // When data loads/filters change
  useEffect(() => {
    setLastUpdated(new Date());
  }, [attendanceData, filter]);


  // For Actual clock
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleDateFilter = () => {
    if (dateRange.start && dateRange.end) {
      setFilter('custom');
      fetchDashboardData();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'absent': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'late': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const filteredData = attendanceData.filter(record =>
    record.id && ( // Only include records with valid user IDs
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const attendanceRate = stats.totalEmployees > 0
    ? ((stats.todayPresent / stats.totalEmployees) * 100).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative w-24 h-24 mx-auto mb-6">
            <motion.div
              className="absolute inset-0 border-4 border-gray-200 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-2 border-4 border-blue-600 rounded-full border-t-transparent"
              animate={{ rotate: -360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        .glass-effect {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
        }
        
        .hover-lift {
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        }
        
        .smooth-transition {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40"
        style={{ fontFamily: 'Arial, sans-serif' }}
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">Attendance Dashboard</h1>
              <p className="text-gray-900 text-xs">Welcome {user?.name || 'Admin'}!</p>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-gray-600">
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="text-xs font-bold text-gray-900">
                  {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-5 py-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
          {/* Total Employees Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            whileHover={{ y: -1 }}
            className="glass-effect rounded-lg p-4 hover-lift"
            style={{ fontFamily: 'Arial, sans-serif' }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">Total Employees</p>
                <motion.p
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl font-bold text-gray-900 mt-1"
                >
                  {stats.totalEmployees}
                </motion.p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="pt-3 border-t border-gray-100 mt-2">
              <span className="inline-flex items-center text-xs text-gray-500">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1.5"></span>
                All active employees
              </span>
            </div>
          </motion.div>

          {/* Present Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            whileHover={{ y: -1 }}
            className="glass-effect rounded-lg p-4 hover-lift"
            style={{ fontFamily: 'Arial, sans-serif' }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">Present Today</p>
                <motion.p
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl font-bold text-emerald-600 mt-1"
                >
                  {stats.todayPresent}
                </motion.p>
              </div>
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="pt-3 border-t border-gray-100 mt-2">
              <span className="inline-flex items-center text-xs font-semibold text-emerald-600">
                <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {stats.totalEmployees > 0 ? ((stats.todayPresent / stats.totalEmployees) * 100).toFixed(1) : 0}% of total
              </span>
            </div>
          </motion.div>

          {/* Absent Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            whileHover={{ y: -1 }}
            className="glass-effect rounded-lg p-4 hover-lift"
            style={{ fontFamily: 'Arial, sans-serif' }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">On Leave Today</p>
                <motion.p
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-xl font-bold text-rose-600 mt-1"
                >
                  {stats.todayAbsent}
                </motion.p>
              </div>
              <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="pt-3 border-t border-gray-100 mt-2">
              <span className="inline-flex items-center text-xs text-gray-500">
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mr-1.5"></span>
                Requires attention
              </span>
            </div>
          </motion.div>

          {/* Attendance Rate Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            whileHover={{ y: -1 }}
            className="glass-effect rounded-lg p-4 hover-lift"
            style={{ fontFamily: 'Arial, sans-serif' }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">Attendance Rate</p>
                <motion.p
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-xl font-bold text-blue-600 mt-1"
                >
                  {attendanceRate}%
                </motion.p>
              </div>
              <div className="relative flex-shrink-0">
                <svg className="w-10 h-10" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="2.5"
                  />
                  <motion.path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="2.5"
                    strokeLinecap="square"
                    initial={{ strokeDasharray: '100, 100', strokeDashoffset: 100 }}
                    animate={{ strokeDashoffset: 100 - attendanceRate }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-blue-600">
                  {attendanceRate}%
                </span>
              </div>
            </div>
            <div className="pt-3 border-t border-gray-100 mt-2">
              <span className="text-xs text-gray-500">Overall Performance</span>
            </div>
          </motion.div>

          {/* Quick Actions Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            whileHover={{ y: -1 }}
            className="glass-effect rounded-lg p-4 hover-lift"
            style={{ fontFamily: 'Arial, sans-serif' }}
          >
            <h3 className="text-sm font-bold text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-between p-2 bg-blue-100 hover:bg-blue-200 rounded-lg smooth-transition group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-200 rounded flex items-center justify-center group-hover:bg-blue-300 flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-gray-900 whitespace-nowrap">Add Employee</span>
                </div>
                <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-between p-2 bg-gray-50 hover:bg-gray-100 rounded-lg smooth-transition group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center group-hover:bg-gray-200 flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-gray-900 whitespace-nowrap">Generate Reports</span>
                </div>
                <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Filters Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="lg:col-span-2"
          >


            <div className="glass-effect rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-gray-900">Attendance Records</h2>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-gray-700">Filter:</span>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-white border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent min-w-[100px]"
                  >
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="week">Last Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>
              </div>

              {/* Date Range Filter */}
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <p className="text-sm font-bold text-gray-700 mb-2">Custom Date Range</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDateFilter}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-semibold self-end"
                  >
                    Apply
                  </motion.button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="mb-3">
                <div className="relative">
                  <svg className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search employees by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-white border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>



            {/* Attendance Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="glass-effect rounded-xl overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <AnimatePresence>
                      {filteredData.map((record, index) => (
                        <motion.tr
                          key={record.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.03 }}
                          className="hover:bg-gray-50/50 smooth-transition"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                                {record.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <button
                                  onClick={() => navigate(`/employee/${record.id}`)}
                                  className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors text-left"
                                >
                                  {record.name}
                                </button>
                                <p className="text-xs text-gray-500 mt-0.5">{record.email}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                                    {record.shift}
                                  </span>
                                  <span className={`text-xs px-2 py-1 rounded-md ${record.faceRegistered
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-rose-100 text-rose-700'
                                    }`}>
                                    {record.faceRegistered ? 'Face ID' : 'No Face ID'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm font-medium text-gray-900">{record.punchIn || '--:--'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm font-medium text-gray-900">{record.punchOut || '--:--'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate(`/employee/${record.id}`)}
                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg smooth-transition"
                                title="View Details"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate(`/employee/${record.id}`)}
                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg smooth-transition"
                                title="Edit"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>

                {filteredData.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-base font-semibold text-gray-700 mb-2">No records found</h3>
                    <p className="text-gray-500 text-sm">Try adjusting your search or filter criteria</p>
                  </motion.div>
                )}
              </div>
            </motion.div>



            
          </motion.div>

          {/* Summary Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
            className="space-y-4"
          >
            {/* Summary Card */}
            <div className="glass-effect rounded-lg p-3">
              <h3 className="text-base font-bold text-gray-900 mb-3">Summary</h3>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Total Records</span>
                  <span className="text-xs font-semibold text-gray-900">{attendanceData.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Showing</span>
                  <span className="text-xs font-semibold text-gray-900">{filteredData.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Filter Applied</span>
                  <span className="text-xs font-semibold text-gray-900 capitalize">{filter}</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-1">Data last updated</p>
                  <p className="text-xs font-semibold text-gray-900">
                    {lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Distribution Card */}
            <div className="glass-effect rounded-lg p-3">
              <h3 className="text-base font-bold text-gray-900 mb-3">Status Distribution</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    <span className="text-xs text-gray-600">Present</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-900">
                    {attendanceData.filter(r => r.status === 'present').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
                    <span className="text-xs text-gray-600">Absent</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-900">
                    {attendanceData.filter(r => r.status === 'absent').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                    <span className="text-xs text-gray-600">Late</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-900">
                    {attendanceData.filter(r => r.status === 'late').length}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center text-sm text-gray-500 pt-6 border-t border-gray-200"
        >
          <div className="flex items-center justify-between">
            <span>Showing {filteredData.length} of {attendanceData.length} records</span>
            <span>Last updated: {lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}