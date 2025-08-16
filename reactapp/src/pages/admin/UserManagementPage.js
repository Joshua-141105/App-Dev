// // pages/admin/UserManagementPage.js
// import React, { useState, useEffect } from 'react';
// import {
//   Card,
//   CardContent,
//   Typography,
//   Box,
//   Button,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   IconButton,
//   Menu,
//   MenuItem,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   FormControl,
//   InputLabel,
//   Select,
//   Chip,
//   Avatar,
//   Switch,
//   FormControlLabel,
//   Alert,
// } from '@mui/material';
// import {
//   Add,
//   MoreVert,
//   Edit,
//   Delete,
//   PersonAdd,
//   Block,
//   CheckCircle,
// } from '@mui/icons-material';
// import { motion } from 'framer-motion';
// import { userAPI } from '../../utils/api';
// import { toast } from 'react-toastify';
// import dayjs from 'dayjs';

// const UserTable = ({ users, onEdit, onDelete, onToggleStatus }) => {
//   const [anchorEl, setAnchorEl] = useState(null);
//   const [selectedUser, setSelectedUser] = useState(null);

//   const handleMenuClick = (event, user) => {
//     setAnchorEl(event.currentTarget);
//     setSelectedUser(user);
//   };

//   const handleMenuClose = () => {
//     setAnchorEl(null);
//     setSelectedUser(null);
//   };

//   const getRoleColor = (role) => {
//     switch (role) {
//       case 'SYSTEM_ADMIN': return 'error';
//       case 'FACILITY_MANAGER': return 'warning';
//       case 'SECURITY': return 'info';
//       default: return 'primary';
//     }
//   };

//   return (
//     <TableContainer component={Paper}>
//       <Table>
//         <TableHead>
//           <TableRow>
//             <TableCell>User</TableCell>
//             <TableCell>Email</TableCell>
//             <TableCell>Role</TableCell>
//             <TableCell>Status</TableCell>
//             <TableCell>Registered</TableCell>
//             <TableCell align="center">Actions</TableCell>
//           </TableRow>
//         </TableHead>
//         <TableBody>
//           {users.map((user) => (
//             <motion.tr
//               key={user.userId}
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               component={TableRow}
//             >
//               <TableCell>
//                 <Box display="flex" alignItems="center">
//                   <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
//                     {user.firstName?.[0]}{user.lastName?.[0]}
//                   </Avatar>
//                   <Box>
//                     <Typography variant="body2" fontWeight="bold">
//                       {user.firstName} {user.lastName}
//                     </Typography>
//                     <Typography variant="caption" color="textSecondary">
//                       @{user.username}
//                     </Typography>
//                   </Box>
//                 </Box>
//               </TableCell>
//               <TableCell>{user.email}</TableCell>
//               <TableCell>
//                 <Chip
//                   label={user.role.replace('_', ' ')}
//                   color={getRoleColor(user.role)}
//                   size="small"
//                 />
//               </TableCell>
//               <TableCell>
//                 <Chip
//                   label={user.isActive ? 'Active' : 'Inactive'}
//                   color={user.isActive ? 'success' : 'error'}
//                   size="small"
//                 />
//               </TableCell>
//               <TableCell>
//                 {dayjs(user.registrationDate).format('MMM DD, YYYY')}
//               </TableCell>
//               <TableCell align="center">
//                 <IconButton
//                   onClick={(e) => handleMenuClick(e, user)}
//                   size="small"
//                 >
//                   <MoreVert />
//                 </IconButton>
//               </TableCell>
//             </motion.tr>
//           ))}
//         </TableBody>
//       </Table>

//       <Menu
//         anchorEl={anchorEl}
//         open={Boolean(anchorEl)}
//         onClose={handleMenuClose}
//       >
//         <MenuItem onClick={() => {
//           onEdit(selectedUser);
//           handleMenuClose();
//         }}>
//           <Edit sx={{ mr: 1 }} />
//           Edit User
//         </MenuItem>
//         <MenuItem onClick={() => {
//           onToggleStatus(selectedUser);
//           handleMenuClose();
//         }}>
//           {selectedUser?.isActive ? <Block sx={{ mr: 1 }} /> : <CheckCircle sx={{ mr: 1 }} />}
//           {selectedUser?.isActive ? 'Deactivate' : 'Activate'}
//         </MenuItem>
//         <MenuItem onClick={() => {
//           onDelete(selectedUser);
//           handleMenuClose();
//         }}>
//           <Delete sx={{ mr: 1 }} />
//           Delete User
//         </MenuItem>
//       </Menu>
//     </TableContainer>
//   );
// };

// const UserManagementPage = () => {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const fetchUsers = async () => {
//     try {
//       const response = await userAPI.getAll();
//       setUsers(response.data);
//     } catch (error) {
//       console.error('Error fetching users:', error);
//       toast.error('Failed to fetch users');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddUser = () => {
//     setSelectedUser(null);
//     setDialogOpen(true);
//   };

//   const handleEditUser = (user) => {
//     setSelectedUser(user);
//     setDialogOpen(true);
//   };

//   const handleDeleteUser = (user) => {
//     setSelectedUser(user);
//     setDeleteDialogOpen(true);
//   };

//   const handleToggleStatus = async (user) => {
//     try {
//       await userAPI.update(user.userId, {
//         ...user,
//         isActive: !user.isActive
//       });
//       toast.success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
//       fetchUsers();
//     } catch (error) {
//       console.error('Error updating user status:', error);
//       toast.error('Failed to update user status');
//     }
//   };

//   const confirmDelete = async () => {
//     try {
//       await userAPI.delete(selectedUser.userId);
//       toast.success('User deleted successfully');
//       fetchUsers();
//       setDeleteDialogOpen(false);
//     } catch (error) {
//       console.error('Error deleting user:', error);
//       toast.error('Failed to delete user');
//     }
//   };

//   const stats = {
//     total: users.length,
//     active: users.filter(u => u.isActive).length,
//     admins: users.filter(u => u.role === 'SYSTEM_ADMIN').length,
//     managers: users.filter(u => u.role === 'FACILITY_MANAGER').length,
//   };

//   return (
//     <Box>
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//       >
//         <Paper sx={{ p: 3, mb: 3 }}>
//           <Box display="flex" justifyContent="space-between" alignItems="center">
//             <Box>