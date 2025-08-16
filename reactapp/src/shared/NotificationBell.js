import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
} from '@mui/material';
import {
  NotificationsOutlined,
  Circle,
  MarkEmailRead,
  Info,
  Warning,
  CheckCircle,
  Error,
} from '@mui/icons-material';
import { useAuth } from '../src/App';
import { notificationAPI } from '../src/utils/api';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const NotificationBell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const [unreadRes, countRes] = await Promise.all([
        notificationAPI.getUnreadByUser(user.id),
        notificationAPI.getUnreadCount(user.id)
      ]);
      
      setNotifications(unreadRes.data.slice(0, 5)); // Show only latest 5
      setUnreadCount(countRes.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead(user.id);
      fetchNotifications();
      handleClose();
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const handleViewAll = () => {
    navigate('/notifications');
    handleClose();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'PAYMENT_SUCCESS':
        return <CheckCircle color="success" />;
      case 'PAYMENT_FAILURE':
        return <Error color="error" />;
      case 'ALERT':
        return <Warning color="warning" />;
      default:
        return <Info color="primary" />;
    }
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsOutlined />
        </Badge>
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 350,
            maxHeight: 400,
          },
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ p: 2, pb: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Button size="small" onClick={handleMarkAllRead}>
                Mark all read
              </Button>
            )}
          </Box>
        </Box>
        <Divider />
        
        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="textSecondary">
              No new notifications
            </Typography>
          </Box>
        ) : (
          <List sx={{ py: 0 }}>
            {notifications.map((notification) => (
              <ListItem key={notification.notificationId} sx={{ py: 1 }}>
                <ListItemIcon>
                  {getNotificationIcon(notification.type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" fontWeight="bold">
                      {notification.message}
                    </Typography>
                  }
                  secondary={dayjs(notification.createdDate).fromNow()}
                />
                {!notification.isRead && (
                  <Circle sx={{ color: 'primary.main', fontSize: 8, ml: 1 }} />
                )}
              </ListItem>
            ))}
          </List>
        )}
        
        <Divider />
        <Box sx={{ p: 1 }}>
          <Button fullWidth onClick={handleViewAll}>
            View All Notifications
          </Button>
        </Box>
      </Menu>
    </>
  );
};

export default NotificationBell;
