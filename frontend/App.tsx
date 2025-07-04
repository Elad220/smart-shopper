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
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
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
      <div key={`app-${mode}`}>
        {isAuthenticated && user ? (
          <MainApp key={`${user.id}-${mode}`} user={user} />
        ) : (
          <AuthFlow key={`auth-${mode}`} />
        )}
      </div>
    </ThemeProvider>
  );
};

export default App;