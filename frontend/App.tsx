// frontend/App.tsx
import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import AuthFlow from './components/auth/AuthFlow';
import MainApp from './components/app/MainApp';

const App: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { theme, mode } = useTheme();

  // Force re-render when theme or auth state changes
  const appKey = `${mode}-${isAuthenticated ? user?.id || 'auth' : 'noauth'}`;

  return (
    <ThemeProvider theme={theme} key={`theme-${mode}`}>
      <CssBaseline />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '12px',
            background: theme.palette.background.paper,
            color: theme.palette.text.primary,
          },
        }}
      />
      <div key={appKey}>
        {isAuthenticated && user ? (
          <MainApp user={user} />
        ) : (
          <AuthFlow />
        )}
      </div>
    </ThemeProvider>
  );
};

export default App;