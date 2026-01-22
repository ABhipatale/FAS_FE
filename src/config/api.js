// Centralized API configuration
const API_CONFIG = {
  BASE_URL: 'http://localhost:8000/api',
  TIMEOUT: 10000,
  
  ENDPOINTS: {
    // Authentication
    LOGIN: '/login',
    REGISTER: '/register',
    LOGOUT: '/logout',
    ME: '/me',
    
    // Users
    USERS: '/users',
    USER_DETAIL: (id) => `/users/${id}`,
    
    // Face Recognition
    FACE_DESCRIPTOR: '/face-descriptor',
    ATTENDANCE_MARK: '/attendance/mark',
    ATTENDANCE_USER: '/attendance/user',
    
    // Employees
    EMPLOYEES: '/employees',
    EMPLOYEE_DETAIL: (id) => `/employees/${id}`,
    EMPLOYEE_ATTENDANCE: (id) => `/employees/${id}/attendance`,
    
    // Shifts
    SHIFTS: '/shifts',
    SHIFT_DETAIL: (id) => `/shifts/${id}`,
    
    // Punch operations
    PUNCH_IN: '/punch/in',
    PUNCH_OUT: '/punch/out',
    
    // Dashboard
    DASHBOARD_STATS: '/dashboard/stats',
    ATTENDANCE_RAW: '/attendance/raw',
  }
};

// Helper function to make API calls
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  // Add auth token if available
  const token = localStorage.getItem('authToken');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    method: 'GET',
    headers: { ...defaultHeaders, ...options.headers },
    ...options,
  };
  
  try {
    const response = await fetch(url, config);
    
    // Handle authentication errors
    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      window.location.href = '/login';
      throw new Error('Authentication required');
    }
    
    const data = await response.json();
    return { response, data };
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

export default API_CONFIG;