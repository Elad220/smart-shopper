import { useState, useMemo, useEffect, useCallback } from 'react';
import { createTheme } from '@mui/material/styles';

export const useTheme = () => {
  const [mode, setMode] = useState<'light' | 'dark'>(() => 
    (localStorage.getItem('themeMode') as 'light' | 'dark') || 'light'
  );

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      ...(mode === 'light' ? {
        primary: { main: '#0c7ff2' },
        secondary: { main: '#9c27b0' },
        background: { default: '#f8fafc', paper: '#ffffff' },
        text: { primary: '#0d141c', secondary: '#49739c' }
      } : {
        primary: { main: '#dce8f3' },
        secondary: { main: '#ce93d8' },
        background: { default: '#141a1f', paper: '#1f272e' },
        text: { primary: '#ffffff', secondary: '#9daebe' }
      })
    },
    typography: {
      fontFamily: 'Roboto, Arial, sans-serif',
      h1: { fontSize: '2.2rem', fontWeight: 700 },
      h2: { fontSize: '1.75rem', fontWeight: 600 },
    },
    shape: { borderRadius: 12 },
  }), [mode]);

  const toggleMode = useCallback(() => {
    setMode(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  return { theme, mode, setMode, toggleMode };
};