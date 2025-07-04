import { useState, useMemo, useEffect, useCallback } from 'react';
import { createTheme } from '@mui/material/styles';

export const useTheme = () => {
  const [mode, setMode] = useState<'light' | 'dark'>(() => 
    (localStorage.getItem('themeMode') as 'light' | 'dark') || 'light'
  );

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
    
    // Apply CSS custom properties for immediate theme switching
    const root = document.documentElement;
    if (mode === 'dark') {
      root.style.setProperty('--bg-color', '#111827');
      root.style.setProperty('--text-color', '#f9fafb');
      root.style.setProperty('--paper-color', '#1f2937');
      root.style.setProperty('--border-color', '#374151');
    } else {
      root.style.setProperty('--bg-color', '#ffffff');
      root.style.setProperty('--text-color', '#111827');
      root.style.setProperty('--paper-color', '#f8fafc');
      root.style.setProperty('--border-color', '#e5e7eb');
    }
  }, [mode]);

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      ...(mode === 'light' ? {
        primary: { 
          main: '#2563eb',
          light: '#3b82f6',
          dark: '#1d4ed8'
        },
        secondary: { 
          main: '#7c3aed',
          light: '#8b5cf6',
          dark: '#6d28d9'
        },
        background: { 
          default: '#ffffff', 
          paper: '#f8fafc' 
        },
        text: { 
          primary: '#111827', 
          secondary: '#6b7280' 
        },
        divider: '#e5e7eb',
        action: {
          hover: '#f3f4f6',
          selected: '#e5e7eb',
          disabled: '#9ca3af'
        }
      } : {
        primary: { 
          main: '#3b82f6',
          light: '#60a5fa',
          dark: '#2563eb'
        },
        secondary: { 
          main: '#8b5cf6',
          light: '#a78bfa',
          dark: '#7c3aed'
        },
        background: { 
          default: '#111827', 
          paper: '#1f2937' 
        },
        text: { 
          primary: '#f9fafb', 
          secondary: '#d1d5db' 
        },
        divider: '#374151',
        action: {
          hover: '#1f2937',
          selected: '#374151',
          disabled: '#6b7280'
        }
      })
    },
    typography: {
      fontFamily: '"Inter", "system-ui", "-apple-system", sans-serif',
      h1: { fontSize: '2.25rem', fontWeight: 700 },
      h2: { fontSize: '1.875rem', fontWeight: 600 },
      h6: { fontWeight: 600 },
      body1: { fontSize: '1rem', lineHeight: 1.5 },
      body2: { fontSize: '0.875rem', lineHeight: 1.43 }
    },
    shape: { borderRadius: 8 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: mode === 'light' ? '#ffffff !important' : '#111827 !important',
            color: mode === 'light' ? '#111827 !important' : '#f9fafb !important',
            transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out',
          },
          '*': {
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: mode === 'light' ? '#f3f4f6' : '#1f2937',
            },
            '&::-webkit-scrollbar-thumb': {
              background: mode === 'light' ? '#d1d5db' : '#6b7280',
              borderRadius: '4px',
            },
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#f8fafc' : '#1f2937',
            border: `1px solid ${mode === 'light' ? '#e5e7eb' : '#374151'}`,
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#f8fafc' : '#1f2937',
            backgroundImage: 'none',
          }
        }
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === 'light' ? '#ffffff' : '#1f2937',
            backgroundImage: 'none',
          }
        }
      }
    }
  }), [mode]);

  const toggleMode = useCallback(() => {
    setMode(prev => {
      const newMode = prev === 'light' ? 'dark' : 'light';
      
      // Force immediate DOM updates
      setTimeout(() => {
        const event = new CustomEvent('themeChange', { detail: { mode: newMode } });
        window.dispatchEvent(event);
      }, 0);
      
      return newMode;
    });
  }, []);

  return { theme, mode, setMode, toggleMode };
};