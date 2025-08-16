// pages/dashboard/UserDashboard.js
import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  Avatar,
  Paper,
  LinearProgress,
} from '@mui/material';
import {
  DirectionsCar,
  EventAvailable,
  Payment,
  History,
  LocalParking,
  TrendingUp,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import { bookingAPI, vehicleAPI, parkingSlotAPI } from '../../utils/api';

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeBookings: 0,
    totalBookings: 0,
    vehicles: 0,
    availableSlots: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [bookingsRes, vehiclesRes, slotsRes] = await Promise.all([
        bookingAPI.getAll(),
        vehicleAPI.getAll(),
        parkingSlotAPI.getAll(),
      ]);

      const userBookings = bookingsRes.data.filter(b => b.userId === user.id);
      const activeBookings = userBookings.filter(b => 
        b.status === 'CONFIRMED' || b.status === 'ACTIVE'
      );
      const availableSlots = slotsRes.data.filter(s => s.isAvailable);

      setStats({
        activeBookings: activeBookings.length,
        totalBookings: userBookings.length,
        vehicles: vehiclesRes.data.filter(v => v.userId === user.id).length,
        availableSlots: availableSlots.length,
      });

      setRecentBookings(userBookings.slice(0, 3));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, onClick }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        sx={{
          cursor: onClick ? 'pointer' : 'default',
          '&:hover': onClick ? { boxShadow: 6 } : {},
        }}
        onClick={onClick}
      >
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography color="textSecondary" gutterBottom variant="body2">
                {title}
              </Typography>
              <Typography variant="h4" component="div" color={color}>
                {value}
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: `${color}.main`, color: 'white' }}>
              {icon}
            </Avatar>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  const QuickActionCard = ({ title, description, icon, onClick, color = 'primary' }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={onClick}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Avatar sx={{ bgcolor: `${color}.main`, mx: 'auto', mb: 2, width: 56, height: 56 }}>
            {icon}
          </Avatar>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {description}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (loading) {
    return (
      <Box>
        <LinearProgress />
        <Typography>Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <Typography variant="h4" color="white" gutterBottom>
            Welcome back, {user?.username}!
          </Typography>
          <Typography variant="body1" color="rgba(255,255,255,0.8)">
            Manage your parking reservations and explore available slots.
          </Typography>
        </Paper>
      </motion.div>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Bookings"
            value={stats.activeBookings}
            icon={<DirectionsCar />}
            color="primary"
            onClick={() => navigate('/my-bookings')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Bookings"
            value={stats.totalBookings}
            icon={<History />}
            color="secondary"
            onClick={() => navigate('/booking-history')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="My Vehicles"
            value={stats.vehicles}
            icon={<DirectionsCar />}
            color="success"
            onClick={() => navigate('/vehicles')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Available Slots"
            value={stats.availableSlots}
            icon={<LocalParking />}
            color="warning"
            onClick={() => navigate('/slots')}
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Quick Actions
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <QuickActionCard
            title="Book a Slot"
            description="Reserve a parking spot"
            icon={<EventAvailable />}
            onClick={() => navigate('/book-slot')}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <QuickActionCard
            title="View Slots"
            description="Check available parking"
            icon={<LocalParking />}
            onClick={() => navigate('/slots')}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <QuickActionCard
            title="Manage Vehicles"
            description="Add or edit vehicles"
            icon={<DirectionsCar />}
            onClick={() => navigate('/vehicles')}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <QuickActionCard
            title="Payment History"
            description="View transaction history"
            icon={<Payment />}
            onClick={() => navigate('/payments')}
            color="secondary"
          />
        </Grid>
      </Grid>

      {/* Recent Bookings */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Recent Bookings
          </Typography>
          {recentBookings.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="textSecondary">
                  No bookings yet. Book your first parking slot!
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate('/book-slot')}
                  sx={{ mt: 2 }}
                >
                  Book Now
                </Button>
              </CardContent>
            </Card>
          ) : (
            recentBookings.map((booking) => (
              <Card key={booking.bookingId} sx={{ mb: 2 }}>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={8}>
                      <Typography variant="h6">
                        Slot {booking.slotId} - {booking.vehicleNumber}
                      </Typography>
                      <Typography color="textSecondary">
                        {new Date(booking.startTime).toLocaleDateString()} - 
                        {new Date(booking.endTime).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2">
                        Total: ${booking.totalCost}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4} sx={{ textAlign: 'right' }}>
                      <Chip
                        label={booking.status}
                        color={
                          booking.status === 'ACTIVE' ? 'success' :
                          booking.status === 'CONFIRMED' ? 'primary' :
                          booking.status === 'COMPLETED' ? 'default' : 'error'
                        }
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))
          )}
        </Grid>
      </Grid>
    </Box>
  );
};
export default UserDashboard;