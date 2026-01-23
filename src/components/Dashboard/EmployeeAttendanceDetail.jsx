// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { apiCall } from '../../config/api';

// const EmployeeAttendanceDetail = () => {
//   const { userId } = useParams();
//   const navigate = useNavigate();
//   const [employee, setEmployee] = useState(null);
//   const [attendanceData, setAttendanceData] = useState({
//     monthly: [],
//     weekly: [],
//     yearly: []
//   });
//   const [loading, setLoading] = useState(true);
//   const [dateRange, setDateRange] = useState('monthly');
//   const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
//   const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

//   useEffect(() => {
//     fetchEmployeeData();
//   }, [userId]);

//   const fetchEmployeeData = async () => {
//     try {
//       const response = await apiCall(`/users/${userId}`);
//       setEmployee(response.data);
      
//       // Fetch attendance data
//       const attendanceResponse = await apiCall(`/attendance/user/${userId}`, 'GET', null, {
//         month: selectedMonth,
//         year: selectedYear
//       });
      
//       if (attendanceResponse.success) {
//         setAttendanceData(attendanceResponse.data);
//       } else {
//         console.error('Error fetching attendance data:', attendanceResponse.message);
//       }
//     } catch (error) {
//       console.error('Error fetching employee data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getDaysInMonth = (month, year) => {
//     return new Date(year, month, 0).getDate();
//   };

//   const renderCalendarView = () => {
//     const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
//     const days = [];
    
//     for (let day = 1; day <= daysInMonth; day++) {
//       const dateString = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
//       const attendanceRecord = attendanceData.monthly.find(record => record.date === dateString);
      
//       let statusClass = 'bg-gray-200'; // Default for weekends/non-working days
//       let statusText = 'N/A';
      
//       if (attendanceRecord) {
//         if (attendanceRecord.status === 'present') {
//           statusClass = 'bg-green-500 text-white';
//           statusText = 'P';
//         } else if (attendanceRecord.status === 'absent') {
//           statusClass = 'bg-red-500 text-white';
//           statusText = 'A';
//         } else if (attendanceRecord.status === 'late') {
//           statusClass = 'bg-yellow-500 text-black';
//           statusText = 'L';
//         } else if (attendanceRecord.status === 'leave') {
//           statusClass = 'bg-blue-500 text-white';
//           statusText = 'LV';
//         }
//       }
      
//       // Check if it's weekend (Saturday or Sunday)
//       const date = new Date(selectedYear, selectedMonth - 1, day);
//       const dayOfWeek = date.getDay();
//       if (dayOfWeek === 0 || dayOfWeek === 6) {
//         statusClass = 'bg-gray-400 text-white';
//         statusText = 'W';
//       }

//       days.push(
//         <div key={day} className={`flex items-center justify-center h-8 w-8 rounded-full ${statusClass} cursor-pointer hover:scale-110 transition-transform`}>
//           {statusText}
//         </div>
//       );
//     }

//     return (
//       <div className="grid grid-cols-7 gap-2 mb-6">
//         {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
//           <div key={index} className="text-center font-semibold text-sm text-gray-600">{day}</div>
//         ))}
//         {days}
//       </div>
//     );
//   };

//   const getAttendanceStats = () => {
//     const presentCount = attendanceData.monthly.filter(record => record.status === 'present').length;
//     const absentCount = attendanceData.monthly.filter(record => record.status === 'absent').length;
//     const lateCount = attendanceData.monthly.filter(record => record.status === 'late').length;
//     const leaveCount = attendanceData.monthly.filter(record => record.status === 'leave').length;

//     return { presentCount, absentCount, lateCount, leaveCount };
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading employee data...</p>
//         </div>
//       </div>
//     );
//   }

//   const stats = getAttendanceStats();

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <button 
//             onClick={() => navigate(-1)}
//             className="mb-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
//           >
//             ← Back
//           </button>
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">
//             {employee?.name}'s Attendance Details
//           </h1>
//           <p className="text-gray-600">Employee ID: {employee?.id}</p>
//         </div>

//         {/* Month/Year Selection */}
//         <div className="mb-6 flex flex-wrap gap-4 items-center">
//           <select 
//             value={selectedMonth} 
//             onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
//             className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//           >
//             {[...Array(12)].map((_, i) => (
//               <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
//             ))}
//           </select>
          
//           <select 
//             value={selectedYear} 
//             onChange={(e) => setSelectedYear(parseInt(e.target.value))}
//             className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//           >
//             {[2024, 2025, 2026, 2027].map(year => (
//               <option key={year} value={year}>{year}</option>
//             ))}
//           </select>
          
//           <button 
//             onClick={fetchEmployeeData}
//             className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
//           >
//             Load Data
//           </button>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//           <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
//             <h3 className="text-lg font-semibold text-gray-700 mb-2">Present Days</h3>
//             <p className="text-3xl font-bold text-green-600">{stats.presentCount}</p>
//           </div>
//           <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500">
//             <h3 className="text-lg font-semibold text-gray-700 mb-2">Absent Days</h3>
//             <p className="text-3xl font-bold text-red-600">{stats.absentCount}</p>
//           </div>
//           <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500">
//             <h3 className="text-lg font-semibold text-gray-700 mb-2">Late Days</h3>
//             <p className="text-3xl font-bold text-yellow-600">{stats.lateCount}</p>
//           </div>
//           <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
//             <h3 className="text-lg font-semibold text-gray-700 mb-2">Leave Days</h3>
//             <p className="text-3xl font-bold text-blue-600">{stats.leaveCount}</p>
//           </div>
//         </div>

//         {/* Calendar View */}
//         <div className="bg-white p-6 rounded-xl shadow-md mb-8">
//           <h2 className="text-xl font-semibold text-gray-800 mb-4">Monthly Attendance Calendar</h2>
//           <div className="mb-4">
//             <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
//             <span className="mr-4">Present (P)</span>
//             <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
//             <span className="mr-4">Absent (A)</span>
//             <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
//             <span className="mr-4">Late (L)</span>
//             <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
//             <span className="mr-4">Leave (LV)</span>
//             <span className="inline-block w-3 h-3 bg-gray-400 rounded-full mr-2"></span>
//             <span>Weekend (W)</span>
//           </div>
//           {renderCalendarView()}
//         </div>

//         {/* Detailed Table */}
//         <div className="bg-white rounded-xl shadow-md overflow-hidden">
//           <h2 className="text-xl font-semibold text-gray-800 p-6 pb-4">Detailed Attendance Records</h2>
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Punch In</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Punch Out</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours Worked</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {attendanceData.monthly.map((record, index) => {
//                   const date = new Date(record.date);
//                   const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                  
//                   return (
//                     <tr key={index} className="hover:bg-gray-50">
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                         {record.date}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {dayNames[date.getDay()]}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                           record.status === 'present' ? 'bg-green-100 text-green-800' :
//                           record.status === 'absent' ? 'bg-red-100 text-red-800' :
//                           record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
//                           'bg-blue-100 text-blue-800'
//                         }`}>
//                           {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                         {record.punch_in_time || '-'}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                         {record.punch_out_time || '-'}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                         {record.hours_worked || '-'}
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EmployeeAttendanceDetail;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiCall } from '../../config/api';

const EmployeeAttendanceDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [attendanceData, setAttendanceData] = useState({
    monthly: [],
    weekly: [],
    yearly: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchEmployeeData();
  }, [userId]);

  const fetchEmployeeData = async () => {
    try {
      const response = await apiCall(`/users/${userId}`);
      setEmployee(response.data);
      
      const attendanceResponse = await apiCall(`/attendance/user/${userId}`, 'GET', null, {
        month: selectedMonth,
        year: selectedYear
      });
      
      if (attendanceResponse.success) {
        setAttendanceData(attendanceResponse.data);
      } else {
        console.error('Error fetching attendance data:', attendanceResponse.message);
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const renderCalendarView = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
    const days = [];
    
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const attendanceRecord = attendanceData.monthly.find(record => record.date === dateString);
      
      const date = new Date(selectedYear, selectedMonth - 1, day);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      let statusClass = 'bg-gray-200';
      
      if (isWeekend) {
        statusClass = 'bg-gray-400';
      } else if (attendanceRecord) {
        if (attendanceRecord.status === 'present') statusClass = 'bg-green-500';
        else if (attendanceRecord.status === 'absent') statusClass = 'bg-red-500';
        else if (attendanceRecord.status === 'late') statusClass = 'bg-yellow-500';
        else if (attendanceRecord.status === 'leave') statusClass = 'bg-blue-500';
      }

      days.push(
        <div key={day} className="aspect-square p-0.5">
          <div className={`h-full rounded ${statusClass} flex items-center justify-center text-[8px] font-medium text-white`}>
            {day}
          </div>
        </div>
      );
    }

    return <div className="grid grid-cols-7 gap-0.5">{days}</div>;
  };

  const getAttendanceStats = () => {
    const presentCount = attendanceData.monthly.filter(record => record.status === 'present').length;
    const absentCount = attendanceData.monthly.filter(record => record.status === 'absent').length;
    const lateCount = attendanceData.monthly.filter(record => record.status === 'late').length;
    const leaveCount = attendanceData.monthly.filter(record => record.status === 'leave').length;

    return { presentCount, absentCount, lateCount, leaveCount };
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent mx-auto"></div>
          <p className="mt-2 text-xs text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const stats = getAttendanceStats();

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50 p-2 sm:p-4">
      <div className="h-full max-w-7xl mx-auto flex flex-col">
        
        {/* Header - Ultra Compact */}
        <div className="flex-shrink-0 mb-2">
          <div className="flex items-center justify-between mb-2">
            <button 
              onClick={() => navigate(-1)}
              className="px-2 py-1 bg-white rounded-lg hover:bg-gray-100 text-xs flex items-center gap-1 shadow-sm"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            
            <div className="flex items-center gap-2">
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-indigo-500"
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString('default', { month: 'short' })}
                  </option>
                ))}
              </select>
              
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-indigo-500"
              >
                {[2024, 2025, 2026, 2027].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              
              <button 
                onClick={fetchEmployeeData}
                className="px-2 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700"
              >
                ↻
              </button>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-2 shadow">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
                <span className="text-sm font-bold text-white">
                  {employee?.name?.charAt(0).toUpperCase() || 'E'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-sm font-bold text-white truncate">{employee?.name}</h1>
                <p className="text-[10px] text-indigo-100">ID: {employee?.id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area - Flexible */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-3">
          
          {/* Left Column - Stats & Calendar */}
          <div className="lg:col-span-1 space-y-2 overflow-auto">
            
            {/* Stats - Ultra Compact */}
            <div className="grid grid-cols-2 gap-1.5">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-2 shadow">
                <div className="flex items-center gap-1 mb-1">
                  <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-[9px] text-white/80">Present</span>
                </div>
                <p className="text-xl font-bold text-white">{stats.presentCount}</p>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-2 shadow">
                <div className="flex items-center gap-1 mb-1">
                  <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-[9px] text-white/80">Absent</span>
                </div>
                <p className="text-xl font-bold text-white">{stats.absentCount}</p>
              </div>

              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-2 shadow">
                <div className="flex items-center gap-1 mb-1">
                  <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-[9px] text-white/80">Late</span>
                </div>
                <p className="text-xl font-bold text-white">{stats.lateCount}</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-2 shadow">
                <div className="flex items-center gap-1 mb-1">
                  <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-[9px] text-white/80">Leave</span>
                </div>
                <p className="text-xl font-bold text-white">{stats.leaveCount}</p>
              </div>
            </div>

            {/* Calendar - 5cm x 5cm (approx 190px) */}
            <div className="bg-white rounded-lg shadow p-2">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-[10px] font-bold text-gray-700">Calendar</h3>
              </div>
              
              {/* Legend */}
              <div className="flex gap-1 mb-1.5 text-[8px] flex-wrap">
                <div className="flex items-center gap-0.5">
                  <div className="w-2 h-2 bg-green-500 rounded-sm"></div>
                  <span>P</span>
                </div>
                <div className="flex items-center gap-0.5">
                  <div className="w-2 h-2 bg-red-500 rounded-sm"></div>
                  <span>A</span>
                </div>
                <div className="flex items-center gap-0.5">
                  <div className="w-2 h-2 bg-yellow-500 rounded-sm"></div>
                  <span>L</span>
                </div>
                <div className="flex items-center gap-0.5">
                  <div className="w-2 h-2 bg-blue-500 rounded-sm"></div>
                  <span>LV</span>
                </div>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-0.5 mb-0.5">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                  <div key={index} className="text-center text-[8px] font-bold text-gray-600 py-0.5">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Grid - Fixed size ~5cm */}
              <div className="w-[190px] h-[190px]">
                {renderCalendarView()}
              </div>
            </div>
          </div>

          {/* Right Column - Table */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden flex flex-col min-h-0">
            <div className="flex-shrink-0 bg-gradient-to-r from-indigo-600 to-purple-600 px-2 py-1.5">
              <h2 className="text-xs font-bold text-white">Attendance Records</h2>
            </div>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-[10px]">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-2 py-1 text-left font-bold text-gray-700">Date</th>
                    <th className="px-2 py-1 text-left font-bold text-gray-700 hidden sm:table-cell">Day</th>
                    <th className="px-2 py-1 text-left font-bold text-gray-700">Status</th>
                    <th className="px-2 py-1 text-left font-bold text-gray-700">In</th>
                    <th className="px-2 py-1 text-left font-bold text-gray-700">Out</th>
                    <th className="px-2 py-1 text-left font-bold text-gray-700 hidden md:table-cell">Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {attendanceData.monthly.map((record, index) => {
                    const date = new Date(record.date);
                    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-2 py-1 font-medium text-gray-900">
                          {record.date.slice(5)}
                        </td>
                        <td className="px-2 py-1 text-gray-600 hidden sm:table-cell">
                          {dayNames[date.getDay()]}
                        </td>
                        <td className="px-2 py-1">
                          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${
                            record.status === 'present' ? 'bg-green-500 text-white' :
                            record.status === 'absent' ? 'bg-red-500 text-white' :
                            record.status === 'late' ? 'bg-yellow-500 text-white' :
                            'bg-blue-500 text-white'
                          }`}>
                            {record.status[0].toUpperCase()}
                          </span>
                        </td>
                        <td className="px-2 py-1 text-gray-900">
                          {record.punch_in_time?.slice(0, 5) || '-'}
                        </td>
                        <td className="px-2 py-1 text-gray-900">
                          {record.punch_out_time?.slice(0, 5) || '-'}
                        </td>
                        <td className="px-2 py-1 font-medium text-gray-900 hidden md:table-cell">
                          {record.hours_worked || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAttendanceDetail;