// components/layout/Sidebar.js
import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard,
  DirectionsCar,
  EventAvailable,
  History,
  Payment,
  Person,
  Notifications,
  Settings,
  SupervisorAccount,
  Analytics,
  Assessment,
  Security,
  AdminPanelSettings,
  LocalParking,
  PriceChange,
  Business,
  BarChart,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 240;

const Sidebar = ({ mobileOpen, onMobileClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getMenuItems = () => {
    const commonItems = [
      { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
      { text: 'Notifications', icon: <Notifications />, path: '/notifications' },
      { text: 'Profile', icon: <Person />, path: '/profile' },
      { text: 'Booking History', icon: <History />, path: '/booking-history' },
    ];
    
    const userItems = [
      { text: 'Available Slots', icon: <LocalParking />, path: '/slots' },
      { text: 'Book Slot', icon: <EventAvailable />, path: '/book-slot' },
      { text: 'My Bookings', icon: <DirectionsCar />, path: '/my-bookings' },
      { text: 'Vehicles', icon: <DirectionsCar />, path: '/vehicles' },
      { text: 'Payments', icon: <Payment />, path: '/payments' },
    ];

    const managerItems = [
      { text: 'Slot Management', icon: <LocalParking />, path: '/slot-management' },
      { text: 'Pricing', icon: <PriceChange />, path: '/pricing' },
      { text: 'Analytics', icon: <Analytics />, path: '/analytics' },
      { text: 'Financial Reports', icon: <Assessment />, path: '/financial-reports' },
      { text: 'Facility Analytics', icon: <BarChart />, path: '/facility-analytics' },
    ];

    const adminItems = [
      { text: 'Pricing', icon: <PriceChange />, path: '/pricing' },
      { text: 'Slot Management', icon: <LocalParking />, path: '/slot-management' },
      { text: 'User Management', icon: <SupervisorAccount />, path: '/user-management' },
      { text: 'Facility Management', icon: <Business />, path: '/facility-management' },
      { text: 'Facility Analytics', icon: <BarChart />, path: '/facility-analytics' },
      { text: 'Access Control', icon: <Security />, path: '/access-control' },
      { text: 'Audit Logs', icon: <AdminPanelSettings />, path: '/audit-logs' },
    ];

    const securityItems = [
      { text: 'Available Slots', icon: <LocalParking />, path: '/slots' },
      { text: 'All Bookings', icon: <DirectionsCar />, path: '/my-bookings' },
    ];

    let items = [...commonItems];

    switch (user?.role) {
      case 'USER':
        items.push(...userItems);
        break;
      case 'FACILITY_MANAGER':
        items.push( ...managerItems);
        break;
      case 'SYSTEM_ADMIN':
        items.push( ...adminItems);
        break;
      case 'SECURITY':
        items.push(...securityItems);
        break;
      default:
        items.push(...userItems);
    }

    return items;
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      onMobileClose();
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header Section */}
      <Box 
        sx={{ 
          p: 2, 
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <Typography 
          variant="h6" 
          component="div" 
          fontWeight={700}
          sx={{ 
            textAlign: 'center',
            textShadow: '0 1px 3px rgba(0,0,0,0.3)',
          }}
        >
          Parking Slot Booking System
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            textAlign: 'center', 
            display: 'block',
            opacity: 0.9,
            fontWeight: 500,
          }}
        >
          {/* {user?.role?.replace('_', ' ')} Portal */}
        </Typography>
      </Box>

      {/* Scrollable Navigation */}
      <Box 
        sx={{ 
          flex: 1,
          overflow: 'auto',
          // Custom scrollbar for sidebar
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: theme.palette.mode === 'dark' ? '#444' : '#ddd',
            borderRadius: '3px',
            '&:hover': {
              background: theme.palette.mode === 'dark' ? '#555' : '#ccc',
            },
          },
        }}
      >
        <List sx={{ py: 1 }}>
          {getMenuItems().map((item, index) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5, px: 1 }}>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  mx: 0.5,
                  transition: 'all 0.2s ease-in-out',
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.main + '15',
                    color: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.main + '25',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: '4px',
                      backgroundColor: theme.palette.primary.main,
                      borderRadius: '0 4px 4px 0',
                    },
                  },
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                    transform: 'translateX(4px)',
                  },
                  position: 'relative',
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: location.pathname === item.path ? 'primary.main' : 'inherit',
                    minWidth: 40,
                    transition: 'color 0.2s ease-in-out',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontSize: '0.9rem',
                      fontWeight: location.pathname === item.path ? 600 : 400,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Footer Section */}
      <Box 
        sx={{ 
          p: 2, 
          borderTop: `1px solid ${theme.palette.divider}`,
          textAlign: 'center',
        }}
      >
        <Typography variant="caption" color="textSecondary">
          Version 1.0.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            borderRadius: '0 16px 16px 0',
          },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Desktop drawer - Fixed */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            position: 'fixed', // Fixed positioning
            height: '100vh', // Full height
            top: 0, // Start from top
            left: 0, // Align to left
            zIndex: (theme) => theme.zIndex.drawer, // Proper z-index
            borderRight: `1px solid ${theme.palette.divider}`,
            // Add subtle shadow for depth
            boxShadow: theme.palette.mode === 'dark' 
              ? '2px 0 8px rgba(0,0,0,0.3)' 
              : '2px 0 8px rgba(0,0,0,0.1)',
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};
export default Sidebar;