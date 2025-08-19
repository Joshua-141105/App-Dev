import React, { useState, useEffect } from 'react';
import {
  Grid,
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
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  Security,
  DirectionsCar,
  CheckCircle,
  Cancel,
  Warning,
  AccessTime,
  LocalParking,
  Visibility,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { bookingAPI, parkingSlotAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

const CheckInOutDialog = ({ open, onClose, booking, action, onConfirm }) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(booking, action);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {action === 'checkin' ? 'Check In Vehicle' : 'Check Out Vehicle'}
      </DialogTitle>
      <DialogContent>
        {booking && (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              {action === 'checkin' 
                ? 'Confirm vehicle check-in for this booking'
                : 'Confirm vehicle check-out and complete booking'
              }
            </Alert>
            <Typography variant="body1" gutterBottom>
              <strong>Booking ID:</strong> #{booking.bookingId}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Vehicle:</strong> {booking.vehicleNumber}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Slot:</strong> {booking.slotId}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Time:</strong> {dayjs(booking.startTime).format('MMM DD, YYYY HH:mm')}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={loading}
          color={action === 'checkin' ? 'success' : 'warning'}
        >
          {loading ? 'Processing...' : (action === 'checkin' ? 'Check In' : 'Check Out')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const SecurityDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [action, setAction] = useState('');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsRes, slotsRes] = await Promise.all([
        bookingAPI.getAll(),
        parkingSlotAPI.getAll()
      ]);

      // Filter for today's bookings and active bookings
      const today = dayjs().format('YYYY-MM-DD');
      const todayBookings = bookingsRes.data.filter(booking => 
        dayjs(booking.startTime).format('YYYY-MM-DD') === today ||
        booking.status === 'ACTIVE' ||
        booking.status === 'CONFIRMED'
      );

      setBookings(todayBookings);
      setSlots(slotsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckInOut = (booking, actionType) => {
    setSelectedBooking(booking);
    setAction(actionType);
    setDialogOpen(true);
  };

  const confirmCheckInOut = async (booking, actionType) => {
    try {
      const updatedBooking = {
        ...booking,
        status: actionType === 'checkin' ? 'ACTIVE' : 'COMPLETED',
        checkInTime: actionType === 'checkin' ? new Date().toISOString() : booking.checkInTime,
        checkOutTime: actionType === 'checkout' ? new Date().toISOString() : booking.checkOutTime,
      };

      await bookingAPI.update(booking.bookingId, updatedBooking);
      
      // Update slot availability
      const slot = slots.find(s => s.slotId === booking.slotId);
      if (slot) {
        await parkingSlotAPI.update(slot.slotId, {
          ...slot,
          isAvailable: actionType === 'checkout'
        });
      }

      toast.success(`Vehicle ${actionType === 'checkin' ? 'checked in' : 'checked out'} successfully`);
      fetchData();
    } catch (error) {
      console.error(`Error during ${actionType}:`, error);
      toast.error(`Failed to ${actionType === 'checkin' ? 'check in' : 'check out'} vehicle`);
    }
  };

  const stats = {
    totalBookings: bookings.length,
    activeBookings: bookings.filter(b => b.status === 'ACTIVE').length,
    pendingCheckIns: bookings.filter(b => b.status === 'CONFIRMED').length,
    occupiedSlots: slots.filter(s => !s.isAvailable).length,
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'primary';
      case 'ACTIVE': return 'success';
      case 'COMPLETED': return 'default';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const canCheckIn = (booking) => {
    return booking.status === 'CONFIRMED' && !booking.checkInTime;
  };

  const canCheckOut = (booking) => {
    return booking.status === 'ACTIVE' && booking.checkInTime && !booking.checkOutTime;
  };

  if (loading) {
    return (
      <Box>
        <LinearProgress />
        <Typography>Loading security dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <Typography variant="h4" color="white" gutterBottom>
            Security Dashboard
          </Typography>
          <Typography variant="body1" color="rgba(255,255,255,0.8)">
            Monitor parking facility access and vehicle movements
          </Typography>
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
                    Active Bookings
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {stats.activeBookings}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <DirectionsCar />
                </Avatar>
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
                    Pending Check-ins
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {stats.pendingCheckIns}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <AccessTime />
                </Avatar>
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
                    Occupied Slots
                  </Typography>
                  <Typography variant="h4" color="error.main">
                    {stats.occupiedSlots}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'error.main' }}>
                  <LocalParking />
                </Avatar>
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
                    Total Today
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {stats.totalBookings}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <Security />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bookings Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Today's Vehicle Access Log
          </Typography>
          {bookings.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography color="textSecondary">
                No bookings for today
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Booking ID</TableCell>
                    <TableCell>Vehicle</TableCell>
                    <TableCell>Slot</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Check-in Time</TableCell>
                    <TableCell>Check-out Time</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookings.map((booking) => (
                    <motion.tr
                      key={booking.bookingId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      component={TableRow}
                    >
                      <TableCell>#{booking.bookingId}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {booking.vehicleNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>Slot {booking.slotId}</TableCell>
                      <TableCell>
                        <Chip
                          label={booking.status}
                          color={getStatusColor(booking.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {booking.checkInTime 
                          ? dayjs(booking.checkInTime).format('HH:mm')
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        {booking.checkOutTime 
                          ? dayjs(booking.checkOutTime).format('HH:mm')
                          : '-'
                        }
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" gap={1} justifyContent="center">
                          {canCheckIn(booking) && (
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => handleCheckInOut(booking, 'checkin')}
                              startIcon={<CheckCircle />}
                            >
                              Check In
                            </Button>
                          )}
                          {canCheckOut(booking) && (
                            <Button
                              size="small"
                              variant="contained"
                              color="warning"
                              onClick={() => handleCheckInOut(booking, 'checkout')}
                              startIcon={<Visibility />}
                            >
                              Check Out
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Check-in/out Dialog */}
      <CheckInOutDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        booking={selectedBooking}
        action={action}
        onConfirm={confirmCheckInOut}
      />
    </Box>
  );
};
export default SecurityDashboard;