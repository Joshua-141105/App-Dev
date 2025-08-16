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
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../App';

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
    ];

    const userItems = [
      { text: 'Available Slots', icon: <LocalParking />, path: '/slots' },
      { text: 'Book Slot', icon: <EventAvailable />, path: '/book-slot' },
      { text: 'My Bookings', icon: <DirectionsCar />, path: '/my-bookings' },
      { text: 'Booking History', icon: <History />, path: '/booking-history' },
      { text: 'Vehicles', icon: <DirectionsCar />, path: '/vehicles' },
      { text: 'Payments', icon: <Payment />, path: '/payments' },
    ];

    const managerItems = [
      { text: 'Slot Management', icon: <LocalParking />, path: '/slot-management' },
      { text: 'Pricing', icon: <PriceChange />, path: '/pricing' },
      { text: 'Analytics', icon: <Analytics />, path: '/analytics' },
      { text: 'Financial Reports', icon: <Assessment />, path: '/financial-reports' },
    ];

    const adminItems = [
      { text: 'User Management', icon: <SupervisorAccount />, path: '/user-management' },
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
        items.push(...userItems, ...managerItems);
        break;
      case 'SYSTEM_ADMIN':
        items.push(...userItems, ...managerItems, ...adminItems);
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
    <Box>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" component="div" color="primary">
          ParkEase
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {user?.role?.replace('_', ' ')}
        </Typography>
      </Box>
      <Divider />
      <List>
        {getMenuItems().map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main + '20',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.main + '30',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
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
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            position: 'relative',
            height: '100vh',
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};