// frontend/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, IconButton } from '@mui/material';
import { Toaster, toast, ToastBar, type Toast } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import LandingPage from './components/auth/LandingPage';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import MainApp from './components/app/MainApp';
import CloseIcon from '@mui/icons-material/Close';

// Public Route Component (redirects to main app if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (isAuthenticated && user) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Root Route Component
const RootRoute: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  if (isAuthenticated && user) {
    return <MainApp />;
  }
  
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

  const handleGoogleLoginSuccess = () => {
    navigate('/');
  };
  
  return (
    <LoginForm 
      onLogin={handleLogin}
      onSwitchToRegister={() => navigate('/register')}
      isLoading={isLoading}
      onGoogleLoginSuccess={handleGoogleLoginSuccess}
    />
  );
};

// Register Form with Navigation
const RegisterFormWithNavigation: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  
  const handleGoogleLoginSuccess = () => {
    navigate('/');
  };
  
  return (
    <RegisterForm 
      onRegister={register}
      onSwitchToLogin={() => navigate('/auth')}
      isLoading={isLoading}
      onGoogleLoginSuccess={handleGoogleLoginSuccess}
    />
  );
};

const App: React.FC = () => {
  const { theme } = useTheme();

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        
        {/* Custom Toast Styling */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: theme.palette.mode === 'dark' ? '#333' : '#fff',
              color: theme.palette.mode === 'dark' ? '#fff' : '#333',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            },
            success: {
              iconTheme: {
                primary: theme.palette.success.main,
                secondary: theme.palette.common.white,
              },
            },
            error: {
              iconTheme: {
                primary: theme.palette.error.main,
                secondary: theme.palette.common.white,
              },
            },
          }}
        >
          {(t: Toast) => (
            <ToastBar toast={t}>
              {({ icon, message }) => (
                <>
                  {icon}
                  {message}
                  {t.type !== 'loading' && (
                    <IconButton
                      size="small"
                      onClick={() => toast.dismiss(t.id)}
                      sx={{
                        color: theme.palette.text.secondary,
                        '&:hover': {
                          color: theme.palette.text.primary,
                        },
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  )}
                </>
              )}
            </ToastBar>
          )}
        </Toaster>

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
    </GoogleOAuthProvider>
  );
};

export default App;