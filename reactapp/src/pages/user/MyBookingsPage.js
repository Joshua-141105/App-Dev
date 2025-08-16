// pages/user/MyBookingsPage.js
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
} from '@mui/material';
import {
  MoreVert,
  Edit,
  Cancel,
  ExtensionOutlined,
  Receipt,
  DirectionsCar,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { bookingAPI } from '../../utils/api';
import { useAuth } from '../../App';
import { toast } from 'react-toastify';

const CancelBookingDialog = ({ open, onClose, booking, onConfirm }) => {
  const [loading, setLoading] = useState(false);

  const getRefundAmount = () => {
    if (!booking) return 0;
    
    const now = dayjs();
    const startTime = dayjs(booking.startTime);
    const hoursUntilStart = startTime.diff(now, 'hour', true);

    if (hoursUntilStart > 2) {
      return booking.totalCost; // 100% refund
    } else if (hoursUntilStart >= 1) {
      return booking.totalCost * 0.5; // 50% refund
    } else {
      return 0; // No refund
    }
  };

  const getRefundPercentage = () => {
    if (!booking) return 0;
    
    const now = dayjs();
    const startTime = dayjs(booking.startTime);
    const hoursUntilStart = startTime.diff(now, 'hour', true);

    if (hoursUntilStart > 2) return 100;
    if (hoursUntilStart >= 1) return 50;
    return 0;
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Cancel Booking</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Are you sure you want to cancel this booking?
        </Alert>
        
        {booking && (
          <Box>
            <Typography variant="body1" gutterBottom>
              <strong>Booking:</strong> Slot {booking.slotId} - {booking.vehicleNumber}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Start Time:</strong> {dayjs(booking.startTime).format('MMM DD, YYYY HH:mm')}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Total Paid:</strong> ${booking.totalCost}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Refund Amount:</strong> ${getRefundAmount().toFixed(2)} ({getRefundPercentage()}%)
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Keep Booking
        </Button>
        <Button
          onClick={handleConfirm}
          color="error"
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Cancelling...' : 'Cancel Booking'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ExtendBookingDialog = ({ open, onClose, booking, onConfirm }) => {
  const [newEndTime, setNewEndTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [additionalCost, setAdditionalCost] = useState(0);

  useEffect(() => {
    if (booking) {
      const currentEnd = dayjs(booking.endTime);
      const proposedEnd = currentEnd.add(1, 'hour');
      setNewEndTime(proposedEnd);
    }
  }, [booking]);

  useEffect(() => {
    if (booking && newEndTime) {
      const currentEnd = dayjs(booking.endTime);
      const additionalHours = newEndTime.diff(currentEnd, 'hour', true);
      const cost = Math.max(0, Math.ceil(additionalHours)) * (booking.hourlyRate || 10);
      setAdditionalCost(cost);
    }
  }, [newEndTime, booking]);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(newEndTime, additionalCost);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Extend Booking</DialogTitle>
        <DialogContent>
          {booking && (
            <Box>
              <Typography variant="body1" gutterBottom>
                <strong>Current End Time:</strong> {dayjs(booking.endTime).format('MMM DD, YYYY HH:mm')}
              </Typography>
              
              <Box mt={2} mb={2}>
                <DateTimePicker
                  label="New End Time"
                  value={newEndTime}
                  onChange={setNewEndTime}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  minDateTime={dayjs(booking.endTime)}
                />
              </Box>

              <Typography variant="body1" color="primary">
                <strong>Additional Cost:</strong> ${additionalCost.toFixed(2)}
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
            disabled={loading || additionalCost <= 0}
          >
            {loading ? 'Extending...' : `Extend for $${additionalCost.toFixed(2)}`}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

const MyBookingsPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [dialogType, setDialogType] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getAll();
      const userBookings = response.data.filter(b => b.userId === user.id);
      setBookings(userBookings.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate)));
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (event, booking) => {
    setAnchorEl(event.currentTarget);
    setSelectedBooking(booking);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedBooking(null);
  };

  const handleCancelBooking = async () => {
    try {
      await bookingAPI.update(selectedBooking.bookingId, {
        ...selectedBooking,
        status: 'CANCELLED'
      });
      toast.success('Booking cancelled successfully');
      fetchBookings();
      setDialogType(null);
      handleMenuClose();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    }
  };

  const handleExtendBooking = async (newEndTime, additionalCost) => {
    try {
      await bookingAPI.update(selectedBooking.bookingId, {
        ...selectedBooking,
        endTime: newEndTime.toISOString(),
        totalCost: selectedBooking.totalCost + additionalCost,
        extendedTime: selectedBooking.extendedTime + newEndTime.diff(dayjs(selectedBooking.endTime), 'hour')
      });
      toast.success('Booking extended successfully');
      fetchBookings();
      setDialogType(null);
      handleMenuClose();
    } catch (error) {
      console.error('Error extending booking:', error);
      toast.error('Failed to extend booking');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'primary';
      case 'ACTIVE': return 'success';
      case 'COMPLETED': return 'default';
      case 'CANCELLED': return 'error';
      case 'OVERDUE': return 'warning';
      default: return 'default';
    }
  };

  const canCancelBooking = (booking) => {
    return ['CONFIRMED', 'ACTIVE'].includes(booking.status);
  };

  const canExtendBooking = (booking) => {
    return booking.status === 'ACTIVE' || booking.status === 'CONFIRMED';
  };

  if (loading) {
    return (
      <Box>
        <LinearProgress />
        <Typography>Loading bookings...</Typography>
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
            My Bookings
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Manage your current and past parking reservations
          </Typography>
        </Paper>
      </motion.div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <DirectionsCar sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              No bookings found
            </Typography>
            <Typography variant="body2" color="textSecondary" mb={2}>
              You haven't made any parking reservations yet.
            </Typography>
            <Button variant="contained" href="/book-slot">
              Book Your First Slot
            </Button>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Slot</TableCell>
                <TableCell>Vehicle</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell>End Time</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Cost</TableCell>
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
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      Slot {booking.slotId}
                    </Typography>
                  </TableCell>
                  <TableCell>{booking.vehicleNumber}</TableCell>
                  <TableCell>
                    {dayjs(booking.startTime).format('MMM DD, HH:mm')}
                  </TableCell>
                  <TableCell>
                    {dayjs(booking.endTime).format('MMM DD, HH:mm')}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={booking.status}
                      color={getStatusColor(booking.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      ${booking.totalCost}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={(e) => handleMenuClick(e, booking)}
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
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => setDialogType('extend')}
          disabled={!selectedBooking || !canExtendBooking(selectedBooking)}
        >
          <ExtensionOutlined sx={{ mr: 1 }} />
          Extend Booking
        </MenuItem>
        <MenuItem
          onClick={() => setDialogType('cancel')}
          disabled={!selectedBooking || !canCancelBooking(selectedBooking)}
        >
          <Cancel sx={{ mr: 1 }} />
          Cancel Booking
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Receipt sx={{ mr: 1 }} />
          View Receipt
        </MenuItem>
      </Menu>

      {/* Dialogs */}
      <CancelBookingDialog
        open={dialogType === 'cancel'}
        onClose={() => setDialogType(null)}
        booking={selectedBooking}
        onConfirm={handleCancelBooking}
      />

      <ExtendBookingDialog
        open={dialogType === 'extend'}
        onClose={() => setDialogType(null)}
        booking={selectedBooking}
        onConfirm={handleExtendBooking}
      />
    </Box>
  );
};
export default MyBookingsPage;