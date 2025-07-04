import React from 'react';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: theme.palette.background.default,
        fontFamily: '"Spline Sans", "Noto Sans", sans-serif',
        pt: '64px', // Added padding for the header
        transition: 'background-color 0.2s ease-in-out',
      }}
    >
      <Box
        component="main"
        sx={{
          display: 'flex',
          flex: 1,
          justifyContent: 'center',
          py: 5,
          px: { xs: 2, sm: 5 },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 480 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AuthLayout;