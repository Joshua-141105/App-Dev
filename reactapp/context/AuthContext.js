// contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state on app load
  useEffect(() => {
    initializeAuth();
  }, []);

  // Set up axios interceptor for token
  useEffect(() => {
    if (token) {
      localStorage.setItem('authToken', token);
      // Set default authorization header
      if (window.axios) {
        window.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    } else {
      localStorage.removeItem('authToken');
      if (window.axios) {
        delete window.axios.defaults.headers.common['Authorization'];
      }
    }
  }, [token]);

  const initializeAuth = async () => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');

    if (storedToken && storedUser) {
      try {
        // Validate token by making a test API call
        const decodedUser = JSON.parse(storedUser);
        
        // Check if token is expired
        if (isTokenExpired(storedToken)) {
          logout();
          return;
        }

        setToken(storedToken);
        setUser(decodedUser);
        setIsAuthenticated(true);
        
        // Optional: Validate token with backend
        await validateTokenWithBackend(storedToken);
      } catch (error) {
        console.error('Auth initialization failed:', error);
        logout();
      }
    }
    setIsLoading(false);
  };

  const validateTokenWithBackend = async (token) => {
    try {
      // Make a test API call to validate token
      // This could be a /me endpoint or any protected endpoint
      const response = await fetch('/api/auth/validate', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Token validation failed');
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      logout();
      throw error;
    }
  };

  const isTokenExpired = (token) => {
    try {
      // Decode JWT token (basic implementation)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  };

  const login = async (credentials) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login(credentials);
      
      const { token: authToken, user: userData } = response.data;
      
      // Decode token to get user info if not provided
      let userInfo = userData;
      if (!userInfo && authToken) {
        try {
          const payload = JSON.parse(atob(authToken.split('.')[1]));
          userInfo = {
            username: payload.sub,
            role: payload.role,
            // Add other user info from token
          };
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      }

      setToken(authToken);
      setUser(userInfo);
      setIsAuthenticated(true);
      
      // Store in localStorage
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('authUser', JSON.stringify(userInfo));
      
      toast.success(`Welcome back, ${userInfo.username || 'User'}!`);
      
      return { success: true, user: userInfo };
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);
      const response = await authAPI.register(userData);
      
      const { token: authToken, user: newUser } = response.data;
      
      setToken(authToken);
      setUser(newUser);
      setIsAuthenticated(true);
      
      // Store in localStorage
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('authUser', JSON.stringify(newUser));
      
      toast.success('Registration successful! Welcome to ParkEase.');
      
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Registration failed:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    
    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    
    // Clear axios headers
    if (window.axios) {
      delete window.axios.defaults.headers.common['Authorization'];
    }
    
    toast.info('You have been logged out successfully.');
  };

  const updateUser = (updatedUserData) => {
    const newUser = { ...user, ...updatedUserData };
    setUser(newUser);
    localStorage.setItem('authUser', JSON.stringify(newUser));
  };

  const resetPassword = async (email) => {
    try {
      setIsLoading(true);
      await authAPI.resetPassword({ email });
      toast.success('Password reset instructions sent to your email.');
      return { success: true };
    } catch (error) {
      console.error('Password reset failed:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send reset email.';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      setIsLoading(true);
      await authAPI.changePassword({ oldPassword, newPassword });
      toast.success('Password changed successfully.');
      return { success: true };
    } catch (error) {
      console.error('Password change failed:', error);
      const errorMessage = error.response?.data?.message || 'Failed to change password.';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Role-based access control helpers
  const hasRole = (requiredRole) => {
    if (!user || !user.role) return false;
    
    const roleHierarchy = {
      'USER': 1,
      'SECURITY': 2,
      'FACILITY_MANAGER': 3,
      'SYSTEM_ADMIN': 4
    };
    
    const userRoleLevel = roleHierarchy[user.role] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0;
    
    return userRoleLevel >= requiredRoleLevel;
  };

  const hasPermission = (permission) => {
    if (!user || !user.role) return false;
    
    const rolePermissions = {
      'USER': [
        'view_own_bookings',
        'create_booking',
        'cancel_own_booking',
        'view_available_slots',
        'manage_own_vehicles',
        'view_own_profile'
      ],
      'SECURITY': [
        'view_all_bookings',
        'override_access_control',
        'view_security_logs',
        'manage_access_devices',
        'emergency_controls'
      ],
      'FACILITY_MANAGER': [
        'manage_facility_slots',
        'view_facility_analytics',
        'manage_pricing',
        'view_facility_reports',
        'manage_facility_users'
      ],
      'SYSTEM_ADMIN': [
        'manage_all_users',
        'manage_all_facilities',
        'view_system_logs',
        'manage_system_config',
        'access_financial_reports',
        'manage_access_control'
      ]
    };
    
    // System admin has all permissions
    if (user.role === 'SYSTEM_ADMIN') return true;
    
    const userPermissions = rolePermissions[user.role] || [];
    return userPermissions.includes(permission);
  };

  // Auto-logout on token expiry
  useEffect(() => {
    let tokenCheckInterval;
    
    if (token && isAuthenticated) {
      tokenCheckInterval = setInterval(() => {
        if (isTokenExpired(token)) {
          logout();
          toast.warning('Your session has expired. Please log in again.');
        }
      }, 60000); // Check every minute
    }
    
    return () => {
      if (tokenCheckInterval) {
        clearInterval(tokenCheckInterval);
      }
    };
  }, [token, isAuthenticated]);

  const value = {
    // State
    user,
    token,
    isLoading,
    isAuthenticated,
    
    // Actions
    login,
    register,
    logout,
    updateUser,
    resetPassword,
    changePassword,
    
    // Utilities
    hasRole,
    hasPermission,
    isTokenExpired: () => token ? isTokenExpired(token) : true,
    
    // User info helpers
    getUserRole: () => user?.role || 'USER',
    getUserName: () => user?.firstName && user?.lastName 
      ? `${user.firstName} ${user.lastName}` 
      : user?.username || 'User',
    getUserEmail: () => user?.email || '',
    getUserId: () => user?.userId || user?.id,
    
    // Dashboard routing helper
    getDashboardRoute: () => {
      if (!user?.role) return '/dashboard';
      
      switch (user.role) {
        case 'SYSTEM_ADMIN':
          return '/admin/dashboard';
        case 'FACILITY_MANAGER':
          return '/manager/dashboard';
        case 'SECURITY':
          return '/security/dashboard';
        default:
          return '/user/dashboard';
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
