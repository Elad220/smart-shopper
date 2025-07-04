import React from 'react';
import { Box } from '@mui/material';
import { User } from '../../hooks/useAuth';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import Header from '../layout/Header';
import ShoppingApp from './ShoppingApp';

interface MainAppProps {
  user: User;
}

const MainApp: React.FC<MainAppProps> = ({ user }) => {
  const { logout } = useAuth();
  const { mode, toggleMode } = useTheme();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ShoppingApp user={user} mode={mode} onToggleMode={toggleMode} onLogout={logout} />
    </Box>
  );
};

export default MainApp;