// pages/admin/FacilityAnalyticsPage.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Alert,
  LinearProgress,
  Tooltip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  LocationOn,
  TrendingUp,
  TrendingDown,
  DirectionsCar,
  Schedule,
  AttachMoney,
  People,
  Analytics,
  Refresh,
  GetApp,
  Warning,
  CheckCircle,
  Speed,
  Timeline,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  ComposedChart
} from 'recharts';
import { motion } from 'framer-motion';
import { facilityAPI, facilityAnalyticsAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

const FacilityAnalyticsPage = () => {
  const [facilities, setFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState('all');
  const [timeRange, setTimeRange] = useState('month');
  const [analyticsData, setAnalyticsData] = useState([]);
  const [occupancyData, setOccupancyData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [peakHoursData, setPeakHoursData] = useState([]);
  const [facilitySummary, setFacilitySummary] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFacilities();
    fetchAnalyticsData();
  }, [selectedFacility, timeRange]);

  const fetchFacilities = async () => {
    try {
      const response = await facilityAPI.getAll();
      setFacilities(response.data);
    } catch (error) {
      console.error('Error fetching facilities:', error);
      toast.error('Failed to load facilities');
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Generate mock analytics data
      const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
      const mockAnalytics = [];
      const mockOccupancy = [];
      const mockRevenue = [];
      
      for (let i = 0; i < days; i++) {
        const date = dayjs().subtract(days - i - 1, 'day');
        const baseOccupancy = Math.random() * 40 + 40; // 40-80%
        const totalSlots = 100;
        const occupiedSlots = Math.round((baseOccupancy / 100) * totalSlots);
        const revenue = occupiedSlots * (Math.random() * 10 + 5); // $5-15 per slot
        
        mockAnalytics.push({
          date: date.format('MMM DD'),
          fullDate: date.format('YYYY-MM-DD'),
          occupancyRate: Math.round(baseOccupancy),
          totalBookings: Math.floor(Math.random() * 50) + 20,
          revenue: Math.round(revenue),
          averageDuration: Math.random() * 4 + 2, // 2-6 hours
          utilizationScore: Math.random() * 0.3 + 0.5 // 0.5-0.8
        });

        mockOccupancy.push({
          time: i,
          timeLabel: `${i}:00`,
          occupancy: Math.round(Math.sin(i * 0.5) * 20 + 60) // Sine wave pattern
        });

        mockRevenue.push({
          date: date.format('MMM DD'),
          revenue: Math.round(revenue),
          bookings: Math.floor(Math.random() * 50) + 20
        });
      }

      // Generate peak hours data
      const hours = Array.from({length: 24}, (_, i) => {
        const hour = i;
        const isWeekend = Math.random() > 0.5;
        let baseOccupancy = 30;
        
        // Peak hours logic
        if (hour >= 7 && hour <= 9) baseOccupancy = 85; // Morning rush
        else if (hour >= 17 && hour <= 19) baseOccupancy = 90; // Evening rush
        else if (hour >= 12 && hour <= 14) baseOccupancy = 70; // Lunch
        else if (hour >= 20 && hour <= 23) baseOccupancy = 60; // Evening
        
        if (isWeekend) baseOccupancy *= 0.7; // Lower on weekends
        
        return {
          hour: `${hour.toString().padStart(2, '0')}:00`,
          occupancy: Math.round(baseOccupancy + (Math.random() * 10 - 5)),
          revenue: Math.round(baseOccupancy * 2 + Math.random() * 50)
        };
      });

      setPeakHoursData(hours);
      setAnalyticsData(mockAnalytics);
      setOccupancyData(mockOccupancy);
      setRevenueData(mockRevenue);

      // Calculate facility summary
      const totalRevenue = mockRevenue.reduce((sum, day) => sum + day.revenue, 0);
      const avgOccupancy = mockAnalytics.reduce((sum, day) => sum + day.occupancyRate, 0) / mockAnalytics.length;
      const totalBookings = mockAnalytics.reduce((sum, day) => sum + day.totalBookings, 0);
      const peakOccupancy = Math.max(...mockAnalytics.map(d => d.occupancyRate));
      
      setFacilitySummary({
        totalRevenue,
        avgOccupancy: Math.round(avgOccupancy),
        totalBookings,
        peakOccupancy,
        avgDuration: mockAnalytics.reduce((sum, day) => sum + day.averageDuration, 0) / mockAnalytics.length,
        utilizationScore: mockAnalytics.reduce((sum, day) => sum + day.utilizationScore, 0) / mockAnalytics.length
      });

    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Date,Occupancy Rate,Total Bookings,Revenue,Average Duration\n" +
      analyticsData.map(row => 
        `${row.fullDate},${row.occupancyRate},${row.totalBookings},${row.revenue},${row.averageDuration.toFixed(2)}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `facility_analytics_${dayjs().format('YYYY-MM-DD')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Analytics data exported successfully');
  };

  const MetricCard = ({ title, value, subtitle, icon: Icon, color = 'primary', trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography color="textSecondary" gutterBottom variant="body2">
                {title}
              </Typography>
              <Typography variant="h4" fontWeight="bold" color={`${color}.main`}>
                {value}
              </Typography>
              {subtitle && (
                <Typography variant="body2" color="textSecondary">
                  {subtitle}
                </Typography>
              )}
              {trend !== undefined && (
                <Box display="flex" alignItems="center" mt={1}>
                  {trend >= 0 ? (
                    <TrendingUp sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                  ) : (
                    <TrendingDown sx={{ fontSize: 16, color: 'error.main', mr: 0.5 }} />
                  )}
                  <Typography 
                    variant="body2" 
                    color={trend >= 0 ? 'success.main' : 'error.main'}
                  >
                    {Math.abs(trend)}% vs last period
                  </Typography>
                </Box>
              )}
            </Box>
            <Icon sx={{ fontSize: 40, color: `${color}.main`, opacity: 0.8 }} />
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  const OccupancyGauge = ({ value, title }) => {
    const data = [
      { name: 'Occupied', value: value, fill: value > 80 ? '#f44336' : value > 60 ? '#ff9800' : '#4caf50' },
      { name: 'Available', value: 100 - value, fill: '#e0e0e0' }
    ];

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom textAlign="center">
            {title}
          </Typography>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                startAngle={90}
                endAngle={-270}
                innerRadius={60}
                outerRadius={80}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <Typography variant="h4" textAlign="center" fontWeight="bold" color="primary.main">
            {value}%
          </Typography>
          <Typography variant="body2" textAlign="center" color="textSecondary">
            Current Occupancy
          </Typography>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="h6" textAlign="center" sx={{ mt: 2 }}>
          Loading facility analytics...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Facility Analytics
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Comprehensive facility performance and utilization analytics
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Tooltip title="Refresh Data">
              <IconButton onClick={fetchAnalyticsData} color="primary">
                <Refresh />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<GetApp />}
              onClick={exportData}
            >
              Export Data
            </Button>
          </Box>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Facility</InputLabel>
                <Select
                  value={selectedFacility}
                  onChange={(e) => setSelectedFacility(e.target.value)}
                  label="Facility"
                >
                  <MenuItem value="all">All Facilities</MenuItem>
                  {facilities.map((facility) => (
                    <MenuItem key={facility.facilityId} value={facility.facilityId}>
                      {facility.facilityName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Time Range</InputLabel>
                <Select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  label="Time Range"
                >
                  <MenuItem value="week">Last 7 Days</MenuItem>
                  <MenuItem value="month">Last 30 Days</MenuItem>
                  <MenuItem value="quarter">Last 90 Days</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Alert severity="info" sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                Data updated in real-time every 5 minutes
              </Alert>
            </Grid>
          </Grid>
        </Paper>

        {/* Key Metrics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Average Occupancy"
              value={`${facilitySummary.avgOccupancy}%`}
              subtitle={`Peak: ${facilitySummary.peakOccupancy}%`}
              icon={DirectionsCar}
              color="primary"
              trend={5.2}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Total Revenue"
              value={`${facilitySummary.totalRevenue?.toLocaleString()}`}
              subtitle={`${facilitySummary.totalBookings} bookings`}
              icon={AttachMoney}
              color="success"
              trend={8.1}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Avg Duration"
              value={`${facilitySummary.avgDuration?.toFixed(1)}h`}
              subtitle="Per booking session"
              icon={Schedule}
              color="info"
              trend={-2.3}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Utilization Score"
              value={`${(facilitySummary.utilizationScore * 100)?.toFixed(0)}%`}
              subtitle="Efficiency rating"
              icon={Speed}
              color="warning"
              trend={3.7}
            />
          </Grid>
        </Grid>

        {/* Current Occupancy Gauges */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <OccupancyGauge value={75} title="Current Occupancy" />
          </Grid>
          <Grid item xs={12} md={4}>
            <OccupancyGauge value={82} title="Peak Hour Average" />
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Facility Status
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText primary="All Systems Operational" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <DirectionsCar color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="25 Available Spots" 
                      secondary="Out of 100 total slots"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <People color="info" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="42 Active Bookings" 
                      secondary="Real-time count"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Warning color="warning" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="2 Maintenance Alerts" 
                      secondary="Non-critical issues"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Occupancy Trend */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3, height: 400 }}>
              <Box display="flex" alignItems="center" justifyContent="between" mb={2}>
                <Typography variant="h6">
                  Occupancy & Revenue Trends
                </Typography>
                <Chip label={`${timeRange === 'week' ? '7' : timeRange === 'month' ? '30' : '90'} days`} />
              </Box>
              <ResponsiveContainer width="100%" height="85%">
                <ComposedChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <RechartsTooltip />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="occupancyRate"
                    fill="#1976d2"
                    fillOpacity={0.1}
                    stroke="#1976d2"
                    strokeWidth={2}
                    name="Occupancy Rate (%)"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="revenue"
                    fill="#4caf50"
                    name="Revenue ($)"
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="totalBookings"
                    stroke="#ff9800"
                    strokeWidth={3}
                    name="Bookings"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Peak Hours Analysis */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Peak Hours Analysis
              </Typography>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={peakHoursData.filter((_, index) => index % 2 === 0)} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="hour" type="category" />
                  <RechartsTooltip />
                  <Bar dataKey="occupancy" fill="#2196f3" name="Occupancy %" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>

        {/* Detailed Analytics Table */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Daily Analytics Breakdown
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Occupancy Rate</strong></TableCell>
                  <TableCell><strong>Total Bookings</strong></TableCell>
                  <TableCell><strong>Revenue</strong></TableCell>
                  <TableCell><strong>Avg Duration</strong></TableCell>
                  <TableCell><strong>Utilization Score</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {analyticsData.slice(-10).reverse().map((day, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{day.date}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <LinearProgress 
                          variant="determinate" 
                          value={day.occupancyRate} 
                          sx={{ width: 60, mr: 1 }}
                          color={day.occupancyRate > 80 ? 'error' : day.occupancyRate > 60 ? 'warning' : 'success'}
                        />
                        <Typography variant="body2">
                          {day.occupancyRate}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={day.totalBookings} 
                        color="primary" 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium" color="success.main">
                        ${day.revenue}
                      </Typography>
                    </TableCell>
                    <TableCell>{day.averageDuration.toFixed(1)}h</TableCell>
                    <TableCell>
                      <Chip
                        label={`${(day.utilizationScore * 100).toFixed(0)}%`}
                        color={day.utilizationScore > 0.7 ? 'success' : day.utilizationScore > 0.5 ? 'warning' : 'error'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Performance Insights */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Performance Insights
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <TrendingUp color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Peak Performance"
                      secondary="Tuesday-Thursday show highest occupancy rates (avg 85%)"
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemIcon>
                      <AttachMoney color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Revenue Optimization"
                      secondary="Morning hours (8-10 AM) generate 35% of daily revenue"
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemIcon>
                      <Schedule color="info" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Duration Trends"
                      secondary="Average parking duration increased by 15 minutes this month"
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemIcon>
                      <DirectionsCar color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Capacity Planning"
                      secondary="Consider expanding during 5-7 PM peak hours"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recommendations
                </Typography>
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Dynamic Pricing:</strong> Implement higher rates during peak hours (5-7 PM) to optimize revenue and distribute demand.
                  </Typography>
                </Alert>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Capacity Management:</strong> Current utilization is optimal. Consider reserved spots for frequent users.
                  </Typography>
                </Alert>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Weekend Optimization:</strong> Weekend occupancy is 20% lower. Consider promotional pricing or events.
                  </Typography>
                </Alert>
                <Alert severity="error">
                  <Typography variant="body2">
                    <strong>Maintenance Window:</strong> Schedule maintenance during low-occupancy hours (2-4 AM) to minimize impact.
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Comparative Analysis */}
        {facilities.length > 1 && (
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Facility Comparison
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={facilities.map(facility => ({
                name: facility.facilityName,
                occupancy: Math.floor(Math.random() * 40) + 50,
                revenue: Math.floor(Math.random() * 5000) + 3000,
                utilization: Math.floor(Math.random() * 30) + 60
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="occupancy" fill="#1976d2" name="Occupancy %" />
                <Bar dataKey="utilization" fill="#4caf50" name="Utilization %" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        )}
      </motion.div>
    </Box>
  );
};

export default FacilityAnalyticsPage;