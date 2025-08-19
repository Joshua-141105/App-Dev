// pages/dashboard/ManagerDashboard.js
import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Paper,
  LinearProgress,
} from '@mui/material';
import {
  Assessment,
  TrendingUp,
  LocalParking,
  AttachMoney,
  Group,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { analyticsAPI, bookingAPI, parkingSlotAPI } from '../../utils/api';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalSlots: 0,
    occupiedSlots: 0,
    totalRevenue: 0,
    todayBookings: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, bookingsRes, slotsRes] = await Promise.all([
        analyticsAPI.getAll(),
        bookingAPI.getAll(),
        parkingSlotAPI.getAll(),
      ]);

      const occupiedSlots = slotsRes.data.filter(s => !s.isAvailable).length;
      const totalRevenue = bookingsRes.data.reduce((sum, b) => sum + b.totalCost, 0);
      const today = new Date().toDateString();
      const todayBookings = bookingsRes.data.filter(b => 
        new Date(b.createdDate).toDateString() === today
      ).length;

      setStats({
        totalSlots: slotsRes.data.length,
        occupiedSlots,
        totalRevenue,
        todayBookings,
      });

      // Sample chart data
      setChartData([
        { name: 'Mon', bookings: 12, revenue: 480 },
        { name: 'Tue', bookings: 19, revenue: 760 },
        { name: 'Wed', bookings: 15, revenue: 600 },
        { name: 'Thu', bookings: 22, revenue: 880 },
        { name: 'Fri', bookings: 28, revenue: 1120 },
        { name: 'Sat', bookings: 25, revenue: 1000 },
        { name: 'Sun', bookings: 18, revenue: 720 },
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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
      >
        <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
          <Typography variant="h4" color="white" gutterBottom>
            Manager Dashboard
          </Typography>
          <Typography variant="body1" color="rgba(255,255,255,0.8)">
            Monitor facility performance and analytics.
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
                    Total Slots
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {stats.totalSlots}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
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
                    Occupied
                  </Typography>
                  <Typography variant="h4" color="warning">
                    {stats.occupiedSlots}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <Group />
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
                    Total Revenue
                  </Typography>
                  <Typography variant="h4" color="success">
                    ${stats.totalRevenue}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <AttachMoney />
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
                    Today's Bookings
                  </Typography>
                  <Typography variant="h4" color="secondary">
                    {stats.todayBookings}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  <TrendingUp />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Weekly Performance Chart */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Weekly Performance
          </Typography>
          <Box height={300}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bookings" fill="#8884d8" name="Bookings" />
                <Bar dataKey="revenue" fill="#82ca9d" name="Revenue ($)" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
export default ManagerDashboard;