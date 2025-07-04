import React from 'react';
import { Box, Typography, TextField, Button, Link, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
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

  const commonTextFieldStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: theme.palette.background.paper,
      transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out',
      '& fieldset': {
        borderColor: theme.palette.divider,
      },
      '&:hover fieldset': {
        borderColor: theme.palette.divider,
      },
      '&.Mui-focused fieldset': {
        borderColor: theme.palette.primary.main,
        borderWidth: '2px',
      },
    },
    '& .MuiInputBase-input': {
      color: theme.palette.text.primary,
      transition: 'color 0.2s ease-in-out',
      '&::placeholder': {
        color: theme.palette.text.secondary,
        opacity: 0.8,
      },
    },
    '& .MuiInputLabel-root': {
      color: theme.palette.text.secondary,
      transition: 'color 0.2s ease-in-out',
      '&.Mui-focused': {
        color: theme.palette.primary.main,
      },
    },
  };

  return (
    <AuthLayout>
      <Box component="form" onSubmit={onLogin} noValidate>
        <Box sx={{ textAlign: 'center', mb: 3, pt: 3 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: 3,
              bgcolor: theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              mb: 3,
            }}
          >
            <ShoppingCartIcon sx={{ color: 'white', fontSize: 40 }} />
          </Box>
        </Box>

        <Typography
          variant="h4"
          sx={{
            color: theme.palette.text.primary,
            fontWeight: 'bold',
            textAlign: 'center',
            pb: 2,
            pt: 0,
            transition: 'color 0.2s ease-in-out',
          }}
        >
          Welcome Back!
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: theme.palette.text.secondary,
            textAlign: 'center',
            pb: 3,
            transition: 'color 0.2s ease-in-out',
          }}
        >
          Sign in to your Smart Shopper account
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
                color: theme.palette.text.secondary,
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
              bgcolor: theme.palette.primary.main,
              color: '#ffffff',
              fontWeight: 'bold',
              textTransform: 'none',
              fontSize: '1rem',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                bgcolor: theme.palette.primary.dark,
                color: '#ffffff',
              },
              '&:disabled': {
                bgcolor: theme.palette.action.disabled,
                color: '#ffffff',
              }
            }}
          >
            {isLoading ? <CircularProgress size={24} sx={{ color: '#ffffff' }} /> : 'Sign In →'}
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
          Don't have an account?{' '}
          <Link
            component="button"
            type="button"
            onClick={onSwitchToRegister}
            sx={{
              color: theme.palette.primary.main,
              textDecoration: 'underline',
              fontWeight: 'medium',
              transition: 'color 0.2s ease-in-out',
            }}
          >
            Create one here
          </Link>
        </Typography>
      </Box>
    </AuthLayout>
  );
};

export default LoginPage;