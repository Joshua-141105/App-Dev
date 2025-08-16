// App.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Auth Context

// Components
import Navbar from './components/layout/Navbar';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// User Pages
import SlotAvailabilityPage from './pages/user/SlotAvailabilityPage';
import BookingFormPage from './pages/user/BookingFormPage';
import MyBookingsPage from './pages/user/MyBookingsPage';
import BookingHistoryPage from './pages/user/BookingHistoryPage';
import VehiclesPage from './pages/user/VehiclesPage';
import PaymentsPage from './pages/user/PaymentsPage';
import ProfilePage from './pages/user/ProfilePage';
import NotificationsPage from './pages/user/NotificationsPage';

// Manager Pages
import SlotManagementPage from './pages/manager/SlotManagementPage';
import PricingPage from './pages/manager/PricingPage';
import FacilityAnalyticsPage from './pages/manager/FacilityAnalyticsPage';
import FinancialReportsPage from './pages/manager/FinancialReportsPage';

// Admin Pages
import UserManagementPage from './pages/admin/UserManagementPage';
import AccessControlPage from './pages/admin/AccessControlPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';

// Security Pages
import SecurityDashboard from './pages/security/SecurityDashboard';

// Dashboard Pages
import UserDashboard from './pages/dashboard/UserDashboard';
import ManagerDashboard from './pages/dashboard/ManagerDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';

// Utils
import { getStoredUser, removeStoredUser } from './utils/auth';

// Auth Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const AuthContext = createContext();
  const ThemeContext = createContext();
  
  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    removeStoredUser();
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};

// Theme Provider
export const AppThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
        dark: '#115293',
      },
      secondary: {
        main: '#dc004e',
      },
    },
  });

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('darkMode', JSON.stringify(!darkMode));
  };

  const value = {
    darkMode,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  return useContext(ThemeContext);
};

function App() {
  return (
    <AppThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              
              {/* Protected Routes */}
              <Route path="/*" element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              } />
            </Routes>
            <ToastContainer 
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </div>
        </Router>
      </AuthProvider>
    </AppThemeProvider>
  );
}

const MainLayout = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <DashboardLayout>
      <Routes>
        {/* Dashboard Routes */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route 
          path="/dashboard" 
          element={
            user.role === 'USER' ? <UserDashboard /> :
            user.role === 'FACILITY_MANAGER' ? <ManagerDashboard /> :
            user.role === 'SYSTEM_ADMIN' ? <AdminDashboard /> :
            user.role === 'SECURITY' ? <SecurityDashboard /> :
            <UserDashboard />
          } 
        />

        {/* User Routes */}
        <Route path="/slots" element={<SlotAvailabilityPage />} />
        <Route path="/book-slot" element={<BookingFormPage />} />
        <Route path="/my-bookings" element={<MyBookingsPage />} />
        <Route path="/booking-history" element={<BookingHistoryPage />} />
        <Route path="/vehicles" element={<VehiclesPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />

        {/* Manager Routes */}
        <Route 
          path="/slot-management" 
          element={
            <ProtectedRoute requiredRoles={['FACILITY_MANAGER', 'SYSTEM_ADMIN']}>
              <SlotManagementPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/pricing" 
          element={
            <ProtectedRoute requiredRoles={['FACILITY_MANAGER', 'SYSTEM_ADMIN']}>
              <PricingPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute requiredRoles={['FACILITY_MANAGER', 'SYSTEM_ADMIN']}>
              <FacilityAnalyticsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/financial-reports" 
          element={
            <ProtectedRoute requiredRoles={['FACILITY_MANAGER', 'SYSTEM_ADMIN']}>
              <FinancialReportsPage />
            </ProtectedRoute>
          } 
        />

        {/* Admin Routes */}
        <Route 
          path="/user-management" 
          element={
            <ProtectedRoute requiredRoles={['SYSTEM_ADMIN']}>
              <UserManagementPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/access-control" 
          element={
            <ProtectedRoute requiredRoles={['SYSTEM_ADMIN']}>
              <AccessControlPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/audit-logs" 
          element={
            <ProtectedRoute requiredRoles={['SYSTEM_ADMIN']}>
              <AuditLogsPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </DashboardLayout>
  );
};

export default App;