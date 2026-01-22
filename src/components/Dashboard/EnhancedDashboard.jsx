import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import API_CONFIG, { apiCall } from '../../config/api';
import { useNavigate } from 'react-router-dom';

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

  // Mock data for demonstration
  useEffect(() => {
    fetchDashboardData();
  }, [filter]);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const statsResponse = await fetchStats();
      setStats(statsResponse);
      
      // Fetch attendance data
      const attendanceResponse = await fetchAttendanceData();
      setAttendanceData(attendanceResponse);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock function to simulate API calls
  const fetchStats = async () => {
    // In a real implementation, this would call the backend API
    return {
      totalEmployees: 150,
      todayPresent: 120,
      todayAbsent: 30
    };
  };

  const fetchAttendanceData = async () => {
    // In a real implementation, this would call the backend API
    return [
      { id: 1, name: 'John Doe', email: 'john@example.com', shift: 'Morning', faceRegistered: true, punchIn: '08:30 AM', punchOut: '05:30 PM', status: 'present' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', shift: 'Evening', faceRegistered: true, punchIn: '12:00 PM', punchOut: '10:00 PM', status: 'present' },
      { id: 3, name: 'Robert Johnson', email: 'robert@example.com', shift: 'Night', faceRegistered: false, punchIn: null, punchOut: null, status: 'absent' },
      { id: 4, name: 'Emily Davis', email: 'emily@example.com', shift: 'Morning', faceRegistered: true, punchIn: '08:45 AM', punchOut: '05:15 PM', status: 'late' },
      { id: 5, name: 'Michael Wilson', email: 'michael@example.com', shift: 'Evening', faceRegistered: true, punchIn: '11:55 AM', punchOut: '10:05 PM', status: 'present' },
    ];
  };

  const handleDateFilter = () => {
    if (dateRange.start && dateRange.end) {
      setFilter('custom');
      // In a real implementation, this would fetch data for the custom date range
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Employees</h3>
            <p className="text-3xl font-bold text-gray-800">{stats.totalEmployees}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Today Present</h3>
            <p className="text-3xl font-bold text-gray-800">{stats.todayPresent}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Today Absent</h3>
            <p className="text-3xl font-bold text-gray-800">{stats.todayAbsent}</p>
          </div>
        </div>
        
        {/* Attendance Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Attendance Tracker</h2>
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
            <p className="text-gray-500">Attendance chart visualization would go here</p>
          </div>
        </div>
        
        {/* Filter Buttons */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('today')}
              className={`px-4 py-2 rounded ${
                filter === 'today' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setFilter('yesterday')}
              className={`px-4 py-2 rounded ${
                filter === 'yesterday' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Yesterday
            </button>
            <button
              onClick={() => setFilter('week')}
              className={`px-4 py-2 rounded ${
                filter === 'week' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Last Week
            </button>
            <div className="flex gap-2 items-center">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="border rounded px-2 py-1"
              />
              <span>to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="border rounded px-2 py-1"
              />
              <button
                onClick={handleDateFilter}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
        
        {/* Attendance Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shift</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Face Registered</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Punch In</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Punch Out</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceData.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => navigate(`/employee/${record.id}`)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {record.name}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{record.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{record.shift}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        record.faceRegistered ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {record.faceRegistered ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.punchIn || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.punchOut || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.status)}`}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => navigate(`/employee/${record.id}`)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        View
                      </button>
                      <button 
                        onClick={() => navigate(`/employee/${record.id}`)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Preview
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}