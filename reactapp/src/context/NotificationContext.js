// context/NotificationsContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { notificationAPI } from '../utils/api';
import { useAuth } from './AuthContext';

const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    if (!user) return;
    const res = await notificationAPI.getByUser(user.id);
    setNotifications(res.data.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate)));
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const markAsRead = async (id) => {
    await notificationAPI.markAsRead(id);
    fetchNotifications();
  };

  const markAllAsRead = async () => {
    await notificationAPI.markAllAsRead(user.id);
    fetchNotifications();
  };

  const deleteNotification = async (id) => {
    await notificationAPI.delete(id);
    fetchNotifications();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationsContext.Provider value={{
      notifications,
      unreadCount,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification
    }}>
      {children}
    </NotificationsContext.Provider>
  );
};
export const useNotifications = () => useContext(NotificationsContext);