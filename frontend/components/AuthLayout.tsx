import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { Box } from '@mui/material';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const { theme } = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.palette.background.default,
        color: theme.palette.text.primary,
        transition: 'all 0.2s ease-in-out',
      }}
    >
      {children}
    </Box>
  );
};

export default AuthLayout;