
// pages/user/BookingHistoryPage.js
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Button,
} from '@mui/material';
import { History, FilterList } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import { bookingHistoryAPI, bookingAPI, userAPI, parkingSlotAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const BookingHistoryPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: null,
    dateTo: null,
    search: '',
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [bookings, filters]);

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getAll();
      const userBookings = response.data
        .filter(b => b.userId === user.id || user.role !== 'USER')
        .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
      setBookings(userBookings);
    } catch (error) {
      console.error('Error fetching booking history:', error);
      toast.error('Failed to fetch booking history');
    } finally {
      setLoading(false);
    }
  };

  const [usernames, setUsernames] = useState({}); // { userId: username }
const [slots, setSlots] = useState({});         // { slotId: slotNumber }

useEffect(() => {
  const fetchData = async () => {
    const usernameMap = {};
    const slotMap = {};

    for (const booking of filteredBookings) {
      // Fetch username if not already cached
      if (!usernameMap[booking.userId] && booking.userId) {
        try {
          const response = await userAPI.getById(booking.userId);
          usernameMap[booking.userId] = response.data.username;
        } catch (err) {
          usernameMap[booking.userId] = "N/A";
        }
      }

      // Fetch slot number if not already cached
      if (!slotMap[booking.slotId] && booking.slotId) {
        try {
          const response = await parkingSlotAPI.getById(booking.slotId);
          slotMap[booking.slotId] = response.data.slotNumber; // depends on your API field
        } catch (err) {
          slotMap[booking.slotId] = "N/A";
        }
      }
    }

    setUsernames(usernameMap);
    setSlots(slotMap);
  };

  fetchData();
}, [filteredBookings]);



  const applyFilters = () => {
    let filtered = [...bookings];
    console.log('Bookings:', bookings);
    if (filters.status) {
      filtered = filtered.filter(booking => booking.status === filters.status);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(booking =>
        dayjs(booking.startTime).isAfter(dayjs(filters.dateFrom))
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(booking =>
        dayjs(booking.startTime).isBefore(dayjs(filters.dateTo))
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(booking =>
        booking.vehicleNumber?.toLowerCase().includes(searchLower) ||
        booking.slotId?.toString().includes(searchLower)
      );
    }

    setFilteredBookings(filtered);
  };

  const handleFilterChange = (field) => (event) => {
    setFilters({
      ...filters,
      [field]: event.target.value,
    });
  };

  const handleDateFilterChange = (field) => (newValue) => {
    setFilters({
      ...filters,
      [field]: newValue,
    });
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      dateFrom: null,
      dateTo: null,
      search: '',
    });
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

  if (loading) {
    return (
      <Box>
        <LinearProgress />
        <Typography>Loading booking history...</Typography>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h4" gutterBottom>
              Booking History
            </Typography>
            <Typography variant="body1" color="textSecondary">
              View all your past and current parking reservations
            </Typography>
          </Paper>
        </motion.div>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <FilterList sx={{ mr: 1 }} />
              <Typography variant="h6">Filter Bookings</Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={clearFilters}
                sx={{ ml: 'auto' }}
              >
                Clear Filters
              </Button>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Search"
                  placeholder="Vehicle number, slot..."
                  value={filters.search}
                  onChange={handleFilterChange('search')}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    onChange={handleFilterChange('status')}
                    label="Status"
                  >
                    <MenuItem value="">All Status</MenuItem>
                    <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                    <MenuItem value="ACTIVE">Active</MenuItem>
                    <MenuItem value="COMPLETED">Completed</MenuItem>
                    <MenuItem value="CANCELLED">Cancelled</MenuItem>
                    <MenuItem value="OVERDUE">Overdue</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="From Date"
                  value={filters.dateFrom}
                  onChange={handleDateFilterChange('dateFrom')}
                  renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="To Date"
                  value={filters.dateTo}
                  onChange={handleDateFilterChange('dateTo')}
                  renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Booking History Table */}
        {filteredBookings.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <History sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="textSecondary">
                No booking history found
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {bookings.length === 0
                  ? "You haven't made any bookings yet."
                  : "No bookings match your current filters."
                }
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Booking ID</TableCell>
                  <TableCell>Slot Number</TableCell>
                  <TableCell>Vehicle</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Cost</TableCell>

                  {/* Show Username column only if role !== 'user' */}
                  {user.role !== "USER" && <TableCell>Username</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <motion.tr
                    key={booking.bookingId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    component={TableRow}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        #{booking.bookingId}
                      </Typography>
                    </TableCell>
                    <TableCell>{slots[booking.slotId]}</TableCell>
                    <TableCell>{booking.vehicleNumber}</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {dayjs(booking.startTime).format("MMM DD, YYYY")}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {dayjs(booking.startTime).format("HH:mm")} -{" "}
                        {dayjs(booking.endTime).format("HH:mm")}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {Math.ceil(
                        dayjs(booking.endTime).diff(dayjs(booking.startTime), "hour", true)
                      )}
                      h
                      {booking.extendedTime > 0 && (
                        <Chip
                          label={`+${booking.extendedTime}h`}
                          size="small"
                          color="warning"
                          sx={{ ml: 1 }}
                        />
                      )}
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

                    {/* Show Username cell only if role !== 'user' */}
                    {user.role !== "USER" && (
                      <TableCell>
                        <Typography variant="body2">
                          {usernames[booking.userId] || "Loading..."}
                        </Typography>
                      </TableCell>
                    )}
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

        )}
      </Box>
    </LocalizationProvider>
  );
};
export default BookingHistoryPage;