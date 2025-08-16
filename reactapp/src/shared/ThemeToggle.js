import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useTheme } from '../App';

const ThemeToggle = () => {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <Tooltip title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}>
      <IconButton color="inherit" onClick={toggleTheme}>
        {darkMode ? <Brightness7 /> : <Brightness4 />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;