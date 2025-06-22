import React from 'react';
import { Box, Typography, TextField, Button, Link, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AuthLayout from './AuthLayout';
import CircularProgress from '@mui/material/CircularProgress';

interface RegisterPageProps {
  onRegister: (e: React.FormEvent) => void;
  onSwitchToLogin: () => void;
  setUsername: (value: string) => void;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  isLoading: boolean;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  error: string | null;
}

const RegisterPage: React.FC<RegisterPageProps> = ({
  onRegister,
  onSwitchToLogin,
  setUsername,
  setEmail,
  setPassword,
  setConfirmPassword,
  isLoading,
  username = '',
  email = '',
  password = '',
  confirmPassword = '',
  error,
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
      <Box component="form" onSubmit={onRegister} noValidate>
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
          Create your account
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box sx={{ px: 4, py: 1.5 }}>
            <TextField
                label="Username"
                placeholder="Enter your username"
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={commonTextFieldStyles}
            />
        </Box>
        <Box sx={{ px: 4, py: 1.5 }}>
             <TextField
                label="Email"
                placeholder="Enter your email"
                type="email"
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
        <Box sx={{ px: 4, py: 1.5 }}>
            <TextField
                label="Confirm Password"
                placeholder="Confirm your password"
                type="password"
                fullWidth
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                sx={commonTextFieldStyles}
            />
        </Box>

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
            {isLoading ? <CircularProgress size={24} /> : 'Register'}
          </Button>
        </Box>
        <Typography
          sx={{
            color: isDarkMode ? '#9daebe' : '#49739c',
            textAlign: 'center',
            fontSize: '0.875rem',
          }}
        >
          Already have an account?{' '}
          <Link
            component="button"
            type="button"
            onClick={onSwitchToLogin}
            sx={{
              color: isDarkMode ? '#dce8f3' : '#0c7ff2',
              textDecoration: 'underline',
              fontWeight: 'medium',
            }}
          >
            Log in
          </Link>
        </Typography>
      </Box>
    </AuthLayout>
  );
};

export default RegisterPage;