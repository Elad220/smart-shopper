import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Box, Container, Paper, TextField, Button, Typography,
  Link, InputAdornment, IconButton, Stack, useTheme, LinearProgress, Divider
} from '@mui/material';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShoppingCart, User, Check, X } from 'lucide-react';
import GoogleLoginButton from './GoogleLoginButton';

interface RegisterFormProps {
  onRegister: (data: { username: string; email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  onSwitchToLogin: () => void;
  isLoading: boolean;
  onGoogleLoginSuccess?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegister, onSwitchToLogin, isLoading, onGoogleLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const theme = useTheme();

  const getPasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const getStrengthColor = (strength: number) => {
    if (strength <= 25) return theme.palette.error.main;
    if (strength <= 50) return theme.palette.warning.main;
    if (strength <= 75) return theme.palette.info.main;
    return theme.palette.success.main;
  };

  const getStrengthText = (strength: number) => {
    if (strength <= 25) return 'Weak';
    if (strength <= 50) return 'Fair';
    if (strength <= 75) return 'Good';
    return 'Strong';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (passwordStrength < 50) {
      setError('Password is too weak');
      return;
    }

    const result = await onRegister({ username, email, password });
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
                Create Account
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Join Smart Shopper and start organizing your shopping
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
                or sign up with email
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
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                margin="normal"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <User size={20} color={theme.palette.text.secondary} />
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

              {/* Password Strength Indicator */}
              {password && (
                <Box sx={{ mt: 1, mb: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={passwordStrength}
                    sx={{
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: `${getStrengthColor(passwordStrength)}20`,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getStrengthColor(passwordStrength),
                        borderRadius: 2,
                      },
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Password strength: {getStrengthText(passwordStrength)}
                  </Typography>
                </Box>
              )}

              <TextField
                fullWidth
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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

              {/* Password Match Indicator */}
              {confirmPassword && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  {passwordsMatch ? (
                    <Check size={16} color={theme.palette.success.main} />
                  ) : (
                    <X size={16} color={theme.palette.error.main} />
                  )}
                  <Typography variant="caption" color={passwordsMatch ? 'success.main' : 'error.main'}>
                    {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                  </Typography>
                </Box>
              )}

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
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>

              <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?
                </Typography>
                <Link
                  component="button"
                  variant="body2"
                  onClick={onSwitchToLogin}
                  sx={{
                    textDecoration: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Sign in
                </Link>
              </Stack>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default RegisterForm;