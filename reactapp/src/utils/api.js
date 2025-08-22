// Updated utils/api.js with additional time-based booking methods
import axios from 'axios';
import { getStoredUser, removeStoredUser } from './auth';
import dayjs from 'dayjs';

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
    const token = localStorage.getItem('authToken');
    if (token && !config.url.includes('/auth/')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for 401 Unauthorized
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

// Helper to optionally include signal
const withSignal = (signal) => (signal ? { signal } : {});

// -------- Auth API --------
export const authAPI = {
  login: (credentials, signal) => api.post('/auth/login', credentials, withSignal(signal)),
  register: (userData, signal) => api.post('/auth/register', userData, withSignal(signal)),
  me: (signal) => api.get('/auth/me', withSignal(signal)),
};

// -------- User API --------
export const userAPI = {
  getAll: (signal) => api.get('/users', withSignal(signal)),
  getById: (id, signal) => api.get(`/users/${id}`, withSignal(signal)),
  create: (userData, signal) => api.post('/users', userData, withSignal(signal)),
  update: (id, userData, signal) => api.put(`/users/${id}`, userData, withSignal(signal)),
  delete: (id, signal) => api.delete(`/users/${id}`, withSignal(signal)),
};

// -------- Parking Slot API --------
export const parkingSlotAPI = {
  getAll: (signal) => api.get('/parkingslots', withSignal(signal)),
  getPaginated: (params, signal) =>
    api.get('/parkingslots/paginated', {
      ...withSignal(signal),
      params,  // passes { page, size, facilityId, slotType, availableOnly, startTime, endTime }
    }),
  getById: (id, signal) => api.get(`/parkingslots/${id}`, withSignal(signal)),
  create: (slotData, signal) => api.post('/parkingslots', slotData, withSignal(signal)),
  update: (id, slotData, signal) => api.put(`/parkingslots/${id}`, slotData, withSignal(signal)),
  delete: (id, signal) => api.delete(`/parkingslots/${id}`, withSignal(signal)),
  
  // Time-based availability methods
  getAvailableForTime: (params, signal) =>
    api.get('/parkingslots/available', {
      ...withSignal(signal),
      params, // { startTime, endTime }
    }),
  getCurrentAvailability: (id, signal) => 
    api.get(`/parkingslots/${id}/current-availability`, withSignal(signal)),
  getUpcomingBookings: (id, signal) => 
    api.get(`/parkingslots/${id}/upcoming-bookings`, withSignal(signal)),
};

// -------- Booking API --------
export const bookingAPI = {
  getAll: (signal) => api.get('/bookings', withSignal(signal)),
  getById: (id, signal) => api.get(`/bookings/${id}`, withSignal(signal)),
  getByUserId: (userId, signal) => api.get(`/bookings/user/${userId}`, withSignal(signal)),
  create: (bookingData, signal) => api.post('/bookings', bookingData, withSignal(signal)),
  update: (id, bookingData, signal) => api.put(`/bookings/${id}`, bookingData, withSignal(signal)),
  delete: (id, signal) => api.delete(`/bookings/${id}`, withSignal(signal)),
  
  // Time-based booking methods
  checkAvailability: (params, signal) =>
    api.get('/bookings/check-availability', {
      ...withSignal(signal),
      params, // { slotId, startTime, endTime }
    }),
  getAvailableTimeSlots: (slotId, params, signal) =>
    api.get(`/bookings/available-slots/${slotId}`, {
      ...withSignal(signal),
      params, // { date }
    }),
  getOverdue: (signal) => api.get('/bookings/overdue', withSignal(signal)),
  
  // Booking actions
  checkIn: (id, signal) => api.post(`/bookings/${id}/checkin`, null, withSignal(signal)),
  checkOut: (id, signal) => api.post(`/bookings/${id}/checkout`, null, withSignal(signal)),
};

// -------- Vehicle API --------
export const vehicleAPI = {
  getAll: (signal) => api.get('/vehicles', withSignal(signal)),
  getById: (id, signal) => api.get(`/vehicles/${id}`, withSignal(signal)),
  create: (vehicleData, signal) => api.post('/vehicles', vehicleData, withSignal(signal)),
  update: (id, vehicleData, signal) => api.put(`/vehicles/${id}`, vehicleData, withSignal(signal)),
  delete: (id, signal) => api.delete(`/vehicles/${id}`, withSignal(signal)),
};

// -------- Payment API --------
export const paymentAPI = {
  getAll: (signal) => api.get('/payments', withSignal(signal)),
  getById: (id, signal) => api.get(`/payments/${id}`, withSignal(signal)),
  create: (paymentData, signal) => api.post('/payments', paymentData, withSignal(signal)),
  update: (id, paymentData, signal) => api.put(`/payments/${id}`, paymentData, withSignal(signal)),
  delete: (id, signal) => api.delete(`/payments/${id}`, withSignal(signal)),
};

// -------- Notification API --------
export const notificationAPI = {
  getAll: (signal) => api.get('/notifications', withSignal(signal)),
  getById: (id, signal) => api.get(`/notifications/${id}`, withSignal(signal)),
  create: (notificationData, signal) => api.post('/notifications', notificationData, withSignal(signal)),
  update: (id, notificationData, signal) => api.put(`/notifications/${id}`, notificationData, withSignal(signal)),
  delete: (id, signal) => api.delete(`/notifications/${id}`, withSignal(signal)),
  getByUser: (userId, signal) => api.get(`/notifications/user/${userId}`, withSignal(signal)),
  getUnreadByUser: (userId, signal) => api.get(`/notifications/user/${userId}/unread`, withSignal(signal)),
  markAsRead: (id, signal) => api.put(`/notifications/${id}/mark-read`, null, withSignal(signal)),
  markAllAsRead: (userId, signal) => api.put(`/notifications/user/${userId}/mark-all-read`, null, withSignal(signal)),
  getUnreadCount: (userId, signal) => api.get(`/notifications/user/${userId}/unread-count`, withSignal(signal)),
};

// -------- Facility API --------
export const facilityAPI = {
  getAll: (signal) => api.get('/facilities', withSignal(signal)),
  getById: (id, signal) => api.get(`/facilities/${id}`, withSignal(signal)),
  create: (facilityData, signal) => api.post('/facilities', facilityData, withSignal(signal)),
  update: (id, facilityData, signal) => api.put(`/facilities/${id}`, facilityData, withSignal(signal)),
  delete: (id, signal) => api.delete(`/facilities/${id}`, withSignal(signal)),
};

// -------- Analytics API --------
export const analyticsAPI = {
  getAll: (signal) => api.get('/facilityanalytics', withSignal(signal)),
  getById: (id, signal) => api.get(`/facilityanalytics/${id}`, withSignal(signal)),
  create: (analyticsData, signal) => api.post('/facilityanalytics', analyticsData, withSignal(signal)),
  update: (id, analyticsData, signal) => api.put(`/facilityanalytics/${id}`, analyticsData, withSignal(signal)),
  delete: (id, signal) => api.delete(`/facilityanalytics/${id}`, withSignal(signal)),
};

// -------- Booking History API --------
export const bookingHistoryAPI = {
  getAll: (signal) => api.get('/booking-histories', withSignal(signal)),
  getById: (id, signal) => api.get(`/booking-histories/${id}`, withSignal(signal)),
  create: (historyData, signal) => api.post('/booking-histories', historyData, withSignal(signal)),
  delete: (id, signal) => api.delete(`/booking-histories/${id}`, withSignal(signal)),
};

// -------- Time-based Utility Functions --------
export const timeUtils = {
  // Format date for API calls
  formatDateForAPI: (date) => {
    return dayjs(date).toISOString();
  },
  
  // Check if two time ranges overlap
  doTimeRangesOverlap: (start1, end1, start2, end2) => {
    return start1 < end2 && end1 > start2;
  },
  
  // Calculate duration between two times in hours
  calculateDurationHours: (startTime, endTime) => {
    return dayjs(endTime).diff(dayjs(startTime), 'hour', true);
  },
  
  // Validate booking time range
  validateBookingTimeRange: (startTime, endTime) => {
    const now = dayjs();
    const start = dayjs(startTime);
    const end = dayjs(endTime);
    
    const errors = [];
    
    if (start.isBefore(now)) {
      errors.push('Start time cannot be in the past');
    }
    
    if (end.isBefore(start) || end.isEqual(start)) {
      errors.push('End time must be after start time');
    }
    
    const durationHours = end.diff(start, 'hour', true);
    if (durationHours < 1) {
      errors.push('Minimum booking duration is 1 hour');
    }
    
    if (durationHours > 24) {
      errors.push('Maximum booking duration is 24 hours');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      durationHours
    };
  },
  
  // Generate time slots for a day (useful for slot selection)
  generateTimeSlots: (date, intervalHours = 1, operatingHours = { start: 6, end: 22 }) => {
    const slots = [];
    const baseDate = dayjs(date).startOf('day');
    
    for (let hour = operatingHours.start; hour < operatingHours.end; hour += intervalHours) {
      const startTime = baseDate.hour(hour);
      const endTime = startTime.add(intervalHours, 'hour');
      
      slots.push({
        startTime: startTime.toDate(),
        endTime: endTime.toDate(),
        label: `${startTime.format('HH:mm')} - ${endTime.format('HH:mm')}`
      });
    }
    
    return slots;
  }
};

export default api;