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
  const [themeKey, setThemeKey] = React.useState(0);

  // Force complete re-render when theme changes
  React.useEffect(() => {
    // Force immediate visual update
    document.documentElement.style.setProperty('--theme-mode', mode);
    document.body.style.backgroundColor = mode === 'dark' ? '#141a1f' : '#f8fafc';
    document.body.style.color = mode === 'dark' ? '#ffffff' : '#0d141c';
    document.documentElement.setAttribute('data-theme', mode);
    
    // Force all components to re-render with new theme
    setThemeKey((prev: number) => prev + 1);
  }, [mode]);

  return (
    <ThemeProvider key={`theme-${mode}-${themeKey}`} theme={theme}>
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
      <div key={`app-${mode}-${themeKey}`}>
        {isAuthenticated && user ? (
          <MainApp key={`${user.id}-${mode}-${themeKey}`} user={user} />
        ) : (
          <AuthFlow key={`auth-${mode}-${themeKey}`} />
        )}
      </div>
    </ThemeProvider>
  );
};

export default App;