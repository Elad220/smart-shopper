// frontend/components/Footer.tsx
import React from 'react';
import { Box, Typography, Link } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const Footer: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 2,
        mt: 'auto',
        backgroundColor: isDarkMode ? '#1f272e' : '#e7edf4',
        borderTop: `1px solid ${isDarkMode ? '#3d4d5c' : '#c1d9f0'}`,
        textAlign: 'center',
        color: isDarkMode ? '#9daebe' : '#49739c',
      }}
    >
      <Typography variant="body2" sx={{ mb: 1 }}>
        &copy; {new Date().getFullYear()} Ticklist. All Rights Reserved.
      </Typography>
      <Box>
        <Link href="#" color="inherit" sx={{ mx: 1 }}>
          Privacy Policy
        </Link>
        <Link href="#" color="inherit" sx={{ mx: 1 }}>
          Terms of Service
        </Link>
      </Box>
    </Box>
  );
};

export default Footer;