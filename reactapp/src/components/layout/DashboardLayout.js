// components/layout/DashboardLayout.js
import React, { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar 
        onMenuToggle={handleDrawerToggle} 
        mobileOpen={mobileOpen}
      />
      <Sidebar 
        mobileOpen={mobileOpen} 
        onMobileClose={handleDrawerToggle}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - 240px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;