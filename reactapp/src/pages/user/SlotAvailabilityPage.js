// Updated SlotAvailabilityPage.js with time-based filtering
import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Paper,
  Avatar,
  Pagination,
} from '@mui/material';
import {
  LocalParking,
  ElectricCar,
  Accessible,
  Star,
  Schedule,
  CalendarMonth,
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { parkingSlotAPI, facilityAPI } from '../../utils/api';
import { toast } from 'react-toastify';

const SlotCard = ({ slot, onBook, facilities, showTimeInfo = false }) => {
  const getSlotIcon = () => {
    switch (slot.slotType) {
      case 'ELECTRIC_VEHICLE':
        return <ElectricCar />;
      case 'HANDICAPPED':
        return <Accessible />;
      case 'VIP':
        return <Star />;
      default:
        return <LocalParking />;
    }
  };

  const getFacilityName = (slot, facilities) => {
    return facilities.find(facility => facility.facilityId === slot.facilityId)?.facilityName || 'Unknown Facility';
  };

  const getSlotColor = () => {
    if (!slot.isAvailable) return 'error';
    switch (slot.slotType) {
      case 'ELECTRIC_VEHICLE':
        return 'success';
      case 'VIP':
        return 'warning';
      case 'HANDICAPPED':
        return 'info';
      default:
        return 'primary';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        sx={{
          height: '100%',
          border: slot.isAvailable ? '2px solid transparent' : '2px solid #f44336',
          '&:hover': {
            boxShadow: 6,
            border: slot.isAvailable ? '2px solid #1976d2' : '2px solid #f44336',
          }
        }}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box>
              <Typography variant="h6">
                Slot {slot.slotNumber}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {facilities ? getFacilityName(slot, facilities) : 'Loading...'}
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: `${getSlotColor()}.main` }}>
              {getSlotIcon()}
            </Avatar>
          </Box>

          <Chip
            label={slot.slotType.replace('_', ' ')}
            color={getSlotColor()}
            size="small"
            sx={{ mb: 1 }}
          />

          <Typography variant="body2" color="textSecondary" gutterBottom>
            Floor {slot.floor} - {slot.section}
          </Typography>

          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" color="primary">
              ${slot.hourlyRate}/hr
            </Typography>
            <Chip
              label={slot.isAvailable ? 'Available' : 'Occupied'}
              color={slot.isAvailable ? 'success' : 'error'}
              size="small"
            />
          </Box>

          {slot.features && (
            <Typography variant="body2" color="textSecondary" mb={2}>
              Features: {slot.features}
            </Typography>
          )}

          {showTimeInfo && (
            <Box sx={{ mb: 2, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="caption" color="textSecondary">
                <Schedule sx={{ fontSize: 16, mr: 0.5 }} />
                Available for selected time
              </Typography>
            </Box>
          )}

          <Button
            fullWidth
            variant={slot.isAvailable ? 'contained' : 'outlined'}
            disabled={!slot.isAvailable}
            onClick={() => onBook(slot)}
          >
            {slot.isAvailable ? 'Book Now' : 'Unavailable'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const SlotAvailabilityPage = () => {
  const [slots, setSlots] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(0);
  const [size] = useState(8);
  const [totalPages, setTotalPages] = useState(0);

  // Time-based filtering
  const [timeFiltersEnabled, setTimeFiltersEnabled] = useState(false);
  const [selectedStartTime, setSelectedStartTime] = useState(dayjs());
  const [selectedEndTime, setSelectedEndTime] = useState(dayjs().add(2, 'hour'));

  const [filters, setFilters] = useState({
    facility: '',
    slotType: '',
    availableOnly: true,
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchSlots();
    fetchFacilities();
    const interval = setInterval(fetchSlots, 30000);
    return () => clearInterval(interval);
  }, [page, filters, timeFiltersEnabled, selectedStartTime, selectedEndTime]);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size,
        facilityId: filters.facility || null,
        slotType: filters.slotType || null,
      };

      if (typeof filters.availableOnly === "boolean") {
        params.availableOnly = filters.availableOnly;
      }

      // Add time-based parameters if enabled
      if (timeFiltersEnabled && selectedStartTime && selectedEndTime) {
        params.startTime = selectedStartTime.toISOString();
        params.endTime = selectedEndTime.toISOString();
      }

      const response = await parkingSlotAPI.getPaginated(params);
      setSlots(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast.error('Failed to fetch parking slots');
    } finally {
      setLoading(false);
    }
  };

  const fetchFacilities = async () => {
    try {
      const response = await facilityAPI.getAll();
      setFacilities(response.data);
    } catch (error) {
      console.error('Error fetching facilities:', error);
    }
  };

  const handleFilterChange = (field) => (event) => {
    setFilters({
      ...filters,
      [field]: event.target.value,
    });
    setPage(0);
  };

  const handleTimeFilterToggle = () => {
    setTimeFiltersEnabled(!timeFiltersEnabled);
    setPage(0);
  };

  const handleStartTimeChange = (newValue) => {
    setSelectedStartTime(newValue);
    // Auto-adjust end time if it's before start time
    if (selectedEndTime.isBefore(newValue)) {
      setSelectedEndTime(newValue.add(2, 'hour'));
    }
    setPage(0);
  };

  const handleEndTimeChange = (newValue) => {
    setSelectedEndTime(newValue);
    setPage(0);
  };

  const handleBookSlot = (slot) => {
    const bookingData = {
      selectedSlot: slot,
      ...(timeFiltersEnabled && {
        preSelectedStartTime: selectedStartTime.toISOString(),
        preSelectedEndTime: selectedEndTime.toISOString(),
      })
    };
    navigate('/book-slot', { state: bookingData });
  };

  const validateTimeRange = () => {
    if (!selectedStartTime || !selectedEndTime) return false;
    if (selectedEndTime.isBefore(selectedStartTime)) return false;
    if (selectedStartTime.isBefore(dayjs())) return false;
    return true;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h4" gutterBottom>
              Available Parking Slots
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {timeFiltersEnabled 
                ? `Showing slots available from ${selectedStartTime.format('MMM DD, HH:mm')} to ${selectedEndTime.format('MMM DD, HH:mm')}`
                : 'Real-time slot availability - Updated every 30 seconds'
              }
            </Typography>
          </Paper>
        </motion.div>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Filter Slots
            </Typography>
            
            {/* Time-based filtering toggle */}
            <Box mb={2}>
              <Button
                variant={timeFiltersEnabled ? "contained" : "outlined"}
                startIcon={<CalendarMonth />}
                onClick={handleTimeFilterToggle}
                sx={{ mr: 2 }}
              >
                {timeFiltersEnabled ? 'Disable' : 'Enable'} Time-Based Search
              </Button>
              {timeFiltersEnabled && (
                <Chip 
                  label="Time filters active" 
                  color="primary" 
                  variant="outlined"
                />
              )}
            </Box>

            <Grid container spacing={2}>
              {/* Time filters */}
              {timeFiltersEnabled && (
                <>
                  <Grid item xs={12} sm={6} md={3}>
                    <DateTimePicker
                      label="Start Time"
                      value={selectedStartTime}
                      onChange={handleStartTimeChange}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                      minDateTime={dayjs()}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <DateTimePicker
                      label="End Time"
                      value={selectedEndTime}
                      onChange={handleEndTimeChange}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                      minDateTime={selectedStartTime}
                    />
                  </Grid>
                </>
              )}
              
              {/* Regular filters */}
              <Grid item xs={12} sm={6} md={timeFiltersEnabled ? 2 : 4}>
                <FormControl fullWidth>
                  <InputLabel>Facility</InputLabel>
                  <Select
                    value={filters.facility}
                    onChange={handleFilterChange('facility')}
                    label="Facility"
                  >
                    <MenuItem value="">All Facilities</MenuItem>
                    {facilities.map((facility) => (
                      <MenuItem key={facility.facilityId} value={facility.facilityId}>
                        {facility.facilityName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={timeFiltersEnabled ? 2 : 4}>
                <FormControl fullWidth>
                  <InputLabel>Slot Type</InputLabel>
                  <Select
                    value={filters.slotType}
                    onChange={handleFilterChange('slotType')}
                    label="Slot Type"
                  >
                    <MenuItem value="">All Types</MenuItem>
                    <MenuItem value="REGULAR">Regular</MenuItem>
                    <MenuItem value="VIP">VIP</MenuItem>
                    <MenuItem value="HANDICAPPED">Handicapped</MenuItem>
                    <MenuItem value="ELECTRIC_VEHICLE">Electric Vehicle</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={timeFiltersEnabled ? 2 : 4}>
                <FormControl fullWidth>
                  <InputLabel>Availability</InputLabel>
                  <Select
                    value={filters.availableOnly}
                    onChange={handleFilterChange('availableOnly')}
                    label="Availability"
                  >
                    <MenuItem value={true}>Available Only</MenuItem>
                    <MenuItem value={false}>Unavailable</MenuItem>
                    <MenuItem value={"all"}>All Slots</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {timeFiltersEnabled && !validateTimeRange() && (
              <Box mt={2}>
                <Typography variant="caption" color="error">
                  Please select a valid time range (end time must be after start time and in the future)
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Slots Grid */}
        <Grid container spacing={3}>
          {slots.length === 0 ? (
            <Grid item xs={12}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <LocalParking sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="textSecondary">
                    {timeFiltersEnabled 
                      ? 'No slots available for the selected time period'
                      : 'No slots available with current filters'
                    }
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setFilters({ facility: '', slotType: '', availableOnly: true });
                      setTimeFiltersEnabled(false);
                    }}
                    sx={{ mt: 2 }}
                  >
                    Clear All Filters
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ) : (
            slots.map((slot) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={slot.slotId}>
                <SlotCard 
                  slot={slot} 
                  onBook={handleBookSlot} 
                  facilities={facilities}
                  showTimeInfo={timeFiltersEnabled}
                />
              </Grid>
            ))
          )}
        </Grid>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={4}>
            <Pagination
              count={totalPages}
              page={page + 1}
              onChange={(e, newPage) => setPage(newPage - 1)}
              color="primary"
            />
          </Box>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default SlotAvailabilityPage;