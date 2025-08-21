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
    <Box 
      sx={{ 
        display: 'flex',
        height: '100vh', // Full viewport height
        overflow: 'hidden', // Prevent body scroll
      }}
    >
      {/* Fixed Navbar */}
      <Navbar 
        onMenuToggle={handleDrawerToggle} 
        mobileOpen={mobileOpen}
      />
      
      {/* Fixed Sidebar */}
      <Sidebar 
        mobileOpen={mobileOpen} 
        onMobileClose={handleDrawerToggle}
      />
      
      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - 240px)` }, // Account for sidebar width
          height: '100vh', // Full viewport height
          overflow: 'auto', // Enable scrolling for content only
          bgcolor: 'background.default',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Toolbar spacer for fixed navbar */}
        <Toolbar />
        
        {/* Scrollable content container */}
        <Box
          sx={{
            flex: 1,
            p: 3,
            overflow: 'auto', // Enable scrolling
            // Custom scrollbar styling
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: (theme) => theme.palette.mode === 'dark' ? '#555' : '#ccc',
              borderRadius: '4px',
              '&:hover': {
                background: (theme) => theme.palette.mode === 'dark' ? '#666' : '#bbb',
              },
            },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;