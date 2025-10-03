import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI, endpoints } from '../services/api';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  isLoading: false,
  isAuthenticated: false,
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REFRESH_TOKEN_START: 'REFRESH_TOKEN_START',
  REFRESH_TOKEN_SUCCESS: 'REFRESH_TOKEN_SUCCESS',
  REFRESH_TOKEN_FAILURE: 'REFRESH_TOKEN_FAILURE',
  USER_LOADED: 'USER_LOADED',
  CLEAR_ERRORS: 'CLEAR_ERRORS',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        user: action.payload.user,
        error: null,
      };
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        token: null,
        refreshToken: null,
        user: null,
        error: action.payload,
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        token: null,
        refreshToken: null,
        user: null,
        error: null,
      };
    case AUTH_ACTIONS.REFRESH_TOKEN_START:
      return {
        ...state,
        isLoading: true,
      };
    case AUTH_ACTIONS.REFRESH_TOKEN_SUCCESS:
      return {
        ...state,
        isLoading: false,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
      };
    case AUTH_ACTIONS.REFRESH_TOKEN_FAILURE:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        token: null,
        refreshToken: null,
        user: null,
      };
    case AUTH_ACTIONS.USER_LOADED:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        isLoading: false,
      };
    case AUTH_ACTIONS.CLEAR_ERRORS:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set token in localStorage
  const setAuthToken = (token) => {
    if (token) {
      localStorage.setItem('token', token);
      // The interceptor in api.js will handle adding the header
    } else {
      localStorage.removeItem('token');
    }
  };

  // Set refresh token in localStorage
  const setRefreshToken = (refreshToken) => {
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    } else {
      localStorage.removeItem('refreshToken');
    }
  };

  // Load user from token
  const loadUser = async () => {
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        // Set the token in the authAPI instance for this request
        authAPI.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await authAPI.get(endpoints.AUTH.ME);
        dispatch({
          type: AUTH_ACTIONS.USER_LOADED,
          payload: response.data,
        });
      } catch (error) {
        console.error('Error loading user:', error);
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: error.response?.data?.detail || 'Failed to load user',
        });
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }
    }
  };

  // Login function
  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    
    try {
      const response = await authAPI.post(endpoints.AUTH.LOGIN, credentials);
      const { access_token, refresh_token, token_type } = response.data;
      
      // Set tokens in localStorage first
      localStorage.setItem('token', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      
      // Load user data with the new token
      // Set the token in the authAPI instance for this request
      authAPI.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      const userResponse = await authAPI.get(endpoints.AUTH.ME);
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          token: access_token,
          refreshToken: refresh_token,
          user: userResponse.data,
        },
      });
      
      toast.success('Login successful!');
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Login failed';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      });
      toast.error(errorMessage);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    toast.success('Logged out successfully');
  };

  // Refresh token function
  const refreshToken = async () => {
    const refreshTokenValue = localStorage.getItem('refreshToken');
    
    if (!refreshTokenValue) {
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      return false;
    }
    
    dispatch({ type: AUTH_ACTIONS.REFRESH_TOKEN_START });
    
    try {
      const response = await authAPI.post(endpoints.AUTH.REFRESH, {
        refresh_token: refreshTokenValue,
      });
      
      const { access_token, refresh_token: newRefreshToken, token_type } = response.data;
      
      setAuthToken(access_token);
      setRefreshToken(newRefreshToken);
      authAPI.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      dispatch({
        type: AUTH_ACTIONS.REFRESH_TOKEN_SUCCESS,
        payload: { token: access_token, refreshToken: newRefreshToken },
      });
      
      return true;
    } catch (error) {
      console.error('Error refreshing token:', error);
      dispatch({ type: AUTH_ACTIONS.REFRESH_TOKEN_FAILURE });
      setAuthToken(null);
      setRefreshToken(null);
      return false;
    }
  };

  // Clear errors
  const clearErrors = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERRORS });
  };

  // Initialize auth on mount
  useEffect(() => {
    loadUser();
  }, []);

  // Setup axios interceptor for token refresh
  useEffect(() => {
    const requestInterceptor = authAPI.interceptors.request.use(
      (config) => {
        // Set token for all requests except auth endpoints
        if (!config.url.includes('/auth/')) {
          const token = localStorage.getItem('token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = authAPI.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // If error is 401 and we haven't tried to refresh token yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          // Don't try to refresh token for auth endpoints
          if (!originalRequest.url.includes('/auth/')) {
            const refreshSuccess = await refreshToken();
            if (refreshSuccess) {
              // Retry the original request with new token
              const token = localStorage.getItem('token');
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return authAPI(originalRequest);
            }
          }
        }
        
        return Promise.reject(error);
      }
    );

    return () => {
      authAPI.interceptors.request.eject(requestInterceptor);
      authAPI.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const value = {
    ...state,
    login,
    logout,
    refreshToken,
    loadUser,
    clearErrors,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;