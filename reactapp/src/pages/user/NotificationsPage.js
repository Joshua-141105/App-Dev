// pages/user/NotificationsPage.js
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Button,
  Paper,
  Avatar,
  Divider,
  Menu,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  Notifications,
  NotificationsActive,
  Circle,
  MoreVert,
  MarkEmailRead,
  Delete,
  Info,
  Warning,
  CheckCircle,
  Error,
  Payment as PaymentIcon,
  DirectionsCar,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { notificationAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const NotificationBell = ({ count, onClick }) => (
  <IconButton onClick={onClick} color="inherit">
    <Notifications />
    {count > 0 && (
      <Chip
        size="small"
        label={count}
        color="error"
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          minWidth: 20,
          height: 20,
        }}
      />
    )}
  </IconButton>
);

const NotificationList = ({ notifications, onMarkRead, onDelete, onMarkAllRead }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const handleMenuClick = (event, notification) => {
    setAnchorEl(event.currentTarget);
    setSelectedNotification(notification);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNotification(null);
  };

  const getNotificationIcon = (type, priority) => {
    const iconProps = {
      sx: {
        color: priority === 'HIGH' || priority === 'URGENT' ? 'error.main' : 'primary.main'
      }
    };

    switch (type) {
      case 'BOOKING_CONFIRMATION':
        return <DirectionsCar {...iconProps} />;
      case 'PAYMENT_SUCCESS':
        return <CheckCircle {...iconProps} />;
      case 'PAYMENT_FAILURE':
        return <Error {...iconProps} />;
      case 'ALERT':
        return <Warning {...iconProps} />;
      case 'SYSTEM_UPDATE':
        return <Info {...iconProps} />;
      default:
        return <Notifications {...iconProps} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT':
        return 'error';
      case 'HIGH':
        return 'warning';
      case 'MEDIUM':
        return 'primary';
      case 'LOW':
        return 'default';
      default:
        return 'primary';
    }
  };

  return (
    <Box>
      {notifications.filter(n => !n.isRead).length > 0 && (
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="body2" color="textSecondary">
            {notifications.filter(n => !n.isRead).length} unread notifications
          </Typography>
          <Button
            size="small"
            onClick={onMarkAllRead}
            startIcon={<MarkEmailRead />}
          >
            Mark All Read
          </Button>
        </Box>
      )}

      <List>
        {notifications.length === 0 ? (
          <ListItem>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              width="100%"
              py={4}
            >
              <Notifications sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="textSecondary">
                No notifications
              </Typography>
              <Typography variant="body2" color="textSecondary">
                You're all caught up!
              </Typography>
            </Box>
          </ListItem>
        ) : (
          notifications.map((notification, index) => (
            <React.Fragment key={notification.notificationId}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ListItem
                  sx={{
                    bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                    borderLeft: notification.isRead ? 'none' : '4px solid',
                    borderLeftColor: `${getPriorityColor(notification.priority)}.main`,
                    '&:hover': {
                      bgcolor: 'action.selected',
                    },
                  }}
                >
                  <ListItemIcon>
                    <Box position="relative">
                      {getNotificationIcon(notification.type, notification.priority)}
                      {!notification.isRead && (
                        <Circle
                          sx={{
                            position: 'absolute',
                            top: -2,
                            right: -2,
                            fontSize: 12,
                            color: 'primary.main',
                          }}
                        />
                      )}
                    </Box>
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography
                          variant="body1"
                          fontWeight={notification.isRead ? 'normal' : 'bold'}
                        >
                          {notification.message}
                        </Typography>
                        <Chip
                          label={notification.priority}
                          color={getPriorityColor(notification.priority)}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          {notification.type.replace('_', ' ').toLowerCase()}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {dayjs(notification.createdDate).fromNow()}
                        </Typography>
                      </Box>
                    }
                  />
                  
                  <ListItemSecondaryAction>
                    <IconButton
                      onClick={(e) => handleMenuClick(e, notification)}
                      size="small"
                    >
                      <MoreVert />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </motion.div>
              {index < notifications.length - 1 && <Divider />}
            </React.Fragment>
          ))
        )}
      </List>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedNotification && !selectedNotification.isRead && (
          <MenuItem
            onClick={() => {
              onMarkRead(selectedNotification.notificationId);
              handleMenuClose();
            }}
          >
            <MarkEmailRead sx={{ mr: 1 }} />
            Mark as Read
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            onDelete(selectedNotification.notificationId);
            handleMenuClose();
          }}
        >
          <Delete sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

const NotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.getByUser(user.id);
      setNotifications(response.data.sort((a, b) => 
        new Date(b.createdDate) - new Date(a.createdDate)
      ));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      fetchNotifications();
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead(user.id);
      fetchNotifications();
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await notificationAPI.delete(notificationId);
      fetchNotifications();
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.isRead);
      case 'read':
        return notifications.filter(n => n.isRead);
      default:
        return notifications;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
                Notifications
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Stay updated with your parking activities
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
              <NotificationsActive />
            </Avatar>
          </Box>
        </Paper>
      </motion.div>

      {/* Filter Buttons */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" gap={2} alignItems="center">
            <Typography variant="h6">Filter:</Typography>
            <Button
              variant={filter === 'all' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setFilter('all')}
            >
              All ({notifications.length})
            </Button>
            <Button
              variant={filter === 'unread' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setFilter('unread')}
              color="warning"
            >
              Unread ({unreadCount})
            </Button>
            <Button
              variant={filter === 'read' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setFilter('read')}
            >
              Read ({notifications.length - unreadCount})
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardContent>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <Typography>Loading notifications...</Typography>
            </Box>
          ) : (
            <NotificationList
              notifications={getFilteredNotifications()}
              onMarkRead={handleMarkAsRead}
              onDelete={handleDelete}
              onMarkAllRead={handleMarkAllAsRead}
            />
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
export default NotificationsPage;