import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FaUserFriends, FaClock, FaCalendarDay, FaCalendarAlt } from 'react-icons/fa';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    todayPresent: 0,
    todayAbsent: 0
  });
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceFilter, setAttendanceFilter] = useState('today');
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  const mockStats = {
    totalEmployees: 24,
    todayPresent: 18,
    todayAbsent: 6
  };

  const mockAttendanceData = [
    { name: 'Mon', present: 15, absent: 5 },
    { name: 'Tue', present: 18, absent: 2 },
    { name: 'Wed', present: 16, absent: 4 },
    { name: 'Thu', present: 17, absent: 3 },
    { name: 'Fri', present: 14, absent: 6 },
    { name: 'Sat', present: 8, absent: 2 },
    { name: 'Sun', present: 5, absent: 1 }
  ];

  const mockAttendanceList = [
    { id: 1, name: 'John Doe', shift: 'Morning', punchIn: '08:00 AM', punchOut: '05:00 PM', action: 'view' },
    { id: 2, name: 'Jane Smith', shift: 'Evening', punchIn: '02:00 PM', punchOut: '10:00 PM', action: 'view' },
    { id: 3, name: 'Mike Johnson', shift: 'Night', punchIn: '10:00 PM', punchOut: '06:00 AM', action: 'view' },
    { id: 4, name: 'Sarah Wilson', shift: 'Morning', punchIn: '08:15 AM', punchOut: '05:10 PM', action: 'view' },
    { id: 5, name: 'David Brown', shift: 'Evening', punchIn: '01:45 PM', punchOut: '09:30 PM', action: 'view' }
  ];

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setStats(mockStats);
      setAttendanceData(mockAttendanceData);
      setAttendanceList(mockAttendanceList);
      setLoading(false);
    }, 1000);
  }, [attendanceFilter]);

  const COLORS = ['#0088FE', '#FF8042'];

  const pieData = [
    { name: 'Present', value: stats.todayPresent },
    { name: 'Absent', value: stats.todayAbsent }
  ];

  const handleFilterChange = (filter) => {
    setAttendanceFilter(filter);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
          <div className="bg-blue-100 p-3 rounded-full mr-4">
            <FaUserFriends className="text-blue-600 text-2xl" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Employees</p>
            <p className="text-2xl font-bold text-gray-800">{stats.totalEmployees}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
          <div className="bg-green-100 p-3 rounded-full mr-4">
            <FaClock className="text-green-600 text-2xl" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Today Present</p>
            <p className="text-2xl font-bold text-gray-800">{stats.todayPresent}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
          <div className="bg-red-100 p-3 rounded-full mr-4">
            <FaCalendarDay className="text-red-600 text-2xl" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Today Absent</p>
            <p className="text-2xl font-bold text-gray-800">{stats.todayAbsent}</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Weekly Attendance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="present" fill="#10B981" name="Present" />
              <Bar dataKey="absent" fill="#EF4444" name="Absent" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Attendance Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Attendance Records</h2>
          
          {/* Filter Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => handleFilterChange('today')}
              className={`px-3 py-1 text-sm rounded ${
                attendanceFilter === 'today' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => handleFilterChange('yesterday')}
              className={`px-3 py-1 text-sm rounded ${
                attendanceFilter === 'yesterday' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Yesterday
            </button>
            <button
              onClick={() => handleFilterChange('one_day_ago')}
              className={`px-3 py-1 text-sm rounded ${
                attendanceFilter === 'one_day_ago' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              1 Day Ago
            </button>
            <button
              onClick={() => handleFilterChange('custom')}
              className={`px-3 py-1 text-sm rounded flex items-center ${
                attendanceFilter === 'custom' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <FaCalendarAlt className="mr-1" /> Custom
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shift
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Punch In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Punch Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendanceList.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{record.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{record.shift}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{record.punchIn}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{record.punchOut}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;