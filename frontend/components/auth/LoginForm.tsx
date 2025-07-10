import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Box, Container, Paper, TextField, Button, Typography,
  Link, InputAdornment, IconButton, Stack, useTheme, LinearProgress, Divider
} from '@mui/material';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShoppingCart } from 'lucide-react';
import GoogleLoginButton from './GoogleLoginButton';

interface LoginFormProps {
  onLogin: (data: { email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  onSwitchToRegister: () => void;
  isLoading: boolean;
  onGoogleLoginSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onSwitchToRegister, isLoading, onGoogleLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const theme = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    const result = await onLogin({ email, password });
    if (!result.success && result.error) {
      setError(result.error);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
      py: 4,
    }}>
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: '16px',
              background: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.05)' 
                : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                style={{ display: 'inline-block', marginBottom: '16px' }}
              >
                <ShoppingCart size={48} color={theme.palette.primary.main} />
              </motion.div>
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
                Welcome Back
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Sign in to your Smart Shopper account
              </Typography>
            </Box>

            {/* Google Login Button */}
            <Box sx={{ mb: 3 }}>
              <GoogleLoginButton
                fullWidth
                size="large"
                onSuccess={onGoogleLoginSuccess}
                onError={(error) => setError(error)}
              />
            </Box>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                or continue with email
              </Typography>
            </Divider>

            <Box component="form" onSubmit={handleSubmit} noValidate>
              {error && (
                <Typography color="error" variant="body2" sx={{ mb: 2, textAlign: 'center' }}>
                  {error}
                </Typography>
              )}

              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail size={20} color={theme.palette.text.secondary} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  },
                }}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock size={20} color={theme.palette.text.secondary} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  },
                }}
              />

              {isLoading && (
                <LinearProgress sx={{ mt: 2, borderRadius: '4px' }} />
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                endIcon={<ArrowRight size={20} />}
                sx={{
                  mt: 3,
                  mb: 2,
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  py: 1.5,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                  },
                }}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>

              <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?
                </Typography>
                <Link
                  component="button"
                  variant="body2"
                  onClick={onSwitchToRegister}
                  sx={{
                    textDecoration: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Sign up
                </Link>
              </Stack>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default LoginForm;