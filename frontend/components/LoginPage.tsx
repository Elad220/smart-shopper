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
      backgroundColor: isDarkMode ? '#1f272e' : '#e7edf4',
      '& fieldset': {
        borderColor: isDarkMode ? '#3d4d5c' : 'transparent',
      },
      '&:hover fieldset': {
        borderColor: isDarkMode ? '#567a9a' : '#c1d9f0',
      },
      '&.Mui-focused fieldset': {
        borderColor: isDarkMode ? '#90caf9' : '#0c7ff2',
      },
    },
    '& .MuiInputBase-input': {
      color: isDarkMode ? 'white' : '#0d141c',
    },
     '& .MuiInputLabel-root': {
        color: isDarkMode ? '#9daebe' : '#49739c',
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
            pb: 3,
            pt: 5,
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
                color: isDarkMode ? '#9daebe' : '#49739c',
                fontSize: '0.875rem',
                textDecoration: 'underline',
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
              bgcolor: isDarkMode ? '#dce8f3' : '#0c7ff2',
              color: isDarkMode ? '#141a1f' : 'white',
              fontWeight: 'bold',
              textTransform: 'none',
              fontSize: '1rem',
               '&:hover': {
                bgcolor: isDarkMode ? '#b9c8d6' : '#0064c4',
              }
            }}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Login'}
          </Button>
        </Box>
        <Typography
          sx={{
            color: isDarkMode ? '#9daebe' : '#49739c',
            textAlign: 'center',
            fontSize: '0.875rem',
          }}
        >
          Don't have an account?{' '}
          <Link
            component="button"
            type="button"
            onClick={onSwitchToRegister}
            sx={{
              color: isDarkMode ? '#dce8f3' : '#0c7ff2',
              textDecoration: 'underline',
              fontWeight: 'medium',
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