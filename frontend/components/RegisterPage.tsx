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
  isLoading: boolean;
  username?: string;
  email?: string;
  password?: string;
  error: string | null;
  successMessage: string | null;
}

const RegisterPage: React.FC<RegisterPageProps> = ({
  onRegister,
  onSwitchToLogin,
  setUsername,
  setEmail,
  setPassword,
  isLoading,
  username = '',
  email = '',
  password = '',
  error,
  successMessage,
}) => {
  const theme = useTheme();

  const commonTextFieldStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: theme.palette.background.paper,
      transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out',
      '& fieldset': {
        borderColor: theme.palette.divider,
      },
      '&:hover fieldset': {
        borderColor: theme.palette.action.hover,
      },
      '&.Mui-focused fieldset': {
        borderColor: theme.palette.primary.main,
      },
    },
    '& .MuiInputBase-input': {
      color: theme.palette.text.primary,
      transition: 'color 0.2s ease-in-out',
    },
     '& .MuiInputLabel-root': {
        color: theme.palette.text.secondary,
        transition: 'color 0.2s ease-in-out',
    },
  };

  return (
    <AuthLayout>
      <Box component="form" onSubmit={onRegister} noValidate>
        <Typography
          variant="h4"
          sx={{
            color: theme.palette.text.primary,
            fontWeight: 'bold',
            textAlign: 'center',
            pb: 3,
            pt: 5,
            transition: 'color 0.2s ease-in-out',
          }}
        >
          Create your account
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

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

        <Box sx={{ px: 4, py: 3 }}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            sx={{
              borderRadius: '9999px',
              height: 48,
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              fontWeight: 'bold',
              textTransform: 'none',
              fontSize: '1rem',
              transition: 'all 0.2s ease-in-out',
               '&:hover': {
                bgcolor: theme.palette.primary.dark,
              }
            }}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Create Account'}
          </Button>
        </Box>
        <Typography
          sx={{
            color: theme.palette.text.secondary,
            textAlign: 'center',
            fontSize: '0.875rem',
            transition: 'color 0.2s ease-in-out',
          }}
        >
          Already have an account?{' '}
          <Link
            component="button"
            type="button"
            onClick={onSwitchToLogin}
            sx={{
              color: theme.palette.primary.main,
              textDecoration: 'underline',
              fontWeight: 'medium',
              transition: 'color 0.2s ease-in-out',
            }}
          >
            Sign in
          </Link>
        </Typography>
      </Box>
    </AuthLayout>
  );
};

export default RegisterPage;