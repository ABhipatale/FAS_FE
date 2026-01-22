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
      
      // Fetch attendance data
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

  const renderCalendarView = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const days = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const attendanceRecord = attendanceData.monthly.find(record => record.date === dateString);
      
      let statusClass = 'bg-gray-200'; // Default for weekends/non-working days
      let statusText = 'N/A';
      
      if (attendanceRecord) {
        if (attendanceRecord.status === 'present') {
          statusClass = 'bg-green-500 text-white';
          statusText = 'P';
        } else if (attendanceRecord.status === 'absent') {
          statusClass = 'bg-red-500 text-white';
          statusText = 'A';
        } else if (attendanceRecord.status === 'late') {
          statusClass = 'bg-yellow-500 text-black';
          statusText = 'L';
        } else if (attendanceRecord.status === 'leave') {
          statusClass = 'bg-blue-500 text-white';
          statusText = 'LV';
        }
      }
      
      // Check if it's weekend (Saturday or Sunday)
      const date = new Date(selectedYear, selectedMonth - 1, day);
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        statusClass = 'bg-gray-400 text-white';
        statusText = 'W';
      }

      days.push(
        <div key={day} className={`flex items-center justify-center h-8 w-8 rounded-full ${statusClass} cursor-pointer hover:scale-110 transition-transform`}>
          {statusText}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-7 gap-2 mb-6">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
          <div key={index} className="text-center font-semibold text-sm text-gray-600">{day}</div>
        ))}
        {days}
      </div>
    );
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading employee data...</p>
        </div>
      </div>
    );
  }

  const stats = getAttendanceStats();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="mb-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {employee?.name}'s Attendance Details
          </h1>
          <p className="text-gray-600">Employee ID: {employee?.id}</p>
        </div>

        {/* Month/Year Selection */}
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>
          
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {[2024, 2025, 2026, 2027].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          
          <button 
            onClick={fetchEmployeeData}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Load Data
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Present Days</h3>
            <p className="text-3xl font-bold text-green-600">{stats.presentCount}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Absent Days</h3>
            <p className="text-3xl font-bold text-red-600">{stats.absentCount}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Late Days</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats.lateCount}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Leave Days</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.leaveCount}</p>
          </div>
        </div>

        {/* Calendar View */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Monthly Attendance Calendar</h2>
          <div className="mb-4">
            <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            <span className="mr-4">Present (P)</span>
            <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
            <span className="mr-4">Absent (A)</span>
            <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
            <span className="mr-4">Late (L)</span>
            <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
            <span className="mr-4">Leave (LV)</span>
            <span className="inline-block w-3 h-3 bg-gray-400 rounded-full mr-2"></span>
            <span>Weekend (W)</span>
          </div>
          {renderCalendarView()}
        </div>

        {/* Detailed Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <h2 className="text-xl font-semibold text-gray-800 p-6 pb-4">Detailed Attendance Records</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Punch In</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Punch Out</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours Worked</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceData.monthly.map((record, index) => {
                  const date = new Date(record.date);
                  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                  
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {dayNames[date.getDay()]}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          record.status === 'present' ? 'bg-green-100 text-green-800' :
                          record.status === 'absent' ? 'bg-red-100 text-red-800' :
                          record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.punch_in_time || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.punch_out_time || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
  );
};

export default EmployeeAttendanceDetail;