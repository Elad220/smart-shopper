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
      backgroundColor: isDarkMode ? '#0a0a0a' : '#e7edf4',
      transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out',
      '& fieldset': {
        borderColor: isDarkMode ? '#1a1a1a' : 'transparent',
      },
      '&:hover fieldset': {
        borderColor: isDarkMode ? '#2a2a2a' : '#c1d9f0',
      },
      '&.Mui-focused fieldset': {
        borderColor: isDarkMode ? '#60a5fa' : '#0c7ff2',
      },
    },
    '& .MuiInputBase-input': {
      color: isDarkMode ? '#ffffff' : '#0d141c',
      transition: 'color 0.2s ease-in-out',
    },
     '& .MuiInputLabel-root': {
        color: isDarkMode ? '#d1d5db' : '#49739c',
        transition: 'color 0.2s ease-in-out',
    },
  };

  return (
    <AuthLayout>
      <Box component="form" onSubmit={onLogin} noValidate>
        <Typography
          variant="h4"
          sx={{
            color: isDarkMode ? '#ffffff' : '#0d141c',
            fontWeight: 'bold',
            textAlign: 'center',
            pb: 3,
            pt: 5,
            transition: 'color 0.2s ease-in-out',
          }}
        >
          Welcome back
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

        <Box sx={{ px: 4, py: 1.5 }}>
           <TextField
                label="Email or Username"
                placeholder="Enter your email or username"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={commonTextFieldStyles}
            />
        </Box>
        <Box sx={{ px: 4, py: 1.5 }}>
           <TextField
                label="Password"
                placeholder="Enter your password"
                type="password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={commonTextFieldStyles}
            />
        </Box>

        <Typography sx={{ px: 4, textAlign: 'right' }}>
           <Link
                component="button"
                type="button"
                sx={{
                color: isDarkMode ? '#d1d5db' : '#49739c',
                fontSize: '0.875rem',
                textDecoration: 'underline',
                transition: 'color 0.2s ease-in-out',
                }}
            >
                Forgot Password?
            </Link>
        </Typography>
        
        <Box sx={{ px: 4, py: 3 }}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            sx={{
              borderRadius: '9999px',
              height: 48,
              bgcolor: isDarkMode ? '#60a5fa' : '#0c7ff2',
              color: isDarkMode ? '#000000' : 'white',
              fontWeight: 'bold',
              textTransform: 'none',
              fontSize: '1rem',
              transition: 'all 0.2s ease-in-out',
               '&:hover': {
                bgcolor: isDarkMode ? '#3b82f6' : '#0064c4',
              }
            }}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Login'}
          </Button>
        </Box>
        <Typography
          sx={{
            color: isDarkMode ? '#d1d5db' : '#49739c',
            textAlign: 'center',
            fontSize: '0.875rem',
            transition: 'color 0.2s ease-in-out',
          }}
        >
          Don't have an account?{' '}
          <Link
            component="button"
            type="button"
            onClick={onSwitchToRegister}
            sx={{
              color: isDarkMode ? '#60a5fa' : '#0c7ff2',
              textDecoration: 'underline',
              fontWeight: 'medium',
              transition: 'color 0.2s ease-in-out',
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