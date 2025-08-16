// pages/admin/FinancialReportsPage.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  Receipt,
  AccountBalance,
  GetApp,
  Print,
  DateRange,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Timeline,
  MonetizationOn,
  CreditCard,
  Undo as Refund,
  Warning
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
  ComposedChart
} from 'recharts';
import { motion } from 'framer-motion';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { paymentAPI, facilityAPI } from '../../utils/api';
import { toast } from 'react-toastify';

const FinancialReportsPage = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [dateRange, setDateRange] = useState('month');
  const [startDate, setStartDate] = useState(dayjs().subtract(30, 'day'));
  const [endDate, setEndDate] = useState(dayjs());
  const [selectedFacility, setSelectedFacility] = useState('all');
  const [loading, setLoading] = useState(true);
  
  // Financial data states
  const [revenueData, setRevenueData] = useState([]);
  const [paymentMethodData, setPaymentMethodData] = useState([]);
  const [facilityRevenueData, setFacilityRevenueData] = useState([]);
  const [transactionData, setTransactionData] = useState([]);
  const [kpiData, setKpiData] = useState({});
  const [facilities, setFacilities] = useState([]);

  useEffect(() => {
    fetchFinancialData();
    fetchFacilities();
  }, [dateRange, startDate, endDate, selectedFacility]);

  const fetchFacilities = async () => {
    try {
      const response = await facilityAPI.getAll();
      setFacilities(response.data);
    } catch (error) {
      console.error('Error fetching facilities:', error);
    }
  };

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      
      // Generate mock financial data
      const days = endDate.diff(startDate, 'day');
      const mockRevenueData = [];
      const mockTransactions = [];
      
      for (let i = 0; i <= days; i++) {
        const date = startDate.add(i, 'day');
        const baseRevenue = Math.random() * 5000 + 2000;
        const refunds = Math.random() * 500 + 100;
        const transactions = Math.floor(Math.random() * 50) + 20;
        
        mockRevenueData.push({
          date: date.format('MMM DD'),
          fullDate: date.format('YYYY-MM-DD'),
          revenue: Math.round(baseRevenue),
          refunds: Math.round(refunds),
          netRevenue: Math.round(baseRevenue - refunds),
          transactions: transactions,
          averageValue: Math.round(baseRevenue / transactions)
        });

        // Generate individual transactions
        for (let j = 0; j < Math.floor(transactions / 5); j++) {
          mockTransactions.push({
            id: `txn_${i}_${j}`,
            date: date.toISOString(),
            amount: Math.round(Math.random() * 100 + 10),
            method: ['Credit Card', 'Debit Card', 'Digital Wallet', 'Cash'][Math.floor(Math.random() * 4)],
            facility: facilities[Math.floor(Math.random() * Math.max(1, facilities.length))]?.facilityName || 'Downtown Parking',
            status: Math.random() > 0.05 ? 'Completed' : 'Failed',
            type: Math.random() > 0.1 ? 'Payment' : 'Refund'
          });
        }
      }

      setRevenueData(mockRevenueData);
      setTransactionData(mockTransactions);

      // Payment method distribution
      const paymentMethods = mockTransactions.reduce((acc, txn) => {
        if (txn.status === 'Completed') {
          acc[txn.method] = (acc[txn.method] || 0) + txn.amount;
        }
        return acc;
      }, {});

      const paymentMethodChartData = Object.entries(paymentMethods).map(([method, amount]) => ({
        name: method,
        value: amount,
        count: mockTransactions.filter(t => t.method === method && t.status === 'Completed').length
      }));

      setPaymentMethodData(paymentMethodChartData);

      // Facility revenue data
      const facilityRevenue = facilities.map(facility => ({
        name: facility.facilityName,
        revenue: Math.round(Math.random() * 50000 + 20000),
        transactions: Math.floor(Math.random() * 500 + 200),
        occupancyRate: Math.round(Math.random() * 40 + 60)
      }));

      setFacilityRevenueData(facilityRevenue);

      // Calculate KPIs
      const totalRevenue = mockRevenueData.reduce((sum, day) => sum + day.revenue, 0);
      const totalRefunds = mockRevenueData.reduce((sum, day) => sum + day.refunds, 0);
      const totalTransactions = mockTransactions.filter(t => t.status === 'Completed').length;
      const failedTransactions = mockTransactions.filter(t => t.status === 'Failed').length;
      
      setKpiData({
        totalRevenue,
        totalRefunds,
        netRevenue: totalRevenue - totalRefunds,
        totalTransactions,
        failedTransactions,
        successRate: ((totalTransactions / (totalTransactions + failedTransactions)) * 100).toFixed(1),
        averageTransactionValue: Math.round(totalRevenue / Math.max(1, totalTransactions)),
        revenueGrowth: Math.random() * 20 - 5 // Random growth between -5% and 15%
      });

    } catch (error) {
      console.error('Error fetching financial data:', error);
      toast.error('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    const now = dayjs();
    
    switch (range) {
      case 'week':
        setStartDate(now.subtract(7, 'day'));
        setEndDate(now);
        break;
      case 'month':
        setStartDate(now.subtract(30, 'day'));
        setEndDate(now);
        break;
      case 'quarter':
        setStartDate(now.subtract(90, 'day'));
        setEndDate(now);
        break;
      case 'year':
        setStartDate(now.subtract(365, 'day'));
        setEndDate(now);
        break;
      default:
        break;
    }
  };

  const exportReport = (format) => {
    if (format === 'csv') {
      const csvContent = "data:text/csv;charset=utf-8," + 
        "Date,Revenue,Refunds,Net Revenue,Transactions\n" +
        revenueData.map(row => 
          `${row.fullDate},${row.revenue},${row.refunds},${row.netRevenue},${row.transactions}`
        ).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `financial_report_${dayjs().format('YYYY-MM-DD')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.print();
    }
    toast.success(`Report exported as ${format.toUpperCase()}`);
  };

  const KPICard = ({ title, value, subtitle, icon: Icon, trend, color = 'primary' }) => (
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

  const OverviewTab = () => (
    <Box>
      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Total Revenue"
            value={`$${kpiData.totalRevenue?.toLocaleString()}`}
            subtitle={`${kpiData.totalTransactions} transactions`}
            icon={AttachMoney}
            trend={kpiData.revenueGrowth}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Net Revenue"
            value={`$${kpiData.netRevenue?.toLocaleString()}`}
            subtitle={`After $${kpiData.totalRefunds?.toLocaleString()} refunds`}
            icon={MonetizationOn}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Avg Transaction"
            value={`$${kpiData.averageTransactionValue}`}
            subtitle={`${kpiData.successRate}% success rate`}
            icon={Receipt}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Failed Payments"
            value={kpiData.failedTransactions}
            subtitle={`${((kpiData.failedTransactions / Math.max(1, kpiData.totalTransactions + kpiData.failedTransactions)) * 100).toFixed(1)}% failure rate`}
            icon={Warning}
            color="error"
          />
        </Grid>
      </Grid>

      {/* Revenue Trend Chart */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Revenue Trend
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <ComposedChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <RechartsTooltip formatter={(value, name) => [`$${value}`, name]} />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  fill="#1976d2"
                  fillOpacity={0.1}
                  stroke="#1976d2"
                  strokeWidth={2}
                  name="Revenue"
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="refunds"
                  fill="#f44336"
                  fillOpacity={0.1}
                  stroke="#f44336"
                  strokeWidth={2}
                  name="Refunds"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="transactions"
                  stroke="#ff9800"
                  strokeWidth={3}
                  name="Transactions"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Payment Methods
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={['#1976d2', '#ff9800', '#4caf50', '#9c27b0'][index % 4]} 
                    />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value) => [`$${value}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Top Performing Facilities */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Facility Performance
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={facilityRevenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            <Bar dataKey="revenue" fill="#1976d2" name="Revenue ($)" />
            <Bar dataKey="transactions" fill="#ff9800" name="Transactions" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );

  const TransactionsTab = () => (
    <Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell><strong>Transaction ID</strong></TableCell>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell><strong>Amount</strong></TableCell>
              <TableCell><strong>Method</strong></TableCell>
              <TableCell><strong>Facility</strong></TableCell>
              <TableCell><strong>Type</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactionData.slice(0, 50).map((transaction) => (
              <TableRow key={transaction.id} hover>
                <TableCell sx={{ fontFamily: 'monospace' }}>
                  {transaction.id}
                </TableCell>
                <TableCell>
                  {dayjs(transaction.date).format('MMM DD, YYYY HH:mm')}
                </TableCell>
                <TableCell>
                  <Typography 
                    color={transaction.type === 'Refund' ? 'error.main' : 'success.main'}
                    fontWeight="medium"
                  >
                    {transaction.type === 'Refund' ? '-' : ''}${transaction.amount}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <CreditCard sx={{ mr: 1, fontSize: 16 }} />
                    {transaction.method}
                  </Box>
                </TableCell>
                <TableCell>{transaction.facility}</TableCell>
                <TableCell>
                  <Chip
                    label={transaction.type}
                    color={transaction.type === 'Refund' ? 'warning' : 'primary'}
                    size="small"
                    icon={transaction.type === 'Refund' ? <Refund /> : <MonetizationOn />}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={transaction.status}
                    color={transaction.status === 'Completed' ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const RefundsTab = () => {
    const refundData = transactionData.filter(t => t.type === 'Refund');
    const refundsByReason = refundData.reduce((acc, refund) => {
      const reasons = ['Cancellation', 'System Error', 'Customer Request', 'Overcharge'];
      const reason = reasons[Math.floor(Math.random() * reasons.length)];
      acc[reason] = (acc[reason] || 0) + refund.amount;
      return acc;
    }, {});

    const refundChartData = Object.entries(refundsByReason).map(([reason, amount]) => ({
      name: reason,
      amount: amount,
      count: refundData.filter(() => Math.random() > 0.5).length
    }));

    return (
      <Box>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Refunds
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="error.main">
                  ${kpiData.totalRefunds?.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {refundData.length} transactions
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Refund Rate
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  {((refundData.length / Math.max(1, transactionData.length)) * 100).toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Of total transactions
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Avg Refund Amount
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="info.main">
                  ${Math.round(kpiData.totalRefunds / Math.max(1, refundData.length))}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Per refund transaction
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: 350 }}>
              <Typography variant="h6" gutterBottom>
                Refund Reasons
              </Typography>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={refundChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="amount" fill="#f44336" name="Amount ($)" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: 350 }}>
              <Typography variant="h6" gutterBottom>
                Recent Refunds
              </Typography>
              <List sx={{ maxHeight: 280, overflow: 'auto' }}>
                {refundData.slice(0, 10).map((refund, index) => (
                  <ListItem key={index} divider>
                    <ListItemIcon>
                      <Refund color="error" />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${refund.amount} - ${refund.facility}`}
                      secondary={`${dayjs(refund.date).format('MMM DD, YYYY HH:mm')} • ${refund.method}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>

        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell><strong>Refund ID</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Amount</strong></TableCell>
                <TableCell><strong>Reason</strong></TableCell>
                <TableCell><strong>Facility</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {refundData.slice(0, 20).map((refund, index) => {
                const reasons = ['Cancellation', 'System Error', 'Customer Request', 'Overcharge'];
                const reason = reasons[Math.floor(Math.random() * reasons.length)];
                
                return (
                  <TableRow key={index} hover>
                    <TableCell sx={{ fontFamily: 'monospace' }}>
                      {refund.id}
                    </TableCell>
                    <TableCell>
                      {dayjs(refund.date).format('MMM DD, YYYY HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Typography color="error.main" fontWeight="medium">
                        ${refund.amount}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={reason} color="warning" size="small" />
                    </TableCell>
                    <TableCell>{refund.facility}</TableCell>
                    <TableCell>
                      <Chip label="Processed" color="success" size="small" />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const AnalyticsTab = () => {
    const monthlyTrends = revenueData.reduce((acc, day, index) => {
      const weekIndex = Math.floor(index / 7);
      const weekKey = `Week ${weekIndex + 1}`;
      
      if (!acc[weekKey]) {
        acc[weekKey] = { week: weekKey, revenue: 0, transactions: 0, refunds: 0 };
      }
      
      acc[weekKey].revenue += day.revenue;
      acc[weekKey].transactions += day.transactions;
      acc[weekKey].refunds += day.refunds;
      
      return acc;
    }, {});

    const weeklyData = Object.values(monthlyTrends);

    return (
      <Box>
        {/* Performance Metrics */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h6">Revenue Growth</Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {kpiData.revenueGrowth?.toFixed(1)}%
                    </Typography>
                  </Box>
                  <TrendingUp sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h6">Peak Revenue Day</Typography>
                    <Typography variant="h4" fontWeight="bold">
                      ${Math.max(...revenueData.map(d => d.revenue)).toLocaleString()}
                    </Typography>
                  </Box>
                  <BarChartIcon sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h6">Transaction Volume</Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {kpiData.totalTransactions?.toLocaleString()}
                    </Typography>
                  </Box>
                  <Receipt sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h6">Success Rate</Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {kpiData.successRate}%
                    </Typography>
                  </Box>
                  <Timeline sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Weekly Trends */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Weekly Performance Trends
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <RechartsTooltip />
              <Legend />
              <Line 
                yAxisId="left" 
                type="monotone" 
                dataKey="revenue" 
                stroke="#1976d2" 
                strokeWidth={3}
                name="Revenue ($)"
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="transactions" 
                stroke="#ff9800" 
                strokeWidth={3}
                name="Transactions"
              />
            </LineChart>
          </ResponsiveContainer>
        </Paper>

        {/* Revenue Distribution by Hour */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Revenue Distribution Analysis
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Peak Revenue Hours
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="9:00 AM - 11:00 AM"
                    secondary="Morning rush - 25% of daily revenue"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="5:00 PM - 7:00 PM"
                    secondary="Evening rush - 30% of daily revenue"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="12:00 PM - 2:00 PM"
                    secondary="Lunch hours - 20% of daily revenue"
                  />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Revenue Insights
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <TrendingUp color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Weekend Performance"
                    secondary="+15% higher than weekdays"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <MonetizationOn color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Digital Payments"
                    secondary="85% of total transactions"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <AccountBalance color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Average Session"
                    secondary="2.5 hours parking duration"
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </Paper>

        {/* Financial Forecast */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Financial Forecast
          </Typography>
          <Typography variant="body2">
            Based on current trends, projected revenue for next month: <strong>${Math.round(kpiData.totalRevenue * 1.1).toLocaleString()}</strong>
            <br />
            Expected growth: <strong>+{((kpiData.revenueGrowth || 5) + 2).toFixed(1)}%</strong> compared to current period
          </Typography>
        </Alert>
      </Box>
    );
  };

  const tabComponents = [
    <OverviewTab />,
    <TransactionsTab />,
    <RefundsTab />,
    <AnalyticsTab />
  ];

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
              Financial Reports
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Comprehensive financial analytics and reporting
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<Print />}
              onClick={() => exportReport('pdf')}
            >
              Print
            </Button>
            <Button
              variant="contained"
              startIcon={<GetApp />}
              onClick={() => exportReport('csv')}
            >
              Export CSV
            </Button>
          </Box>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Date Range</InputLabel>
                <Select
                  value={dateRange}
                  onChange={(e) => handleDateRangeChange(e.target.value)}
                  label="Date Range"
                >
                  <MenuItem value="week">Last 7 Days</MenuItem>
                  <MenuItem value="month">Last 30 Days</MenuItem>
                  <MenuItem value="quarter">Last 90 Days</MenuItem>
                  <MenuItem value="year">Last Year</MenuItem>
                  <MenuItem value="custom">Custom Range</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {dateRange === 'custom' && (
              <>
                <Grid item xs={12} md={3}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Start Date"
                      value={startDate}
                      onChange={(newValue) => setStartDate(newValue)}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} md={3}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="End Date"
                      value={endDate}
                      onChange={(newValue) => setEndDate(newValue)}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </LocalizationProvider>
                </Grid>
              </>
            )}

            <Grid item xs={12} md={3}>
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
          </Grid>
        </Paper>

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={currentTab}
            onChange={(e, newValue) => setCurrentTab(newValue)}
            variant="fullWidth"
          >
            <Tab label="Overview" icon={<BarChartIcon />} />
            <Tab label="Transactions" icon={<Receipt />} />
            <Tab label="Refunds" icon={<Refund />} />
            <Tab label="Analytics" icon={<Timeline />} />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        <Box sx={{ mt: 3 }}>
          {tabComponents[currentTab]}
        </Box>
      </motion.div>
    </Box>
  );
};

export default FinancialReportsPage;