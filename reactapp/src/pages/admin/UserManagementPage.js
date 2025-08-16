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
  Avatar,
  Switch,
  FormControlLabel,
  Alert,
  Grid,
  Pagination,
  InputAdornment,
  Fab,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Add,
  MoreVert,
  Edit,
  Delete,
  PersonAdd,
  Block,
  CheckCircle,
  Search,
  FilterList,
  GetApp,
  Refresh
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { userAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

const UserTable = ({ users, onEdit, onDelete, onToggleStatus, page, rowsPerPage }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleMenuClick = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'SYSTEM_ADMIN': return 'error';
      case 'FACILITY_MANAGER': return 'warning';
      case 'SECURITY': return 'info';
      default: return 'primary';
    }
  };

  const displayedUsers = users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'grey.50' }}>
            <TableCell><strong>User</strong></TableCell>
            <TableCell><strong>Email</strong></TableCell>
            <TableCell><strong>Role</strong></TableCell>
            <TableCell><strong>Status</strong></TableCell>
            <TableCell><strong>Last Login</strong></TableCell>
            <TableCell><strong>Registered</strong></TableCell>
            <TableCell align="center"><strong>Actions</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {displayedUsers.map((user, index) => (
            <motion.tr
              key={user.userId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              component={TableRow}
              hover
            >
              <TableCell>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {user.firstName} {user.lastName}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      @{user.username}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{user.email}</Typography>
                {user.emailVerified ? (
                  <Chip label="Verified" color="success" size="small" sx={{ mt: 0.5 }} />
                ) : (
                  <Chip label="Unverified" color="error" size="small" sx={{ mt: 0.5 }} />
                )}
              </TableCell>
              <TableCell>
                <Chip
                  label={user.role.replace('_', ' ')}
                  color={getRoleColor(user.role)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={user.isActive ? 'Active' : 'Inactive'}
                  color={user.isActive ? 'success' : 'error'}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {user.lastLogin ? dayjs(user.lastLogin).format('MMM DD, YYYY HH:mm') : 'Never'}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {dayjs(user.registrationDate).format('MMM DD, YYYY')}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Tooltip title="More actions">
                  <IconButton
                    onClick={(e) => handleMenuClick(e, user)}
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
          onEdit(selectedUser);
          handleMenuClose();
        }}>
          <Edit sx={{ mr: 1 }} />
          Edit User
        </MenuItem>
        <MenuItem onClick={() => {
          onToggleStatus(selectedUser);
          handleMenuClose();
        }}>
          {selectedUser?.isActive ? <Block sx={{ mr: 1 }} /> : <CheckCircle sx={{ mr: 1 }} />}
          {selectedUser?.isActive ? 'Deactivate' : 'Activate'}
        </MenuItem>
        <MenuItem 
          onClick={() => {
            onDelete(selectedUser);
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ mr: 1 }} />
          Delete User
        </MenuItem>
      </Menu>
    </TableContainer>
  );
};

const UserForm = ({ user, open, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    role: 'USER',
    isActive: true,
    emailVerified: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'USER',
        isActive: user.isActive !== undefined ? user.isActive : true,
        emailVerified: user.emailVerified || false
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        phone: '',
        role: 'USER',
        isActive: true,
        emailVerified: false
      });
    }
  }, [user]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (user) {
        await userAPI.update(user.userId, formData);
        toast.success('User updated successfully');
      } else {
        await userAPI.create(formData);
        toast.success('User created successfully');
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {user ? 'Edit User' : 'Create New User'}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              margin="normal"
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              margin="normal"
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              margin="normal"
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              margin="normal"
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                label="Role"
              >
                <MenuItem value="USER">User</MenuItem>
                <MenuItem value="SECURITY">Security</MenuItem>
                <MenuItem value="FACILITY_MANAGER">Facility Manager</MenuItem>
                <MenuItem value="SYSTEM_ADMIN">System Admin</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              }
              label="Active User"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.emailVerified}
                  onChange={(e) => setFormData({ ...formData, emailVerified: e.target.checked })}
                />
              }
              label="Email Verified"
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
          {user ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAll();
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (roleFilter) {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter(user => 
        statusFilter === 'active' ? user.isActive : !user.isActive
      );
    }

    setFilteredUsers(filtered);
    setPage(0);
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setDialogOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleToggleStatus = async (user) => {
    try {
      await userAPI.update(user.userId, {
        ...user,
        isActive: !user.isActive
      });
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const confirmDelete = async () => {
    try {
      await userAPI.delete(selectedUser.userId);
      toast.success('User deleted successfully');
      fetchUsers();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const exportUsers = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "First Name,Last Name,Username,Email,Role,Status,Registered\n" +
      filteredUsers.map(user => 
        `${user.firstName},${user.lastName},${user.username},${user.email},${user.role},${user.isActive ? 'Active' : 'Inactive'},${dayjs(user.registrationDate).format('YYYY-MM-DD')}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "users_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    admins: users.filter(u => u.role === 'SYSTEM_ADMIN').length,
    managers: users.filter(u => u.role === 'FACILITY_MANAGER').length,
  };

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
              User Management
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Manage system users and their permissions
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <Tooltip title="Export Users">
              <IconButton onClick={exportUsers} color="primary">
                <GetApp />
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchUsers} color="primary">
                <Refresh />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={handleAddUser}
            >
              Add User
            </Button>
          </Box>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Users
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
                  Active Users
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {stats.active}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Administrators
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="error.main">
                  {stats.admins}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Managers
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  {stats.managers}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search users..."
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
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Role Filter</InputLabel>
                <Select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  label="Role Filter"
                >
                  <MenuItem value="">All Roles</MenuItem>
                  <MenuItem value="USER">User</MenuItem>
                  <MenuItem value="SECURITY">Security</MenuItem>
                  <MenuItem value="FACILITY_MANAGER">Facility Manager</MenuItem>
                  <MenuItem value="SYSTEM_ADMIN">System Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status Filter</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status Filter"
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
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
                  setRoleFilter('');
                  setStatusFilter('');
                }}
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* User Table */}
        <UserTable
          users={filteredUsers}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
          onToggleStatus={handleToggleStatus}
          page={page}
          rowsPerPage={rowsPerPage}
        />

        {/* Pagination */}
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={Math.ceil(filteredUsers.length / rowsPerPage)}
            page={page + 1}
            onChange={(e, newPage) => setPage(newPage - 1)}
            color="primary"
          />
        </Box>

        {/* User Form Dialog */}
        <UserForm
          user={selectedUser}
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSave={fetchUsers}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              This action cannot be undone. All user data will be permanently deleted.
            </Alert>
            <Typography>
              Are you sure you want to delete user <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong>?
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
          aria-label="add user"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            display: { xs: 'flex', md: 'none' }
          }}
          onClick={handleAddUser}
        >
          <Add />
        </Fab>
      </motion.div>
    </Box>
  );
};

export default UserManagementPage;