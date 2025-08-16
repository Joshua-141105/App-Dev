import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Switch,
  FormControlLabel,
  Alert,
  Grid,
} from '@mui/material';
import {
  Add,
  MoreVert,
  Edit,
  Delete,
  Security,
  Rfid,
  CameraAlt,
  VpnKey,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const AccessControlTable = ({ accessControls, onEdit, onDelete, onToggleStatus }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedControl, setSelectedControl] = useState(null);

  const handleMenuClick = (event, control) => {
    setAnchorEl(event.currentTarget);
    setSelectedControl(control);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedControl(null);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'RFID': return <Rfid />;
      case 'CAMERA': return <CameraAlt />;
      case 'BARRIER': return <Security />;
      default: return <VpnKey />;
    }
  };

  const getStatusColor = (status) => {
    return status === 'ACTIVE' ? 'success' : 'error';
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Device ID</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Location</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Last Updated</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {accessControls.map((control) => (
            <motion.tr
              key={control.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              component={TableRow}
            >
              <TableCell>
                <Box display="flex" alignItems="center">
                  {getTypeIcon(control.type)}
                  <Typography variant="body2" fontWeight="bold" sx={{ ml: 1 }}>
                    {control.deviceId}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Chip label={control.type} color="primary" size="small" />
              </TableCell>
              <TableCell>{control.location}</TableCell>
              <TableCell>
                <Chip
                  label={control.status}
                  color={getStatusColor(control.status)}
                  size="small"
                />
              </TableCell>
              <TableCell>{control.lastUpdated}</TableCell>
              <TableCell align="center">
                <IconButton
                  onClick={(e) => handleMenuClick(e, control)}
                  size="small"
                >
                  <MoreVert />
                </IconButton>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          onEdit(selectedControl);
          handleMenuClose();
        }}>
          <Edit sx={{ mr: 1 }} />
          Edit Device
        </MenuItem>
        <MenuItem onClick={() => {
          onToggleStatus(selectedControl);
          handleMenuClose();
        }}>
          <Security sx={{ mr: 1 }} />
          {selectedControl?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
        </MenuItem>
        <MenuItem onClick={() => {
          onDelete(selectedControl);
          handleMenuClose();
        }}>
          <Delete sx={{ mr: 1 }} />
          Delete Device
        </MenuItem>
      </Menu>
    </TableContainer>
  );
};

const AccessControlPage = () => {
  const [accessControls, setAccessControls] = useState([
    {
      id: 1,
      deviceId: 'GATE-001',
      type: 'BARRIER',
      location: 'Main Entrance',
      status: 'ACTIVE',
      lastUpdated: '2024-01-15 10:30',
    },
    {
      id: 2,
      deviceId: 'RFID-002',
      type: 'RFID',
      location: 'Entry Gate A',
      status: 'ACTIVE',
      lastUpdated: '2024-01-15 09:15',
    },
    {
      id: 3,
      deviceId: 'CAM-003',
      type: 'CAMERA',
      location: 'Parking Area B',
      status: 'INACTIVE',
      lastUpdated: '2024-01-14 16:45',
    },
  ]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedControl, setSelectedControl] = useState(null);
  const [formData, setFormData] = useState({
    deviceId: '',
    type: 'BARRIER',
    location: '',
    status: 'ACTIVE',
  });

  const handleAddDevice = () => {
    setSelectedControl(null);
    setFormData({
      deviceId: '',
      type: 'BARRIER',
      location: '',
      status: 'ACTIVE',
    });
    setDialogOpen(true);
  };

  const handleEditDevice = (control) => {
    setSelectedControl(control);
    setFormData({
      deviceId: control.deviceId,
      type: control.type,
      location: control.location,
      status: control.status,
    });
    setDialogOpen(true);
  };

  const handleSaveDevice = () => {
    if (selectedControl) {
      setAccessControls(prev => prev.map(control => 
        control.id === selectedControl.id 
          ? { ...control, ...formData, lastUpdated: new Date().toLocaleString() }
          : control
      ));
      toast.success('Device updated successfully');
    } else {
      const newDevice = {
        id: Date.now(),
        ...formData,
        lastUpdated: new Date().toLocaleString(),
      };
      setAccessControls(prev => [...prev, newDevice]);
      toast.success('Device added successfully');
    }
    setDialogOpen(false);
  };

  const handleDeleteDevice = (control) => {
    setAccessControls(prev => prev.filter(c => c.id !== control.id));
    toast.success('Device deleted successfully');
  };

  const handleToggleStatus = (control) => {
    const newStatus = control.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setAccessControls(prev => prev.map(c => 
      c.id === control.id 
        ? { ...c, status: newStatus, lastUpdated: new Date().toLocaleString() }
        : c
    ));
    toast.success(`Device ${newStatus.toLowerCase()} successfully`);
  };

  const stats = {
    total: accessControls.length,
    active: accessControls.filter(c => c.status === 'ACTIVE').length,
    barriers: accessControls.filter(c => c.type === 'BARRIER').length,
    cameras: accessControls.filter(c => c.type === 'CAMERA').length,
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
                Access Control Management
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Manage barrier gates, RFID readers, and security cameras
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddDevice}
            >
              Add Device
            </Button>
          </Box>
        </Paper>
      </motion.div>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Devices
              </Typography>
              <Typography variant="h4" color="primary">
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Devices
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.active}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Barrier Gates
              </Typography>
              <Typography variant="h4" color="warning.main">
                {stats.barriers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Security Cameras
              </Typography>
              <Typography variant="h4" color="info.main">
                {stats.cameras}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Access Control Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Access Control Devices
          </Typography>
          <AccessControlTable
            accessControls={accessControls}
            onEdit={handleEditDevice}
            onDelete={handleDeleteDevice}
            onToggleStatus={handleToggleStatus}
          />
        </CardContent>
      </Card>

      {/* Device Form Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedControl ? 'Edit Device' : 'Add New Device'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Device ID"
                  value={formData.deviceId}
                  onChange={(e) => setFormData(prev => ({ ...prev, deviceId: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Device Type</InputLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    label="Device Type"
                  >
                    <MenuItem value="BARRIER">Barrier Gate</MenuItem>
                    <MenuItem value="RFID">RFID Reader</MenuItem>
                    <MenuItem value="CAMERA">Security Camera</MenuItem>
                    <MenuItem value="LICENSE_PLATE">License Plate Reader</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    label="Status"
                  >
                    <MenuItem value="ACTIVE">Active</MenuItem>
                    <MenuItem value="INACTIVE">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  required
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveDevice} variant="contained">
            {selectedControl ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
export default AccessControlPage;