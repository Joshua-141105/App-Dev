// Updated BookingFormPage.js with real-time availability checking
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Paper,
  Divider,
  Chip,
  CircularProgress,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { vehicleAPI, bookingAPI, paymentAPI, notificationAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const BookingFormPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const selectedSlot = location.state?.selectedSlot;
  const preSelectedStartTime = location.state?.preSelectedStartTime;
  const preSelectedEndTime = location.state?.preSelectedEndTime;

  const [vehicles, setVehicles] = useState([]);
  const [formData, setFormData] = useState({
    slotId: selectedSlot?.slotId || '',
    vehicleId: '',
    startTime: preSelectedStartTime ? dayjs(preSelectedStartTime) : dayjs(),
    endTime: preSelectedEndTime ? dayjs(preSelectedEndTime) : dayjs().add(2, 'hour'),
    vehicleNumber: '',
  });


  const [cost, setCost] = useState(0);
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [error, setError] = useState(null);
  const [availabilityStatus, setAvailabilityStatus] = useState({
    available: true,
    checking: false,
    message: '',
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
  setFormData(prev => ({
    ...prev,
    startTime: dayjs(prev.startTime),
    endTime: dayjs(prev.endTime),
  }));
}, []);


  useEffect(() => {
    calculateCost();
    checkRealTimeAvailability();
  }, [formData.startTime, formData.endTime]);

  const fetchVehicles = async () => {
    try {
      const response = await vehicleAPI.getAll();
      const userVehicles = response.data.filter(v => v.userId === user.id);
      setVehicles(userVehicles);

      if (userVehicles.length > 0) {
        const defaultVehicle = userVehicles.find(v => v.isDefault) || userVehicles[0];
        setFormData(prev => ({
          ...prev,
          vehicleId: defaultVehicle.vehicleId,
          vehicleNumber: defaultVehicle.licensePlate,
        }));
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const calculateCost = () => {
    if (!selectedSlot || !formData.startTime || !formData.endTime) {
      setCost(0);
      return;
    }

    const hours = formData.endTime.diff(formData.startTime, 'hour', true);
    const totalCost = Math.max(1, Math.ceil(hours)) * selectedSlot.hourlyRate;
    setCost(totalCost);
  };

  const checkRealTimeAvailability = async () => {
    if (!selectedSlot || !formData.startTime || !formData.endTime) {
      return;
    }

    setCheckingAvailability(true);
    setAvailabilityStatus(prev => ({ ...prev, checking: true }));

    try {
      const response = await bookingAPI.checkAvailability({
        slotId: selectedSlot.slotId,
        startTime: formData.startTime.toISOString(),
        endTime: formData.endTime.toISOString(),
      });

      const available = response.data;
      setAvailabilityStatus({
        available,
        checking: false,
        message: available
          ? 'Slot is available for the selected time'
          : 'Slot is not available for the selected time. Please choose different times.',
      });
    } catch (error) {
      console.error('Error checking availability:', error);
      setAvailabilityStatus({
        available: false,
        checking: false,
        message: 'Unable to check availability. Please try again.',
      });
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    if (field === 'vehicleId') {
      const vehicle = vehicles.find(v => v.vehicleId === value);
      if (vehicle) {
        setFormData(prev => ({
          ...prev,
          vehicleNumber: vehicle.licensePlate,
        }));
      }
    }
  };

  const handleDateTimeChange = (field) => (newValue) => {
    if (!dayjs.isDayjs(newValue)) {
      newValue = dayjs(newValue); // convert to dayjs if not already
    }
    setFormData(prev => ({
      ...prev,
      [field]: newValue,
    }));
  };


  const validateForm = () => {
    const now = dayjs();
    const minDuration = 1; // 1 hour minimum
    const maxDuration = 24; // 24 hours maximum

    if (formData.startTime.isBefore(now)) {
      setError('Start time cannot be in the past');
      return false;
    }

    const duration = formData.endTime.diff(formData.startTime, 'hour', true);
    if (duration < minDuration) {
      setError('Minimum booking duration is 1 hour');
      return false;
    }

    if (duration > maxDuration) {
      setError('Maximum booking duration is 24 hours');
      return false;
    }

    if (!formData.vehicleId) {
      setError('Please select a vehicle');
      return false;
    }

    if (!availabilityStatus.available) {
      setError('Selected time slot is not available');
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Final availability check before booking
      const finalAvailabilityCheck = await bookingAPI.checkAvailability({
        slotId: selectedSlot.slotId,
        startTime: formData.startTime.format('YYYY-MM-DDTHH:mm:ss'),
        endTime: formData.endTime.format('YYYY-MM-DDTHH:mm:ss'),
      });

      if (!finalAvailabilityCheck.data) {
        setError('Slot was booked by someone else. Please select different times.');
        setLoading(false);
        return;
      }

      // Create booking
      const bookingData = {
        userId: user.id,
        slotId: formData.slotId,
        vehicleNumber: formData.vehicleNumber,
        startTime: formData.startTime.format('YYYY-MM-DDTHH:mm:ss'),
        endTime: formData.endTime.format('YYYY-MM-DDTHH:mm:ss'),
        totalCost: cost,
        status: 'CONFIRMED',
        extendedTime: 0,
      };

      const bookingResponse = await bookingAPI.create(bookingData);

      // Create payment
      const paymentData = {
        bookingId: bookingResponse.data.bookingId,
        amount: cost,
        paymentMethod: 'CREDIT_CARD',
        status: 'COMPLETED',
        transactionId: `TXN_${Date.now()}`,
      };

      await paymentAPI.create(paymentData);

      const notificationData = {
        userId: user.id,
        message: `Your booking for slot ${selectedSlot.slotNumber} from ${formData.startTime.format('MMM DD, HH:mm')} to ${formData.endTime.format('MMM DD, HH:mm')} has been confirmed.`,
        type: "BOOKING_CONFIRMATION",
        priority: "Medium",
        relatedEntityType: "Booking",
        relatedEntityId: bookingResponse.data.bookingId,
        isRead: false
      };
      await notificationAPI.create(notificationData);

      toast.success('Booking created successfully!');
      navigate('/my-bookings');
    } catch (error) {
      console.error('Error creating booking:', error);
      if (error.response?.status === 409) {
        setError('This time slot is no longer available. Please select different times.');
      } else {
        setError(error.response?.data?.message || 'Failed to create booking');
      }
      toast.error('Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const suggestAlternativeTimes = () => {
    // Suggest next available 2-hour slot
    const newStartTime = formData.endTime;
    const newEndTime = newStartTime.add(2, 'hour');

    setFormData(prev => ({
      ...prev,
      startTime: newStartTime,
      endTime: newEndTime,
    }));
  };

  if (!selectedSlot) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="textSecondary">
            No slot selected. Please go back and select a parking slot.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/slots')}
            sx={{ mt: 2 }}
          >
            Browse Slots
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h4" gutterBottom>
              Book Parking Slot
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Complete your booking details below
            </Typography>
          </Paper>
        </motion.div>

        <Grid container spacing={3}>
          {/* Selected Slot Info */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Selected Slot
                </Typography>
                <Box mb={2}>
                  <Typography variant="h4" color="primary">
                    Slot {selectedSlot.slotNumber}
                  </Typography>
                  <Chip
                    label={selectedSlot.slotType.replace('_', ' ')}
                    color="primary"
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Box>
                <Typography variant="body2" gutterBottom>
                  Floor {selectedSlot.floor} - {selectedSlot.section}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Rate: ${selectedSlot.hourlyRate}/hour
                </Typography>
                {selectedSlot.features && (
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Features: {selectedSlot.features}
                  </Typography>
                )}

                <Divider sx={{ my: 2 }} />

                {/* Availability Status */}
                <Box mb={2}>
                  {availabilityStatus.checking || checkingAvailability ? (
                    <Box display="flex" alignItems="center" gap={1}>
                      <CircularProgress size={16} />
                      <Typography variant="body2" color="textSecondary">
                        Checking availability...
                      </Typography>
                    </Box>
                  ) : (
                    <Alert
                      severity={availabilityStatus.available ? 'success' : 'warning'}
                      sx={{ mb: 1 }}
                    >
                      {availabilityStatus.message}
                    </Alert>
                  )}
                </Box>

                <Typography variant="h6" color="primary">
                  Total Cost: ${cost.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Booking Form */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Booking Details
                </Typography>

                {error && (
                  <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                    action={
                      error.includes('not available') && (
                        <Button
                          color="inherit"
                          size="small"
                          onClick={suggestAlternativeTimes}
                        >
                          Try Next Slot
                        </Button>
                      )
                    }
                  >
                    {error}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControl fullWidth required>
                        <InputLabel>Select Vehicle</InputLabel>
                        <Select
                          value={formData.vehicleId}
                          onChange={handleInputChange('vehicleId')}
                          label="Select Vehicle"
                        >
                          {vehicles.map((vehicle) => (
                            <MenuItem key={vehicle.vehicleId} value={vehicle.vehicleId}>
                              {vehicle.licensePlate} - {vehicle.make} {vehicle.model}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <DateTimePicker
                        label="Start Time"
                        value={formData.startTime}
                        onChange={handleDateTimeChange('startTime')}
                        renderInput={(params) => <TextField {...params} fullWidth required />}
                        minDateTime={dayjs()}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <DateTimePicker
                        label="End Time"
                        value={formData.endTime}
                        onChange={handleDateTimeChange('endTime')}
                        renderInput={(params) => <TextField {...params} fullWidth required />}
                        minDateTime={formData.startTime ? formData.startTime.add(1, 'hour') : dayjs().add(1, 'hour')}
                      />

                    </Grid>

                    {/* Duration and cost breakdown */}
                    <Grid item xs={12}>
                      <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Booking Summary
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Duration: {formData.endTime.diff(formData.startTime, 'hour', true).toFixed(1)} hours
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Rate: ${selectedSlot.hourlyRate}/hour
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Vehicle: {formData.vehicleNumber || 'Not selected'}
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={12}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                        <Button
                          variant="outlined"
                          onClick={() => navigate('/slots')}
                        >
                          Back to Slots
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          size="large"
                          disabled={loading || !availabilityStatus.available || checkingAvailability}
                        >
                          {loading ? (
                            <>
                              <CircularProgress size={20} sx={{ mr: 1 }} />
                              Booking...
                            </>
                          ) : (
                            `Book for ${cost.toFixed(2)}`
                          )}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default BookingFormPage;