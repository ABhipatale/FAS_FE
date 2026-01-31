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
//       const userResponse = await apiCall(`/users/${userId}`);
//       if (userResponse.data.success) {
//         setEmployee(userResponse.data.data);
//       } else {
//         setEmployee(userResponse.data.data || {});
//       }
      
//       const attendanceResponse = await apiCall(`/attendance/user/${userId}?month=${selectedMonth}&year=${selectedYear}`);
      
//       if (attendanceResponse.data.success) {
//         setAttendanceData(attendanceResponse.data.data);
//       } else {
//         console.error('Error fetching attendance data:', attendanceResponse.data.message);
//         // Set empty data if there's an error
//         setAttendanceData({
//           monthly: [],
//           weekly: [],
//           yearly: []
//         });
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

//   const getFirstDayOfMonth = (month, year) => {
//     return new Date(year, month - 1, 1).getDay();
//   };

//   const renderCalendarView = () => {
//     const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
//     const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
//     const days = [];
    
//     for (let i = 0; i < firstDay; i++) {
//       days.push(<div key={`empty-${i}`} className="cal-empty"></div>);
//     }
    
//     for (let day = 1; day <= daysInMonth; day++) {
//       const dateString = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
//       const attendanceRecord = attendanceData.monthly.find(record => record.date === dateString);
      
//       const date = new Date(selectedYear, selectedMonth - 1, day);
//       const dayOfWeek = date.getDay();
//       const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
//       const isToday = dateString === new Date().toISOString().split('T')[0];
      
//       let statusClass = '';
      
//       if (isWeekend) {
//         statusClass = 'weekend';
//       } else if (attendanceRecord) {
//         statusClass = attendanceRecord.status;
//       }

//       days.push(
//         <div 
//           key={day} 
//           className={`cal-day ${statusClass} ${isToday ? 'today' : ''}`}
//           title={attendanceRecord ? `${attendanceRecord.status.toUpperCase()} - ${attendanceRecord.punch_in_time || 'N/A'}` : 'No record'}
//         >
//           {day}
//         </div>
//       );
//     }

//     return <div className="cal-grid">{days}</div>;
//   };

//   const getAttendanceStats = () => {
//     const presentCount = attendanceData.monthly.filter(record => record.status === 'present').length;
//     const absentCount = attendanceData.monthly.filter(record => record.status === 'absent').length;
//     const lateCount = attendanceData.monthly.filter(record => record.status === 'late').length;
//     const leaveCount = attendanceData.monthly.filter(record => record.status === 'leave').length;
//     const totalDays = presentCount + absentCount + lateCount + leaveCount;
//     const attendanceRate = totalDays > 0 ? ((presentCount + lateCount) / totalDays * 100).toFixed(1) : 0;

//     return { presentCount, absentCount, lateCount, leaveCount, attendanceRate, totalDays };
//   };

//   if (loading) {
//     return (
//       <div className="loading-screen">
//         <style>{`
//           .loading-screen {
//             min-height: 100vh;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//           }
//           .loader {
//             width: 60px;
//             height: 60px;
//             border: 5px solid rgba(255,255,255,0.3);
//             border-radius: 50%;
//             border-top-color: #fff;
//             animation: spin 1s ease-in-out infinite;
//           }
//           @keyframes spin {
//             to { transform: rotate(360deg); }
//           }
//           .loading-text {
//             color: white;
//             font-size: 1.125rem;
//             font-weight: 600;
//             margin-top: 1.5rem;
//             font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
//           }
//         `}</style>
//         <div style={{ textAlign: 'center' }}>
//           <div className="loader"></div>
//           <p className="loading-text">Loading attendance data...</p>
//         </div>
//       </div>
//     );
//   }

//   const stats = getAttendanceStats();
//   const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' });

//   return (
//     <div className="attendance-page">
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;700&display=swap');

//         * {
//           margin: 0;
//           padding: 0;
//           box-sizing: border-box;
//         }

//         .attendance-page {
//           min-height: 100vh;
//           background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//           font-family: 'DM Sans', sans-serif;
//           padding: 2rem;
//         }

//         .container {
//           max-width: 1400px;
//           margin: 0 auto;
//           animation: fadeIn 0.6s ease-out;
//         }

//         @keyframes fadeIn {
//           from {
//             opacity: 0;
//             transform: translateY(20px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }

//         /* Header */
//         .page-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           margin-bottom: 2rem;
//           flex-wrap: wrap;
//           gap: 1rem;
//         }

//         .back-btn {
//           display: inline-flex;
//           align-items: center;
//           gap: 0.5rem;
//           padding: 0.75rem 1.5rem;
//           background: rgba(255, 255, 255, 0.2);
//           backdrop-filter: blur(10px);
//           border: 2px solid rgba(255, 255, 255, 0.3);
//           border-radius: 12px;
//           color: white;
//           font-weight: 600;
//           font-size: 0.95rem;
//           cursor: pointer;
//           transition: all 0.3s ease;
//         }

//         .back-btn:hover {
//           background: rgba(255, 255, 255, 0.3);
//           transform: translateX(-5px);
//         }

//         .controls {
//           display: flex;
//           gap: 0.75rem;
//           align-items: center;
//           flex-wrap: wrap;
//         }

//         .select-control {
//           padding: 0.75rem 1rem;
//           background: rgba(255, 255, 255, 0.95);
//           border: none;
//           border-radius: 12px;
//           font-weight: 600;
//           font-size: 0.95rem;
//           cursor: pointer;
//           transition: all 0.3s ease;
//           box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
//         }

//         .select-control:hover {
//           background: white;
//           transform: translateY(-2px);
//           box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
//         }

//         .refresh-btn {
//           width: 45px;
//           height: 45px;
//           background: rgba(255, 255, 255, 0.2);
//           backdrop-filter: blur(10px);
//           border: 2px solid rgba(255, 255, 255, 0.3);
//           border-radius: 12px;
//           color: white;
//           font-size: 1.25rem;
//           cursor: pointer;
//           transition: all 0.3s ease;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//         }

//         .refresh-btn:hover {
//           background: rgba(255, 255, 255, 0.3);
//           transform: rotate(180deg);
//         }

//         /* Employee Card */
//         .employee-card {
//           background: white;
//           border-radius: 24px;
//           padding: 2rem;
//           margin-bottom: 2rem;
//           box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
//           animation: slideUp 0.6s ease-out 0.1s both;
//         }

//         @keyframes slideUp {
//           from {
//             opacity: 0;
//             transform: translateY(30px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }

//         .employee-info {
//           display: flex;
//           align-items: center;
//           gap: 1.5rem;
//         }

//         .avatar {
//           width: 80px;
//           height: 80px;
//           background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//           border-radius: 20px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           color: white;
//           font-size: 2rem;
//           font-weight: 800;
//           font-family: 'Poppins', sans-serif;
//           box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
//           flex-shrink: 0;
//         }

//         .info-text h1 {
//           font-family: 'Poppins', sans-serif;
//           font-size: 1.875rem;
//           font-weight: 700;
//           color: #1a202c;
//           margin-bottom: 0.25rem;
//         }

//         .info-meta {
//           display: flex;
//           gap: 1.5rem;
//           flex-wrap: wrap;
//           font-size: 0.95rem;
//           color: #718096;
//         }

//         .meta-item {
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//         }

//         .meta-label {
//           font-weight: 600;
//           color: #4a5568;
//         }

//         /* Main Grid */
//         .main-grid {
//           display: grid;
//           grid-template-columns: 1fr 1fr;
//           gap: 2rem;
//           margin-bottom: 2rem;
//         }

//         @media (max-width: 1024px) {
//           .main-grid {
//             grid-template-columns: 1fr;
//           }
//         }

//         /* Stats Cards */
//         .stats-section {
//           animation: slideUp 0.6s ease-out 0.2s both;
//         }

//         .stats-grid {
//           display: grid;
//           grid-template-columns: repeat(2, 1fr);
//           gap: 1rem;
//           margin-bottom: 1.5rem;
//         }

//         .stat-card {
//           background: white;
//           border-radius: 20px;
//           padding: 1.5rem;
//           box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
//           transition: all 0.3s ease;
//           position: relative;
//           overflow: hidden;
//         }

//         .stat-card::before {
//           content: '';
//           position: absolute;
//           top: 0;
//           left: 0;
//           right: 0;
//           height: 4px;
//           background: var(--accent-color);
//         }

//         .stat-card:hover {
//           transform: translateY(-5px);
//           box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
//         }

//         .stat-card.present {
//           --accent-color: #10b981;
//         }

//         .stat-card.absent {
//           --accent-color: #ef4444;
//         }

//         .stat-card.late {
//           --accent-color: #f59e0b;
//         }

//         .stat-card.leave {
//           --accent-color: #3b82f6;
//         }

//         .stat-header {
//           display: flex;
//           align-items: center;
//           gap: 0.75rem;
//           margin-bottom: 0.75rem;
//         }

//         .stat-icon {
//           width: 40px;
//           height: 40px;
//           background: var(--accent-color);
//           border-radius: 12px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           color: white;
//           font-size: 1.25rem;
//           box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
//         }

//         .stat-label {
//           font-size: 0.875rem;
//           font-weight: 600;
//           color: #64748b;
//           text-transform: uppercase;
//           letter-spacing: 0.5px;
//         }

//         .stat-value {
//           font-family: 'Poppins', sans-serif;
//           font-size: 2.25rem;
//           font-weight: 800;
//           color: #1a202c;
//           line-height: 1;
//         }

//         /* Attendance Rate Card */
//         .rate-card {
//           background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//           border-radius: 20px;
//           padding: 2rem;
//           text-align: center;
//           box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
//           position: relative;
//           overflow: hidden;
//         }

//         .rate-card::before {
//           content: '';
//           position: absolute;
//           top: -50%;
//           right: -50%;
//           width: 200%;
//           height: 200%;
//           background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
//           animation: float 6s ease-in-out infinite;
//         }

//         @keyframes float {
//           0%, 100% { transform: translate(0, 0) rotate(0deg); }
//           50% { transform: translate(-20px, -20px) rotate(180deg); }
//         }

//         .rate-percentage {
//           font-family: 'Poppins', sans-serif;
//           font-size: 3.5rem;
//           font-weight: 800;
//           color: white;
//           margin-bottom: 0.5rem;
//           position: relative;
//           z-index: 1;
//         }

//         .rate-label {
//           font-size: 1rem;
//           font-weight: 600;
//           color: rgba(255, 255, 255, 0.9);
//           text-transform: uppercase;
//           letter-spacing: 1px;
//           position: relative;
//           z-index: 1;
//         }

//         .rate-info {
//           margin-top: 1rem;
//           font-size: 0.875rem;
//           color: rgba(255, 255, 255, 0.8);
//           position: relative;
//           z-index: 1;
//         }

//         /* Calendar Section */
//         .calendar-section {
//           animation: slideUp 0.6s ease-out 0.3s both;
//         }

//         .calendar-card {
//           background: white;
//           border-radius: 20px;
//           padding: 1.5rem;
//           box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
//         }

//         .calendar-header {
//           margin-bottom: 1.5rem;
//         }

//         .calendar-title {
//           font-family: 'Poppins', sans-serif;
//           font-size: 1.25rem;
//           font-weight: 700;
//           color: #1a202c;
//           margin-bottom: 1rem;
//         }

//         .legend {
//           display: flex;
//           gap: 1rem;
//           flex-wrap: wrap;
//         }

//         .legend-item {
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//           font-size: 0.875rem;
//           font-weight: 500;
//           color: #64748b;
//         }

//         .legend-dot {
//           width: 12px;
//           height: 12px;
//           border-radius: 3px;
//         }

//         .legend-dot.present { background: #10b981; }
//         .legend-dot.absent { background: #ef4444; }
//         .legend-dot.late { background: #f59e0b; }
//         .legend-dot.leave { background: #3b82f6; }
//         .legend-dot.weekend { background: #cbd5e1; }

//         .cal-weekdays {
//           display: grid;
//           grid-template-columns: repeat(7, 1fr);
//           gap: 0.5rem;
//           margin-bottom: 0.5rem;
//         }

//         .cal-weekday {
//           text-align: center;
//           font-size: 0.875rem;
//           font-weight: 700;
//           color: #64748b;
//           padding: 0.5rem;
//         }

//         .cal-grid {
//           display: grid;
//           grid-template-columns: repeat(7, 1fr);
//           gap: 0.5rem;
//         }

//         .cal-day {
//           aspect-ratio: 1;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           font-weight: 600;
//           font-size: 0.95rem;
//           border-radius: 10px;
//           cursor: pointer;
//           transition: all 0.3s ease;
//           background: #f8fafc;
//           color: #1a202c;
//           border: 2px solid transparent;
//         }

//         .cal-day:hover {
//           transform: scale(1.1);
//           box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
//           z-index: 10;
//         }

//         .cal-empty {
//           aspect-ratio: 1;
//         }

//         .cal-day.today {
//           border: 2px solid #667eea;
//           box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
//           font-weight: 800;
//         }

//         .cal-day.weekend {
//           background: #f1f5f9;
//           color: #94a3b8;
//         }

//         .cal-day.present {
//           background: #d1fae5;
//           color: #065f46;
//           border-color: #10b981;
//         }

//         .cal-day.absent {
//           background: #fee2e2;
//           color: #991b1b;
//           border-color: #ef4444;
//         }

//         .cal-day.late {
//           background: #fef3c7;
//           color: #92400e;
//           border-color: #f59e0b;
//         }

//         .cal-day.leave {
//           background: #dbeafe;
//           color: #1e40af;
//           border-color: #3b82f6;
//         }

//         /* Records Table */
//         .records-section {
//           grid-column: 1 / -1;
//           animation: slideUp 0.6s ease-out 0.4s both;
//         }

//         .records-card {
//           background: white;
//           border-radius: 20px;
//           overflow: hidden;
//           box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
//         }

//         .records-header {
//           background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//           padding: 1.5rem 2rem;
//         }

//         .records-title {
//           font-family: 'Poppins', sans-serif;
//           font-size: 1.5rem;
//           font-weight: 700;
//           color: white;
//         }

//         .records-subtitle {
//           color: rgba(255, 255, 255, 0.9);
//           font-size: 0.95rem;
//           margin-top: 0.25rem;
//         }

//         .table-container {
//           overflow-x: auto;
//           max-height: 600px;
//           overflow-y: auto;
//         }

//         .records-table {
//           width: 100%;
//           border-collapse: collapse;
//         }

//         .records-table thead {
//           position: sticky;
//           top: 0;
//           background: #f8fafc;
//           z-index: 10;
//         }

//         .records-table th {
//           padding: 1.25rem 1.5rem;
//           text-align: left;
//           font-weight: 700;
//           font-size: 0.875rem;
//           color: #475569;
//           text-transform: uppercase;
//           letter-spacing: 0.5px;
//           border-bottom: 2px solid #e2e8f0;
//         }

//         .records-table td {
//           padding: 1.25rem 1.5rem;
//           border-bottom: 1px solid #f1f5f9;
//           font-size: 0.95rem;
//         }

//         .records-table tbody tr {
//           transition: all 0.2s ease;
//         }

//         .records-table tbody tr:hover {
//           background: #f8fafc;
//         }

//         .date-cell {
//           font-weight: 700;
//           color: #1a202c;
//         }

//         .day-cell {
//           color: #64748b;
//         }

//         .status-badge {
//           display: inline-block;
//           padding: 0.4rem 0.875rem;
//           border-radius: 8px;
//           font-weight: 700;
//           font-size: 0.8125rem;
//           text-transform: uppercase;
//           letter-spacing: 0.3px;
//         }

//         .status-badge.present {
//           background: #d1fae5;
//           color: #065f46;
//         }

//         .status-badge.absent {
//           background: #fee2e2;
//           color: #991b1b;
//         }

//         .status-badge.late {
//           background: #fef3c7;
//           color: #92400e;
//         }

//         .status-badge.leave {
//           background: #dbeafe;
//           color: #1e40af;
//         }

//         .time-cell {
//           font-weight: 600;
//           color: #475569;
//           font-variant-numeric: tabular-nums;
//         }

//         .hours-cell {
//           font-weight: 700;
//           color: #1a202c;
//           font-variant-numeric: tabular-nums;
//         }

//         .no-records {
//           text-align: center;
//           padding: 4rem 2rem;
//           color: #94a3b8;
//           font-size: 1rem;
//         }

//         /* Responsive */
//         @media (max-width: 768px) {
//           .attendance-page {
//             padding: 1rem;
//           }

//           .employee-info {
//             flex-direction: column;
//             text-align: center;
//           }

//           .info-text h1 {
//             font-size: 1.5rem;
//           }

//           .info-meta {
//             justify-content: center;
//           }

//           .stats-grid {
//             grid-template-columns: 1fr;
//           }

//           .cal-day {
//             font-size: 0.875rem;
//           }

//           .records-table th,
//           .records-table td {
//             padding: 1rem;
//             font-size: 0.875rem;
//           }
//         }

//         @media (max-width: 640px) {
//           .cal-grid {
//             gap: 0.25rem;
//           }

//           .cal-weekdays {
//             gap: 0.25rem;
//           }

//           .cal-day {
//             font-size: 0.8125rem;
//             border-radius: 6px;
//           }
//         }
//       `}</style>

//       <div className="container">
//         {/* Header */}
//         <div className="page-header">
//           <button onClick={() => navigate(-1)} className="back-btn">
//             <span>←</span>
//             Back
//           </button>
          
//           <div className="controls">
//             <select 
//               value={selectedMonth} 
//               onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
//               className="select-control"
//             >
//               {[...Array(12)].map((_, i) => (
//                 <option key={i + 1} value={i + 1}>
//                   {new Date(0, i).toLocaleString('default', { month: 'long' })}
//                 </option>
//               ))}
//             </select>
            
//             <select 
//               value={selectedYear} 
//               onChange={(e) => setSelectedYear(parseInt(e.target.value))}
//               className="select-control"
//             >
//               {[2023, 2024, 2025, 2026, 2027].map(year => (
//                 <option key={year} value={year}>{year}</option>
//               ))}
//             </select>
            
//             <button onClick={fetchEmployeeData} className="refresh-btn">
//               ↻
//             </button>
//           </div>
//         </div>

//         {/* Employee Card */}
//         <div className="employee-card">
//           <div className="employee-info">
//             <div className="avatar">
//               {employee?.name?.charAt(0).toUpperCase() || 'E'}
//             </div>
//             <div className="info-text">
//               <h1>{employee?.name || 'Employee Name'}</h1>
//               <div className="info-meta">
//                 <div className="meta-item">
//                   <span className="meta-label">ID:</span>
//                   <span>{employee?.id || 'N/A'}</span>
//                 </div>
//                 <div className="meta-item">
//                   <span className="meta-label">Department:</span>
//                   <span>{employee?.department || 'N/A'}</span>
//                 </div>
//                 <div className="meta-item">
//                   <span className="meta-label">Period:</span>
//                   <span>{monthName} {selectedYear}</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Main Grid */}
//         <div className="main-grid">
//           {/* Stats Section */}
//           <div className="stats-section">
//             <div className="stats-grid">
//               <div className="stat-card present">
//                 <div className="stat-header">
//                   <div className="stat-icon">✓</div>
//                   <div className="stat-label">Present</div>
//                 </div>
//                 <div className="stat-value">{stats.presentCount}</div>
//               </div>

//               <div className="stat-card absent">
//                 <div className="stat-header">
//                   <div className="stat-icon">✕</div>
//                   <div className="stat-label">Absent</div>
//                 </div>
//                 <div className="stat-value">{stats.absentCount}</div>
//               </div>

//               <div className="stat-card late">
//                 <div className="stat-header">
//                   <div className="stat-icon">⏰</div>
//                   <div className="stat-label">Late</div>
//                 </div>
//                 <div className="stat-value">{stats.lateCount}</div>
//               </div>

//               <div className="stat-card leave">
//                 <div className="stat-header">
//                   <div className="stat-icon">📋</div>
//                   <div className="stat-label">Leave</div>
//                 </div>
//                 <div className="stat-value">{stats.leaveCount}</div>
//               </div>
//             </div>

//             {/* Attendance Rate */}
//             <div className="rate-card">
//               <div className="rate-percentage">{stats.attendanceRate}%</div>
//               <div className="rate-label">Attendance Rate</div>
//               <div className="rate-info">Based on {stats.totalDays} working days</div>
//             </div>
//           </div>

//           {/* Calendar Section */}
//           <div className="calendar-section">
//             <div className="calendar-card">
//               <div className="calendar-header">
//                 <h2 className="calendar-title">{monthName} {selectedYear}</h2>
//                 <div className="legend">
//                   <div className="legend-item">
//                     <div className="legend-dot present"></div>
//                     <span>Present</span>
//                   </div>
//                   <div className="legend-item">
//                     <div className="legend-dot absent"></div>
//                     <span>Absent</span>
//                   </div>
//                   <div className="legend-item">
//                     <div className="legend-dot late"></div>
//                     <span>Late</span>
//                   </div>
//                   <div className="legend-item">
//                     <div className="legend-dot leave"></div>
//                     <span>Leave</span>
//                   </div>
//                   <div className="legend-item">
//                     <div className="legend-dot weekend"></div>
//                     <span>Weekend</span>
//                   </div>
//                 </div>
//               </div>

//               <div className="cal-weekdays">
//                 {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
//                   <div key={day} className="cal-weekday">{day}</div>
//                 ))}
//               </div>

//               {renderCalendarView()}
//             </div>
//           </div>
//         </div>

//         {/* Records Table */}
//         <div className="records-section">
//           <div className="records-card">
//             <div className="records-header">
//               <h2 className="records-title">Attendance Records</h2>
//               <p className="records-subtitle">Complete monthly attendance details</p>
//             </div>
            
//             <div className="table-container">
//               <table className="records-table">
//                 <thead>
//                   <tr>
//                     <th>Date</th>
//                     <th>Day</th>
//                     <th>Status</th>
//                     <th>Check In</th>
//                     <th>Check Out</th>
//                     <th>Hours</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {attendanceData.monthly.length > 0 ? (
//                     attendanceData.monthly.map((record, index) => {
//                       const date = new Date(record.date);
//                       const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                      
//                       return (
//                         <tr key={index}>
//                           <td className="date-cell">
//                             {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
//                           </td>
//                           <td className="day-cell">{dayNames[date.getDay()]}</td>
//                           <td>
//                             <span className={`status-badge ${record.status}`}>
//                               {record.status}
//                             </span>
//                           </td>
//                           <td className="time-cell">
//                             {record.punch_in_time || '—'}
//                           </td>
//                           <td className="time-cell">
//                             {record.punch_out_time || '—'}
//                           </td>
//                           <td className="hours-cell">
//                             {record.hours_worked || '—'}
//                           </td>
//                         </tr>
//                       );
//                     })
//                   ) : (
//                     <tr>
//                       <td colSpan="6" className="no-records">
//                         No attendance records found for this period.
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EmployeeAttendanceDetail;
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiCall } from "../../config/api";

export default function EmployeeAttendanceDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState({});
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Validate userId
  useEffect(() => {
    if (!userId || isNaN(userId)) {
      console.error("Invalid user ID:", userId);
      navigate("/"); // Redirect to dashboard if invalid ID
      return;
    }
  }, [userId, navigate]);

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadData();
  }, [month, year]);

  const loadData = async () => {
    setLoading(true);

    try {
      const user = await apiCall(`/users/${userId}`);
      const att = await apiCall(`/attendance/user/${userId}?month=${month}&year=${year}`);

      setEmployee(user.data.data || {});
      setRecords(att.data.data?.monthly || []);
    } catch {
      setRecords([]);
    }

    setLoading(false);
  };

  const stats = {
    present: records.filter(r => r.status === "present").length,
    absent: records.filter(r => r.status === "absent").length,
    late: records.filter(r => r.status === "late").length,
    leave: records.filter(r => r.status === "leave").length,
  };

  const rate = records.length
    ? (((stats.present + stats.late) / records.length) * 100).toFixed(1)
    : 0;

  return (
    <div className="page">
<style>{`
:root{
--primary:#2563eb;
--bg:#f8fafc;
--card:#fff;
--border:#e5e7eb;
--text:#0f172a;
--muted:#64748b;
--present:#16a34a;
--absent:#dc2626;
--late:#ca8a04;
--leave:#2563eb;
}

*{box-sizing:border-box;font-family:Inter,system-ui}

.page{background:var(--bg);min-height:100vh;padding:32px}
.container{max-width:1200px;margin:auto}

header{display:flex;justify-content:space-between;margin-bottom:20px}

select,button{
padding:8px 14px;
border-radius:6px;
border:1px solid var(--border);
background:white;
cursor:pointer
}

.card{
background:white;
border:1px solid var(--border);
border-radius:10px;
padding:20px;
margin-bottom:20px
}

.employee{display:flex;gap:16px}
.avatar{
width:60px;height:60px;border-radius:8px;
background:var(--primary);color:white;
display:flex;align-items:center;justify-content:center;
font-size:22px;font-weight:700
}

.grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}

.stats{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}

.stat{border:1px solid var(--border);padding:16px;border-radius:8px}
.stat h4{margin:0;color:var(--muted)}
.stat strong{font-size:28px}

.rate{
margin-top:12px;
background:var(--primary);
color:white;
padding:18px;
border-radius:8px;
text-align:center
}

.calendar{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-top:12px}
.day{
border:1px solid var(--border);
padding:8px;
border-radius:6px;
text-align:center
}

.present{background:#dcfce7}
.absent{background:#fee2e2}
.late{background:#fef9c3}
.leave{background:#dbeafe}

table{width:100%;border-collapse:collapse}
th,td{padding:12px;border-bottom:1px solid var(--border)}
th{background:#f1f5f9;text-align:left}

.badge{
padding:4px 10px;border-radius:6px;font-weight:600
}

@media(max-width:900px){
.grid{grid-template-columns:1fr}
}
`}</style>

<div className="container">

<header>
<button onClick={()=>navigate(-1)}>← Back</button>

<div>
<select value={month} onChange={e=>setMonth(e.target.value)}>
{Array.from({length:12}).map((_,i)=>(
<option key={i+1} value={i+1}>
{new Date(0,i).toLocaleString("default",{month:"long"})}
</option>
))}
</select>

<select value={year} onChange={e=>setYear(e.target.value)}>
{[2024,2025,2026].map(y=><option key={y}>{y}</option>)}
</select>
</div>
</header>

<div className="card employee">
<div className="avatar">{employee?.name?.[0]||"E"}</div>
<div>
<h2>{employee?.name}</h2>
<p>{employee?.department}</p>
</div>
</div>

<div className="grid">

<div>
<div className="stats">
<div className="stat"><h4>Present</h4><strong>{stats.present}</strong></div>
<div className="stat"><h4>Absent</h4><strong>{stats.absent}</strong></div>
<div className="stat"><h4>Late</h4><strong>{stats.late}</strong></div>
<div className="stat"><h4>Leave</h4><strong>{stats.leave}</strong></div>
</div>

<div className="rate">
<h1>{rate}%</h1>
<p>Attendance Rate</p>
</div>
</div>

<div className="card">
<h3>Calendar</h3>
<div className="calendar">
{records.map((r,i)=>(
<div key={i} className={`day ${r.status}`}>
{new Date(r.date).getDate()}
</div>
))}
</div>
</div>

</div>

<div className="card">
<h3>Attendance Records</h3>

<table>
<thead>
<tr>
<th>Date</th>
<th>Status</th>
<th>In</th>
<th>Out</th>
<th>Hours</th>
</tr>
</thead>

<tbody>
{records.map((r,i)=>(
<tr key={i}>
<td>{r.date}</td>
<td><span className={`badge ${r.status}`}>{r.status}</span></td>
<td>{r.punch_in_time||"—"}</td>
<td>{r.punch_out_time||"—"}</td>
<td>{r.hours_worked||"—"}</td>
</tr>
))}
</tbody>
</table>

</div>

</div>
</div>
);
}
