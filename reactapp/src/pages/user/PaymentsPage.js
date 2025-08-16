// pages/user/PaymentsPage.js
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Payment,
  Receipt,
  CreditCard,
  AccountBalance,
  Wallet,
  TrendingUp,
  AttachMoney,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { paymentAPI, bookingAPI } from '../../utils/api';
import { useAuth } from '../../App';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

const PaymentForm = ({ open, onClose, booking, onSuccess }) => {
  const [formData, setFormData] = useState({
    paymentMethod: 'CREDIT_CARD',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolderName: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const paymentData = {
        bookingId: booking.bookingId,
        amount: booking.totalCost,
        paymentMethod: formData.paymentMethod,
        status: 'COMPLETED',
        transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        gatewayResponse: 'Payment processed successfully',
      };

      await paymentAPI.create(paymentData);
      toast.success('Payment completed successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Process Payment</DialogTitle>
      <DialogContent>
        {booking && (
          <Box mb={3}>
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="h6" gutterBottom>
                Payment Summary
              </Typography>
              <Box display="flex" justifyContent="space-between">
                <Typography>Booking #{booking.bookingId}</Typography>
                <Typography fontWeight="bold">${booking.totalCost}</Typography>
              </Box>
            </Paper>
          </Box>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={formData.paymentMethod}
                  onChange={handleChange('paymentMethod')}
                  label="Payment Method"
                >
                  <MenuItem value="CREDIT_CARD">Credit Card</MenuItem>
                  <MenuItem value="DEBIT_CARD">Debit Card</MenuItem>
                  <MenuItem value="DIGITAL_WALLET">Digital Wallet</MenuItem>
                  <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {(formData.paymentMethod === 'CREDIT_CARD' || formData.paymentMethod === 'DEBIT_CARD') && (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Card Holder Name"
                    value={formData.cardHolderName}
                    onChange={handleChange('cardHolderName')}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Card Number"
                    value={formData.cardNumber}
                    onChange={handleChange('cardNumber')}
                    placeholder="1234 5678 9012 3456"
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Expiry Date"
                    value={formData.expiryDate}
                    onChange={handleChange('expiryDate')}
                    placeholder="MM/YY"
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="CVV"
                    value={formData.cvv}
                    onChange={handleChange('cvv')}
                    placeholder="123"
                    required
                  />
                </Grid>
              </>
            )}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Processing...' : `Pay $${booking?.totalCost}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const TransactionTable = ({ transactions, onViewReceipt }) => {
  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'CREDIT_CARD':
      case 'DEBIT_CARD':
        return <CreditCard />;
      case 'DIGITAL_WALLET':
        return <Wallet />;
      case 'BANK_TRANSFER':
        return <AccountBalance />;
      default:
        return <Payment />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'FAILED':
        return 'error';
      case 'REFUNDED':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Transaction ID</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Booking</TableCell>
            <TableCell>Method</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.map((transaction) => (
            <motion.tr
              key={transaction.paymentId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              component={TableRow}
            >
              <TableCell>
                <Typography variant="body2" fontFamily="monospace">
                  {transaction.transactionId}
                </Typography>
              </TableCell>
              <TableCell>
                {dayjs(transaction.paymentDate).format('MMM DD, YYYY')}
              </TableCell>
              <TableCell>
                Booking #{transaction.bookingId}
              </TableCell>
              <TableCell>
                <Box display="flex" alignItems="center">
                  {getPaymentMethodIcon(transaction.paymentMethod)}
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {transaction.paymentMethod.replace('_', ' ')}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight="bold">
                  ${transaction.amount}
                </Typography>
                {transaction.refundAmount > 0 && (
                  <Typography variant="caption" color="info.main" display="block">
                    Refunded: ${transaction.refundAmount}
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Chip
                  label={transaction.status}
                  color={getStatusColor(transaction.status)}
                  size="small"
                />
              </TableCell>
              <TableCell align="center">
                <Button
                  size="small"
                  startIcon={<Receipt />}
                  onClick={() => onViewReceipt(transaction)}
                >
                  Receipt
                </Button>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const PaymentsPage = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    totalSpent: 0,
    successfulPayments: 0,
    refundAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const [paymentsRes, bookingsRes] = await Promise.all([
        paymentAPI.getAll(),
        bookingAPI.getAll()
      ]);

      const userBookings = bookingsRes.data.filter(b => b.userId === user.id);
      const userPayments = paymentsRes.data.filter(p => 
        userBookings.some(b => b.bookingId === p.bookingId)
      );

      setPayments(userPayments.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate)));

      // Calculate stats
      const totalSpent = userPayments.reduce((sum, p) => sum + p.amount, 0);
      const successfulPayments = userPayments.filter(p => p.status === 'COMPLETED').length;
      const refundAmount = userPayments.reduce((sum, p) => sum + (p.refundAmount || 0), 0);

      setStats({
        totalSpent,
        successfulPayments,
        refundAmount,
      });
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const handleViewReceipt = (payment) => {
    // Mock receipt viewing
    toast.info('Receipt downloaded successfully');
  };

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Payment History
          </Typography>
          <Typography variant="body1" color="textSecondary">
            View your transaction history and download receipts
          </Typography>
        </Paper>
      </motion.div>

      {/* Payment Stats */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Spent
                  </Typography>
                  <Typography variant="h4" color="primary">
                    ${stats.totalSpent.toFixed(2)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <AttachMoney />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Successful Payments
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {stats.successfulPayments}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <TrendingUp />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Refunds
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    ${stats.refundAmount.toFixed(2)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <Receipt />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Transaction History */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography>Loading payments...</Typography>
        </Box>
      ) : payments.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Payment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              No payment history
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Your payment transactions will appear here.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TransactionTable
          transactions={payments}
          onViewReceipt={handleViewReceipt}
        />
      )}

      {/* Payment Form Dialog */}
      <PaymentForm
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        booking={selectedBooking}
        onSuccess={fetchPayments}
      />
    </Box>
  );
};
export default PaymentsPage;