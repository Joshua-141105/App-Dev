// pages/manager/FacilityAnalyticsPage.js
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Paper,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  TrendingUp,
  AttachMoney,
  AccessTime,
  LocalParking,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { motion } from 'framer-motion';
import { analyticsAPI, facilityAPI } from '../../utils/api';
import { toast } from 'react-toastify';

const AnalyticsCharts = ({ data }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const occupancyData = data.map(d => ({
    name: new Date(d.date).toLocaleDateString(),
    occupancy: d.occupancyRate,
    revenue: d.revenue,
  }));

  const pieData = [
    { name: 'Occupied', value: 65 },
    { name: 'Available', value: 25 },
    { name: 'Maintenance', value: 10 },
  ];

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Daily Occupancy Rate
            </Typography>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={occupancyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="occupancy" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Revenue Trends
            </Typography>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={occupancyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Slot Distribution
            </Typography>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Peak Hours Analysis
            </Typography>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { hour: '6-8 AM', bookings: 45 },
                  { hour: '8-10 AM', bookings: 85 },
                  { hour: '10-12 PM', bookings: 65 },
                  { hour: '12-2 PM', bookings: 75 },
                  { hour: '2-4 PM', bookings: 55 },
                  { hour: '4-6 PM', bookings: 90 },
                  { hour: '6-8 PM', bookings: 70 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="bookings" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

const FacilityAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    fetchFacilities();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await analyticsAPI.getAll();
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const fetchFacilities = async () => {
    try {
      const response = await facilityAPI.getAll();
      setFacilities(response.data);
      if (response.data.length > 0) {
        setSelectedFacility(response.data[0].facilityId);
      }
    } catch (error) {
      console.error('Error fetching facilities:', error);
    }
  };

  const filteredAnalytics = selectedFacility
    ? analytics.filter(a => a.facilityId === selectedFacility)
    : analytics;

  const stats = {
    totalRevenue: filteredAnalytics.reduce((sum, a) => sum + a.revenue, 0),
    avgOccupancy: filteredAnalytics.length > 0
      ? filteredAnalytics.reduce((sum, a) => sum + a.occupancyRate, 0) / filteredAnalytics.length
      : 0,
    totalBookings: filteredAnalytics.reduce((sum, a) => sum + a.totalBookings, 0),
    avgDuration: filteredAnalytics.length > 0
      ? filteredAnalytics.reduce((sum, a) => sum + a.averageBookingDuration, 0) / filteredAnalytics.length
      : 0,
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
                Facility Analytics
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Comprehensive insights into facility performance
              </Typography>
            </Box>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Select Facility</InputLabel>
              <Select
                value={selectedFacility}
                onChange={(e) => setSelectedFacility(e.target.value)}
                label="Select Facility"
              >
                <MenuItem value="">All Facilities</MenuItem>
                {facilities.map((facility) => (
                  <MenuItem key={facility.facilityId} value={facility.facilityId}>
                    {facility.facilityName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Paper>
      </motion.div>

      {/* Key Metrics */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Revenue
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    ${stats.totalRevenue.toFixed(2)}
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
                    Avg Occupancy
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {stats.avgOccupancy.toFixed(1)}%
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <TrendingUp />
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
                    Total Bookings
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {stats.totalBookings}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
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
                    Avg Duration
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    {stats.avgDuration.toFixed(1)}h
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <AccessTime />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography>Loading analytics...</Typography>
        </Box>
      ) : (
        <AnalyticsCharts data={filteredAnalytics} />
      )}
    </Box>
  );
};
export default FacilityAnalyticsPage;