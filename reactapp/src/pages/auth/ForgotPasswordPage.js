// pages/auth/ForgotPasswordPage.js
import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthForm from '../../components/auth/AuthForm';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../utils/api';

const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1); // 1 = email input, 2 = password input
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Step 1: Verify email exists
  const handleVerifyEmail = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      const { email } = formData;
      const res = await userAPI.getAll(); // fetch all users (or you can create an API `getByEmail`)
      const userExists = res.data.find((u) => u.email === email);

      if (!userExists) {
        throw new Error('No account found with this email');
      }

      setEmail(email);
      setStep(2);
      toast.success('Email verified! Please enter your new password.');
    } catch (err) {
      const errorMessage = err.message || 'Failed to verify email';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset password
  const handleResetPassword = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      const { password, confirmPassword } = formData;
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Find user by email (better to have a backend endpoint `updateByEmail`)
      const res = await userAPI.getAll();
      const user = res.data.find((u) => u.email === email);

      if (!user) {
        throw new Error('User not found');
      }

      await userAPI.update(user.id, { ...user, password });
      toast.success('Password reset successful! Please login with your new password.');
      navigate('/login');
    } catch (err) {
      const errorMessage = err.message || 'Failed to reset password';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Form fields
  const emailFields = [
    { name: 'email', label: 'Email Address', type: 'email', required: true },
  ];

  const passwordFields = [
    { name: 'password', label: 'New Password', type: 'password', required: true },
    { name: 'confirmPassword', label: 'Confirm Password', type: 'password', required: true },
  ];

  return (
    <AuthForm
      title={step === 1 ? 'Forgot Password' : 'Reset Password'}
      fields={step === 1 ? emailFields : passwordFields}
      onSubmit={step === 1 ? handleVerifyEmail : handleResetPassword}
      submitText={step === 1 ? 'Verify Email' : 'Reset Password'}
      links={[{ text: 'Back to Login', href: '/login' }]}
      loading={loading}
      error={error}
    />
  );
};

export default ForgotPasswordPage;