// components/auth/ProtectedRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { motion } from 'framer-motion';

const ProtectedRoute = ({ 
  children, 
  requiredRole = null, 
  requiredPermission = null,
  fallbackPath = '/login',
  showLoading = true 
}) => {
  const { isAuthenticated, isLoading, user, hasRole, hasPermission } = useAuth();
  const location = useLocation();

  // Show loading spinner while auth is being initialized
  if (isLoading && showLoading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{ bgcolor: 'background.default' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 2, textAlign: 'center' }}>
            Loading...
          </Typography>
        </motion.div>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ maxWidth: 600, mx: 'auto' }}>
          <Typography variant="h6" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body1">
            You don't have the required permissions to access this page.
            {user?.role && (
              <>
                <br />
                Your role: <strong>{user.role.replace('_', ' ')}</strong>
                <br />
                Required role: <strong>{requiredRole.replace('_', ' ')}</strong>
              </>
            )}
          </Typography>
        </Alert>
      </Box>
    );
  }

  // Check permission-based access
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ maxWidth: 600, mx: 'auto' }}>
          <Typography variant="h6" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body1">
            You don't have the required permission to access this page.
            <br />
            Required permission: <strong>{requiredPermission.replace('_', ' ')}</strong>
          </Typography>
        </Alert>
      </Box>
    );
  }

  // Render the protected component
  return <>{children}</>;
};

// Higher-order component for role-based protection
export const withRoleProtection = (Component, requiredRole) => {
  return function ProtectedComponent(props) {
    return (
      <ProtectedRoute requiredRole={requiredRole}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
};

// Higher-order component for permission-based protection
export const withPermissionProtection = (Component, requiredPermission) => {
  return function ProtectedComponent(props) {
    return (
      <ProtectedRoute requiredPermission={requiredPermission}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
};

// Admin-only route protection
export const AdminRoute = ({ children }) => (
  <ProtectedRoute requiredRole="SYSTEM_ADMIN">
    {children}
  </ProtectedRoute>
);
export default ProtectedRoute;