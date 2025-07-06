import React from 'react';
import { Box } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import ShoppingApp from './ShoppingApp';

const MainApp: React.FC = () => {
  const { user, logout } = useAuth();
  const { mode, toggleMode } = useTheme();

  if (!user) return null;

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ShoppingApp user={user} mode={mode} onToggleMode={toggleMode} onLogout={logout} />
    </Box>
  );
};

export default MainApp;