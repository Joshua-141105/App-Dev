// components/layout/Navbar.js
import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Tooltip,
} from '@mui/material';
import {
  NotificationsOutlined,
  AccountCircle,
  Brightness4,
  Brightness7,
  MenuOpen,
} from '@mui/icons-material';
import { useTheme } from '../../context/ThemeProvider';
import { useAuth } from '../../context/AuthContext';
import { notificationAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onMenuToggle, mobileOpen }) => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchNotificationCount();
    }
  }, [user]);

  const fetchNotificationCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount(user.id);
      setNotificationCount(response.data);
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
    toast.success('Logged out successfully');
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        // Ensure navbar stays above everything
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        // Custom styling for better visual separation
        boxShadow: (theme) => theme.palette.mode === 'dark' 
          ? '0 2px 8px rgba(0,0,0,0.3)' 
          : '0 2px 8px rgba(0,0,0,0.1)',
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="toggle drawer"
          onClick={onMenuToggle}
          edge="start"
          sx={{ 
            mr: 2, 
            display: { sm: 'none' },
            // Ensure touch target is adequate
            minWidth: 48,
            minHeight: 48,
          }}
        >
          <MenuOpen />
        </IconButton>
        
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1,
            fontWeight: 600,
            // Prevent text selection on logo
            userSelect: 'none',
          }}
        >
          Parking Slot Booking System
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Theme Toggle */}
          <Tooltip title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}>
            <IconButton 
              color="inherit" 
              onClick={toggleTheme}
              sx={{
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'rotate(180deg)',
                },
              }}
            >
              {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton 
              color="inherit"
              onClick = {() => {navigate('/notifications')}}
              sx={{
                position: 'relative',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.1)',
                },
              }}
            >
              <Badge 
                badgeContent={notificationCount} 
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    animation: notificationCount > 0 ? 'pulse 2s infinite' : 'none',
                    '@keyframes pulse': {
                      '0%': { transform: 'scale(1)' },
                      '50%': { transform: 'scale(1.1)' },
                      '100%': { transform: 'scale(1)' },
                    },
                  },
                }}
              >
                <NotificationsOutlined />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Profile Menu */}
          <Tooltip title="Account settings">
            <IconButton
              color="inherit"
              onClick={handleProfileMenuOpen}
              aria-controls="profile-menu"
              aria-haspopup="true"
              sx={{
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            >
              <Avatar 
                sx={{ 
                  width: 36, 
                  height: 36, 
                  bgcolor: 'secondary.main',
                  fontSize: '1rem',
                  fontWeight: 600,
                }}
              >
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            id="profile-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            sx={{
              '& .MuiPaper-root': {
                minWidth: 200,
                mt: 1,
                borderRadius: 2,
                boxShadow: (theme) => theme.palette.mode === 'dark' 
                  ? '0 8px 24px rgba(0,0,0,0.4)' 
                  : '0 8px 24px rgba(0,0,0,0.15)',
              },
            }}
          >
            <MenuItem 
              onClick={handleProfileMenuClose}
              sx={{ 
                py: 1.5, 
                borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                '&:hover': { bgcolor: 'transparent' },
                cursor: 'default',
              }}
            >
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {user?.username}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {user?.role?.replace('_', ' ')}
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem 
              onClick={handleProfileMenuClose}
              sx={{ 
                py: 1,
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              Profile Settings
            </MenuItem>
            <MenuItem 
              onClick={handleLogout}
              sx={{ 
                py: 1,
                color: 'error.main',
                '&:hover': {
                  bgcolor: 'error.light',
                  color: 'error.contrastText',
                },
              }}
            >
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;