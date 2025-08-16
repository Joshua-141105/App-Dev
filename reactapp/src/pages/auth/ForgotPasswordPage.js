// pages/auth/ForgotPasswordPage.js
import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthForm from '../../components/auth/AuthForm';
import { useAuth } from '../../App';

const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleForgotPassword = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      // Mock forgot password API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSuccess(true);
      toast.success('Password reset instructions sent to your email!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const errorMessage = 'Failed to send reset email';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthForm
        title="Check Your Email"
        fields={[]}
        onSubmit={() => {}}
        submitText=""
        links={[{ text: 'Back to Login', href: '/login' }]}
      />
    );
  }

  const fields = [
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      required: true,
    },
  ];

  const links = [
    { text: 'Back to Login', href: '/login' },
  ];

  return (
    <AuthForm
      title="Forgot Password"
      fields={fields}
      onSubmit={handleForgotPassword}
      submitText="Send Reset Link"
      links={links}
      loading={loading}
      error={error}
    />
  );
};

export default ForgotPasswordPage;