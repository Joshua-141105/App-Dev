import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Tooltip,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Analytics,
  Assessment,
  GetApp,
  Refresh,
  DateRange,
  Business,
  LocalParking,
  AttachMoney,
  Schedule,
  Star,
  FilterList
} from '@mui/icons-material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { facilityAPI, analyticsAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const MetricCard = ({ title, value, trend, trendValue, icon, color = 'primary', subtitle }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold" color={`${color}.main`}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {subtitle}
            </Typography>
          )}
          {trend && (
            <Box display="flex" alignItems="center" mt={1}>
              {trend === 'up' ? (
                <TrendingUp color="success" sx={{ fontSize: 16, mr: 0.5 }} />
              ) : (
                <TrendingDown color="error" sx={{ fontSize: 16, mr: 0.5 }} />
              )}
              <Typography 
                variant="caption" 
                color={trend === 'up' ? 'success.main' : 'error.main'}
              >
                {trendValue}
              </Typography>
            </Box>
          )}
        </Box>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: `${color}.main`,
            color: 'white'
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const AnalyticsTable = ({ analytics, facilities }) => {
  const getFacilityName = (facilityId) => {
    const facility = facilities.find(f => f.facilityId === facilityId);
    return facility ? facility.facilityName : `Facility ${facilityId}`;
  };

  const getUtilizationChip = (score) => {
    if (score >= 0.8) return <Chip label="Excellent" color="success" size="small" />;
    if (score >= 0.6) return <Chip label="Good" color="primary" size="small" />;
    if (score >= 0.4) return <Chip label="Fair" color="warning" size="small" />;
    return <Chip label="Poor" color="error" size="small" />;
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'grey.50' }}>
            <TableCell><strong>Date</strong></TableCell>
            <TableCell><strong>Facility</strong></TableCell>
            <TableCell><strong>Bookings</strong></TableCell>
            <TableCell><strong>Occupancy Rate</strong></TableCell>
            <TableCell><strong>Revenue</strong></TableCell>
            <TableCell><strong>Avg. Duration (hrs)</strong></TableCell>
            <TableCell><strong>Peak Hours</strong></TableCell>
            <TableCell><strong>Utilization</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {analytics.map((item) => (
            <TableRow key={`${item.facilityId}-${item.date}`} hover>
              <TableCell>
                {dayjs(item.date).format('MMM DD, YYYY')}
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight="medium">
                  {getFacilityName(item.facilityId)}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {item.totalBookings}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {item.occupancyRate.toFixed(1)}%
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="success.main" fontWeight="medium">
                  ${item.revenue.toFixed(2)}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {item.averageBookingDuration.toFixed(1)}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {item.peakHours || 'N/A'}
                </Typography>
              </TableCell>
              <TableCell>
                {getUtilizationChip(item.utilizationScore)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const FacilityAnalyticsReportPage = () => {
  const [facilities, setFacilities] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [filteredAnalytics, setFilteredAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState('');
  const [startDate, setStartDate] = useState(dayjs().subtract(30, 'day'));
  const [endDate, setEndDate] = useState(dayjs());
  const [chartData, setChartData] = useState([]);
  const [facilityComparisonData, setFacilityComparisonData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterAndProcessData();
  }, [analytics, selectedFacility, startDate, endDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [facilitiesRes, analyticsRes] = await Promise.all([
        facilityAPI.getAll(),
        analyticsAPI.getAll()
      ]);
      setFacilities(facilitiesRes.data);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const filterAndProcessData = () => {
    let filtered = analytics;

    // Filter by facility
    if (selectedFacility) {
      filtered = filtered.filter(item => item.facilityId === parseInt(selectedFacility));
    }

    // Filter by date range
    if (startDate && endDate) {
      filtered = filtered.filter(item => {
        const itemDate = dayjs(item.date);
        return itemDate.isAfter(startDate.subtract(1, 'day')) && itemDate.isBefore(endDate.add(1, 'day'));
      });
    }

    setFilteredAnalytics(filtered);

    // Prepare chart data
    const chartData = filtered
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(item => ({
        date: dayjs(item.date).format('MMM DD'),
        occupancy: item.occupancyRate,
        revenue: item.revenue,
        bookings: item.totalBookings,
        utilization: item.utilizationScore * 100
      }));
    setChartData(chartData);

    // Prepare facility comparison data
    if (!selectedFacility) {
      const facilityStats = facilities.map(facility => {
        const facilityAnalytics = filtered.filter(item => item.facilityId === facility.facilityId);
        const totalRevenue = facilityAnalytics.reduce((sum, item) => sum + item.revenue, 0);
        const avgOccupancy = facilityAnalytics.length > 0 
          ? facilityAnalytics.reduce((sum, item) => sum + item.occupancyRate, 0) / facilityAnalytics.length
          : 0;
        const totalBookings = facilityAnalytics.reduce((sum, item) => sum + item.totalBookings, 0);

        return {
          name: facility.facilityName,
          revenue: totalRevenue,
          occupancy: avgOccupancy,
          bookings: totalBookings,
          city: facility.city
        };
      }).filter(item => item.revenue > 0 || item.bookings > 0);

      setFacilityComparisonData(facilityStats);
    }
  };

  const calculateSummaryStats = () => {
    if (filteredAnalytics.length === 0) {
      return {
        totalRevenue: 0,
        avgOccupancy: 0,
        totalBookings: 0,
        avgUtilization: 0,
        topFacility: 'N/A',
        peakDay: 'N/A'
      };
    }

    const totalRevenue = filteredAnalytics.reduce((sum, item) => sum + item.revenue, 0);
    const avgOccupancy = filteredAnalytics.reduce((sum, item) => sum + item.occupancyRate, 0) / filteredAnalytics.length;
    const totalBookings = filteredAnalytics.reduce((sum, item) => sum + item.totalBookings, 0);
    const avgUtilization = filteredAnalytics.reduce((sum, item) => sum + item.utilizationScore, 0) / filteredAnalytics.length;

    // Find top facility by revenue
    const facilityRevenues = facilities.map(facility => ({
      name: facility.facilityName,
      revenue: filteredAnalytics
        .filter(item => item.facilityId === facility.facilityId)
        .reduce((sum, item) => sum + item.revenue, 0)
    })).sort((a, b) => b.revenue - a.revenue);

    const topFacility = facilityRevenues.length > 0 ? facilityRevenues[0].name : 'N/A';

    // Find peak day
    const dayRevenues = {};
    filteredAnalytics.forEach(item => {
      const day = dayjs(item.date).format('YYYY-MM-DD');
      dayRevenues[day] = (dayRevenues[day] || 0) + item.revenue;
    });

    const peakDay = Object.entries(dayRevenues)
      .sort(([,a], [,b]) => b - a)[0]?.[0];
    
    return {
      totalRevenue,
      avgOccupancy,
      totalBookings,
      avgUtilization: avgUtilization * 100,
      topFacility,
      peakDay: peakDay ? dayjs(peakDay).format('MMM DD, YYYY') : 'N/A'
    };
  };

  const exportReport = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Date,Facility ID,Facility Name,Total Bookings,Occupancy Rate (%),Revenue ($),Average Duration (hrs),Peak Hours,Utilization Score\n" +
      filteredAnalytics.map(item => {
        const facilityName = facilities.find(f => f.facilityId === item.facilityId)?.facilityName || 'Unknown';
        return `${item.date},${item.facilityId},"${facilityName}",${item.totalBookings},${item.occupancyRate.toFixed(2)},${item.revenue.toFixed(2)},${item.averageBookingDuration.toFixed(2)},"${item.peakHours || ''}",${item.utilizationScore.toFixed(3)}`;
      }).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `facility_analytics_report_${dayjs().format('YYYY-MM-DD')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stats = calculateSummaryStats();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box>
              <Typography variant="h4" gutterBottom fontWeight="bold">
                Facility Analytics Report
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Comprehensive analytics and insights across all parking facilities
              </Typography>
            </Box>
            <Box display="flex" gap={2}>
              <Tooltip title="Export Report">
                <IconButton onClick={exportReport} color="primary">
                  <GetApp />
                </IconButton>
              </Tooltip>
              <Tooltip title="Refresh Data">
                <IconButton onClick={fetchData} color="primary">
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Filters */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Facility</InputLabel>
                  <Select
                    value={selectedFacility}
                    onChange={(e) => setSelectedFacility(e.target.value)}
                    label="Facility"
                  >
                    <MenuItem value="">All Facilities</MenuItem>
                    {facilities.map((facility) => (
                      <MenuItem key={facility.facilityId} value={facility.facilityId}>
                        {facility.facilityName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<FilterList />}
                  onClick={() => {
                    setSelectedFacility('');
                    setStartDate(dayjs().subtract(30, 'day'));
                    setEndDate(dayjs());
                  }}
                >
                  Reset Filters
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={2}>
              <MetricCard
                title="Total Revenue"
                value={`${stats.totalRevenue.toFixed(0)}`}
                icon={<AttachMoney />}
                color="success"
                subtitle="Current period"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <MetricCard
                title="Avg. Occupancy"
                value={`${stats.avgOccupancy.toFixed(1)}%`}
                icon={<LocalParking />}
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <MetricCard
                title="Total Bookings"
                value={stats.totalBookings.toLocaleString()}
                icon={<Assessment />}
                color="info"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <MetricCard
                title="Avg. Utilization"
                value={`${stats.avgUtilization.toFixed(1)}%`}
                icon={<TrendingUp />}
                color="warning"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <MetricCard
                title="Top Facility"
                value={stats.topFacility.length > 20 ? stats.topFacility.substring(0, 20) + '...' : stats.topFacility}
                icon={<Star />}
                color="secondary"
                subtitle="By revenue"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <MetricCard
                title="Peak Day"
                value={stats.peakDay}
                icon={<DateRange />}
                color="error"
                subtitle="Highest revenue"
              />
            </Grid>
          </Grid>

          {/* Charts */}
          {chartData.length > 0 ? (
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} lg={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Occupancy & Revenue Trends
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <RechartsTooltip />
                        <Legend />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="occupancy"
                          stroke="#8884d8"
                          name="Occupancy Rate (%)"
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="revenue"
                          stroke="#82ca9d"
                          name="Revenue ($)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} lg={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Daily Bookings
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="bookings" fill="#ffc658" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Alert severity="info" sx={{ mb: 3 }}>
              No data available for the selected filters. Try adjusting your date range or facility selection.
            </Alert>
          )}

          {/* Facility Comparison Chart */}
          {!selectedFacility && facilityComparisonData.length > 0 && (
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} lg={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Facility Performance Comparison
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={facilityComparisonData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <RechartsTooltip />
                        <Legend />
                        <Bar
                          yAxisId="left"
                          dataKey="revenue"
                          fill="#8884d8"
                          name="Revenue ($)"
                        />
                        <Bar
                          yAxisId="right"
                          dataKey="occupancy"
                          fill="#82ca9d"
                          name="Avg. Occupancy (%)"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} lg={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Revenue Distribution
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={facilityComparisonData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name.substring(0, 10)}... ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="revenue"
                        >
                          {facilityComparisonData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Analytics Table */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Detailed Analytics Data
              </Typography>
              {filteredAnalytics.length > 0 ? (
                <AnalyticsTable analytics={filteredAnalytics} facilities={facilities} />
              ) : (
                <Alert severity="info">
                  No analytics data available for the selected criteria.
                </Alert>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </Box>
    </LocalizationProvider>
  );
};

export default FacilityAnalyticsReportPage;