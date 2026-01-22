import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { FaArrowLeft, FaCalendarAlt, FaChartBar, FaChartLine } from 'react-icons/fa';

const EmployeeDetail = ({ employeeId }) => {
  const [employee, setEmployee] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);
  const [viewType, setViewType] = useState('monthly'); // monthly, weekly, yearly
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  const mockEmployee = {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    shift: 'Morning',
    position: 'Software Engineer',
    totalLate: 3
  };

  const mockAttendanceData = [
    { day: '01', status: 'P', late: false },
    { day: '02', status: 'P', late: false },
    { day: '03', status: 'A', late: false },
    { day: '04', status: 'P', late: true },
    { day: '05', status: 'P', late: false },
    { day: '06', status: 'P', late: false },
    { day: '07', status: 'A', late: false },
    { day: '08', status: 'P', late: false },
    { day: '09', status: 'P', late: true },
    { day: '10', status: 'P', late: false },
    { day: '11', status: 'P', late: false },
    { day: '12', status: 'P', late: false },
    { day: '13', status: 'A', late: false },
    { day: '14', status: 'P', late: false },
    { day: '15', status: 'P', late: false },
    { day: '16', status: 'P', late: true },
    { day: '17', status: 'P', late: false },
    { day: '18', status: 'P', late: false },
    { day: '19', status: 'A', late: false },
    { day: '20', status: 'P', late: false },
    { day: '21', status: 'P', late: false },
    { day: '22', status: 'P', late: false },
    { day: '23', status: 'P', late: false },
    { day: '24', status: 'A', late: false },
    { day: '25', status: 'P', late: false },
    { day: '26', status: 'P', late: false },
    { day: '27', status: 'P', late: true },
    { day: '28', status: 'P', late: false },
    { day: '29', status: 'P', late: false },
    { day: '30', status: 'P', late: false },
    { day: '31', status: 'A', late: false }
  ];

  const mockMonthlyData = [
    { month: 'Jan', present: 25, absent: 5, late: 2 },
    { month: 'Feb', present: 22, absent: 8, late: 3 },
    { month: 'Mar', present: 26, absent: 4, late: 1 },
    { month: 'Apr', present: 24, absent: 6, late: 2 },
    { month: 'May', present: 27, absent: 3, late: 1 },
    { month: 'Jun', present: 23, absent: 7, late: 2 }
  ];

  const mockWeeklyData = [
    { week: 'W1', present: 5, absent: 2, late: 1 },
    { week: 'W2', present: 4, absent: 3, late: 0 },
    { week: 'W3', present: 6, absent: 1, late: 1 },
    { week: 'W4', present: 5, absent: 2, late: 1 }
  ];

  const mockYearlyData = [
    { year: '2023', present: 280, absent: 40, late: 15 },
    { year: '2024', present: 275, absent: 45, late: 12 }
  ];

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setEmployee(mockEmployee);
      setAttendanceData(mockAttendanceData);
      setMonthlyData(mockMonthlyData);
      setWeeklyData(mockWeeklyData);
      setYearlyData(mockYearlyData);
      setLoading(false);
    }, 1000);
  }, [employeeId]);

  const getStatusColor = (status, late) => {
    if (status === 'A') return 'bg-red-500 text-white'; // Absent
    if (late) return 'bg-yellow-500 text-white'; // Late
    return 'bg-green-500 text-white'; // Present
  };

  const getStatusText = (status, late) => {
    if (status === 'A') return 'A'; // Absent
    if (late) return 'P*'; // Present but late
    return 'P'; // Present
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
      <div className="mb-6">
        <button className="flex items-center text-blue-600 hover:text-blue-800 mb-4">
          <FaArrowLeft className="mr-2" /> Back to Employees
        </button>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{employee.name}</h1>
              <p className="text-gray-600">{employee.email}</p>
              <div className="mt-2 flex space-x-4">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {employee.position}
                </span>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                  {employee.shift} Shift
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-800">Total Late: {employee.totalLate}</div>
              <div className="text-sm text-gray-600">This Month</div>
            </div>
          </div>
        </div>
      </div>

      {/* View Type Selector */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setViewType('monthly')}
          className={`px-4 py-2 rounded-lg flex items-center ${
            viewType === 'monthly' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <FaChartBar className="mr-2" /> Monthly Data
        </button>
        <button
          onClick={() => setViewType('weekly')}
          className={`px-4 py-2 rounded-lg flex items-center ${
            viewType === 'weekly' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <FaChartLine className="mr-2" /> Weekly Data
        </button>
        <button
          onClick={() => setViewType('yearly')}
          className={`px-4 py-2 rounded-lg flex items-center ${
            viewType === 'yearly' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <FaCalendarAlt className="mr-2" /> Yearly Data
        </button>
      </div>

      {/* Chart based on view type */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {viewType === 'monthly' && 'Monthly Attendance Overview'}
          {viewType === 'weekly' && 'Weekly Attendance Overview'}
          {viewType === 'yearly' && 'Yearly Attendance Overview'}
        </h2>
        
        <ResponsiveContainer width="100%" height={300}>
          {viewType === 'monthly' && (
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="present" fill="#10B981" name="Present Days" />
              <Bar dataKey="absent" fill="#EF4444" name="Absent Days" />
              <Bar dataKey="late" fill="#F59E0B" name="Late Days" />
            </BarChart>
          )}
          
          {viewType === 'weekly' && (
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="present" fill="#10B981" name="Present Days" />
              <Bar dataKey="absent" fill="#EF4444" name="Absent Days" />
              <Bar dataKey="late" fill="#F59E0B" name="Late Days" />
            </BarChart>
          )}
          
          {viewType === 'yearly' && (
            <LineChart data={yearlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="present" stroke="#10B981" name="Present Days" strokeWidth={2} />
              <Line type="monotone" dataKey="absent" stroke="#EF4444" name="Absent Days" strokeWidth={2} />
              <Line type="monotone" dataKey="late" stroke="#F59E0B" name="Late Days" strokeWidth={2} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Calendar View */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Monthly Calendar View</h2>
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <div key={index} className="text-center font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}
          {Array.from({ length: 31 }, (_, i) => {
            const dayData = attendanceData[i];
            return (
              <div 
                key={i} 
                className={`aspect-square flex items-center justify-center rounded-lg cursor-pointer hover:opacity-80 transition-opacity ${
                  getStatusColor(dayData.status, dayData.late)
                }`}
                title={`${dayData.status === 'A' ? 'Absent' : dayData.late ? 'Present (Late)' : 'Present'} - Day ${i + 1}`}
              >
                {getStatusText(dayData.status, dayData.late)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetail;