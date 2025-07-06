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

// Public Route Component (redirects to main app if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (isAuthenticated && user) {
    return <Navigate to="/" replace />;
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
    const result = await login(credentials);
    if (result.success) {
      navigate('/');
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
  
  return (
    <RegisterForm 
      onRegister={register}
      onSwitchToLogin={() => navigate('/auth')}
      isLoading={isLoading}
    />
  );
};

// Root Route Component - handles both authenticated and unauthenticated states
const RootRoute: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  
  if (isAuthenticated && user) {
    return <MainApp />;
  }
  
  return <LandingPageWithNavigation />;
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
          {/* Root route - shows landing page or main app based on auth state */}
          <Route path="/" element={<RootRoute />} />
          
          {/* Public routes */}
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
          
          {/* Catch-all route for any other paths - redirect to root */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;