import { useState, useMemo, useEffect, useCallback } from 'react';
import { createTheme } from '@mui/material/styles';

export const useTheme = () => {
  const [mode, setMode] = useState<'light' | 'dark'>(() => 
    (localStorage.getItem('themeMode') as 'light' | 'dark') || 'light'
  );

  // Apply theme immediately to DOM
  const applyThemeToDOM = useCallback((themeMode: 'light' | 'dark') => {
    const root = document.documentElement;
    const body = document.body;
    
    // Remove existing theme classes
    root.classList.remove('theme-light', 'theme-dark');
    body.classList.remove('theme-light', 'theme-dark');
    
    // Add new theme class
    root.classList.add(`theme-${themeMode}`);
    body.classList.add(`theme-${themeMode}`);
    
    // Set CSS custom properties
    root.style.setProperty('--theme-mode', themeMode);
    root.setAttribute('data-theme', themeMode);
    
    // Apply immediate background colors
    if (themeMode === 'dark') {
      body.style.backgroundColor = '#141a1f';
      body.style.color = '#ffffff';
    } else {
      body.style.backgroundColor = '#f8fafc';
      body.style.color = '#0d141c';
    }
    
    // Force layout recalculation
    body.offsetHeight;
  }, []);

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
    applyThemeToDOM(mode);
  }, [mode, applyThemeToDOM]);

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
    const newMode = mode === 'light' ? 'dark' : 'light';
    
    // Apply theme immediately before state update
    applyThemeToDOM(newMode);
    localStorage.setItem('themeMode', newMode);
    
    // Update state
    setMode(newMode);
  }, [mode, applyThemeToDOM]);

  return { theme, mode, setMode, toggleMode };
};