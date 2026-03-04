import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaUserEdit } from 'react-icons/fa';
// import FaceRegistrationModal from './Face/FaceRegistrationModal';
import { apiCall } from '../../config/api';
import API_CONFIG from '../../config/api';

const EditEmployeeModal = ({ employee, onClose, onUpdateComplete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [showFaceModal, setShowFaceModal] = useState(false);
  const [shifts, setShifts] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    phone: '',
    sex: '',
    age: '',
    dob: '',
    position: '',
    shift_id: '',
    password: ''
  });

  // Load shifts and populate form data
  useEffect(() => {
    fetchShifts();
    if (employee) {
      setFormData({
        name: employee.name || '',
        email: employee.email || '',
        address: employee.address || '',
        phone: employee.phone || '',
        sex: employee.sex || '',
        age: employee.age || '',
        dob: employee.dob || '',
        position: employee.position || '',
        shift_id: employee.shift_id || '',
        password: '' // Don't pre-fill password for security
      });
    }
  }, [employee]);

  const fetchShifts = async () => {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.SHIFTS, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = response.data;
      if (data.success) {
        setShifts(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch shifts');
      }
    } catch (err) {
      console.error('Error fetching shifts:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      // Prepare data - only include password if it's provided
      const submitData = { ...formData };
      if (!submitData.password) {
        delete submitData.password;
      }

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.USERS}/${employee.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      const data = response.data;
      
      if (data.success) {
        setMessage('Employee updated successfully!');
        setTimeout(() => {
          if (onUpdateComplete) {
            onUpdateComplete();
          }
          onClose();
        }, 1500);
      } else {
        setError(data.message || 'Failed to update employee');
      }
    } catch (err) {
      console.error('Error updating employee:', err);
      setError('Network error occurred while updating employee');
    } finally {
      setLoading(false);
    }
  };

  const handleFaceRegistrationComplete = () => {
    setMessage('Face registered successfully!');
    if (onUpdateComplete) {
      onUpdateComplete();
    }
  };

  const hasFaceRegistered = employee && employee.face_descriptor && 
                             Array.isArray(employee.face_descriptor) && 
                             employee.face_descriptor.length > 0;

  return (
    <>
      <div style={S.overlay} className="modal-overlay">
        <div style={{ ...S.modal, maxWidth: 720 }} className="anim-modal">
          {/* Header */}
          <div style={S.modalHeader}>
            <div style={S.modalHeaderLeft}>
              <div style={S.modalIconWrap}>
                <FaUserEdit size={18} color="#2563eb" />
              </div>
              <div>
                <h2 style={S.modalTitle}>Edit Employee</h2>
                <p style={S.modalSub}>Update employee information and face registration</p>
              </div>
            </div>
            <button onClick={onClose} style={S.closeBtn} className="close-btn">
              <FaTimes size={18} />
            </button>
          </div>

          {/* Body */}
          <div style={S.modalBody}>
            {/* Messages */}
            {message && (
              <div style={S.successMessage}>
                <span style={S.successIcon}>✓</span> {message}
              </div>
            )}
            
            {error && (
              <div style={S.errorMessage}>
                <span style={S.errorIcon}>⚠</span> {error}
              </div>
            )}

            {/* Face Registration Status Banner */}
            <div style={{ ...S.faceBanner, ...(hasFaceRegistered ? S.faceBannerYes : S.faceBannerNo) }}>
              <span style={S.faceBannerDot(hasFaceRegistered)}></span>
              <span style={S.faceBannerText(hasFaceRegistered)}>
                Face Recognition — {hasFaceRegistered ? 'Registered' : 'Not Registered'}
              </span>
              <button 
                onClick={() => setShowFaceModal(true)}
                style={S.faceRegisterBtn}
                className="face-register-btn"
              >
                {hasFaceRegistered ? 'Update Face' : 'Register Face'}
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={S.form}>
              {/* Row 1: Name & Email */}
              <div style={S.row}>
                <div style={S.field}>
                  <label style={S.label}>Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    style={S.input}
                    required
                  />
                </div>
                <div style={S.field}>
                  <label style={S.label}>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={S.input}
                    required
                  />
                </div>
              </div>

              {/* Row 2: Phone & Position */}
              <div style={S.row}>
                <div style={S.field}>
                  <label style={S.label}>Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    style={S.input}
                  />
                </div>
                <div style={S.field}>
                  <label style={S.label}>Position</label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    style={S.input}
                  />
                </div>
              </div>

              {/* Row 3: Sex & Age */}
              <div style={S.row}>
                <div style={S.field}>
                  <label style={S.label}>Sex</label>
                  <select
                    name="sex"
                    value={formData.sex}
                    onChange={handleInputChange}
                    style={S.select}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div style={S.field}>
                  <label style={S.label}>Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    style={S.input}
                    min="18"
                    max="100"
                  />
                </div>
              </div>

              {/* Row 4: DOB & Shift */}
              <div style={S.row}>
                <div style={S.field}>
                  <label style={S.label}>Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    style={S.input}
                  />
                </div>
                <div style={S.field}>
                  <label style={S.label}>Shift</label>
                  <select
                    name="shift_id"
                    value={formData.shift_id}
                    onChange={handleInputChange}
                    style={S.select}
                  >
                    <option value="">Select Shift</option>
                    {shifts.map(shift => (
                      <option key={shift.id} value={shift.id}>
                        {shift.shift_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 5: Address */}
              <div style={S.row}>
                <div style={S.fieldFull}>
                  <label style={S.label}>Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    style={S.input}
                  />
                </div>
              </div>

              {/* Row 6: Password (Optional) */}
              <div style={S.row}>
                <div style={S.field}>
                  <label style={S.label}>New Password (Optional)</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    style={S.input}
                    placeholder="Leave blank to keep current password"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={S.actionBar}>
                <button
                  type="button"
                  onClick={onClose}
                  style={S.cancelBtn}
                  className="btn-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    ...S.saveBtn,
                    ...(loading ? S.saveBtnDisabled : {})
                  }}
                  className="btn-save"
                >
                  <FaSave size={14} style={{ marginRight: 8 }} />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Face Registration Modal */}
      {/* {showFaceModal && (
        <FaceRegistrationModal
          userId={employee.id}
          userName={employee.name}
          onRegistrationComplete={handleFaceRegistrationComplete}
          onClose={() => setShowFaceModal(false)}
        />
      )} */}
    </>
  );
};

export default EditEmployeeModal;

// ======================== STYLES ========================
const S = {
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
  modal: {
    background: '#fff',
    borderRadius: 16,
    width: '100%',
    maxHeight: '90vh',
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
    width: 42,
    height: 42,
    borderRadius: 10,
    background: '#eff6ff',
    border: '1px solid #dbeafe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: { margin: 0, fontSize: 17, fontWeight: 700, color: '#1e293b' },
  modalSub: { margin: '2px 0 0', fontSize: 12, color: '#64748b' },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    width: 32,
    height: 32,
    borderRadius: 7,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.18s',
  },
  modalBody: { padding: '24px' },
  
  // Messages
  successMessage: {
    padding: '12px 16px',
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: 8,
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    color: '#16a34a',
  },
  successIcon: { fontSize: 16, fontWeight: 700 },
  errorMessage: {
    padding: '12px 16px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 8,
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    color: '#dc2626',
  },
  errorIcon: { fontSize: 16, fontWeight: 700 },
  
  // Face banner
  faceBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: '12px 16px',
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 13,
    fontWeight: 600,
  },
  faceBannerYes: { background: '#f0fdf4', border: '1px solid #bbf7d0' },
  faceBannerNo: { background: '#fef2f2', border: '1px solid #fecaca' },
  faceBannerDot: (active) => ({
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: active ? '#16a34a' : '#dc2626',
    flexShrink: 0,
  }),
  faceBannerText: (active) => ({ color: active ? '#16a34a' : '#dc2626', flex: 1 }),
  faceRegisterBtn: {
    padding: '6px 14px',
    borderRadius: 6,
    border: 'none',
    background: '#2563eb',
    color: '#fff',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    flexShrink: 0,
  },
  
  // Form
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  fieldFull: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: {
    fontSize: 12.5,
    fontWeight: 600,
    color: '#475569',
    letterSpacing: '0.2px',
  },
  input: {
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
    fontSize: 13.5,
    color: '#334155',
    outline: 'none',
    transition: 'all 0.2s',
  },
  select: {
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
    fontSize: 13.5,
    color: '#334155',
    outline: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  
  // Action bar
  actionBar: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
    paddingTop: 16,
    borderTop: '1px solid #f1f5f9',
  },
  cancelBtn: {
    padding: '9px 22px',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    background: '#fff',
    color: '#475569',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.18s',
  },
  saveBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '9px 26px',
    borderRadius: 8,
    border: 'none',
    background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(37,99,235,0.35)',
    transition: 'all 0.18s',
  },
  saveBtnDisabled: {
    background: '#cbd5e1',
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
};

// CSS animations
const CSS = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes modalIn {
    from { opacity: 0; transform: translateY(14px) scale(0.975); }
    to   { opacity: 1; transform: translateY(0)  scale(1); }
  }
  .modal-overlay { animation: fadeIn 0.18s ease; }
  .anim-modal { animation: modalIn 0.22s cubic-bezier(.4,0,.2,1); }
  .face-register-btn:hover {
    background: #1d4ed8;
    transform: translateY(-1px);
  }
  .btn-cancel:hover { background: #f1f5f9; }
  .btn-save:not(:disabled):hover {
    background: linear-gradient(135deg, #1d4ed8, #2563eb);
    box-shadow: 0 4px 12px rgba(37,99,235,0.4);
    transform: translateY(-1px);
  }
  input:focus, select:focus {
    border-color: #2563eb;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(37,99,235,0.15);
  }
`;
