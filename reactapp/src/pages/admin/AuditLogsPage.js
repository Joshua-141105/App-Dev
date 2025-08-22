// pages/admin/AuditLogsPage.js
import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Pagination,
    InputAdornment,
    Tooltip,
    Alert,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider
} from '@mui/material';
import {
    Search,
    FilterList,
    GetApp,
    Visibility,
    Security,
    Person,
    Payment,
    DirectionsCar,
    Settings,
    Warning,
    Error,
    Info,
    CheckCircle,
    ExpandMore,
    Schedule,
    Computer,
    VpnKey
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';

const AuditLogsPage = () => {
    const MotionTableRow = motion(TableRow);
    const [auditLogs, setAuditLogs] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [actionFilter, setActionFilter] = useState('');
    const [severityFilter, setSeverityFilter] = useState('');
    const [userFilter, setUserFilter] = useState('');
    const [startDate, setStartDate] = useState(dayjs().subtract(7, 'day'));
    const [endDate, setEndDate] = useState(dayjs());
    const [selectedLog, setSelectedLog] = useState(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage] = useState(25);

    useEffect(() => {
        generateMockAuditLogs();
    }, []);

    useEffect(() => {
        filterLogs();
    }, [auditLogs, searchQuery, actionFilter, severityFilter, userFilter, startDate, endDate]);

    const generateMockAuditLogs = () => {
        const actions = [
            'USER_LOGIN', 'USER_LOGOUT', 'USER_CREATED', 'USER_UPDATED', 'USER_DELETED',
            'BOOKING_CREATED', 'BOOKING_CANCELLED', 'BOOKING_UPDATED',
            'PAYMENT_PROCESSED', 'PAYMENT_FAILED', 'PAYMENT_REFUNDED',
            'SLOT_CREATED', 'SLOT_UPDATED', 'SLOT_DELETED',
            'FACILITY_CREATED', 'FACILITY_UPDATED',
            'SYSTEM_CONFIG_CHANGED', 'DATABASE_BACKUP', 'PASSWORD_RESET',
            'ACCESS_DENIED', 'SECURITY_BREACH_ATTEMPT', 'API_RATE_LIMIT_EXCEEDED'
        ];

        const severities = ['INFO', 'WARNING', 'ERROR', 'CRITICAL'];
        const users = ['admin@parking.com', 'manager@parking.com', 'security@parking.com', 'system'];
        const ipAddresses = ['192.168.1.100', '192.168.1.101', '10.0.0.50', '172.16.0.10'];

        const logs = [];
        for (let i = 0; i < 150; i++) {
            const timestamp = dayjs().subtract(Math.floor(Math.random() * 7), 'day')
                .subtract(Math.floor(Math.random() * 24), 'hour')
                .subtract(Math.floor(Math.random() * 60), 'minute');

            const action = actions[Math.floor(Math.random() * actions.length)];
            const severity = severities[Math.floor(Math.random() * severities.length)];
            const user = users[Math.floor(Math.random() * users.length)];
            const ipAddress = ipAddresses[Math.floor(Math.random() * ipAddresses.length)];

            logs.push({
                id: i + 1,
                timestamp: timestamp.toISOString(),
                action,
                severity,
                user,
                ipAddress,
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                resource: getResourceForAction(action),
                description: getDescriptionForAction(action),
                details: generateLogDetails(action),
                sessionId: `session_${Math.random().toString(36).substr(2, 9)}`,
                requestId: `req_${Math.random().toString(36).substr(2, 12)}`
            });
        }

        setAuditLogs(logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
        setLoading(false);
    };

    const getResourceForAction = (action) => {
        const resourceMap = {
            'USER_LOGIN': '/api/auth/login',
            'USER_LOGOUT': '/api/auth/logout',
            'USER_CREATED': '/api/users',
            'USER_UPDATED': '/api/users/{id}',
            'USER_DELETED': '/api/users/{id}',
            'BOOKING_CREATED': '/api/bookings',
            'BOOKING_CANCELLED': '/api/bookings/{id}/cancel',
            'BOOKING_UPDATED': '/api/bookings/{id}',
            'PAYMENT_PROCESSED': '/api/payments',
            'PAYMENT_FAILED': '/api/payments/{id}',
            'PAYMENT_REFUNDED': '/api/payments/{id}/refund',
            'SLOT_CREATED': '/api/parking-slots',
            'SLOT_UPDATED': '/api/parking-slots/{id}',
            'SLOT_DELETED': '/api/parking-slots/{id}',
            'FACILITY_CREATED': '/api/facilities',
            'FACILITY_UPDATED': '/api/facilities/{id}',
            'SYSTEM_CONFIG_CHANGED': '/admin/config',
            'DATABASE_BACKUP': '/admin/backup',
            'PASSWORD_RESET': '/api/auth/reset-password',
            'ACCESS_DENIED': '/api/**',
            'SECURITY_BREACH_ATTEMPT': '/api/auth/**',
            'API_RATE_LIMIT_EXCEEDED': '/api/**'
        };
        return resourceMap[action] || '/api/unknown';
    };

    const getDescriptionForAction = (action) => {
        const descriptions = {
            'USER_LOGIN': 'User successfully logged into the system',
            'USER_LOGOUT': 'User logged out of the system',
            'USER_CREATED': 'New user account created',
            'USER_UPDATED': 'User account information updated',
            'USER_DELETED': 'User account deleted from system',
            'BOOKING_CREATED': 'New parking slot booking created',
            'BOOKING_CANCELLED': 'Parking slot booking cancelled',
            'BOOKING_UPDATED': 'Parking slot booking details updated',
            'PAYMENT_PROCESSED': 'Payment transaction completed successfully',
            'PAYMENT_FAILED': 'Payment transaction failed',
            'PAYMENT_REFUNDED': 'Payment refunded to customer',
            'SLOT_CREATED': 'New parking slot added to facility',
            'SLOT_UPDATED': 'Parking slot information updated',
            'SLOT_DELETED': 'Parking slot removed from facility',
            'FACILITY_CREATED': 'New parking facility created',
            'FACILITY_UPDATED': 'Parking facility information updated',
            'SYSTEM_CONFIG_CHANGED': 'System configuration settings modified',
            'DATABASE_BACKUP': 'Database backup operation completed',
            'PASSWORD_RESET': 'User password reset initiated',
            'ACCESS_DENIED': 'Unauthorized access attempt blocked',
            'SECURITY_BREACH_ATTEMPT': 'Potential security breach detected',
            'API_RATE_LIMIT_EXCEEDED': 'API rate limit exceeded for user'
        };
        return descriptions[action] || 'Unknown system action';
    };

    const generateLogDetails = (action) => {
        const baseDetails = {
            httpMethod: ['GET', 'POST', 'PUT', 'DELETE'][Math.floor(Math.random() * 4)],
            responseCode: action.includes('FAILED') || action.includes('DENIED') ? 400 : 200,
            responseTime: Math.floor(Math.random() * 1000) + 50,
            requestSize: Math.floor(Math.random() * 5000) + 100,
            responseSize: Math.floor(Math.random() * 10000) + 500
        };

        if (action.includes('USER')) {
            return {
                ...baseDetails,
                userId: Math.floor(Math.random() * 1000) + 1,
                affectedFields: ['email', 'role', 'status']
            };
        }

        if (action.includes('BOOKING')) {
            return {
                ...baseDetails,
                bookingId: Math.floor(Math.random() * 10000) + 1,
                slotId: Math.floor(Math.random() * 100) + 1,
                amount: Math.floor(Math.random() * 100) + 10
            };
        }

        if (action.includes('PAYMENT')) {
            return {
                ...baseDetails,
                paymentId: Math.floor(Math.random() * 10000) + 1,
                amount: Math.floor(Math.random() * 100) + 10,
                gateway: 'stripe'
            };
        }

        return baseDetails;
    };

    const filterLogs = () => {
        let filtered = auditLogs;

        // Date range filter
        filtered = filtered.filter(log => {
            const logDate = dayjs(log.timestamp);
            return logDate.isAfter(startDate) && logDate.isBefore(endDate.add(1, 'day'));
        });

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(log =>
                log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                log.resource.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Action filter
        if (actionFilter) {
            filtered = filtered.filter(log => log.action === actionFilter);
        }

        // Severity filter
        if (severityFilter) {
            filtered = filtered.filter(log => log.severity === severityFilter);
        }

        // User filter
        if (userFilter) {
            filtered = filtered.filter(log => log.user === userFilter);
        }

        setFilteredLogs(filtered);
        setPage(0);
    };

    const getActionIcon = (action) => {
        if (action.includes('USER')) return <Person />;
        if (action.includes('BOOKING')) return <DirectionsCar />;
        if (action.includes('PAYMENT')) return <Payment />;
        if (action.includes('SECURITY') || action.includes('ACCESS')) return <Security />;
        if (action.includes('SYSTEM') || action.includes('CONFIG')) return <Settings />;
        return <Info />;
    };

    const getSeverityIcon = (severity) => {
        switch (severity) {
            case 'INFO': return <Info color="info" />;
            case 'WARNING': return <Warning color="warning" />;
            case 'ERROR': return <Error color="error" />;
            case 'CRITICAL': return <Error color="error" />;
            default: return <Info />;
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'INFO': return 'info';
            case 'WARNING': return 'warning';
            case 'ERROR': return 'error';
            case 'CRITICAL': return 'error';
            default: return 'default';
        }
    };

    const exportLogs = () => {
        const csvContent = "data:text/csv;charset=utf-8," +
            "Timestamp,Action,Severity,User,IP Address,Resource,Description\n" +
            filteredLogs.map(log =>
                `${dayjs(log.timestamp).format('YYYY-MM-DD HH:mm:ss')},${log.action},${log.severity},${log.user},${log.ipAddress},${log.resource},"${log.description}"`
            ).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `audit_logs_${dayjs().format('YYYY-MM-DD')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Audit logs exported successfully');
    };

    const LogDetailDialog = ({ log, open, onClose }) => {
        if (!log) return null;

        return (
            <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Box display="flex" alignItems="center">
                        {getActionIcon(log.action)}
                        <Typography variant="h6" sx={{ ml: 1 }}>
                            Audit Log Details
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" gutterBottom>
                                Basic Information
                            </Typography>
                            <List dense>
                                <ListItem>
                                    <ListItemIcon><Schedule /></ListItemIcon>
                                    <ListItemText
                                        primary="Timestamp"
                                        secondary={dayjs(log.timestamp).format('YYYY-MM-DD HH:mm:ss')}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>{getActionIcon(log.action)}</ListItemIcon>
                                    <ListItemText
                                        primary="Action"
                                        secondary={log.action}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>{getSeverityIcon(log.severity)}</ListItemIcon>
                                    <ListItemText
                                        primary="Severity"
                                        secondary={log.severity}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><Person /></ListItemIcon>
                                    <ListItemText
                                        primary="User"
                                        secondary={log.user}
                                    />
                                </ListItem>
                            </List>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" gutterBottom>
                                Request Information
                            </Typography>
                            <List dense>
                                <ListItem>
                                    <ListItemIcon><Computer /></ListItemIcon>
                                    <ListItemText
                                        primary="IP Address"
                                        secondary={log.ipAddress}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><VpnKey /></ListItemIcon>
                                    <ListItemText
                                        primary="Session ID"
                                        secondary={log.sessionId}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><Info /></ListItemIcon>
                                    <ListItemText
                                        primary="Request ID"
                                        secondary={log.requestId}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText
                                        primary="Resource"
                                        secondary={log.resource}
                                    />
                                </ListItem>
                            </List>
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="subtitle2" gutterBottom>
                                Description
                            </Typography>
                            <Typography variant="body2" paragraph>
                                {log.description}
                            </Typography>
                        </Grid>

                        <Grid item xs={12}>
                            <Accordion>
                                <AccordionSummary expandIcon={<ExpandMore />}>
                                    <Typography variant="subtitle2">Technical Details</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">
                                                <strong>HTTP Method:</strong> {log.details.httpMethod}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">
                                                <strong>Response Code:</strong> {log.details.responseCode}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">
                                                <strong>Response Time:</strong> {log.details.responseTime}ms
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">
                                                <strong>Request Size:</strong> {log.details.requestSize} bytes
                                            </Typography>
                                        </Grid>
                                        {log.details.userId && (
                                            <Grid item xs={6}>
                                                <Typography variant="body2">
                                                    <strong>User ID:</strong> {log.details.userId}
                                                </Typography>
                                            </Grid>
                                        )}
                                        {log.details.bookingId && (
                                            <Grid item xs={6}>
                                                <Typography variant="body2">
                                                    <strong>Booking ID:</strong> {log.details.bookingId}
                                                </Typography>
                                            </Grid>
                                        )}
                                    </Grid>
                                </AccordionDetails>
                            </Accordion>
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom>
                                User Agent
                            </Typography>
                            <Typography variant="body2" sx={{
                                bgcolor: 'grey.100',
                                p: 1,
                                borderRadius: 1,
                                fontFamily: 'monospace',
                                fontSize: '0.8rem'
                            }}>
                                {log.userAgent}
                            </Typography>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Close</Button>
                </DialogActions>
            </Dialog>
        );
    };

    const displayedLogs = filteredLogs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Box sx={{ p: 3 }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Box>
                        <Typography variant="h4" gutterBottom fontWeight="bold">
                            Audit Logs
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                            Comprehensive system activity and security logs
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<GetApp />}
                        onClick={exportLogs}
                    >
                        Export Logs
                    </Button>
                </Box>

                {/* Statistics */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Failed Operations
                                </Typography>
                                <Typography variant="h4" fontWeight="bold" color="error.main">
                                    {filteredLogs.filter(log => log.action.includes('FAILED') || log.action.includes('DENIED')).length}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Filters */}
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Filter Logs
                    </Typography>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={2}>
                            <TextField
                                fullWidth
                                placeholder="Search logs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth>
                                <InputLabel>Action</InputLabel>
                                <Select
                                    value={actionFilter}
                                    onChange={(e) => setActionFilter(e.target.value)}
                                    label="Action"
                                >
                                    <MenuItem value="">All Actions</MenuItem>
                                    <MenuItem value="USER_LOGIN">User Login</MenuItem>
                                    <MenuItem value="USER_LOGOUT">User Logout</MenuItem>
                                    <MenuItem value="BOOKING_CREATED">Booking Created</MenuItem>
                                    <MenuItem value="PAYMENT_PROCESSED">Payment Processed</MenuItem>
                                    <MenuItem value="ACCESS_DENIED">Access Denied</MenuItem>
                                    <MenuItem value="SECURITY_BREACH_ATTEMPT">Security Breach</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth>
                                <InputLabel>Severity</InputLabel>
                                <Select
                                    value={severityFilter}
                                    onChange={(e) => setSeverityFilter(e.target.value)}
                                    label="Severity"
                                >
                                    <MenuItem value="">All Severities</MenuItem>
                                    <MenuItem value="INFO">Info</MenuItem>
                                    <MenuItem value="WARNING">Warning</MenuItem>
                                    <MenuItem value="ERROR">Error</MenuItem>
                                    <MenuItem value="CRITICAL">Critical</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={2}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateTimePicker
                                    label="Start Date"
                                    value={startDate}
                                    onChange={(newValue) => setStartDate(newValue)}
                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                />
                            </LocalizationProvider>
                        </Grid>

                        <Grid item xs={12} md={2}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateTimePicker
                                    label="End Date"
                                    value={endDate}
                                    onChange={(newValue) => setEndDate(newValue)}
                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                />
                            </LocalizationProvider>
                        </Grid>

                        <Grid item xs={12} md={2}>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<FilterList />}
                                onClick={() => {
                                    setSearchQuery('');
                                    setActionFilter('');
                                    setSeverityFilter('');
                                    setUserFilter('');
                                    setStartDate(dayjs().subtract(7, 'day'));
                                    setEndDate(dayjs());
                                }}
                            >
                                Clear
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Alert for security events */}
                {filteredLogs.some(log => log.severity === 'CRITICAL' || log.action.includes('SECURITY')) && (
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        <Typography variant="body2">
                            Security events detected in the current view. Please review carefully.
                        </Typography>
                    </Alert>
                )}

                {/* Audit Logs Table */}
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                                <TableCell><strong>Timestamp</strong></TableCell>
                                <TableCell><strong>Action</strong></TableCell>
                                <TableCell><strong>Severity</strong></TableCell>
                                <TableCell><strong>User</strong></TableCell>
                                <TableCell><strong>IP Address</strong></TableCell>
                                <TableCell><strong>Resource</strong></TableCell>
                                <TableCell><strong>Actions</strong></TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {displayedLogs.map((log, index) => (
                                <MotionTableRow
                                    key={log.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    hover
                                    sx={{
                                        bgcolor:
                                            log.severity === 'CRITICAL'
                                                ? 'error.light'
                                                : log.severity === 'ERROR'
                                                    ? 'warning.light'
                                                    : 'inherit',
                                    }}
                                >
                                    {/* Timestamp */}
                                    <TableCell>
                                        <Typography variant="body2">
                                            {dayjs(log.timestamp).format('MMM DD, YYYY')}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            {dayjs(log.timestamp).format('HH:mm:ss')}
                                        </Typography>
                                    </TableCell>

                                    {/* Action */}
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            {getActionIcon(log.action)}
                                            <Typography variant="body2">{log.action}</Typography>
                                        </Box>
                                    </TableCell>

                                    {/* Severity */}
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            {getSeverityIcon(log.severity)}
                                            <Typography variant="body2">{log.severity}</Typography>
                                        </Box>
                                    </TableCell>

                                    {/* User */}
                                    <TableCell>
                                        <Typography variant="body2">{log.user}</Typography>
                                    </TableCell>

                                    {/* IP Address */}
                                    <TableCell>
                                        <Typography variant="body2">
                                            {log.details?.ipAddress || '—'}
                                        </Typography>
                                    </TableCell>

                                    {/* Resource */}
                                    <TableCell>
                                        <Typography variant="body2">
                                            {log.details?.resource || '—'}
                                        </Typography>
                                    </TableCell>

                                    {/* Actions */}
                                    <TableCell>
                                        <Tooltip title="View Details">
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    setSelectedLog(log);
                                                    setDetailDialogOpen(true);
                                                }}
                                            >
                                                <Visibility />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </MotionTableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>


                {/* Pagination */}
                <Box display="flex" justifyContent="center" alignItems="center" mt={3}>
                    <Typography variant="body2" sx={{ mr: 2 }}>
                        Showing {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, filteredLogs.length)} of {filteredLogs.length} logs
                    </Typography>
                    <Pagination
                        count={Math.ceil(filteredLogs.length / rowsPerPage)}
                        page={page + 1}
                        onChange={(e, newPage) => setPage(newPage - 1)}
                        color="primary"
                    />
                </Box>

                {/* Log Detail Dialog */}
                <LogDetailDialog
                    log={selectedLog}
                    open={detailDialogOpen}
                    onClose={() => setDetailDialogOpen(false)}
                />

                {/* Security Alert */}
                {filteredLogs.filter(log =>
                    log.action.includes('SECURITY_BREACH') ||
                    log.action.includes('ACCESS_DENIED')
                ).length > 0 && (
                        <Alert severity="error" sx={{ mt: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Security Alert
                            </Typography>
                            <Typography variant="body2">
                                Multiple security events detected. Please review the following:
                            </Typography>
                            <List dense>
                                <ListItem>
                                    <ListItemText primary="• Failed login attempts from suspicious IP addresses" />
                                </ListItem>
                                <ListItem>
                                    <ListItemText primary="• Unauthorized access attempts to restricted resources" />
                                </ListItem>
                                <ListItem>
                                    <ListItemText primary="• API rate limit exceeded multiple times" />
                                </ListItem>
                            </List>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                Recommended actions: Review access controls, check firewall rules, and consider implementing additional security measures.
                            </Typography>
                        </Alert>
                    )}

                {/* Performance Metrics */}
                <Card sx={{ mt: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            System Performance Metrics
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={3}>
                                <Box textAlign="center">
                                    <Typography variant="h4" color="primary.main">
                                        {Math.round(filteredLogs.reduce((sum, log) => sum + log.details.responseTime, 0) / filteredLogs.length)}ms
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Avg Response Time
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Box textAlign="center">
                                    <Typography variant="h4" color="success.main">
                                        {((filteredLogs.filter(log => log.details.responseCode < 400).length / filteredLogs.length) * 100).toFixed(1)}%
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Success Rate
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Box textAlign="center">
                                    <Typography variant="h4" color="info.main">
                                        {filteredLogs.filter(log => dayjs(log.timestamp).isAfter(dayjs().subtract(1, 'hour'))).length}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Events (Last Hour)
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Box textAlign="center">
                                    <Typography variant="h4" color="warning.main">
                                        {new Set(filteredLogs.map(log => log.ipAddress)).size}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Unique IP Addresses
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </motion.div>
        </Box>
    );
};
export default AuditLogsPage;