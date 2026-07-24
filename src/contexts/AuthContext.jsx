import React, { createContext, useContext, useReducer, useEffect } from 'react';
import API_CONFIG from '../config/api';

const AuthStateContext = createContext();

// Reducer to handle auth state
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        company: action.payload.company || null,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        company: null,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        company: null,
        loading: false,
        error: null,
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'SET_COMPANY':
      return {
        ...state,
        company: action.payload,
      };
    case 'LOADING':
      return {
        ...state,
        loading: true,
      };
    case 'LOADED':
      return {
        ...state,
        loading: false,
      };
    default:
      return state;
  }
};

// Read a JSON value from localStorage without throwing on corrupt data
const readStored = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
};

// Persist the session so a page refresh restores it immediately,
// before the /me verification round-trip finishes.
const storeSession = (token, user, company) => {
  localStorage.setItem('authToken', token);
  if (user) localStorage.setItem('authUser', JSON.stringify(user));
  if (company) localStorage.setItem('authCompany', JSON.stringify(company));
  else localStorage.removeItem('authCompany');
};

const clearSession = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('authUser');
  localStorage.removeItem('authCompany');
};

// Initial state - hydrated from localStorage so a refresh doesn't bounce to /login
const storedToken = localStorage.getItem('authToken');
const storedUser = storedToken ? readStored('authUser') : null;

const initialState = {
  isAuthenticated: Boolean(storedToken && storedUser),
  user: storedUser,
  token: storedToken || null,
  company: storedToken ? readStored('authCompany') : null,
  // Only block the UI when we have a token but no cached user to render with
  loading: Boolean(storedToken) && !storedUser,
  error: null,
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Fetch company details for a token; never throws
  const fetchCompany = async (token) => {
    try {
      const companyResponse = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COMPANY_DETAILS}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (companyResponse.ok) {
        const companyData = await companyResponse.json();
        if (companyData.success && companyData.data) {
          return companyData.data;
        }
      }
    } catch (error) {
      console.error('Error fetching company data:', error);
    }
    return null;
  };

  // Check for stored token on initial load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      dispatch({ type: 'LOADED' });
      return;
    }

    // Verify token validity by fetching user data
    const verifySession = async () => {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ME}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // Only a definitive rejection from the server logs the user out
        if (response.status === 401 || response.status === 403) {
          clearSession();
          dispatch({ type: 'LOGOUT' });
          return;
        }

        if (!response.ok) {
          // Server-side hiccup (5xx, etc.) - keep the cached session
          console.error('Token verification failed with status', response.status);
          dispatch({ type: 'LOADED' });
          return;
        }

        const data = await response.json();
        if (!data.success || !data.data) {
          clearSession();
          dispatch({ type: 'LOGOUT' });
          return;
        }

        const user = data.data.user;
        // Awaited: loading must not clear before isAuthenticated is set,
        // otherwise ProtectedRoute redirects to /login mid-restore.
        const company = await fetchCompany(token);

        storeSession(token, user, company);
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token, company },
        });
      } catch (error) {
        console.error('Error verifying token:', error);
        // Network error - keep whatever session was restored from localStorage
        dispatch({ type: 'LOADED' });
      }
    };

    verifySession();
  }, []);

  // Login function
  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const token = data.data.token;
        const user = data.data.user;

        // Fetch company details after successful login
        const company = await fetchCompany(token);

        // Persist the whole session so a refresh can restore it without a round-trip
        storeSession(token, user, company);

        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token, company },
        });

        return { success: true, message: data.message };
      } else {
        const errorMessage = data.message || 'Login failed';
        dispatch({
          type: 'LOGIN_FAILURE',
          payload: errorMessage,
        });
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error('Login error:', error);
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: 'Network error. Please try again.',
      });
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  // Logout function
  const logout = async () => {
    const token = state.token;
    if (token) {
      try {
        await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGOUT}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Logout API error:', error);
        // Even if API call fails, still clear local data
      }
    }

    // Clear local storage and state
    clearSession();
    dispatch({ type: 'LOGOUT' });
  };

  // Register function
  const register = async (name, email, password, role = 'user') => {
    dispatch({ type: 'LOADING' });

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        dispatch({ type: 'LOADED' });
        return { success: true, message: data.message };
      } else {
        const errorMessage = data.message || 'Registration failed';
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat().join(', ');
          return { success: false, message: errorMessages };
        }
        dispatch({ type: 'LOADED' });
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error('Registration error:', error);
      dispatch({ type: 'LOADED' });
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  // Function to update company details
  const updateCompany = async (companyData) => {
    if (!state.token) {
      return { success: false, message: 'Not authenticated' };
    }

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COMPANY_UPDATE}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${state.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('authCompany', JSON.stringify(data.data));
        dispatch({
          type: 'SET_COMPANY',
          payload: data.data,
        });
        return { success: true, message: data.message, company: data.data };
      } else {
        const errorMessage = data.message || 'Failed to update company';
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error('Update company error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  // Function to get company details
  const getCompanyDetails = async () => {
    if (!state.token) {
      return { success: false, message: 'Not authenticated' };
    }

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COMPANY_DETAILS}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${state.token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('authCompany', JSON.stringify(data.data));
        dispatch({
          type: 'SET_COMPANY',
          payload: data.data,
        });
        return { success: true, company: data.data };
      } else {
        const errorMessage = data.message || 'Failed to get company details';
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error('Get company details error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const value = {
    ...state,
    login,
    logout,
    register,
    updateCompany,
    getCompanyDetails,
  };

  return (
    <AuthStateContext.Provider value={value}>
      {children}
    </AuthStateContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthStateContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};