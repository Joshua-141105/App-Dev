
// pages/dashboard/AdminDashboard.js
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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from '@mui/material';
import {
  SupervisorAccount,
  Business,
  Security,
  Assessment,
  TrendingUp,
  Warning,
  CheckCircle,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { userAPI, facilityAPI, bookingAPI } from '../../utils/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFacilities: 0,
    totalBookings: 0,
    systemHealth: 95,
  });
  const [userRoleData, setUserRoleData] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [usersRes, facilitiesRes, bookingsRes] = await Promise.all([
        userAPI.getAll(),
        facilityAPI.getAll(),
        bookingAPI.getAll(),
      ]);

      setStats({
        totalUsers: usersRes.data.length,
        totalFacilities: facilitiesRes.data.length,
        totalBookings: bookingsRes.data.length,
        systemHealth: 95,
      });

      // Calculate user role distribution
      const roleCounts = usersRes.data.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {});

      const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
      setUserRoleData(
        Object.entries(roleCounts).map(([role, count], index) => ({
          name: role,
          value: count,
          color: colors[index % colors.length],
        }))
      );

      // Mock system alerts
      setSystemAlerts([
        { id: 1, type: 'warning', message: 'Server load is above 80%', time: '2 mins ago' },
        { id: 2, type: 'success', message: 'All payment systems operational', time: '5 mins ago' },
        { id: 3, type: 'info', message: 'Daily backup completed', time: '1 hour ago' },
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
        <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <Typography variant="h4" color="white" gutterBottom>
            System Administrator
          </Typography>
          <Typography variant="body1" color="rgba(255,255,255,0.8)">
            Complete system overview and management console.
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
                    Total Users
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {stats.totalUsers}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <SupervisorAccount />
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
                    Facilities
                  </Typography>
                  <Typography variant="h4" color="success">
                    {stats.totalFacilities}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <Business />
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
                  <Typography variant="h4" color="warning">
                    {stats.totalBookings}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <Assessment />
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
                    System Health
                  </Typography>
                  <Typography variant="h4" color="secondary">
                    {stats.systemHealth}%
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  <Security />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* User Role Distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                User Role Distribution
              </Typography>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userRoleData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {userRoleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* System Alerts */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Alerts
              </Typography>
              <List>
                {systemAlerts.map((alert) => (
                  <ListItem key={alert.id}>
                    <ListItemIcon>
                      {alert.type === 'warning' ? <Warning color="warning" /> :
                       alert.type === 'success' ? <CheckCircle color="success" /> :
                       <TrendingUp color="info" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={alert.message}
                      secondary={alert.time}
                    />
                    <Chip
                      size="small"
                      label={alert.type}
                      color={
                        alert.type === 'warning' ? 'warning' :
                        alert.type === 'success' ? 'success' : 'info'
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
export default AdminDashboard;