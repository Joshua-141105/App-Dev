// pages/auth/RegisterPage.js
import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthForm from '../../components/auth/AuthForm';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../utils/api';
import { storeUser } from '../../utils/auth';

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user, login } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleRegister = async (formData) => {
  if (formData.password !== formData.confirmPassword) {
    setError('Passwords do not match');
    toast.error('Passwords do not match');
    return;
  }

  setLoading(true);
  setError(null);

  const controller = new AbortController(); 
  try {
    const response = await authAPI.register(
      {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      },
      controller.signal 
    );

    const userData = storeUser(response.data.token);
    login(userData);
    toast.success('Registration successful!');
    navigate('/dashboard');
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Registration failed';
    setError(errorMessage);
    console.error('Registration error:', err);
    toast.error(errorMessage);
  } finally {
    setLoading(false);
  }
};

  const fields = [
    {
      name: 'firstName',
      label: 'First Name',
      type: 'text',
      required: true,
    },
    {
      name: 'lastName',
      label: 'Last Name',
      type: 'text',
      required: true,
    },
    {
      name: 'username',
      label: 'Username',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
    },
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'tel',
      required: false,
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      required: true,
    },
    {
      name: 'confirmPassword',
      label: 'Confirm Password',
      type: 'password',
      required: true,
    },
  ];

  const links = [
    { text: 'Already have an account? Sign in', href: '/login' },
  ];

  return (
    <AuthForm
      title="Register"
      fields={fields}
      onSubmit={handleRegister}
      submitText="Sign Up"
      links={links}
      loading={loading}
      error={error}
    />
  );
};
export default RegisterPage;