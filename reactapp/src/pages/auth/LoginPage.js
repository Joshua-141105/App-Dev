// pages/auth/LoginPage.js
import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthForm from '../../components/auth/AuthForm';
import { useAuth } from '../../App';
import { authAPI } from '../../utils/api';
import { storeUser } from '../../utils/auth';

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user, login } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.login({
        usernameOrEmail: formData.usernameOrEmail,
        password: formData.password,
      });

      const userData = storeUser(response.data.token);
      login(userData);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Invalid credentials';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      name: 'usernameOrEmail',
      label: 'Username or Email',
      type: 'text',
      required: true,
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      required: true,
    },
  ];

  const links = [
    { text: "Don't have an account? Sign up", href: '/register' },
    { text: 'Forgot Password?', href: '/forgot-password' },
  ];

  return (
    <AuthForm
      title="Login"
      fields={fields}
      onSubmit={handleLogin}
      submitText="Sign In"
      links={links}
      loading={loading}
      error={error}
    />
  );
};
export default LoginPage;