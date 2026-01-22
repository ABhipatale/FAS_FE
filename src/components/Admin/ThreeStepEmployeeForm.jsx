import React, { useState, useEffect } from 'react';
import { FaUser, FaClock, FaKey, FaCheck, FaTimes, FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const FourStepEmployeeForm = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [shifts, setShifts] = useState([]);
  const [createdUserId, setCreatedUserId] = useState(null);
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load shifts from API
  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      const response = await fetch(`${window.BASE_URL}/api/shifts`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch shifts');
      }

      const data = await response.json();
      if (data.success) {
        setShifts(data.data);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateStep = (currentStep) => {
    if (currentStep === 1) {
      if (!formData.name.trim()) {
        alert('Name is required');
        return false;
      }
      if (!formData.email.trim()) {
        alert('Email is required');
        return false;
      }
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        alert('Email is invalid');
        return false;
      }
    } else if (currentStep === 2) {
      if (!formData.shift_id) {
        alert('Please select a shift');
        return false;
      }
    } else if (currentStep === 3) {
      if (!formData.password) {
        alert('Password is required');
        return false;
      }
      if (formData.password.length < 6) {
        alert('Password must be at least 6 characters long');
        return false;
      }
    }
    // Step 4 (face registration) doesn't need validation
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(3)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${window.BASE_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          role: 'user' // Default to user role
        })
      });

      const data = await response.json();

      if (data.success) {
        setCreatedUserId(data.data.id); // Save the created user ID
        setStep(4); // Move to face registration step
      } else {
        setError(data.message || 'Failed to create employee');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => {
    return (
      <div className="flex justify-center mb-8">
        {[1, 2, 3, 4].map((num) => (
          <div key={num} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step === num 
                ? 'bg-blue-600 text-white' 
                : num < step 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-300 text-gray-700'
            }`}>
              {num < step ? <FaCheck /> : num}
            </div>
            {num < 4 && (
              <div className={`w-16 h-1 ${
                num < step ? 'bg-green-500' : 'bg-gray-300'
              }`}></div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <FaUser className="mr-2" /> Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sex
                </label>
                <select
                  name="sex"
                  value={formData.sex}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select sex</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter age"
                  min="18"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position
                </label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter position"
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <FaClock className="mr-2" /> Shift Assignment
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Shift *
                </label>
                <select
                  name="shift_id"
                  value={formData.shift_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a shift</option>
                  {shifts.map((shift) => (
                    <option key={shift.id} value={shift.id}>
                      {shift.shift_name} ({shift.punch_in_time} - {shift.punch_out_time})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium text-gray-800 mb-2">Available Shifts:</h3>
                <ul className="space-y-2">
                  {shifts.map((shift) => (
                    <li key={shift.id} className="text-sm text-gray-600">
                      <span className="font-medium">{shift.shift_name}:</span> {shift.punch_in_time} - {shift.punch_out_time} 
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        shift.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {shift.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <FaKey className="mr-2" /> Credentials
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter password (minimum 6 characters)"
                />
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <FaUser className="mr-2" /> Face Registration
            </h2>
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <div className="text-center">
                <div className="mb-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaUser className="text-4xl text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800">Ready to Register Face</h3>
                  <p className="text-gray-600 mt-2">
                    Employee created successfully! Now you can register their face for attendance tracking.
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-md shadow-sm">
                  <h4 className="font-medium text-gray-800 mb-2">Employee Details:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="font-medium">Name:</span> {formData.name}</div>
                    <div><span className="font-medium">Email:</span> {formData.email}</div>
                    <div><span className="font-medium">Position:</span> {formData.position || 'N/A'}</div>
                    <div><span className="font-medium">Shift:</span> {shifts.find(s => s.id == formData.shift_id)?.shift_name || 'N/A'}</div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-center space-x-4">
                  <button
                    onClick={() => {
                      // Navigate to face registration page
                      window.location.href = `/face-registration?userId=${createdUserId}&userName=${encodeURIComponent(formData.name)}`;
                    }}
                    className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                  >
                    <FaUser className="mr-2" /> Register Face Now
                  </button>
                  
                  <button
                    onClick={() => {
                      alert('Employee created successfully! You can register their face later from the employee management page.');
                      onClose();
                    }}
                    className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Skip for Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {renderStepIndicator()}
      
      <form onSubmit={handleSubmit}>
        {renderStepContent()}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={prevStep}
            disabled={step === 1}
            className={`px-6 py-2 rounded-md flex items-center ${
              step === 1
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            <FaArrowLeft className="mr-2" /> Previous
          </button>
          
          {step < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              Next <FaArrowRight className="ml-2" />
            </button>
          ) : (
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center"
              >
                <FaTimes className="mr-2" /> Close
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default FourStepEmployeeForm;