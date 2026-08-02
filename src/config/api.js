// Centralized API configuration
//
// BASE_URL comes from VITE_API_URL, which Vite inlines at BUILD time (not at
// runtime), so it must be set in Render's Static Site environment before the
// build runs. The localhost fallback keeps `npm run dev` working unchanged.
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'https://fasback.growmoreitservices.com/api',
  TIMEOUT: 10000,
  
  ENDPOINTS: {
    // Companies
    COMPANIES: '/companies',
    COMPANIES_REGISTER: '/companies/register',
    COMPANY_BY_ID: (id) => `/companies/${id}`,
    COMPANY_DETAILS: '/company/details',
    COMPANY_UPDATE: '/company/update',
    
    // Authentication
    LOGIN: '/login',
    PASSWORD_FORGOT: '/password/forgot',
    PASSWORD_RESET: '/password/reset',
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

    // Superadmin - cross-company system overview
    SUPERADMIN_OVERVIEW: '/superadmin/overview',
  }
};

// Helper function to make API calls
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    // Without this Laravel treats an expired token as a browser navigation and
    // redirects to the `login` named route (GET /api/login -> 405 + an HTML
    // error page), which used to surface as "Unexpected token '<'" everywhere.
    'Accept': 'application/json',
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
      // Token expired or invalid - clear the whole cached session,
      // otherwise the app re-hydrates a dead one on the next load
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      localStorage.removeItem('authCompany');
      window.location.href = '/login';
      throw new Error('Authentication required');
    }

    const data = await readJson(response, url);
    return { response, data };
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Parse a response body without throwing on HTML/empty payloads. A crash inside
// response.json() looks like a network failure to every caller, which hides the
// real problem (a 405, a 500 stack trace page, a dead endpoint).
const readJson = async (response, url) => {
  const raw = await response.text();

  if (!raw) {
    return response.ok
      ? { success: true }
      : { success: false, message: `The server returned an empty ${response.status} response.` };
  }

  try {
    return JSON.parse(raw);
  } catch {
    console.error(`Non-JSON response from ${url} (HTTP ${response.status}):`, raw.slice(0, 300));
    return {
      success: false,
      message: `Unexpected response from the server (HTTP ${response.status}). `
        + `Check that the API is running at ${API_CONFIG.BASE_URL}.`,
    };
  }
};

export default API_CONFIG;