// frontend/App.tsx
import React, { useEffect, useState } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import AuthFlow from './components/auth/AuthFlow';
import MainApp from './components/app/MainApp';

const App: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { theme, mode } = useTheme();
  const [themeKey, setThemeKey] = useState<number>(0);

  // Force re-render when theme changes
  useEffect(() => {
    setThemeKey((prev: number) => prev + 1);
    
    // Listen for custom theme change events
    const handleThemeChange = () => {
      setThemeKey((prev: number) => prev + 1);
    };
    
    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, [mode]);

  return (
    <ThemeProvider theme={theme} key={`theme-${themeKey}`}>
      <CssBaseline enableColorScheme />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '8px',
            background: theme.palette.background.paper,
            color: theme.palette.text.primary,
            border: `1px solid ${theme.palette.divider}`,
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: theme.palette.success?.main || '#22c55e',
              secondary: theme.palette.common.white,
            },
          },
          error: {
            iconTheme: {
              primary: theme.palette.error?.main || '#ef4444',
              secondary: theme.palette.common.white,
            },
          },
        }}
      />
      {isAuthenticated && user ? (
        <MainApp user={user} key={`main-${themeKey}`} />
      ) : (
        <AuthFlow key={`auth-${themeKey}`} />
      )}
    </ThemeProvider>
  );
};

export default App;