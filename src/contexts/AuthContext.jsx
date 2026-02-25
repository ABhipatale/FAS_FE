import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AuthStateContext = createContext();

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };

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
      return { ...state, user: action.payload };

    case 'SET_COMPANY':
      return { ...state, company: action.payload };

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    default:
      return state;
  }
};

// Initial state
const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  company: null,
  loading: true,
  error: null,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 🔹 Check stored token on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('authToken');

      if (!token) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      try {
        const response = await fetch('http://localhost:8000/api/me', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Token invalid');
        }

        const data = await response.json();

        if (!data?.success || !data?.data?.user) {
          throw new Error('Invalid user data');
        }

        // 🔹 Fetch company safely
        let company = null;
        try {
          const companyRes = await fetch('http://localhost:8000/api/company/details', {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (companyRes.ok) {
            const companyData = await companyRes.json();
            if (companyData.success) company = companyData.data;
          }
        } catch (e) {
          console.warn('Company fetch failed (non-blocking)');
        }

        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: { ...data.data.user, role: 'admin' }, // ✅ FORCE ADMIN
            token,
            company,
          },
        });

      } catch (error) {
        console.warn('Auth restore failed:', error.message);
        localStorage.removeItem('authToken');
        dispatch({ type: 'LOGOUT' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  // 🔹 LOGIN
  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }

      const token = data.data.token;
      localStorage.setItem('authToken', token);

      let company = null;
      try {
        const companyRes = await fetch('http://localhost:8000/api/company/details', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (companyRes.ok) {
          const companyData = await companyRes.json();
          if (companyData.success) company = companyData.data;
        }
      } catch {
        console.warn('Company fetch failed (non-blocking)');
      }

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: { ...data.data.user, role: 'admin' }, // ✅ FORCE ADMIN
          token,
          company,
        },
      });

      return { success: true, message: data.message };

    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: error.message });
      return { success: false, message: error.message };
    }
  };

  // 🔹 LOGOUT
  const logout = async () => {
    try {
      if (state.token) {
        await fetch('http://localhost:8000/api/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${state.token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch {
      console.warn('Logout API failed (non-blocking)');
    }

    localStorage.removeItem('authToken');
    dispatch({ type: 'LOGOUT' });
  };

  // 🔹 REGISTER
  const register = async (name, email, password, role = 'user') => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();
      dispatch({ type: 'SET_LOADING', payload: false });

      if (response.ok && data.success) {
        return { success: true, message: data.message };
      }

      return { success: false, message: data.message || 'Registration failed' };

    } catch {
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  // 🔹 Company functions
  const updateCompany = async (companyData) => {
    if (!state.token) return { success: false, message: 'Not authenticated' };

    try {
      const response = await fetch('http://localhost:8000/api/company/update', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${state.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        dispatch({ type: 'SET_COMPANY', payload: data.data });
        return { success: true, company: data.data };
      }

      return { success: false, message: data.message };
    } catch {
      return { success: false, message: 'Network error' };
    }
  };

  const getCompanyDetails = async () => {
    if (!state.token) return { success: false, message: 'Not authenticated' };

    try {
      const response = await fetch('http://localhost:8000/api/company/details', {
        headers: {
          Authorization: `Bearer ${state.token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        dispatch({ type: 'SET_COMPANY', payload: data.data });
        return { success: true, company: data.data };
      }

      return { success: false, message: data.message };
    } catch {
      return { success: false, message: 'Network error' };
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

export const useAuth = () => {
  const context = useContext(AuthStateContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};