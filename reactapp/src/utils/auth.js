// utils/auth.js
import { jwtDecode } from 'jwt-decode';

export const getStoredUser = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (decoded.exp < currentTime) {
      removeStoredUser();
      return null;
    }

    return {
      username: decoded.sub,
      role: decoded.role,
      token
    };
  } catch (error) {
    console.error('Error decoding token:', error);
    removeStoredUser();
    return null;
  }
};

export const storeUser = (token) => {
  localStorage.setItem('token', token);
  return getStoredUser();
};

export const removeStoredUser = () => {
  localStorage.removeItem('token');
};

export const isTokenValid = () => {
  const user = getStoredUser();
  return !!user;
};

export const hasRole = (user, requiredRoles) => {
  if (!user || !requiredRoles) return false;
  return requiredRoles.includes(user.role);
};
