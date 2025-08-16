// pages/admin/AccessControlPage.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert,
  Tooltip
} from '@mui/material';
import {
  Security,
  Add,
  Edit,
  Delete,
  Key,
  Badge,
  CameraAlt,
  Sensors,
  Lock,
  LockOpen,
  Settings,
  History,
  Warning
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { facilityAPI, userAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

const AccessControlPage = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [accessRoles, setAccessRoles] = useState([]);
  const [accessDevices, setAccessDevices] = useState([]);
  const [accessLogs, setAccessLogs] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [users, setUsers] = useState([]);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [deviceDialogOpen, setDeviceDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [facilitiesRes, usersRes] = await Promise.all([
        facilityAPI.getAll(),
        userAPI.getAll()
      ]);
      
      setFacilities(facilitiesRes.data);
      setUsers(usersRes.data);
      
      // Mock data for access control
      setAccessRoles([
        {
          id: 1,
          name: 'Admin Access',
          description: 'Full system access',
          permissions: ['all_facilities', 'user_management', 'system_config'],
          userCount: 3,
          isActive: true,
          createdDate: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Manager Access',
          description: 'Facility management access',
          permissions: ['assigned_facilities', 'booking_management', 'reports'],
          userCount: 5,
          isActive: true,
          createdDate: new Date().toISOString()
        },
        {
          id: 3,
          name: 'Security Access',
          description: 'Security and monitoring access',
          permissions: ['facility_monitoring', 'access_control', 'emergency_override'],
          userCount: 8,
          isActive: true,
          createdDate: new Date().toISOString()
        }
      ]);

      setAccessDevices([
        {
          id: 1,
          name: 'Main Gate Barrier',
          type: 'Barrier Gate',
          facilityId: 1,
          status: 'online',
          lastActivity: new Date().toISOString(),
          ipAddress: '192.168.1.100',
          location: 'Main Entrance'
        },
        {
          id: 2,
          name: 'RFID Reader 1',
          type: 'RFID Reader',
          facilityId: 1,
          status: 'online',
          lastActivity: new Date().toISOString(),
          ipAddress: '192.168.1.101',
          location: 'Employee Entrance'
        },
        {
          id: 3,
          name: 'License Plate Camera',
          type: 'LPR Camera',
          facilityId: 1,
          status: 'offline',
          lastActivity: dayjs().subtract(2, 'hour').toISOString(),
          ipAddress: '192.168.1.102',
          location: 'Exit Gate'
        }
      ]);

      setAccessLogs([
        {
          id: 1,
          timestamp: new Date().toISOString(),
          userId: 1,
          userName: 'John Doe',
          action: 'Entry',
          device: 'Main Gate Barrier',
          result: 'Success',
          vehiclePlate: 'ABC123'
        },
        {
          id: 2,
          timestamp: dayjs().subtract(15, 'minute').toISOString(),
          userId: 2,
          userName: 'Jane Smith',
          action: 'Exit',
          device: 'Main Gate Barrier',
          result: 'Success',
          vehiclePlate: 'XYZ789'
        },
        {
          id: 3,
          timestamp: dayjs().subtract(30, 'minute').toISOString(),
          userId: null,
          userName: 'Unknown',
          action: 'Entry Attempt',
          device: 'RFID Reader 1',
          result: 'Failed',
          vehiclePlate: 'UNKNOWN'
        }
      ]);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load access control data');
    } finally {
      setLoading(false);
    }
  };

  const AccessRolesTab = () => {
    const RoleForm = ({ role, open, onClose, onSave }) => {
      const [formData, setFormData] = useState({
        name: '',
        description: '',
        permissions: [],
        isActive: true
      });

      useEffect(() => {
        if (role) {
          setFormData({
            name: role.name || '',
            description: role.description || '',
            permissions: role.permissions || [],
            isActive: role.isActive !== undefined ? role.isActive : true
          });
        } else {
          setFormData({
            name: '',
            description: '',
            permissions: [],
            isActive: true
          });
        }
      }, [role]);

      const availablePermissions = [
        'all_facilities',
        'user_management',
        'system_config',
        'assigned_facilities',
        'booking_management',
        'reports',
        'facility_monitoring',
        'access_control',
        'emergency_override'
      ];

      const handlePermissionToggle = (permission) => {
        setFormData(prev => ({
          ...prev,
          permissions: prev.permissions.includes(permission)
            ? prev.permissions.filter(p => p !== permission)
            : [...prev.permissions, permission]
        }));
      };

      const handleSave = () => {
        if (role) {
          setAccessRoles(prev => prev.map(r => 
            r.id === role.id ? { ...role, ...formData } : r
          ));
          toast.success('Role updated successfully');
        } else {
          const newRole = {
            id: Date.now(),
            ...formData,
            userCount: 0,
            createdDate: new Date().toISOString()
          };
          setAccessRoles(prev => [...prev, newRole]);
          toast.success('Role created successfully');
        }
        onClose();
      };

      return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
          <DialogTitle>
            {role ? 'Edit Access Role' : 'Create Access Role'}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Role Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  margin="normal"
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Permissions
                </Typography>
                <Paper sx={{ p: 2, maxHeight: 300, overflow: 'auto' }}>
                  {availablePermissions.map((permission) => (
                    <FormControlLabel
                      key={permission}
                      control={
                        <Switch
                          checked={formData.permissions.includes(permission)}
                          onChange={() => handlePermissionToggle(permission)}
                        />
                      }
                      label={permission.replace(/_/g, ' ').toUpperCase()}
                      sx={{ display: 'block', mb: 1 }}
                    />
                  ))}
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                  }
                  label="Active Role"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} variant="contained">
              {role ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      );
    };

    return (
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">Access Roles</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setSelectedRole(null);
              setRoleDialogOpen(true);
            }}
          >
            Create Role
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell><strong>Role Name</strong></TableCell>
                <TableCell><strong>Description</strong></TableCell>
                <TableCell><strong>Permissions</strong></TableCell>
                <TableCell><strong>Users</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accessRoles.map((role) => (
                <TableRow key={role.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Key sx={{ mr: 1, color: 'primary.main' }} />
                      {role.name}
                    </Box>
                  </TableCell>
                  <TableCell>{role.description}</TableCell>
                  <TableCell>
                    <Box display="flex" gap={0.5} flexWrap="wrap">
                      {role.permissions.slice(0, 3).map((permission) => (
                        <Chip
                          key={permission}
                          label={permission.replace(/_/g, ' ')}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                      {role.permissions.length > 3 && (
                        <Chip
                          label={`+${role.permissions.length - 3} more`}
                          size="small"
                          color="primary"
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={role.userCount} color="info" size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={role.isActive ? 'Active' : 'Inactive'}
                      color={role.isActive ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => {
                        setSelectedRole(role);
                        setRoleDialogOpen(true);
                      }}
                      size="small"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={() => {
                        setAccessRoles(prev => prev.filter(r => r.id !== role.id));
                        toast.success('Role deleted successfully');
                      }}
                      size="small"
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <RoleForm
          role={selectedRole}
          open={roleDialogOpen}
          onClose={() => setRoleDialogOpen(false)}
          onSave={() => setRoleDialogOpen(false)}
        />
      </Box>
    );
  };

  const AccessDevicesTab = () => {
    const DeviceForm = ({ device, open, onClose, onSave }) => {
      const [formData, setFormData] = useState({
        name: '',
        type: 'Barrier Gate',
        facilityId: '',
        ipAddress: '',
        location: '',
        status: 'online'
      });

      useEffect(() => {
        if (device) {
          setFormData({
            name: device.name || '',
            type: device.type || 'Barrier Gate',
            facilityId: device.facilityId || '',
            ipAddress: device.ipAddress || '',
            location: device.location || '',
            status: device.status || 'online'
          });
        } else {
          setFormData({
            name: '',
            type: 'Barrier Gate',
            facilityId: '',
            ipAddress: '',
            location: '',
            status: 'online'
          });
        }
      }, [device]);

      const deviceTypes = ['Barrier Gate', 'RFID Reader', 'LPR Camera', 'Access Panel'];

      const handleSave = () => {
        if (device) {
          setAccessDevices(prev => prev.map(d => 
            d.id === device.id ? { ...device, ...formData, lastActivity: new Date().toISOString() } : d
          ));
          toast.success('Device updated successfully');
        } else {
          const newDevice = {
            id: Date.now(),
            ...formData,
            lastActivity: new Date().toISOString()
          };
          setAccessDevices(prev => [...prev, newDevice]);
          toast.success('Device added successfully');
        }
        onClose();
      };

      return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
          <DialogTitle>
            {device ? 'Edit Access Device' : 'Add Access Device'}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Device Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Device Type</InputLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    label="Device Type"
                  >
                    {deviceTypes.map((type) => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Facility</InputLabel>
                  <Select
                    value={formData.facilityId}
                    onChange={(e) => setFormData({ ...formData, facilityId: e.target.value })}
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
                  label="IP Address"
                  value={formData.ipAddress}
                  onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    label="Status"
                  >
                    <MenuItem value="online">Online</MenuItem>
                    <MenuItem value="offline">Offline</MenuItem>
                    <MenuItem value="maintenance">Maintenance</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} variant="contained">
              {device ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>
      );
    };

    const getDeviceIcon = (type) => {
      switch (type) {
        case 'Barrier Gate': return <Security />;
        case 'RFID Reader': return <Badge />;
        case 'LPR Camera': return <CameraAlt />;
        case 'Access Panel': return <Sensors />;
        default: return <Settings />;
      }
    };

    const getStatusColor = (status) => {
      switch (status) {
        case 'online': return 'success';
        case 'offline': return 'error';
        case 'maintenance': return 'warning';
        default: return 'default';
      }
    };

    return (
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">Access Control Devices</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setSelectedDevice(null);
              setDeviceDialogOpen(true);
            }}
          >
            Add Device
          </Button>
        </Box>

        <Grid container spacing={3}>
          {accessDevices.map((device) => (
            <Grid item xs={12} md={6} lg={4} key={device.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                      <Box display="flex" alignItems="center">
                        {getDeviceIcon(device.type)}
                        <Typography variant="h6" sx={{ ml: 1 }}>
                          {device.name}
                        </Typography>
                      </Box>
                      <Chip
                        label={device.status}
                        color={getStatusColor(device.status)}
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {device.type} • {device.location}
                    </Typography>
                    
                    <Typography variant="body2" gutterBottom>
                      IP: {device.ipAddress}
                    </Typography>
                    
                    <Typography variant="caption" color="textSecondary">
                      Last Activity: {dayjs(device.lastActivity).format('MMM DD, HH:mm')}
                    </Typography>

                    <Box display="flex" justifyContent="space-between" mt={2}>
                      <Button
                        size="small"
                        startIcon={<Edit />}
                        onClick={() => {
                          setSelectedDevice(device);
                          setDeviceDialogOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => {
                          setAccessDevices(prev => prev.filter(d => d.id !== device.id));
                          toast.success('Device removed successfully');
                        }}
                      >
                        Remove
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <DeviceForm
          device={selectedDevice}
          open={deviceDialogOpen}
          onClose={() => setDeviceDialogOpen(false)}
          onSave={() => setDeviceDialogOpen(false)}
        />
      </Box>
    );
  };

  const AccessLogsTab = () => {
    const getActionIcon = (action) => {
      switch (action) {
        case 'Entry': return <LockOpen color="success" />;
        case 'Exit': return <Lock color="info" />;
        case 'Entry Attempt': return <Warning color="error" />;
        default: return <History />;
      }
    };

    const getResultColor = (result) => {
      switch (result) {
        case 'Success': return 'success';
        case 'Failed': return 'error';
        default: return 'default';
      }
    };

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Access Logs
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          Real-time access control logs from all connected devices
        </Alert>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell><strong>Timestamp</strong></TableCell>
                <TableCell><strong>User</strong></TableCell>
                <TableCell><strong>Action</strong></TableCell>
                <TableCell><strong>Device</strong></TableCell>
                <TableCell><strong>Vehicle</strong></TableCell>
                <TableCell><strong>Result</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accessLogs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell>
                    {dayjs(log.timestamp).format('MMM DD, YYYY HH:mm:ss')}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      {log.userId ? (
                        <>
                          <Badge sx={{ mr: 1, color: 'primary.main' }} />
                          {log.userName}
                        </>
                      ) : (
                        <>
                          <Warning sx={{ mr: 1, color: 'warning.main' }} />
                          Unknown User
                        </>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      {getActionIcon(log.action)}
                      <Typography sx={{ ml: 1 }}>
                        {log.action}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{log.device}</TableCell>
                  <TableCell>
                    <Chip
                      label={log.vehiclePlate}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={log.result}
                      color={getResultColor(log.result)}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const EmergencyControlsTab = () => {
    const [emergencyMode, setEmergencyMode] = useState(false);
    const [lockdownActive, setLockdownActive] = useState(false);

    const handleEmergencyToggle = () => {
      setEmergencyMode(!emergencyMode);
      if (!emergencyMode) {
        toast.warning('Emergency mode activated - All gates opened');
      } else {
        toast.info('Emergency mode deactivated - Normal operations resumed');
      }
    };

    const handleLockdownToggle = () => {
      setLockdownActive(!lockdownActive);
      if (!lockdownActive) {
        toast.error('Facility lockdown activated - All access restricted');
      } else {
        toast.info('Facility lockdown deactivated - Normal access restored');
      }
    };

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Emergency Controls
        </Typography>
        
        <Alert severity="warning" sx={{ mb: 3 }}>
          These controls should only be used in emergency situations. All actions are logged and monitored.
        </Alert>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: emergencyMode ? 'warning.light' : 'background.paper' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Emergency Mode
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Opens all barriers and gates for emergency evacuation
                    </Typography>
                  </Box>
                  <Switch
                    checked={emergencyMode}
                    onChange={handleEmergencyToggle}
                    color="warning"
                    size="large"
                  />
                </Box>
                {emergencyMode && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Emergency mode is ACTIVE - All gates are open
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: lockdownActive ? 'error.light' : 'background.paper' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Facility Lockdown
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Restricts all access and locks down the facility
                    </Typography>
                  </Box>
                  <Switch
                    checked={lockdownActive}
                    onChange={handleLockdownToggle}
                    color="error"
                    size="large"
                  />
                </Box>
                {lockdownActive && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    Facility lockdown is ACTIVE - All access restricted
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Manual Device Controls
                </Typography>
                <List>
                  {accessDevices.map((device) => (
                    <React.Fragment key={device.id}>
                      <ListItem>
                        <ListItemText
                          primary={device.name}
                          secondary={`${device.type} - ${device.location}`}
                        />
                        <ListItemSecondaryAction>
                          <Tooltip title="Override Open">
                            <IconButton
                              color="success"
                              onClick={() => toast.info(`${device.name} opened manually`)}
                            >
                              <LockOpen />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Override Close">
                            <IconButton
                              color="error"
                              onClick={() => toast.info(`${device.name} closed manually`)}
                            >
                              <Lock />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reset Device">
                            <IconButton
                              color="primary"
                              onClick={() => toast.info(`${device.name} reset successfully`)}
                            >
                              <Settings />
                            </IconButton>
                          </Tooltip>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const tabComponents = [
    <AccessRolesTab />,
    <AccessDevicesTab />,
    <AccessLogsTab />,
    <EmergencyControlsTab />
  ];

  return (
    <Box sx={{ p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Box display="flex" alignItems="center" mb={3}>
          <Security sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Access Control Management
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Manage access roles, devices, and security controls
            </Typography>
          </Box>
        </Box>

        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={currentTab}
            onChange={(e, newValue) => setCurrentTab(newValue)}
            variant="fullWidth"
          >
            <Tab label="Access Roles" icon={<Key />} />
            <Tab label="Devices" icon={<Settings />} />
            <Tab label="Access Logs" icon={<History />} />
            <Tab label="Emergency" icon={<Warning />} />
          </Tabs>
        </Paper>

        <Box sx={{ mt: 3 }}>
          {tabComponents[currentTab]}
        </Box>
      </motion.div>
    </Box>
  );
};

export default AccessControlPage;