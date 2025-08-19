// contexts/ThemeProvider.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as MUIThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const CustomThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('parkingSystemTheme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    } else {
      // Check system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(systemPrefersDark);
    }
  }, []);

  // Save theme preference
  useEffect(() => {
    localStorage.setItem('parkingSystemTheme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  // Custom color palette for parking system
  const lightPalette = {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#dc004e',
      light: '#ff5983',
      dark: '#9a0036',
      contrastText: '#ffffff',
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#ed6c02',
      light: '#ff9800',
      dark: '#e65100',
      contrastText: '#ffffff',
    },
    error: {
      main: '#d32f2f',
      light: '#f44336',
      dark: '#c62828',
      contrastText: '#ffffff',
    },
    info: {
      main: '#0288d1',
      light: '#03a9f4',
      dark: '#01579b',
      contrastText: '#ffffff',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
    // Custom parking system colors
    parking: {
      available: '#4caf50',
      occupied: '#f44336',
      reserved: '#ff9800',
      maintenance: '#9e9e9e',
      vip: '#9c27b0',
      handicapped: '#2196f3',
      electric: '#00e676',
    }
  };

  const darkPalette = {
    primary: {
      main: '#90caf9',
      light: '#e3f2fd',
      dark: '#42a5f5',
      contrastText: '#000000',
    },
    secondary: {
      main: '#f48fb1',
      light: '#fce4ec',
      dark: '#e91e63',
      contrastText: '#000000',
    },
    success: {
      main: '#66bb6a',
      light: '#c8e6c9',
      dark: '#388e3c',
      contrastText: '#000000',
    },
    warning: {
      main: '#ffa726',
      light: '#fff3e0',
      dark: '#f57c00',
      contrastText: '#000000',
    },
    error: {
      main: '#ef5350',
      light: '#ffebee',
      dark: '#c62828',
      contrastText: '#000000',
    },
    info: {
      main: '#29b6f6',
      light: '#e1f5fe',
      dark: '#0277bd',
      contrastText: '#000000',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#aaaaaa',
    },
    // Custom parking system colors for dark mode
    parking: {
      available: '#66bb6a',
      occupied: '#ef5350',
      reserved: '#ffa726',
      maintenance: '#bdbdbd',
      vip: '#ba68c8',
      handicapped: '#64b5f6',
      electric: '#69f0ae',
    }
  };

  // Create theme
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      ...(darkMode ? darkPalette : lightPalette),
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 600,
        fontSize: '2.5rem',
        lineHeight: 1.2,
      },
      h2: {
        fontWeight: 600,
        fontSize: '2rem',
        lineHeight: 1.3,
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.75rem',
        lineHeight: 1.3,
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.5rem',
        lineHeight: 1.4,
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.25rem',
        lineHeight: 1.4,
      },
      h6: {
        fontWeight: 600,
        fontSize: '1.125rem',
        lineHeight: 1.4,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
      },
      button: {
        textTransform: 'none',
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 12,
    },
    spacing: 8,
    components: {
      // Card customization
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: darkMode 
              ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
              : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              boxShadow: darkMode 
                ? '0 10px 15px -3px rgba(0, 0, 0, 0.4)' 
                : '0 10px 15px -3px rgba(0, 0, 0, 0.15)',
              transform: 'translateY(-2px)',
            },
          },
        },
      },
      // Button customization
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 500,
            padding: '8px 16px',
            transition: 'all 0.2s ease-in-out',
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              transform: 'translateY(-1px)',
            },
          },
        },
      },
      // Chip customization
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 16,
          },
        },
      },
      // Paper customization
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundImage: 'none',
          },
        },
      },
      // Table customization
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 600,
            backgroundColor: darkMode ? '#2c2c2c' : '#f5f5f5',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          hover: {
            '&:hover': {
              backgroundColor: darkMode ? '#2c2c2c' : '#f8f9fa',
            },
          },
        },
      },
      // AppBar customization
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            borderBottom: `1px solid ${darkMode ? '#333' : '#e0e0e0'}`,
          },
        },
      },
      // Drawer customization
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRadius: '0 12px 12px 0',
            border: 'none',
          },
        },
      },
      // TextField customization
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              transition: 'all 0.2s ease-in-out',
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: darkMode ? '#555' : '#ccc',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderWidth: 2,
              },
            },
          },
        },
      },
      // Dialog customization
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
          },
        },
      },
      // Menu customization
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 8,
            marginTop: 8,
            boxShadow: darkMode 
              ? '0 8px 24px rgba(0, 0, 0, 0.4)' 
              : '0 8px 24px rgba(0, 0, 0, 0.15)',
          },
        },
      },
      // Tooltip customization
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: 6,
            fontSize: '0.75rem',
          },
        },
      },
      // Switch customization
      MuiSwitch: {
        styleOverrides: {
          switchBase: {
            '&.Mui-checked': {
              '& + .MuiSwitch-track': {
                opacity: 1,
              },
            },
          },
        },
      },
      // Tab customization
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            minHeight: 48,
          },
        },
      },
      // Alert customization
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
    },
    // Custom breakpoints for responsive design
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 900,
        lg: 1200,
        xl: 1536,
      },
    },
    // Custom z-index values
    zIndex: {
      mobileStepper: 1000,
      fab: 1050,
      speedDial: 1050,
      appBar: 1100,
      drawer: 1200,
      modal: 1300,
      snackbar: 1400,
      tooltip: 1500,
    },
  });

  // Add custom theme utilities
  theme.utils = {
    // Parking slot status colors
    getParkingSlotColor: (status) => {
      return theme.palette.parking[status] || theme.palette.grey[500];
    },
    
    // Responsive font sizes
    getResponsiveFontSize: (base) => ({
      fontSize: base,
      [theme.breakpoints.down('md')]: {
        fontSize: base * 0.9,
      },
      [theme.breakpoints.down('sm')]: {
        fontSize: base * 0.8,
      },
    }),
    
    // Custom shadows
    getCustomShadow: (elevation = 1) => {
      const shadows = {
        1: darkMode ? '0 2px 4px rgba(0, 0, 0, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
        2: darkMode ? '0 4px 8px rgba(0, 0, 0, 0.3)' : '0 4px 8px rgba(0, 0, 0, 0.1)',
        3: darkMode ? '0 8px 16px rgba(0, 0, 0, 0.3)' : '0 8px 16px rgba(0, 0, 0, 0.1)',
      };
      return shadows[elevation] || shadows[1];
    },
    
    // Glassmorphism effect
    getGlassMorphism: () => ({
      background: darkMode 
        ? 'rgba(255, 255, 255, 0.1)' 
        : 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px)',
      border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.3)'}`,
    }),
  };

  const contextValue = {
    darkMode,
    toggleTheme,
    theme,
    
    // Helper functions
    isDarkMode: () => darkMode,
    getThemeMode: () => darkMode ? 'dark' : 'light',
    
    // Color utilities
    getPrimaryColor: () => theme.palette.primary.main,
    getSecondaryColor: () => theme.palette.secondary.main,
    getBackgroundColor: () => theme.palette.background.default,
    getTextColor: () => theme.palette.text.primary,
    
    // Responsive utilities
    isSmallScreen: () => window.innerWidth < theme.breakpoints.values.sm,
    isMediumScreen: () => window.innerWidth < theme.breakpoints.values.md,
    isLargeScreen: () => window.innerWidth >= theme.breakpoints.values.lg,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
};