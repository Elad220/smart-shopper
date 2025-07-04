// frontend/components/Footer.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const Footer: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 3,
        backgroundColor: isDarkMode ? '#000000' : '#e7edf4',
        borderTop: `1px solid ${isDarkMode ? '#1a1a1a' : '#c1d9f0'}`,
        mt: 'auto',
        color: isDarkMode ? '#d1d5db' : '#49739c',
        transition: 'all 0.2s ease-in-out',
      }}
    >
      <Typography variant="body2" align="center">
        © 2024 Smart Shopper. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;