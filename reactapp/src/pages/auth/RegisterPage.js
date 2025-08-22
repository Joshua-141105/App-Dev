// pages/auth/RegisterPage.js
import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthForm from '../../components/auth/AuthForm';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../utils/api';
import { IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Step 1: Verify unique email + username
  const handleVerifyStep1 = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const { email, username } = data;
      const res = await userAPI.getAll();
      let userExists = res.data.find(
        (u) => u.username === username
      );
      if (userExists) {
        throw new Error('Username already exists');
      }
      userExists = res.data.find(
        (u) => u.email === email
      );
      if (userExists) {
        throw new Error('Email already exists');
      }
      setFormData({ ...formData, email, username });
      setStep(2);
      toast.success('Email and Username available! Continue registration.');
    } catch (err) {
      const errorMessage = err.message || 'Failed to verify';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle registration
  const handleRegister = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const { firstname, lastname, password, confirmPassword } = data;
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      await userAPI.create({
        email: formData.email,
        username: formData.username,
        firstname,
        lastname,
        password,
      });
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      const errorMessage = err.message || 'Failed to register';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Form fields
  const step1Fields = [
    { name: 'email', label: 'Email Address', type: 'email', required: true },
    { name: 'username', label: 'Username', type: 'text', required: true },
  ];

  const step2Fields = [
    { name: 'firstname', label: 'First Name', type: 'text', required: true },
    { name: 'lastname', label: 'Last Name', type: 'text', required: true },
    { name: 'password', label: 'Password', type: 'password', required: true },
    { name: 'confirmPassword', label: 'Confirm Password', type: 'password', required: true },
  ];

  return (
    <div>
      <AuthForm
        title={step === 1 ? 'Register - Step 1' : 'Register - Step 2'}
        fields={step === 1 ? step1Fields : step2Fields}
        onSubmit={step === 1 ? handleVerifyStep1 : handleRegister}
        submitText={step === 1 ? 'Next' : 'Register'}
        links={[{ text: 'Back to Login', href: '/login' }]}
        loading={loading}
        error={error}
      />
    </div>
  );
};
export default RegisterPage;