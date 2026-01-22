import React, { createContext, useContext, useReducer, useEffect } from 'react';

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
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null,
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
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

// Initial state
const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true, // Initially true while checking stored token
  error: null,
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for stored token on initial load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Verify token validity by fetching user data
      const fetchUserData = async () => {
        try {
          const response = await fetch('http://localhost:8000/api/me', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.status === 401 || response.status === 403) {
            // Token invalid, clear it
            localStorage.removeItem('authToken');
            dispatch({ type: 'LOGOUT' });
          } else if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              dispatch({
                type: 'LOGIN_SUCCESS',
                payload: {
                  user: data.data.user,
                  token: token,
                },
              });
            } else {
              // Token invalid, clear it
              localStorage.removeItem('authToken');
              dispatch({ type: 'LOGOUT' });
            }
          } else {
            // Other error, clear token
            localStorage.removeItem('authToken');
            dispatch({ type: 'LOGOUT' });
          }
        } catch (error) {
          console.error('Error verifying token:', error);
          // For network errors, keep the token but set as unauthenticated temporarily
          dispatch({ type: 'LOADED' });
        } finally {
          dispatch({ type: 'LOADED' });
        }
      };

      fetchUserData();
    } else {
      dispatch({ type: 'LOADED' });
    }
  }, []);

  // Login function
  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const response = await fetch('http://localhost:8000/api/login', {
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
        // Store token in localStorage
        const token = data.data.token;
        localStorage.setItem('authToken', token);

        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: data.data.user,
            token: token,
          },
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
        await fetch('http://localhost:8000/api/logout', {
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
    localStorage.removeItem('authToken');
    dispatch({ type: 'LOGOUT' });
  };

  // Register function
  const register = async (name, email, password, role = 'user') => {
    dispatch({ type: 'LOADING' });

    try {
      const response = await fetch('http://localhost:8000/api/register', {
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

  const value = {
    ...state,
    login,
    logout,
    register,
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