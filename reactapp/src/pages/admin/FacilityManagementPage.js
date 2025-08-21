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
  Alert,
  Grid,
  Pagination,
  InputAdornment,
  Fab,
  Tooltip,
  CircularProgress,
  Avatar
} from '@mui/material';
import {
  Add,
  MoreVert,
  Edit,
  Delete,
  Business,
  LocationOn,
  Search,
  FilterList,
  GetApp,
  Refresh,
  Phone,
  Schedule,
  LocalParking
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { facilityAPI, userAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const FacilityTable = ({ facilities, onEdit, onDelete, page, rowsPerPage }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFacility, setSelectedFacility] = useState(null);

  const handleMenuClick = (event, facility) => {
    setAnchorEl(event.currentTarget);
    setSelectedFacility(facility);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedFacility(null);
  };

  const displayedFacilities = facilities.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'grey.50' }}>
            <TableCell><strong>Facility</strong></TableCell>
            <TableCell><strong>Location</strong></TableCell>
            <TableCell><strong>Capacity</strong></TableCell>
            <TableCell><strong>Manager</strong></TableCell>
            <TableCell><strong>Operating Hours</strong></TableCell>
            <TableCell><strong>Contact</strong></TableCell>
            <TableCell align="center"><strong>Actions</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {displayedFacilities.map((facility, index) => (
            <motion.tr
              key={facility.facilityId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              component={TableRow}
              hover
            >
              <TableCell>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    <Business />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {facility.facilityName}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      ID: {facility.facilityId}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Box display="flex" alignItems="center">
                  <LocationOn sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2">
                      {facility.city}, {facility.state}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {facility.address}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Box display="flex" alignItems="center">
                  <LocalParking sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {facility.totalSlots} slots
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  Manager ID: {facility.managerId}
                </Typography>
              </TableCell>
              <TableCell>
                <Box display="flex" alignItems="center">
                  <Schedule sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {facility.operatingHours || 'Not specified'}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Box display="flex" alignItems="center">
                  <Phone sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {facility.contactInfo || 'Not provided'}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell align="center">
                <Tooltip title="More actions">
                  <IconButton
                    onClick={(e) => handleMenuClick(e, facility)}
                    size="small"
                  >
                    <MoreVert />
                  </IconButton>
                </Tooltip>
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
          onEdit(selectedFacility);
          handleMenuClose();
        }}>
          <Edit sx={{ mr: 1 }} />
          Edit Facility
        </MenuItem>
        <MenuItem 
          onClick={() => {
            onDelete(selectedFacility);
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ mr: 1 }} />
          Delete Facility
        </MenuItem>
      </Menu>
    </TableContainer>
  );
};

const FacilityForm = ({ facility, open, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    facilityName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    totalSlots: '',
    operatingHours: '',
    contactInfo: '',
    managerId: '',
    latitude: '',
    longitude: ''
  });
  const [loading, setLoading] = useState(false);
  const [managers, setManagers] = useState([]);

  useEffect(() => {
    fetchManagers();
  }, []);

  useEffect(() => {
    if (facility) {
      setFormData({
        facilityName: facility.facilityName || '',
        address: facility.address || '',
        city: facility.city || '',
        state: facility.state || '',
        zipCode: facility.zipCode || '',
        totalSlots: facility.totalSlots || '',
        operatingHours: facility.operatingHours || '',
        contactInfo: facility.contactInfo || '',
        managerId: facility.managerId || '',
        latitude: facility.latitude || '',
        longitude: facility.longitude || ''
      });
    } else {
      setFormData({
        facilityName: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        totalSlots: '',
        operatingHours: '',
        contactInfo: '',
        managerId: '',
        latitude: '',
        longitude: ''
      });
    }
  }, [facility]);

  const fetchManagers = async () => {
    try {
      const response = await userAPI.getAll();
      const managerUsers = response.data.filter(user => 
        user.role === 'FACILITY_MANAGER' || user.role === 'SYSTEM_ADMIN'
      );
      setManagers(managerUsers);
    } catch (error) {
      console.error('Error fetching managers:', error);
      toast.error('Failed to fetch managers');
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const submitData = {
        ...formData,
        totalSlots: parseInt(formData.totalSlots),
        latitude: parseFloat(formData.latitude) || 0,
        longitude: parseFloat(formData.longitude) || 0,
        managerId: parseInt(formData.managerId)
      };

      if (facility) {
        await facilityAPI.update(facility.facilityId, submitData);
        toast.success('Facility updated successfully');
      } else {
        await facilityAPI.create(submitData);
        toast.success('Facility created successfully');
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving facility:', error);
      toast.error('Failed to save facility');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {facility ? 'Edit Facility' : 'Create New Facility'}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Facility Name"
              value={formData.facilityName}
              onChange={(e) => setFormData({ ...formData, facilityName: e.target.value })}
              margin="normal"
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Total Slots"
              type="number"
              value={formData.totalSlots}
              onChange={(e) => setFormData({ ...formData, totalSlots: e.target.value })}
              margin="normal"
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              margin="normal"
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              margin="normal"
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="State"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              margin="normal"
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="ZIP Code"
              value={formData.zipCode}
              onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Operating Hours"
              value={formData.operatingHours}
              onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
              margin="normal"
              placeholder="e.g., 6:00 AM - 10:00 PM"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Contact Info"
              value={formData.contactInfo}
              onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
              margin="normal"
              placeholder="Phone or email"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Manager</InputLabel>
              <Select
                value={formData.managerId}
                onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                label="Manager"
              >
                {managers.map((manager) => (
                  <MenuItem key={manager.userId} value={manager.userId}>
                    {manager.firstName} {manager.lastName} ({manager.role})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Latitude"
              type="number"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              margin="normal"
              inputProps={{ step: "any" }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Longitude"
              type="number"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              margin="normal"
              inputProps={{ step: "any" }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={16} />}
        >
          {facility ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const FacilityManagementPage = () => {
  const { user } = useAuth();
  const [facilities, setFacilities] = useState([]);
  const [filteredFacilities, setFilteredFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);

  useEffect(() => {
    fetchFacilities();
  }, []);

  useEffect(() => {
    filterFacilities();
  }, [facilities, searchQuery, cityFilter]);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const response = await facilityAPI.getAll();
      setFacilities(response.data);
    } catch (error) {
      console.error('Error fetching facilities:', error);
      toast.error('Failed to fetch facilities');
    } finally {
      setLoading(false);
    }
  };

  const filterFacilities = () => {
    let filtered = facilities;

    if (searchQuery) {
      filtered = filtered.filter(facility =>
        facility.facilityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        facility.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        facility.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (cityFilter) {
      filtered = filtered.filter(facility => facility.city === cityFilter);
    }

    setFilteredFacilities(filtered);
    setPage(0);
  };

  const handleAddFacility = () => {
    setSelectedFacility(null);
    setDialogOpen(true);
  };

  const handleEditFacility = (facility) => {
    setSelectedFacility(facility);
    setDialogOpen(true);
  };

  const handleDeleteFacility = (facility) => {
    setSelectedFacility(facility);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await facilityAPI.delete(selectedFacility.facilityId);
      toast.success('Facility deleted successfully');
      fetchFacilities();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting facility:', error);
      toast.error('Failed to delete facility');
    }
  };

  const exportFacilities = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Facility Name,Address,City,State,ZIP,Total Slots,Manager ID,Operating Hours,Contact Info\n" +
      filteredFacilities.map(facility => 
        `"${facility.facilityName}","${facility.address}","${facility.city}","${facility.state}","${facility.zipCode}",${facility.totalSlots},${facility.managerId},"${facility.operatingHours || ''}","${facility.contactInfo || ''}"`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "facilities_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stats = {
    total: facilities.length,
    totalSlots: facilities.reduce((sum, f) => sum + (f.totalSlots || 0), 0),
    cities: [...new Set(facilities.map(f => f.city))].length,
    avgSlots: facilities.length > 0 ? Math.round(facilities.reduce((sum, f) => sum + (f.totalSlots || 0), 0) / facilities.length) : 0
  };

  const uniqueCities = [...new Set(facilities.map(f => f.city))].sort();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Facility Management
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Manage parking facilities across all locations
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <Tooltip title="Export Facilities">
              <IconButton onClick={exportFacilities} color="primary">
                <GetApp />
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchFacilities} color="primary">
                <Refresh />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<Business />}
              onClick={handleAddFacility}
            >
              Add Facility
            </Button>
          </Box>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Facilities
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {stats.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Parking Slots
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                  {stats.totalSlots}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Cities Covered
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {stats.cities}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Avg. Slots per Facility
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  {stats.avgSlots}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search facilities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>City Filter</InputLabel>
                <Select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  label="City Filter"
                >
                  <MenuItem value="">All Cities</MenuItem>
                  {uniqueCities.map((city) => (
                    <MenuItem key={city} value={city}>{city}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => {
                  setSearchQuery('');
                  setCityFilter('');
                }}
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Facility Table */}
        <FacilityTable
          facilities={filteredFacilities}
          onEdit={handleEditFacility}
          onDelete={handleDeleteFacility}
          page={page}
          rowsPerPage={rowsPerPage}
        />

        {/* Pagination */}
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={Math.ceil(filteredFacilities.length / rowsPerPage)}
            page={page + 1}
            onChange={(e, newPage) => setPage(newPage - 1)}
            color="primary"
          />
        </Box>

        {/* Facility Form Dialog */}
        <FacilityForm
          facility={selectedFacility}
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSave={fetchFacilities}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              This action cannot be undone. All facility data and associated parking slots will be permanently deleted.
            </Alert>
            <Typography>
              Are you sure you want to delete facility <strong>{selectedFacility?.facilityName}</strong>?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmDelete} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Floating Action Button for Mobile */}
        <Fab
          color="primary"
          aria-label="add facility"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            display: { xs: 'flex', md: 'none' }
          }}
          onClick={handleAddFacility}
        >
          <Add />
        </Fab>
      </motion.div>
    </Box>
  );
};

export default FacilityManagementPage;