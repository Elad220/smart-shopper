import React from 'react';
import { useTheme } from '../hooks/useTheme';
import LoginForm from './auth/LoginForm';
import { useAuth } from '../hooks/useAuth';

const LoginPage: React.FC = () => {
  const { theme } = useTheme();
  const { login, isLoading } = useAuth();

  const handleLogin = async (credentials: { email: string; password: string }) => {
    return await login(credentials);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: theme.palette.background.default,
      color: theme.palette.text.primary,
      transition: 'all 0.2s ease-in-out'
    }}>
      <LoginForm 
        onLogin={handleLogin}
        onSwitchToRegister={() => window.history.back()}
        isLoading={isLoading}
      />
    </div>
  );
};

export default LoginPage;