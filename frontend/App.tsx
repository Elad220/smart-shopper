// frontend/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import LandingPage from './components/auth/LandingPage';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import MainApp from './components/app/MainApp';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

// Public Route Component (redirects to main app if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (isAuthenticated && user) {
    return <Navigate to="/list" replace />;
  }
  
  return <>{children}</>;
};

// Landing Page with Navigation
const LandingPageWithNavigation: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <LandingPage 
      onGetStarted={() => navigate('/register')}
      onSignIn={() => navigate('/auth')}
    />
  );
};

// Login Form with Navigation
const LoginFormWithNavigation: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  
  const handleLogin = async (credentials: { email: string; password: string }) => {
    console.log('LoginFormWithNavigation: handleLogin called with credentials:', credentials);
    const result = await login(credentials);
    console.log('LoginFormWithNavigation: login result:', result);
    if (result.success) {
      // Navigation will be handled by the useAuth hook (page reload)
      console.log('LoginFormWithNavigation: login successful, page will reload');
    }
    return result;
  };
  
  return (
    <LoginForm 
      onLogin={handleLogin}
      onSwitchToRegister={() => navigate('/register')}
      isLoading={isLoading}
    />
  );
};

// Register Form with Navigation
const RegisterFormWithNavigation: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  
  const handleRegister = async (data: { username: string; email: string; password: string }) => {
    const result = await register(data);
    if (result.success) {
      // Navigate to login page after successful registration
      navigate('/auth');
    }
    return result;
  };
  
  return (
    <RegisterForm 
      onRegister={handleRegister}
      onSwitchToLogin={() => navigate('/auth')}
      isLoading={isLoading}
    />
  );
};

const App: React.FC = () => {
  const { theme } = useTheme();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 6000,
          style: {
            borderRadius: '8px',
            background: theme.palette.background.paper,
            color: theme.palette.text.primary,
            border: `1px solid ${theme.palette.divider}`,
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: theme.palette.success?.main || '#22c55e',
              secondary: theme.palette.common.white,
            },
          },
          error: {
            iconTheme: {
              primary: theme.palette.error?.main || '#ef4444',
              secondary: theme.palette.common.white,
            },
          },
        }}
      />
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={
            <PublicRoute>
              <LandingPageWithNavigation />
            </PublicRoute>
          } />
          
          <Route path="/auth" element={
            <PublicRoute>
              <LoginFormWithNavigation />
            </PublicRoute>
          } />
          
          <Route path="/register" element={
            <PublicRoute>
              <RegisterFormWithNavigation />
            </PublicRoute>
          } />
          
          {/* Protected routes - all handled by MainApp */}
          <Route path="/*" element={
            <ProtectedRoute>
              <MainApp />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;