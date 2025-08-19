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
  Switch,
  FormControlLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  MoreVert,
  LocalParking,
  Build,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { parkingSlotAPI, facilityAPI } from '../../utils/api';
import { toast } from 'react-toastify';

const SlotForm = ({ open, onClose, slot, facilities, onSave }) => {
  const [formData, setFormData] = useState({
    slotNumber: '',
    slotType: 'REGULAR',
    facilityId: '',
    hourlyRate: 10,
    isAvailable: true,
    floor: 1,
    section: '',
    coordinates: '',
    features: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (slot) {
      setFormData({
        slotNumber: slot.slotNumber || '',
        slotType: slot.slotType || 'REGULAR',
        facilityId: slot.facilityId || '',
        hourlyRate: slot.hourlyRate || 10,
        isAvailable: slot.isAvailable !== undefined ? slot.isAvailable : true,
        floor: slot.floor || 1,
        section: slot.section || '',
        coordinates: slot.coordinates || '',
        features: slot.features || '',
      });
    } else {
      setFormData({
        slotNumber: '',
        slotType: 'REGULAR',
        facilityId: facilities.length > 0 ? facilities[0].facilityId : '',
        hourlyRate: 10,
        isAvailable: true,
        floor: 1,
        section: '',
        coordinates: '',
        features: '',
      });
    }
  }, [slot, facilities, open]);

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
      toast.success(slot ? 'Slot updated successfully' : 'Slot created successfully');
    } catch (error) {
      console.error('Error saving slot:', error);
      toast.error('Failed to save slot');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {slot ? 'Edit Parking Slot' : 'Create New Parking Slot'}
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Slot Number"
                value={formData.slotNumber}
                onChange={handleChange('slotNumber')}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Slot Type</InputLabel>
                <Select
                  value={formData.slotType}
                  onChange={handleChange('slotType')}
                  label="Slot Type"
                >
                  <MenuItem value="REGULAR">Regular</MenuItem>
                  <MenuItem value="VIP">VIP</MenuItem>
                  <MenuItem value="HANDICAPPED">Handicapped</MenuItem>
                  <MenuItem value="ELECTRIC_VEHICLE">Electric Vehicle</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Facility</InputLabel>
                <Select
                  value={formData.facilityId}
                  onChange={handleChange('facilityId')}
                  label="Facility"
                >
                  {facilities.map((facility) => (
                    <MenuItem key={facility.facilityId} value={facility.facilityId}>
                      {facility.facilityName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                type="number"
                label="Hourly Rate ($)"
                value={formData.hourlyRate}
                onChange={handleChange('hourlyRate')}
                inputProps={{ min: 0, step: 0.5 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Floor"
                value={formData.floor}
                onChange={handleChange('floor')}
                inputProps={{ min: 1 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Section"
                value={formData.section}
                onChange={handleChange('section')}
                placeholder="e.g., A, B, North, South"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Coordinates"
                value={formData.coordinates}
                onChange={handleChange('coordinates')}
                placeholder="e.g., 40.7128,-74.0060"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Features"
                value={formData.features}
                onChange={handleChange('features')}
                placeholder="e.g., Covered, Security Camera, EV Charging"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isAvailable}
                    onChange={handleChange('isAvailable')}
                  />
                }
                label="Available for booking"
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
          {loading ? 'Saving...' : (slot ? 'Update' : 'Create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const SlotTable = ({ slots, onEdit, onDelete, onToggleAvailability }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const handleMenuClick = (event, slot) => {
    setAnchorEl(event.currentTarget);
    setSelectedSlot(slot);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSlot(null);
  };

  const getSlotTypeColor = (type) => {
    switch (type) {
      case 'VIP': return 'warning';
      case 'HANDICAPPED': return 'info';
      case 'ELECTRIC_VEHICLE': return 'success';
      default: return 'primary';
    }
  };

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Slot Number</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Floor</TableCell>
              <TableCell>Section</TableCell>
              <TableCell>Rate/Hour</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {slots.map((slot) => (
              <motion.tr
                key={slot.slotId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                component={TableRow}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {slot.slotNumber}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={slot.slotType.replace('_', ' ')}
                    color={getSlotTypeColor(slot.slotType)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{slot.floor}</TableCell>
                <TableCell>{slot.section || 'N/A'}</TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    ${slot.hourlyRate}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={slot.isAvailable ? 'Available' : 'Unavailable'}
                    color={slot.isAvailable ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    onClick={(e) => handleMenuClick(e, slot)}
                    size="small"
                  >
                    <MoreVert />
                  </IconButton>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          onEdit(selectedSlot);
          handleMenuClose();
        }}>
          <Edit sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => {
          onToggleAvailability(selectedSlot);
          handleMenuClose();
        }}>
          {selectedSlot?.isAvailable ? <VisibilityOff sx={{ mr: 1 }} /> : <Visibility sx={{ mr: 1 }} />}
          {selectedSlot?.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
        </MenuItem>
        <MenuItem onClick={() => {
          onDelete(selectedSlot);
          handleMenuClose();
        }}>
          <Delete sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

const SlotManagementPage = () => {
  const [slots, setSlots] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchSlots();
    fetchFacilities();
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

  const fetchFacilities = async () => {
    try {
      const response = await facilityAPI.getAll();
      setFacilities(response.data);
    } catch (error) {
      console.error('Error fetching facilities:', error);
    }
  };

  const handleAddSlot = () => {
    setSelectedSlot(null);
    setDialogOpen(true);
  };

  const handleEditSlot = (slot) => {
    setSelectedSlot(slot);
    setDialogOpen(true);
  };

  const handleSaveSlot = async (formData) => {
    if (selectedSlot) {
      await parkingSlotAPI.update(selectedSlot.slotId, formData);
    } else {
      await parkingSlotAPI.create(formData);
    }
    fetchSlots();
  };

  const handleDeleteSlot = (slot) => {
    setSelectedSlot(slot);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await parkingSlotAPI.delete(selectedSlot.slotId);
      toast.success('Slot deleted successfully');
      fetchSlots();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting slot:', error);
      toast.error('Failed to delete slot');
    }
  };

  const handleToggleAvailability = async (slot) => {
    try {
      await parkingSlotAPI.update(slot.slotId, {
        ...slot,
        isAvailable: !slot.isAvailable
      });
      toast.success(`Slot ${slot.isAvailable ? 'marked unavailable' : 'marked available'}`);
      fetchSlots();
    } catch (error) {
      console.error('Error updating slot availability:', error);
      toast.error('Failed to update slot availability');
    }
  };

  const stats = {
    total: slots.length,
    available: slots.filter(s => s.isAvailable).length,
    occupied: slots.filter(s => !s.isAvailable).length,
    vip: slots.filter(s => s.slotType === 'VIP').length,
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
                Slot Management
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Create, update, and manage parking slots across all facilities
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddSlot}
            >
              Add Slot
            </Button>
          </Box>
        </Paper>
      </motion.div>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Slots
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {stats.total}
                  </Typography>
                </Box>
                <LocalParking sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    VIP Slots
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {stats.vip}
                  </Typography>
                </Box>
                <Build sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Slots Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography>Loading slots...</Typography>
        </Box>
      ) : (
        <SlotTable
          slots={slots}
          onEdit={handleEditSlot}
          onDelete={handleDeleteSlot}
          onToggleAvailability={handleToggleAvailability}
        />
      )}

      {/* Slot Form Dialog */}
      <SlotForm
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        slot={selectedSlot}
        facilities={facilities}
        onSave={handleSaveSlot}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
      >
        <DialogTitle>Delete Parking Slot</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Are you sure you want to delete this parking slot?
          </Alert>
          {selectedSlot && (
            <Typography>
              <strong>Slot {selectedSlot.slotNumber}</strong> - {selectedSlot.slotType}
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
export default SlotManagementPage;