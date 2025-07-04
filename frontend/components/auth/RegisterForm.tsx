import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Box, Container, Paper, TextField, Button, Typography,
  Link, InputAdornment, IconButton, Stack, useTheme, LinearProgress
} from '@mui/material';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShoppingCart, User, Check, X } from 'lucide-react';

interface RegisterFormProps {
  onRegister: (data: { username: string; email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  onSwitchToLogin: () => void;
  isLoading: boolean;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegister, onSwitchToLogin, isLoading }) => {
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
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: '24px',
              background: theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            {/* Header */}
            <Box textAlign="center" sx={{ mb: 4 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '20px',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                }}
              >
                <ShoppingCart size={40} color="white" />
              </Box>
              
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Join Smart Shopper
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Create your account and start shopping smarter
              </Typography>
            </Box>

            {/* Error Message */}
            {error && (
              <Box sx={{ 
                p: 2, 
                mb: 3, 
                borderRadius: '12px', 
                background: `${theme.palette.error.main}10`,
                border: `1px solid ${theme.palette.error.light}`,
              }}>
                <Typography color="error" variant="body2">{error}</Typography>
              </Box>
            )}

            {/* Register Form */}
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <User size={20} />
                      </InputAdornment>
                    ),
                    endAdornment: username.length >= 3 && (
                      <InputAdornment position="end">
                        <Check size={20} color={theme.palette.success.main} />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: '12px' },
                  }}
                />

                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Mail size={20} />
                      </InputAdornment>
                    ),
                    endAdornment: email && (
                      <InputAdornment position="end">
                        {isValidEmail(email) ? (
                          <Check size={20} color={theme.palette.success.main} />
                        ) : (
                          <X size={20} color={theme.palette.error.main} />
                        )}
                      </InputAdornment>
                    ),
                    sx: { borderRadius: '12px' },
                  }}
                />

                <Box>
                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock size={20} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            size="small"
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                      sx: { borderRadius: '12px' },
                    }}
                  />
                  
                  {password && (
                    <Box sx={{ mt: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Password strength:
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: getStrengthColor(passwordStrength),
                            fontWeight: 600,
                          }}
                        >
                          {getStrengthText(passwordStrength)}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={passwordStrength}
                        sx={{
                          height: 4,
                          borderRadius: 2,
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getStrengthColor(passwordStrength),
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Box>
                  )}
                </Box>

                <TextField
                  fullWidth
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock size={20} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Stack direction="row" spacing={1} alignItems="center">
                          {confirmPassword && (
                            passwordsMatch ? (
                              <Check size={20} color={theme.palette.success.main} />
                            ) : (
                              <X size={20} color={theme.palette.error.main} />
                            )
                          )}
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                            size="small"
                          >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </IconButton>
                        </Stack>
                      </InputAdornment>
                    ),
                    sx: { borderRadius: '12px' },
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  size="large"
                  disabled={isLoading || !username || !isValidEmail(email) || !passwordsMatch || passwordStrength < 50}
                  endIcon={<ArrowRight size={20} />}
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    py: 1.5,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    '&:disabled': {
                      background: theme.palette.action.disabledBackground,
                    },
                  }}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </Stack>
            </form>

            {/* Sign In Link */}
            <Box textAlign="center" sx={{ mt: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link
                  component="button"
                  type="button"
                  onClick={onSwitchToLogin}
                  sx={{
                    fontWeight: 600,
                    textDecoration: 'none',
                    color: theme.palette.primary.main,
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  Sign in here
                </Link>
              </Typography>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default RegisterForm;