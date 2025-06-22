import React from 'react';
import { Box, Typography, SvgIcon } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const TicklistIcon = () => (
  <SvgIcon viewBox="0 0 48 48" fill="none">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z"
      fill="currentColor"
    />
  </SvgIcon>
);

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: isDarkMode ? '#141a1f' : '#f8fafc',
        fontFamily: '"Spline Sans", "Noto Sans", sans-serif',
      }}
    >
      <Box
        component="header"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: isDarkMode ? '#2b3640' : '#e7edf4',
          px: 5,
          py: 1.5,
          color: isDarkMode ? 'white' : '#0d141c',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TicklistIcon />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Ticklist
          </Typography>
        </Box>
      </Box>
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