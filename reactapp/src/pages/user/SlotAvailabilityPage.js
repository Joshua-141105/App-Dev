// pages/user/SlotAvailabilityPage.js
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
} from '@mui/material';
import {
  LocalParking,
  ElectricCar,
  Accessible,
  Star,
  LocationOn,
  Schedule,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { parkingSlotAPI, facilityAPI } from '../../utils/api';
import { toast } from 'react-toastify';

const SlotCard = ({ slot, onBook ,facilities}) => {
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

  const getFacilityName =  (slot , facilities) => {
    // console.log("Facilities:", facilities);
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
                {facilities ? getFacilityName(slot,facilities) : 'Loading...'}
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
  const [filteredSlots, setFilteredSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    facility: '',
    slotType: '',
    availableOnly: true,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchSlots();
    fetchFacilities();
    const interval = setInterval(fetchSlots, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [slots, filters]);

  const fetchSlots = async () => {
    try {
      const response = await parkingSlotAPI.getAll();
      setSlots(response.data);
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
      console.log('Facilities:', facilities);
    } catch (error) {
      console.error('Error fetching facilities:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...slots];
    console.log('Slots:', slots);
    if (filters.facility) {
      filtered = filtered.filter(slot => slot.facilityId === parseInt(filters.facility));
    }

    if (filters.slotType) {
      filtered = filtered.filter(slot => slot.slotType === filters.slotType);
    }

    if (filters.availableOnly) {
      filtered = filtered.filter(slot => slot.isAvailable);
    }

    setFilteredSlots(filtered);
  };

  const handleFilterChange = (field) => (event) => {
    setFilters({
      ...filters,
      [field]: event.target.value,
    });
  };

  const handleBookSlot = (slot) => {
    navigate('/book-slot', { state: { selectedSlot: slot } });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
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
          <Typography variant="h4" gutterBottom>
            Available Parking Slots
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Real-time slot availability - Updated every 30 seconds
          </Typography>
        </Paper>
      </motion.div>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Filter Slots
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
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
            <Grid item xs={12} sm={4}>
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
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Availability</InputLabel>
                <Select
                  value={filters.availableOnly}
                  onChange={handleFilterChange('availableOnly')}
                  label="Availability"
                >
                  <MenuItem value={true}>Available Only</MenuItem>
                  <MenuItem value={false}>All Slots</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Slots Grid */}
      <Grid container spacing={3}>
        {filteredSlots.length === 0 ? (
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <LocalParking sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="textSecondary">
                  No slots available with current filters
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => setFilters({ facility: '', slotType: '', availableOnly: true })}
                  sx={{ mt: 2 }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          filteredSlots.map((slot) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={slot.slotId}>
              <SlotCard slot={slot} onBook={handleBookSlot} facilities={facilities}/>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
};
export default SlotAvailabilityPage;