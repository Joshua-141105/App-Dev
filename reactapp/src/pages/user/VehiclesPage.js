/ pages/user/VehiclesPage.js
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Menu,
  Chip,
  Paper,
  Alert,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Add,
  MoreVert,
  Edit,
  Delete,
  DirectionsCar,
  Star,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { vehicleAPI } from '../../utils/api';
import { useAuth } from '../../App';
import { toast } from 'react-toastify';

const VehicleForm = ({ open, onClose, vehicle, onSave }) => {
  const [formData, setFormData] = useState({
    licensePlate: '',
    vehicleType: 'CAR',
    make: '',
    model: '',
    color: '',
    year: new Date().getFullYear(),
    isDefault: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vehicle) {
      setFormData({
        licensePlate: vehicle.licensePlate || '',
        vehicleType: vehicle.vehicleType || 'CAR',
        make: vehicle.make || '',
        model: vehicle.model || '',
        color: vehicle.color || '',
        year: vehicle.year || new Date().getFullYear(),
        isDefault: vehicle.isDefault || false,
      });
    } else {
      setFormData({
        licensePlate: '',
        vehicleType: 'CAR',
        make: '',
        model: '',
        color: '',
        year: new Date().getFullYear(),
        isDefault: false,
      });
    }
  }, [vehicle, open]);

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await onSave(formData);
      onClose();
      toast.success(vehicle ? 'Vehicle updated successfully' : 'Vehicle added successfully');
    } catch (error) {
      console.error('Error saving vehicle:', error);
      toast.error('Failed to save vehicle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="License Plate"
                value={formData.licensePlate}
                onChange={handleChange('licensePlate')}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Vehicle Type</InputLabel>
                <Select
                  value={formData.vehicleType}
                  onChange={handleChange('vehicleType')}
                  label="Vehicle Type"
                >
                  <MenuItem value="CAR">Car</MenuItem>
                  <MenuItem value="MOTORCYCLE">Motorcycle</MenuItem>
                  <MenuItem value="TRUCK">Truck</MenuItem>
                  <MenuItem value="VAN">Van</MenuItem>
                  <MenuItem value="ELECTRIC">Electric Vehicle</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Year"
                type="number"
                value={formData.year}
                onChange={handleChange('year')}
                inputProps={{ min: 1900, max: new Date().getFullYear() + 1 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Make"
                value={formData.make}
                onChange={handleChange('make')}
                placeholder="e.g., Toyota, Honda"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Model"
                value={formData.model}
                onChange={handleChange('model')}
                placeholder="e.g., Camry, Civic"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Color"
                value={formData.color}
                onChange={handleChange('color')}
                placeholder="e.g., White, Black, Red"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isDefault}
                    onChange={handleChange('isDefault')}
                  />
                }
                label="Set as default vehicle"
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Saving...' : (vehicle ? 'Update' : 'Add Vehicle')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const VehicleCard = ({ vehicle, onEdit, onDelete, onSetDefault }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const getVehicleIcon = () => {
    switch (vehicle.vehicleType) {
      case 'ELECTRIC':
        return '🔋';
      case 'MOTORCYCLE':
        return '🏍️';
      case 'TRUCK':
        return '🚚';
      case 'VAN':
        return '🚐';
      default:
        return '🚗';
    }
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    onEdit(vehicle);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDelete(vehicle);
    handleMenuClose();
  };

  const handleSetDefault = () => {
    onSetDefault(vehicle);
    handleMenuClose();
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        sx={{ 
          height: '100%',
          border: vehicle.isDefault ? '2px solid #1976d2' : '1px solid #e0e0e0',
        }}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Box display="flex" alignItems="center" mb={1}>
                <Typography variant="h2" component="span" sx={{ mr: 1 }}>
                  {getVehicleIcon()}
                </Typography>
                {vehicle.isDefault && (
                  <Chip
                    icon={<Star />}
                    label="Default"
                    size="small"
                    color="primary"
                  />
                )}
              </Box>
              <Typography variant="h6" gutterBottom>
                {vehicle.licensePlate}
              </Typography>
            </Box>
            <IconButton onClick={handleMenuClick} size="small">
              <MoreVert />
            </IconButton>
          </Box>

          <Typography variant="body2" color="textSecondary" gutterBottom>
            {vehicle.vehicleType?.replace('_', ' ')}
          </Typography>

          {(vehicle.make || vehicle.model) && (
            <Typography variant="body2" gutterBottom>
              {vehicle.make} {vehicle.model} {vehicle.year}
            </Typography>
          )}

          {vehicle.color && (
            <Typography variant="body2" color="textSecondary">
              Color: {vehicle.color}
            </Typography>
          )}

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            {!vehicle.isDefault && (
              <MenuItem onClick={handleSetDefault}>
                <Star sx={{ mr: 1 }} />
                Set as Default
              </MenuItem>
            )}
            <MenuItem onClick={handleEdit}>
              <Edit sx={{ mr: 1 }} />
              Edit
            </MenuItem>
            <MenuItem onClick={handleDelete}>
              <Delete sx={{ mr: 1 }} />
              Delete
            </MenuItem>
          </Menu>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const VehiclesPage = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await vehicleAPI.getAll();
      const userVehicles = response.data.filter(v => v.userId === user.id);
      setVehicles(userVehicles);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast.error('Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = () => {
    setSelectedVehicle(null);
    setDialogOpen(true);
  };

  const handleEditVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setDialogOpen(true);
  };

  const handleSaveVehicle = async (formData) => {
    const vehicleData = {
      ...formData,
      userId: user.id,
    };

    if (selectedVehicle) {
      await vehicleAPI.update(selectedVehicle.vehicleId, vehicleData);
    } else {
      await vehicleAPI.create(vehicleData);
    }

    fetchVehicles();
  };

  const handleDeleteVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await vehicleAPI.delete(selectedVehicle.vehicleId);
      toast.success('Vehicle deleted successfully');
      fetchVehicles();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast.error('Failed to delete vehicle');
    }
  };

  const handleSetDefault = async (vehicle) => {
    try {
      // First, unset all other vehicles as default
      const updates = vehicles.map(v => 
        vehicleAPI.update(v.vehicleId, { ...v, isDefault: v.vehicleId === vehicle.vehicleId })
      );
      await Promise.all(updates);
      toast.success('Default vehicle updated');
      fetchVehicles();
    } catch (error) {
      console.error('Error setting default vehicle:', error);
      toast.error('Failed to set default vehicle');
    }
  };

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" gutterBottom>
                My Vehicles
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Manage your registered vehicles for parking reservations
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddVehicle}
            >
              Add Vehicle
            </Button>
          </Box>
        </Paper>
      </motion.div>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <Typography>Loading vehicles...</Typography>
        </Box>
      ) : vehicles.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <DirectionsCar sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No vehicles registered
            </Typography>
            <Typography variant="body2" color="textSecondary" mb={2}>
              Add your first vehicle to start making bookings
            </Typography>
            <Button variant="contained" onClick={handleAddVehicle}>
              Add Your First Vehicle
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {vehicles.map((vehicle) => (
            <Grid item xs={12} sm={6} md={4} key={vehicle.vehicleId}>
              <VehicleCard
                vehicle={vehicle}
                onEdit={handleEditVehicle}
                onDelete={handleDeleteVehicle}
                onSetDefault={handleSetDefault}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Vehicle Form Dialog */}
      <VehicleForm
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        vehicle={selectedVehicle}
        onSave={handleSaveVehicle}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
      >
        <DialogTitle>Delete Vehicle</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Are you sure you want to delete this vehicle?
          </Alert>
          {selectedVehicle && (
            <Typography>
              <strong>{selectedVehicle.licensePlate}</strong> - {selectedVehicle.make} {selectedVehicle.model}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
export default VehiclesPage;