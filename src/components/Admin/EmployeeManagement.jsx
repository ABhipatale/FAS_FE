// import React, { useState, useEffect } from 'react';
// import { FaPlus, FaEdit, FaEye, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
// import FourStepEmployeeForm from './FourStepEmployeeForm';
// import { apiCall } from '../../config/api';
// import API_CONFIG from '../../config/api';

// const EmployeeManagement = () => {
//   const [employees, setEmployees] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [selectedEmployee, setSelectedEmployee] = useState(null);

//   // Load employees from API
//   useEffect(() => {
//     fetchEmployees();
//   }, []);

//   const fetchEmployees = async () => {
//     try {
//       const response = await apiCall(API_CONFIG.ENDPOINTS.USERS, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       const data = response.data;
//       if (data.success) {
//         setEmployees(data.data);
//       } else {
//         throw new Error(data.message || 'Failed to load employees');
//       }
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (employeeId) => {
//     if (!window.confirm('Are you sure you want to delete this employee?')) {
//       return;
//     }

//     try {
//       const response = await apiCall(`${API_CONFIG.ENDPOINTS.USERS}/${employeeId}`, {
//         method: 'DELETE',
//         headers: {
//           'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       const data = response.data;

//       if (data.success) {
//         fetchEmployees();
//         alert(data.message);
//       } else {
//         alert(data.message || 'Failed to delete employee');
//       }
//     } catch (err) {
//       setError(err.message);
//       alert('An error occurred while deleting the employee');
//     }
//   };

//   const hasFaceDescriptors = (employee) => {
//     return employee.face_descriptor && Array.isArray(employee.face_descriptor) && employee.face_descriptor.length > 0;
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
//         <strong className="font-bold">Error: </strong>
//         <span className="block sm:inline">{error}</span>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold text-gray-800">Employee Management</h1>
//         <button
//           onClick={() => setShowAddModal(true)}
//           className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition duration-200"
//         >
//           <FaPlus /> Add Employee
//         </button>
//       </div>

//       {/* Employees Table */}
//       <div className="bg-white shadow-md rounded-lg overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Name
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Email
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Shift
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Face Reg
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {employees.map((employee) => (
//                 <tr key={employee.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="text-sm font-medium text-gray-900">{employee.name}</div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="text-sm text-gray-900">{employee.email}</div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="text-sm text-gray-900">
//                       {employee.shift ? employee.shift.shift_name : 'N/A'}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                       hasFaceDescriptors(employee)
//                         ? 'bg-green-100 text-green-800' 
//                         : 'bg-red-100 text-red-800'
//                     }`}>
//                       {hasFaceDescriptors(employee) ? 'Yes' : 'No'}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-2">
//                     <button
//                       onClick={() => setSelectedEmployee(employee)}
//                       className="text-blue-600 hover:text-blue-900"
//                       title="View Details"
//                     >
//                       <FaEye />
//                     </button>
//                     <button
//                       onClick={() => {}}
//                       className="text-green-600 hover:text-green-900"
//                       title="Edit"
//                     >
//                       <FaEdit />
//                     </button>
//                     <button
//                       onClick={() => handleDelete(employee.id)}
//                       className="text-red-600 hover:text-red-900"
//                       title="Delete"
//                     >
//                       <FaTrash />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Add Employee Modal */}
//       {showAddModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
//           <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 my-8 max-h-[90vh] overflow-y-auto">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-xl font-bold text-gray-800">Add New Employee</h2>
//               <button
//                 onClick={() => setShowAddModal(false)}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 <FaTimes size={20} />
//               </button>
//             </div>

//             <FourStepEmployeeForm
//               onClose={() => {
//                 setShowAddModal(false);
//                 fetchEmployees(); // Refresh the list after adding
//               }} 
//             />
//           </div>
//         </div>
//       )}

//       {/* View Employee Details Modal */}
//       {selectedEmployee && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
//           <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 my-8">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-xl font-bold text-gray-800">Employee Details</h2>
//               <button
//                 onClick={() => setSelectedEmployee(null)}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 <FaTimes size={20} />
//               </button>
//             </div>

//             <div className="space-y-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Name</label>
//                   <p className="mt-1 text-sm text-gray-900">{selectedEmployee.name}</p>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Email</label>
//                   <p className="mt-1 text-sm text-gray-900">{selectedEmployee.email}</p>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Position</label>
//                   <p className="mt-1 text-sm text-gray-900">{selectedEmployee.position || 'N/A'}</p>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Phone</label>
//                   <p className="mt-1 text-sm text-gray-900">{selectedEmployee.phone || 'N/A'}</p>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Address</label>
//                   <p className="mt-1 text-sm text-gray-900">{selectedEmployee.address || 'N/A'}</p>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Sex</label>
//                   <p className="mt-1 text-sm text-gray-900">{selectedEmployee.sex || 'N/A'}</p>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Age</label>
//                   <p className="mt-1 text-sm text-gray-900">{selectedEmployee.age || 'N/A'}</p>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
//                   <p className="mt-1 text-sm text-gray-900">{selectedEmployee.dob || 'N/A'}</p>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Shift</label>
//                 <p className="mt-1 text-sm text-gray-900">{selectedEmployee.shift ? selectedEmployee.shift.shift_name : 'N/A'}</p>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Role</label>
//                 <p className="mt-1 text-sm text-gray-900 capitalize">{selectedEmployee.role}</p>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Face Registration</label>
//                 <p className={`mt-1 text-sm ${hasFaceDescriptors(selectedEmployee) ? 'text-green-600' : 'text-red-600'}`}>
//                   {hasFaceDescriptors(selectedEmployee) ? 'Registered' : 'Not Registered'}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default EmployeeManagement;

import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaEye, FaTrash, FaTimes, FaSearch, FaUsers } from 'react-icons/fa';
import FourStepEmployeeForm from './FourStepEmployeeForm';
import { apiCall } from '../../config/api';
import API_CONFIG from '../../config/api';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.USERS, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });
      const data = response.data;
      if (data.success) {
        setEmployees(data.data);
      } else {
        throw new Error(data.message || 'Failed to load employees');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (employeeId) => {
    try {
      const response = await apiCall(`${API_CONFIG.ENDPOINTS.USERS}/${employeeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });
      const data = response.data;
      if (data.success) {
        setDeleteConfirm(null);
        fetchEmployees();
      } else {
        alert(data.message || 'Failed to delete employee');
      }
    } catch (err) {
      setError(err.message);
      alert('An error occurred while deleting the employee');
    }
  };

  const hasFaceDescriptors = (employee) =>
    employee.face_descriptor && Array.isArray(employee.face_descriptor) && employee.face_descriptor.length > 0;

  const filtered = employees.filter((e) =>
    e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.email?.toLowerCase().includes(search.toLowerCase())
  );

  const getInitials = (name) => {
    if (!name) return 'E';
    const parts = name.trim().split(' ');
    return parts.length > 1
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0][0].toUpperCase();
  };

  const getAvatarColor = (name) => {
    const colors = [
      ['#1e40af', '#3b82f6'],
      ['#7c3aed', '#a78bfa'],
      ['#059669', '#34d399'],
      ['#d97706', '#fcd34d'],
      ['#db2777', '#f472b6'],
      ['#0891b2', '#22d3ee'],
      ['#65a30d', '#a3e635'],
    ];
    let hash = 0;
    (name || '').split('').forEach((c) => { hash += c.charCodeAt(0); });
    return colors[hash % colors.length];
  };

  // ===================== LOADING =====================
  if (loading) {
    return (
      <div style={S.page}>
        <style>{CSS}</style>
        <div style={S.loaderCenter}>
          <div className="spinner"></div>
          <p style={S.loaderText}>Loading employees...</p>
        </div>
      </div>
    );
  }

  // ===================== ERROR =====================
  if (error) {
    return (
      <div style={S.page}>
        <style>{CSS}</style>
        <div style={S.errorBox}>
          <span style={S.errorIcon}>⚠</span>
          <div>
            <strong style={S.errorTitle}>Error</strong>
            <p style={S.errorMsg}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // ===================== MAIN =====================
  return (
    <div style={S.page}>
      <style>{CSS}</style>

      <div style={S.container}>

        {/* ─── CONTROL BAR ─── */}
        <div style={S.controlBar}>

          {/* Left: Title + Search */}
          <div style={S.controlLeft}>
            <div style={S.titleBlock}>
              <div style={S.titleIconWrap}>
                <FaUsers size={18} color="#1e40af" />
              </div>
              <div>
                <h1 style={S.pageTitle}>Employee Management</h1>
                <span style={S.pageSub}>
                  <span style={S.countHighlight}>{filtered.length}</span>
                  {' '}of {employees.length} employees
                </span>
              </div>
            </div>

            <div style={S.searchWrap}>
              <FaSearch size={14} color="#94a3b8" style={S.searchIcon} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={S.searchInput}
                className="search-input"
              />
            </div>
          </div>

          {/* Right: Add Button */}
          <button onClick={() => setShowAddModal(true)} style={S.addBtn} className="add-btn">
            <FaPlus size={12} style={{ marginRight: 7 }} />
            Add Employee
          </button>
        </div>

        {/* ─── TABLE ─── */}
        <div style={S.tableCard}>
          <div style={S.tableScroll}>
            <table style={S.table}>
              <thead>
                <tr>
                  {[
                    { label: 'Employee', width: '28%' },
                    { label: 'Email', width: '24%' },
                    { label: 'Shift', width: '16%' },
                    { label: 'Face Reg', width: '18%' },
                    { label: 'Actions', width: '14%' },
                  ].map((h) => (
                    <th key={h.label} style={{ ...S.th, width: h.width }}>{h.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={S.emptyCell}>
                      <div style={S.emptyBox}>
                        <div style={S.emptyIconWrap}>
                          <FaUsers size={28} color="#cbd5e1" />
                        </div>
                        <p style={S.emptyText}>No employees found</p>
                        <p style={S.emptySubText}>
                          {search ? 'Try a different search term' : 'Click "Add Employee" to get started'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((emp) => {
                    const [bg1, bg2] = getAvatarColor(emp.name);
                    const face = hasFaceDescriptors(emp);
                    return (
                      <tr key={emp.id} style={S.tr} className="table-row">
                        {/* Name */}
                        <td style={S.td}>
                          <div style={S.empCell}>
                            <div style={{ ...S.avatar, background: `linear-gradient(135deg, ${bg1}, ${bg2})` }}>
                              {getInitials(emp.name)}
                            </div>
                            <div>
                              <div style={S.empName}>{emp.name}</div>
                              <div style={S.empPosition}>{emp.position || 'No position set'}</div>
                            </div>
                          </div>
                        </td>
                        {/* Email */}
                        <td style={S.td}>
                          <span style={S.emailText}>{emp.email}</span>
                        </td>
                        {/* Shift */}
                        <td style={S.td}>
                          {emp.shift ? (
                            <span style={S.shiftBadge}>{emp.shift.shift_name}</span>
                          ) : (
                            <span style={S.shiftEmpty}>—</span>
                          )}
                        </td>
                        {/* Face */}
                        <td style={S.td}>
                          <span style={{ ...S.facePill, ...(face ? S.facePillYes : S.facePillNo) }}>
                            <span style={S.faceDot(face)}></span>
                            {face ? 'Registered' : 'Not registered'}
                          </span>
                        </td>
                        {/* Actions */}
                        <td style={S.td}>
                          <div style={S.actions}>
                            <button onClick={() => setSelectedEmployee(emp)} style={S.actionBtn} className="action-btn action-view" title="View Details">
                              <FaEye size={14} />
                            </button>
                            <button onClick={() => {}} style={S.actionBtn} className="action-btn action-edit" title="Edit">
                              <FaEdit size={14} />
                            </button>
                            <button onClick={() => setDeleteConfirm(emp.id)} style={S.actionBtn} className="action-btn action-delete" title="Delete">
                              <FaTrash size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ─── DELETE CONFIRM MODAL ─── */}
      {deleteConfirm && (
        <div style={S.overlay} className="modal-overlay">
          <div style={S.confirmModal} className="anim-modal">
            <div style={S.confirmIconWrap}>
              <FaTrash size={20} color="#dc2626" />
            </div>
            <h3 style={S.confirmTitle}>Delete Employee</h3>
            <p style={S.confirmDesc}>
              This action is permanent and cannot be undone. The employee and all associated records will be removed.
            </p>
            <div style={S.confirmButtons}>
              <button onClick={() => setDeleteConfirm(null)} style={S.btnCancel} className="btn-cancel">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={S.btnDanger} className="btn-danger">
                <FaTrash size={12} style={{ marginRight: 6 }} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── ADD EMPLOYEE MODAL ─── */}
      {showAddModal && (
        <div style={S.overlay} className="modal-overlay">
          <div style={{ ...S.modal, maxWidth: 860 }} className="anim-modal">
            <div style={S.modalHeader}>
              <div style={S.modalHeaderLeft}>
                <div style={S.modalIconWrap}>
                  <FaPlus size={15} color="#2563eb" />
                </div>
                <div>
                  <h2 style={S.modalTitle}>Add New Employee</h2>
                  <p style={S.modalSub}>Fill in all required details to register a new team member</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} style={S.closeBtn} className="close-btn">
                <FaTimes size={17} />
              </button>
            </div>
            <div style={S.modalBody}>
              <FourStepEmployeeForm onClose={() => { setShowAddModal(false); fetchEmployees(); }} />
            </div>
          </div>
        </div>
      )}

      {/* ─── VIEW DETAILS MODAL ─── */}
      {selectedEmployee && (
        <div style={S.overlay} className="modal-overlay">
          <div style={{ ...S.modal, maxWidth: 580 }} className="anim-modal">
            <div style={S.modalHeader}>
              <div style={S.modalHeaderLeft}>
                {(() => {
                  const [bg1, bg2] = getAvatarColor(selectedEmployee.name);
                  return (
                    <div style={{ ...S.modalAvatar, background: `linear-gradient(135deg, ${bg1}, ${bg2})` }}>
                      {getInitials(selectedEmployee.name)}
                    </div>
                  );
                })()}
                <div>
                  <h2 style={S.modalTitle}>{selectedEmployee.name}</h2>
                  <p style={S.modalSub}>
                    {selectedEmployee.position || 'No position'} &middot; {selectedEmployee.department || selectedEmployee.role || '—'}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedEmployee(null)} style={S.closeBtn} className="close-btn">
                <FaTimes size={17} />
              </button>
            </div>

            <div style={S.modalBody}>
              {/* Face status strip */}
              {(() => {
                const face = hasFaceDescriptors(selectedEmployee);
                return (
                  <div style={{ ...S.faceBanner, ...(face ? S.faceBannerYes : S.faceBannerNo) }}>
                    <span style={S.faceBannerDot(face)}></span>
                    <span style={S.faceBannerText(face)}>
                      Face Recognition — {face ? 'Registered' : 'Not Registered'}
                    </span>
                  </div>
                );
              })()}

              {/* Details grid */}
              <div style={S.detailGrid}>
                {[
                  { label: 'Email', value: selectedEmployee.email, icon: '✉' },
                  { label: 'Phone', value: selectedEmployee.phone, icon: '☎' },
                  { label: 'Position', value: selectedEmployee.position, icon: '💼' },
                  { label: 'Role', value: selectedEmployee.role, capitalize: true, icon: '🏷' },
                  { label: 'Age', value: selectedEmployee.age, icon: '🔢' },
                  { label: 'Date of Birth', value: selectedEmployee.dob, icon: '📅' },
                  { label: 'Sex', value: selectedEmployee.sex, icon: '👤' },
                  { label: 'Address', value: selectedEmployee.address, icon: '📍' },
                  { label: 'Shift', value: selectedEmployee.shift?.shift_name, icon: '🕐' },
                ].map((item) => (
                  <div key={item.label} style={S.detailItem}>
                    <div style={S.detailTop}>
                      <span style={S.detailIcon}>{item.icon}</span>
                      <span style={S.detailLabel}>{item.label}</span>
                    </div>
                    <span style={{ ...S.detailValue, textTransform: item.capitalize ? 'capitalize' : 'none' }}>
                      {item.value || '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;

// ======================== STYLES ========================
const S = {
  page: {
    minHeight: '100vh',
    background: '#eef2f7',
    fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
  },

  // Loader
  loaderCenter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    gap: 14,
  },
  loaderText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: 500,
    letterSpacing: '0.2px',
  },

  // Error
  errorBox: {
    maxWidth: 580,
    margin: '100px auto',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 12,
    padding: '20px 24px',
    display: 'flex',
    gap: 14,
    alignItems: 'flex-start',
  },
  errorIcon: { fontSize: 22, color: '#dc2626' },
  errorTitle: { color: '#991b1b', fontSize: 14, display: 'block', marginBottom: 3 },
  errorMsg: { color: '#dc2626', fontSize: 13, margin: 0 },

  // Container
  container: {
    maxWidth: 1160,
    margin: '0 auto',
    padding: '28px 28px 56px',
  },

  // ─── CONTROL BAR ───
  controlBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 14,
    padding: '16px 20px',
    marginBottom: 20,
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    gap: 16,
  },
  controlLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    flex: 1,
    minWidth: 0,
  },

  // Title block
  titleBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexShrink: 0,
  },
  titleIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: '#eff6ff',
    border: '1px solid #dbeafe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageTitle: {
    margin: 0,
    fontSize: 15,
    fontWeight: 700,
    color: '#1e293b',
    letterSpacing: '-0.2px',
  },
  pageSub: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: 500,
  },
  countHighlight: {
    color: '#2563eb',
    fontWeight: 700,
  },

  // Search
  searchWrap: {
    position: 'relative',
    flex: 1,
    maxWidth: 340,
  },
  searchIcon: {
    position: 'absolute',
    left: 13,
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    padding: '9px 16px 9px 38px',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
    fontSize: 13,
    color: '#334155',
    outline: 'none',
    transition: 'all 0.2s',
  },

  // Add button
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #1e40af, #2563eb)',
    color: '#fff',
    border: 'none',
    padding: '9px 20px',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(37,99,235,0.35)',
    transition: 'all 0.2s',
    flexShrink: 0,
    letterSpacing: '0.2px',
  },

  // ─── TABLE ───
  tableCard: {
    background: '#fff',
    borderRadius: 14,
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
  },
  tableScroll: { overflowX: 'auto' },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: 720,
  },
  th: {
    padding: '12px 20px',
    textAlign: 'left',
    fontSize: 10.5,
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    background: '#f8fafc',
    borderBottom: '2px solid #eef2f7',
    whiteSpace: 'nowrap',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background 0.15s',
  },
  td: {
    padding: '13px 20px',
    verticalAlign: 'middle',
  },

  // Employee cell
  empCell: { display: 'flex', alignItems: 'center', gap: 12 },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 9,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: 13,
    fontWeight: 700,
    flexShrink: 0,
    boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
  },
  empName: { fontSize: 13.5, fontWeight: 600, color: '#1e293b' },
  empPosition: { fontSize: 11.5, color: '#94a3b8', marginTop: 1.5 },
  emailText: { fontSize: 13, color: '#475569' },

  // Shift
  shiftBadge: {
    fontSize: 12,
    color: '#334155',
    background: '#f1f5f9',
    border: '1px solid #e2e8f0',
    padding: '4px 10px',
    borderRadius: 6,
    fontWeight: 500,
  },
  shiftEmpty: { fontSize: 13, color: '#cbd5e1' },

  // Face pill
  facePill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 11.5,
    fontWeight: 600,
    padding: '4px 10px',
    borderRadius: 20,
  },
  facePillYes: { background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' },
  facePillNo: { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' },
  faceDot: (active) => ({
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: active ? '#16a34a' : '#dc2626',
  }),

  // Actions
  actions: { display: 'flex', gap: 5 },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 7,
    border: '1px solid #eef2f7',
    background: '#fafbfc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#94a3b8',
    transition: 'all 0.18s',
  },

  // Empty
  emptyCell: { padding: '64px 20px', textAlign: 'center' },
  emptyBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 },
  emptyIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 14,
    background: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { fontSize: 15, fontWeight: 600, color: '#475569', margin: 0 },
  emptySubText: { fontSize: 13, color: '#94a3b8', margin: 0 },

  // ─── OVERLAY ───
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15,23,42,0.5)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 24,
  },

  // ─── MODAL ───
  modal: {
    background: '#fff',
    borderRadius: 16,
    width: '100%',
    maxHeight: '88vh',
    overflowY: 'auto',
    boxShadow: '0 20px 44px rgba(15,23,42,0.2)',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '20px 24px 16px',
    borderBottom: '1px solid #f1f5f9',
  },
  modalHeaderLeft: { display: 'flex', alignItems: 'center', gap: 14 },
  modalIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: '#eff6ff',
    border: '1px solid #dbeafe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalAvatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: 15,
    fontWeight: 700,
    boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
  },
  modalTitle: { margin: 0, fontSize: 16, fontWeight: 700, color: '#1e293b' },
  modalSub: { margin: '2px 0 0', fontSize: 12, color: '#64748b' },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    width: 30,
    height: 30,
    borderRadius: 7,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.18s',
  },
  modalBody: { padding: '20px 24px 24px' },

  // Face banner
  faceBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '9px 14px',
    borderRadius: 8,
    marginBottom: 18,
    fontSize: 12.5,
    fontWeight: 600,
  },
  faceBannerYes: { background: '#f0fdf4', border: '1px solid #bbf7d0' },
  faceBannerNo: { background: '#fef2f2', border: '1px solid #fecaca' },
  faceBannerDot: (active) => ({
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: active ? '#16a34a' : '#dc2626',
    flexShrink: 0,
  }),
  faceBannerText: (active) => ({ color: active ? '#16a34a' : '#dc2626' }),

  // Detail grid
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1px',
    background: '#e2e8f0',
    borderRadius: 10,
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
  },
  detailItem: {
    background: '#fff',
    padding: '12px 15px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  detailTop: { display: 'flex', alignItems: 'center', gap: 6 },
  detailIcon: { fontSize: 12 },
  detailLabel: {
    fontSize: 10.5,
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
  },
  detailValue: { fontSize: 13, fontWeight: 500, color: '#1e293b', paddingLeft: 18 },

  // ─── CONFIRM MODAL ───
  confirmModal: {
    background: '#fff',
    borderRadius: 16,
    padding: '32px 28px 28px',
    width: '100%',
    maxWidth: 400,
    textAlign: 'center',
    boxShadow: '0 20px 44px rgba(15,23,42,0.2)',
  },
  confirmIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 13,
    background: '#fef2f2',
    border: '1px solid #fecaca',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
  },
  confirmTitle: { margin: '0 0 8px', fontSize: 17, fontWeight: 700, color: '#1e293b' },
  confirmDesc: { margin: '0 0 22px', fontSize: 13, color: '#64748b', lineHeight: 1.55 },
  confirmButtons: { display: 'flex', gap: 10, justifyContent: 'center' },
  btnCancel: {
    padding: '8px 22px',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    background: '#fff',
    color: '#475569',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.18s',
  },
  btnDanger: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 22px',
    borderRadius: 8,
    border: 'none',
    background: 'linear-gradient(135deg, #dc2626, #ef4444)',
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(220,38,38,0.3)',
    transition: 'all 0.18s',
  },
};

// ======================== CSS ========================
const CSS = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes modalIn {
    from { opacity: 0; transform: translateY(14px) scale(0.975); }
    to   { opacity: 1; transform: translateY(0)  scale(1); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  .spinner {
    width: 38px; height: 38px;
    border: 3.5px solid #e2e8f0;
    border-top-color: #2563eb;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
  .search-input:focus {
    border-color: #2563eb;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(37,99,235,0.15);
  }
  .table-row:hover { background: #f8fafc !important; }
  .action-btn:hover { border-color: transparent; }
  .action-view:hover  { background: #eff6ff; color: #2563eb; }
  .action-edit:hover   { background: #f0fdf4; color: #16a34a; }
  .action-delete:hover { background: #fef2f2; color: #dc2626; }
  .add-btn:hover {
    background: linear-gradient(135deg, #1e3a8a, #1d4ed8);
    box-shadow: 0 4px 14px rgba(37,99,235,0.4);
    transform: translateY(-1px);
  }
  .close-btn:hover { background: #f1f5f9; color: #475569; }
  .btn-cancel:hover { background: #f1f5f9; }
  .btn-danger:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(220,38,38,0.4);
  }
  .modal-overlay { animation: fadeIn 0.18s ease; }
  .anim-modal { animation: modalIn 0.22s cubic-bezier(.4,0,.2,1); }
  * { box-sizing: border-box; }
`;