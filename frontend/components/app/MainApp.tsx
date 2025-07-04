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
      <Header
        mode={mode}
        onToggleMode={toggleMode}
        isAuthenticated={true}
        user={user}
        onLogout={logout}
      />
      <ShoppingApp user={user} />
    </Box>
  );
};

export default MainApp;