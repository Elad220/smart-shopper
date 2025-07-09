import React from 'react';
import { useTheme } from '../hooks/useTheme';
import RegisterForm from './auth/RegisterForm';
import { useAuth } from '../hooks/useAuth';

const RegisterPage: React.FC = () => {
  const { theme } = useTheme();
  const { register, isLoading } = useAuth();

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: theme.palette.background.default,
      color: theme.palette.text.primary,
      transition: 'all 0.2s ease-in-out'
    }}>
      <RegisterForm 
        onRegister={register}
        onSwitchToLogin={() => window.history.back()}
        isLoading={isLoading}
      />
    </div>
  );
};

export default RegisterPage;