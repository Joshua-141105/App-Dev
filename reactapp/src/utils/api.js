
// utils/api.js
import axios from 'axios';
import { getStoredUser, removeStoredUser } from './auth';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const user = getStoredUser();
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeStoredUser();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  me: () => api.get('/auth/me'),
};

// User API
export const userAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
};

// Parking Slot API
export const parkingSlotAPI = {
  getAll: () => api.get('/parkingslots'),
  getById: (id) => api.get(`/parkingslots/${id}`),
  create: (slotData) => api.post('/parkingslots', slotData),
  update: (id, slotData) => api.put(`/parkingslots/${id}`, slotData),
  delete: (id) => api.delete(`/parkingslots/${id}`),
};

// Booking API
export const bookingAPI = {
  getAll: () => api.get('/bookings'),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (bookingData) => api.post('/bookings', bookingData),
  update: (id, bookingData) => api.put(`/bookings/${id}`, bookingData),
  delete: (id) => api.delete(`/bookings/${id}`),
};

// Vehicle API
export const vehicleAPI = {
  getAll: () => api.get('/vehicles'),
  getById: (id) => api.get(`/vehicles/${id}`),
  create: (vehicleData) => api.post('/vehicles', vehicleData),
  update: (id, vehicleData) => api.put(`/vehicles/${id}`, vehicleData),
  delete: (id) => api.delete(`/vehicles/${id}`),
};

// Payment API
export const paymentAPI = {
  getAll: () => api.get('/payments'),
  getById: (id) => api.get(`/payments/${id}`),
  create: (paymentData) => api.post('/payments', paymentData),
  update: (id, paymentData) => api.put(`/payments/${id}`, paymentData),
  delete: (id) => api.delete(`/payments/${id}`),
};

// Notification API
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  getById: (id) => api.get(`/notifications/${id}`),
  create: (notificationData) => api.post('/notifications', notificationData),
  update: (id, notificationData) => api.put(`/notifications/${id}`, notificationData),
  delete: (id) => api.delete(`/notifications/${id}`),
  getByUser: (userId) => api.get(`/notifications/user/${userId}`),
  getUnreadByUser: (userId) => api.get(`/notifications/user/${userId}/unread`),
  markAsRead: (id) => api.put(`/notifications/${id}/mark-read`),
  markAllAsRead: (userId) => api.put(`/notifications/user/${userId}/mark-all-read`),
  getUnreadCount: (userId) => api.get(`/notifications/user/${userId}/unread-count`),
};

// Facility API
export const facilityAPI = {
  getAll: () => api.get('/facilities'),
  getById: (id) => api.get(`/facilities/${id}`),
  create: (facilityData) => api.post('/facilities', facilityData),
  update: (id, facilityData) => api.put(`/facilities/${id}`, facilityData),
  delete: (id) => api.delete(`/facilities/${id}`),
};

// Analytics API
export const analyticsAPI = {
  getAll: () => api.get('/facilityanalytics'),
  getById: (id) => api.get(`/facilityanalytics/${id}`),
  create: (analyticsData) => api.post('/facilityanalytics', analyticsData),
  update: (id, analyticsData) => api.put(`/facilityanalytics/${id}`, analyticsData),
  delete: (id) => api.delete(`/facilityanalytics/${id}`),
};

// Booking History API
export const bookingHistoryAPI = {
  getAll: () => api.get('/booking-histories'),
  getById: (id) => api.get(`/booking-histories/${id}`),
  create: (historyData) => api.post('/booking-histories', historyData),
  delete: (id) => api.delete(`/booking-histories/${id}`),
};

export default api;