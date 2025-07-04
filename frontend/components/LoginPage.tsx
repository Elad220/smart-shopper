import React from 'react';
import { Box, Typography, TextField, Button, Link, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AuthLayout from './AuthLayout';
import CircularProgress from '@mui/material/CircularProgress';

interface LoginPageProps {
  onLogin: (e: React.FormEvent) => void;
  onSwitchToRegister: () => void;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  isLoading: boolean;
  email?: string;
  password?: string;
  error: string | null;
  successMessage: string | null;
}

const LoginPage: React.FC<LoginPageProps> = ({
  onLogin,
  onSwitchToRegister,
  setEmail,
  setPassword,
  isLoading,
  email = '',
  password = '',
  error,
  successMessage,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const commonTextFieldStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: isDarkMode ? '#2a3441' : '#ffffff',
      border: `2px solid ${isDarkMode ? '#404b5a' : '#e1e8ed'}`,
      '& fieldset': {
        border: 'none', // Remove default border since we're using custom border
      },
      '&:hover': {
        borderColor: isDarkMode ? '#567a9a' : '#c1d9f0',
        backgroundColor: isDarkMode ? '#334155' : '#f8fafc',
      },
      '&.Mui-focused': {
        borderColor: isDarkMode ? '#90caf9' : '#0c7ff2',
        backgroundColor: isDarkMode ? '#334155' : '#ffffff',
        boxShadow: `0 0 0 3px ${isDarkMode ? 'rgba(144, 202, 249, 0.16)' : 'rgba(12, 127, 242, 0.16)'}`,
      },
      '&.Mui-error': {
        borderColor: '#f87171',
        '&:hover': {
          borderColor: '#ef4444',
        },
        '&.Mui-focused': {
          borderColor: '#ef4444',
          boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.16)',
        },
      },
    },
    '& .MuiInputBase-input': {
      color: isDarkMode ? '#f1f5f9' : '#0f172a',
      fontSize: '16px',
      padding: '14px 16px',
      '&::placeholder': {
        color: isDarkMode ? '#94a3b8' : '#64748b',
        opacity: 1,
      },
    },
    '& .MuiInputLabel-root': {
      color: isDarkMode ? '#94a3b8' : '#475569',
      fontSize: '16px',
      '&.Mui-focused': {
        color: isDarkMode ? '#90caf9' : '#0c7ff2',
      },
      '&.Mui-error': {
        color: '#f87171',
      },
    },
  };

  return (
    <AuthLayout>
      <Box component="form" onSubmit={onLogin} noValidate>
        <Typography
          variant="h4"
          sx={{
            color: isDarkMode ? 'white' : '#0d141c',
            fontWeight: 'bold',
            textAlign: 'center',
            pb: 1,
            pt: 2,
          }}
        >
          Welcome Back!
        </Typography>

        <Typography
          sx={{
            color: isDarkMode ? '#94a3b8' : '#64748b',
            textAlign: 'center',
            fontSize: '16px',
            pb: 4,
          }}
        >
          Sign in to your Smart Shopper account
        </Typography>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              mx: 4,
              borderRadius: '12px',
              '& .MuiAlert-message': {
                fontSize: '14px',
              },
            }}
          >
            {error}
          </Alert>
        )}
        {successMessage && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 3, 
              mx: 4,
              borderRadius: '12px',
              '& .MuiAlert-message': {
                fontSize: '14px',
              },
            }}
          >
            {successMessage}
          </Alert>
        )}

        <Box sx={{ px: 4, pb: 3 }}>
           <TextField
                label="Email or Username"
                placeholder="Enter your email or username"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={error?.toLowerCase().includes('username') || error?.toLowerCase().includes('email')}
                sx={commonTextFieldStyles}
            />
        </Box>
        <Box sx={{ px: 4, pb: 2 }}>
           <TextField
                label="Password"
                placeholder="Enter your password"
                type="password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={error?.toLowerCase().includes('password')}
                sx={commonTextFieldStyles}
            />
        </Box>

        <Typography sx={{ px: 4, pb: 4, textAlign: 'right' }}>
           <Link
                component="button"
                type="button"
                sx={{
                  color: isDarkMode ? '#94a3b8' : '#475569',
                  fontSize: '14px',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                    color: isDarkMode ? '#cbd5e1' : '#334155',
                  },
                }}
            >
                Forgot Password?
            </Link>
        </Typography>
        
        <Box sx={{ px: 4, pb: 4 }}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            sx={{
              borderRadius: '12px',
              height: 56,
              bgcolor: '#0c7ff2',
              color: 'white',
              fontWeight: '600',
              textTransform: 'none',
              fontSize: '16px',
              boxShadow: '0 4px 14px 0 rgba(12, 127, 242, 0.39)',
              border: 'none',
              '&:hover': {
                bgcolor: '#0064c4',
                boxShadow: '0 6px 20px 0 rgba(12, 127, 242, 0.45)',
                transform: 'translateY(-1px)',
              },
              '&:active': {
                transform: 'translateY(0)',
                boxShadow: '0 2px 8px 0 rgba(12, 127, 242, 0.35)',
              },
              '&:disabled': {
                bgcolor: isDarkMode ? '#374151' : '#e5e7eb',
                color: isDarkMode ? '#6b7280' : '#9ca3af',
                boxShadow: 'none',
                transform: 'none',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
          </Button>
        </Box>
        
        <Typography
          sx={{
            color: isDarkMode ? '#94a3b8' : '#64748b',
            textAlign: 'center',
            fontSize: '14px',
            px: 4,
          }}
        >
          Don't have an account?{' '}
          <Link
            component="button"
            type="button"
            onClick={onSwitchToRegister}
            sx={{
              color: '#0c7ff2',
              textDecoration: 'none',
              fontWeight: '600',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            Sign up
          </Link>
        </Typography>
      </Box>
    </AuthLayout>
  );
};

export default LoginPage;