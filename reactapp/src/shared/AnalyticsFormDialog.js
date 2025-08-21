import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Box,
  Alert
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { facilityAPI, analyticsAPI } from '../utils/api';
import { toast } from 'react-toastify';

const AnalyticsFormDialog = ({ open, onClose, onSave, analytics = null }) => {
  const [formData, setFormData] = useState({
    facilityId: '',
    date: dayjs(),
    totalBookings: '',
    occupancyRate: '',
    revenue: '',
    averageBookingDuration: '',
    peakHours: '',
    utilizationScore: ''
  });
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      fetchFacilities();
      if (analytics) {
        setFormData({
          facilityId: analytics.facilityId || '',
          date: dayjs(analytics.date) || dayjs(),
          totalBookings: analytics.totalBookings || '',
          occupancyRate: analytics.occupancyRate || '',
          revenue: analytics.revenue || '',
          averageBookingDuration: analytics.averageBookingDuration || '',
          peakHours: analytics.peakHours || '',
          utilizationScore: analytics.utilizationScore || ''
        });
      } else {
        resetForm();
      }
    }
  }, [open, analytics]);

  const resetForm = () => {
    setFormData({
      facilityId: '',
      date: dayjs(),
      totalBookings: '',
      occupancyRate: '',
      revenue: '',
      averageBookingDuration: '',
      peakHours: '',
      utilizationScore: ''
    });
    setError('');
  };

  const fetchFacilities = async () => {
    try {
      const response = await facilityAPI.getAll();
      setFacilities(response.data);
    } catch (error) {
      console.error('Error fetching facilities:', error);
      toast.error('Failed to fetch facilities');
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      // Validation
      if (!formData.facilityId) {
        setError('Please select a facility');
        return;
      }

      if (!formData.date) {
        setError('Please select a date');
        return;
      }

      // Prepare data for submission
      const submitData = {
        facilityId: parseInt(formData.facilityId),
        date: formData.date.format('YYYY-MM-DD'),
        totalBookings: parseInt(formData.totalBookings) || 0,
        occupancyRate: parseFloat(formData.occupancyRate) || 0.0,
        revenue: parseFloat(formData.revenue) || 0.0,
        averageBookingDuration: parseFloat(formData.averageBookingDuration) || 0.0,
        peakHours: formData.peakHours || '',
        utilizationScore: parseFloat(formData.utilizationScore) || 0.0
      };

      // Validate ranges
      if (submitData.occupancyRate < 0 || submitData.occupancyRate > 100) {
        setError('Occupancy rate must be between 0 and 100');
        return;
      }

      if (submitData.utilizationScore < 0 || submitData.utilizationScore > 1) {
        setError('Utilization score must be between 0 and 1');
        return;
      }

      if (submitData.revenue < 0) {
        setError('Revenue cannot be negative');
        return;
      }

      if (analytics) {
        await analyticsAPI.update(analytics.analyticsId, submitData);
        toast.success('Analytics data updated successfully');
      } else {
        await analyticsAPI.create(submitData);
        toast.success('Analytics data created successfully');
      }

      onSave();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error saving analytics data:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save analytics data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {analytics ? 'Edit Analytics Data' : 'Add Analytics Data'}
        </DialogTitle>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Facility</InputLabel>
                <Select
                  value={formData.facilityId}
                  onChange={(e) => setFormData({ ...formData, facilityId: e.target.value })}
                  label="Facility"
                  disabled={loading}
                >
                  {facilities.map((facility) => (
                    <MenuItem key={facility.facilityId} value={facility.facilityId}>
                      {facility.facilityName} - {facility.city}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Date"
                value={formData.date}
                onChange={(newValue) => setFormData({ ...formData, date: newValue })}
                renderInput={(params) => 
                  <TextField {...params} fullWidth margin="normal" required disabled={loading} />
                }
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Total Bookings"
                type="number"
                value={formData.totalBookings}
                onChange={(e) => setFormData({ ...formData, totalBookings: e.target.value })}
                margin="normal"
                inputProps={{ min: 0 }}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Occupancy Rate (%)"
                type="number"
                value={formData.occupancyRate}
                onChange={(e) => setFormData({ ...formData, occupancyRate: e.target.value })}
                margin="normal"
                inputProps={{ min: 0, max: 100, step: 0.1 }}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Revenue ($)"
                type="number"
                value={formData.revenue}
                onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                margin="normal"
                inputProps={{ min: 0, step: 0.01 }}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Average Booking Duration (hours)"
                type="number"
                value={formData.averageBookingDuration}
                onChange={(e) => setFormData({ ...formData, averageBookingDuration: e.target.value })}
                margin="normal"
                inputProps={{ min: 0, step: 0.1 }}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Peak Hours"
                value={formData.peakHours}
                onChange={(e) => setFormData({ ...formData, peakHours: e.target.value })}
                margin="normal"
                placeholder="e.g., 9:00 AM - 11:00 AM"
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Utilization Score (0-1)"
                type="number"
                value={formData.utilizationScore}
                onChange={(e) => setFormData({ ...formData, utilizationScore: e.target.value })}
                margin="normal"
                inputProps={{ min: 0, max: 1, step: 0.01 }}
                disabled={loading}
                helperText="Score between 0.0 and 1.0 representing overall utilization"
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={loading}
            startIcon={loading && <CircularProgress size={16} />}
          >
            {analytics ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};
export default AnalyticsFormDialog;