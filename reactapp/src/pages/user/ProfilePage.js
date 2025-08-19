// pages/user/ProfilePage.js
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  Avatar,
  Paper,
  Alert,
  Divider,
} from '@mui/material';
import { Person, Email, Phone, Badge } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { userAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const ProfileForm = ({ user, onSave }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    username: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        username: user.username || '',
      });
    }
  }, [user]);

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await onSave(formData);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label="First Name"
            value={formData.firstName}
            onChange={handleChange('firstName')}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label="Last Name"
            value={formData.lastName}
            onChange={handleChange('lastName')}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label="Username"
            value={formData.username}
            onChange={handleChange('username')}
            disabled // Usually username shouldn't be changeable
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            type="email"
            label="Email"
            value={formData.email}
            onChange={handleChange('email')}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="tel"
            label="Phone Number"
            value={formData.phone}
            onChange={handleChange('phone')}
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

const ProfilePage = () => {
  const { user: authUser } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      console.log(authUser);
      const response = await userAPI.getById(authUser.id);
      setUserProfile(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (formData) => {
    await userAPI.update(authUser.id, formData);
    fetchUserProfile();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading profile...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: 'primary.main',
                mr: 3,
                fontSize: '1.5rem',
              }}
            >
              {userProfile?.firstName?.[0]}{userProfile?.lastName?.[0]}
            </Avatar>
            <Box>
              <Typography variant="h4" gutterBottom>
                {userProfile?.firstName} {userProfile?.lastName}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {authUser?.role?.replace('_', ' ')} • Member since {new Date(userProfile?.registrationDate).getFullYear()}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </motion.div>

      <Grid container spacing={3}>
        {/* Profile Form */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <ProfileForm user={userProfile} onSave={handleSaveProfile} />
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Stats */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Account Details
              </Typography>
              <Box display="flex" alignItems="center" mb={2}>
                <Person sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  Role: {authUser?.role?.replace('_', ' ')}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" mb={2}>
                <Email sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  {userProfile?.emailVerified ? 'Email Verified' : 'Email Not Verified'}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" mb={2}>
                <Badge sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  Status: {userProfile?.isActive ? 'Active' : 'Inactive'}
                </Typography>
              </Box>
              {userProfile?.lastLogin && (
                <Typography variant="body2" color="textSecondary">
                  Last Login: {new Date(userProfile.lastLogin).toLocaleDateString()}
                </Typography>
              )}
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Security Settings
              </Typography>
              <Button variant="outlined" fullWidth sx={{ mb: 1 }}>
                Change Password
              </Button>
              <Button variant="outlined" fullWidth>
                Two-Factor Authentication
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
export default ProfilePage;