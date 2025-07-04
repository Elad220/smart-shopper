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
      body.style.backgroundColor = '#1a202c';
      body.style.color = '#f7fafc';
    } else {
      body.style.backgroundColor = '#f8fafc';
      body.style.color = '#1a202c';
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
        primary: { 
          main: '#0c7ff2',
          light: '#4dabf7',
          dark: '#0b5fa3'
        },
        secondary: { 
          main: '#9c27b0',
          light: '#ba68c8',
          dark: '#7b1fa2'
        },
        background: { 
          default: '#f8fafc', 
          paper: '#ffffff' 
        },
        text: { 
          primary: '#1a202c', 
          secondary: '#4a5568' 
        },
        divider: '#e2e8f0',
        action: {
          hover: '#f7fafc',
          selected: '#edf2f7',
          disabled: '#a0aec0'
        }
      } : {
        primary: { 
          main: '#4dabf7',
          light: '#74c0fc',
          dark: '#339af0'
        },
        secondary: { 
          main: '#da77f2',
          light: '#e599f7',
          dark: '#be4bdb'
        },
        background: { 
          default: '#1a202c', 
          paper: '#2d3748' 
        },
        text: { 
          primary: '#f7fafc', 
          secondary: '#e2e8f0' 
        },
        divider: '#4a5568',
        action: {
          hover: '#2d3748',
          selected: '#4a5568',
          disabled: '#718096'
        }
      })
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Arial", sans-serif',
      h1: { fontSize: '2.2rem', fontWeight: 700 },
      h2: { fontSize: '1.75rem', fontWeight: 600 },
      h6: { fontWeight: 600 },
      body1: { fontSize: '1rem', lineHeight: 1.5 },
      body2: { fontSize: '0.875rem', lineHeight: 1.43 }
    },
    shape: { borderRadius: 12 },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: mode === 'light' 
              ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
              : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
          }
        }
      }
    }
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