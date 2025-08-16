import React from 'react';
import { Box, Container, useTheme, useMediaQuery } from '@mui/material';

const ResponsiveLayout = ({ children, maxWidth = 'lg', padding = 3 }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Container maxWidth={maxWidth} sx={{ py: isMobile ? 2 : padding }}>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </Box>
    </Container>
  );
};

export default ResponsiveLayout;