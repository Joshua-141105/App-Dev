// components/auth/AuthForm.js
import React, { useState } from 'react';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { motion } from 'framer-motion';

const AuthForm = ({ 
  title, 
  fields, 
  onSubmit, 
  submitText, 
  links = [], 
  loading = false, 
  error = null 
}) => {
  const [formData, setFormData] = useState({});
  const [showPassword, setShowPassword] = useState({});

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(formData);
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field]
    });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 400,
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            align="center"
            color="primary"
            fontWeight="bold"
          >
            {title}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            {fields.map((field) => (
              <TextField
                key={field.name}
                fullWidth
                margin="normal"
                label={field.label}
                name={field.name}
                type={
                  field.type === 'password' 
                    ? showPassword[field.name] ? 'text' : 'password'
                    : field.type
                }
                required={field.required}
                value={formData[field.name] || ''}
                onChange={handleChange(field.name)}
                InputProps={field.type === 'password' ? {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility(field.name)}
                        edge="end"
                      >
                        {showPassword[field.name] ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                } : undefined}
              />
            ))}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {loading ? 'Please wait...' : submitText}
            </Button>

            {links.map((link, index) => (
              <Box key={index} textAlign="center" sx={{ mt: 1 }}>
                <Link
                  href={link.href}
                  variant="body2"
                  color="primary"
                  underline="hover"
                >
                  {link.text}
                </Link>
              </Box>
            ))}
          </Box>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default AuthForm;