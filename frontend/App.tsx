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

  // Force complete re-render when theme changes
  React.useEffect(() => {
    // Force a style recalculation
    document.documentElement.style.setProperty('--theme-mode', mode);
  }, [mode]);

  return (
    <ThemeProvider theme={theme}>
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
      {isAuthenticated && user ? (
        <MainApp key={`${user.id}-${mode}`} user={user} />
      ) : (
        <AuthFlow key={`auth-${mode}`} />
      )}
    </ThemeProvider>
  );
};

export default App;