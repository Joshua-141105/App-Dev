// pages/manager/PricingPage.js
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Paper,
  Alert,
  Divider,
  Switch,
  FormControlLabel,
  InputAdornment,
} from '@mui/material';
import { AttachMoney, TrendingUp, Schedule, Info } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { parkingSlotAPI } from '../../utils/api';
import { toast } from 'react-toastify';

const PricingForm = ({ slotType, currentRate, onSave }) => {
  const [rate, setRate] = useState(currentRate);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setRate(currentRate);
  }, [currentRate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await onSave(slotType, rate);
      toast.success(`${slotType} rate updated successfully`);
    } catch (error) {
      console.error('Error updating rate:', error);
      toast.error('Failed to update rate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {slotType.replace('_', ' ')} Slots
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            type="number"
            label="Hourly Rate"
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            inputProps={{ min: 0, step: 0.5 }}
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={loading || rate === currentRate}
            fullWidth
          >
            {loading ? 'Updating...' : 'Update Rate'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

const PricingPage = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dynamicPricing, setDynamicPricing] = useState(false);

  useEffect(() => {
    fetchSlots();
  }, []);

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

  const getAverageRate = (slotType) => {
    const typeSlots = slots.filter(s => s.slotType === slotType);
    if (typeSlots.length === 0) return 0;
    return typeSlots.reduce((sum, s) => sum + s.hourlyRate, 0) / typeSlots.length;
  };

  const handleUpdateRate = async (slotType, newRate) => {
    const slotsToUpdate = slots.filter(s => s.slotType === slotType);
    
    try {
      const updatePromises = slotsToUpdate.map(slot => 
        parkingSlotAPI.update(slot.slotId, { ...slot, hourlyRate: newRate })
      );
      
      await Promise.all(updatePromises);
      fetchSlots();
    } catch (error) {
      throw error;
    }
  };

  const slotTypes = ['REGULAR', 'VIP', 'HANDICAPPED', 'ELECTRIC_VEHICLE'];
  
  const pricingRules = [
    'VIP slots must be priced at least 2x regular rates',
    'EV slots can have separate charging fees',
    'Handicapped slots typically follow regular pricing',
    'Peak hour surcharges can be applied during busy periods'
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading pricing data...</Typography>
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
            Pricing Management
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Set and manage hourly rates for different slot types
          </Typography>
        </Paper>
      </motion.div>

      <Grid container spacing={3}>
        {/* Pricing Forms */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            {slotTypes.map((slotType) => {
              const avgRate = getAverageRate(slotType);
              return avgRate > 0 ? (
                <Grid item xs={12} sm={6} key={slotType}>
                  <PricingForm
                    slotType={slotType}
                    currentRate={avgRate}
                    onSave={handleUpdateRate}
                  />
                </Grid>
              ) : null;
            })}
          </Grid>

          {/* Dynamic Pricing Settings */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Dynamic Pricing Settings
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={dynamicPricing}
                    onChange={(e) => setDynamicPricing(e.target.checked)}
                  />
                }
                label="Enable dynamic pricing based on demand"
              />
              
              {dynamicPricing && (
                <Box mt={2}>
                  <Alert severity="info">
                    Dynamic pricing will automatically adjust rates based on occupancy levels and peak hours.
                  </Alert>
                  <Grid container spacing={2} mt={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Peak Hour Multiplier"
                        type="number"
                        defaultValue={1.5}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">×</InputAdornment>,
                        }}
                        inputProps={{ min: 1, max: 3, step: 0.1 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="High Occupancy Multiplier"
                        type="number"
                        defaultValue={1.25}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">×</InputAdornment>,
                        }}
                        inputProps={{ min: 1, max: 2, step: 0.05 }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Pricing Rules and Info */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Info sx={{ mr: 1, verticalAlign: 'middle' }} />
                Pricing Rules
              </Typography>
              <Box>
                {pricingRules.map((rule, index) => (
                  <Box key={index} mb={1}>
                    <Typography variant="body2" color="textSecondary">
                      • {rule}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current Averages
              </Typography>
              {slotTypes.map((slotType) => {
                const avgRate = getAverageRate(slotType);
                return avgRate > 0 ? (
                  <Box key={slotType} display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">
                      {slotType.replace('_', ' ')}:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      ${avgRate.toFixed(2)}/hr
                    </Typography>
                  </Box>
                ) : null;
              })}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
export default PricingPage;