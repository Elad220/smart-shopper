// frontend/components/Footer.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useThemeChange } from '../hooks/useThemeChange';

const Footer: React.FC = () => {
  const theme = useTheme();
  const themeChangeKey = useThemeChange();

  return (
    <Box
      key={themeChangeKey}
      component="footer"
      sx={{
        py: 2,
        px: 3,
        backgroundColor: theme.palette.background.paper,
        borderTop: `1px solid ${theme.palette.divider}`,
        mt: 'auto',
        color: theme.palette.text.secondary,
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