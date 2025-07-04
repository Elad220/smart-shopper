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
      root.style.setProperty('--bg-color', '#0f172a');
      root.style.setProperty('--text-color', '#f8fafc');
      root.style.setProperty('--paper-color', '#1e293b');
      root.style.setProperty('--border-color', '#334155');
    } else {
      root.style.setProperty('--bg-color', '#ffffff');
      root.style.setProperty('--text-color', '#0f172a');
      root.style.setProperty('--paper-color', '#f8fafc');
      root.style.setProperty('--border-color', '#e2e8f0');
    }
  }, [mode]);

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      ...(mode === 'light' ? {
        primary: { 
          main: '#3b82f6',
          light: '#60a5fa',
          dark: '#1d4ed8',
          contrastText: '#ffffff'
        },
        secondary: { 
          main: '#8b5cf6',
          light: '#a78bfa',
          dark: '#7c3aed',
          contrastText: '#ffffff'
        },
        background: { 
          default: '#ffffff', 
          paper: '#f8fafc' 
        },
        text: { 
          primary: '#0f172a', 
          secondary: '#475569' 
        },
        divider: '#e2e8f0',
        action: {
          hover: '#f1f5f9',
          selected: '#e2e8f0',
          disabled: '#94a3b8',
          disabledBackground: '#f1f5f9'
        },
        grey: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a'
        }
      } : {
        primary: { 
          main: '#60a5fa',
          light: '#93c5fd',
          dark: '#3b82f6',
          contrastText: '#0f172a'
        },
        secondary: { 
          main: '#a78bfa',
          light: '#c4b5fd',
          dark: '#8b5cf6',
          contrastText: '#0f172a'
        },
        background: { 
          default: '#0f172a', 
          paper: '#1e293b' 
        },
        text: { 
          primary: '#f8fafc', 
          secondary: '#cbd5e1' 
        },
        divider: '#334155',
        action: {
          hover: '#1e293b',
          selected: '#334155',
          disabled: '#475569',
          disabledBackground: '#1e293b'
        },
        grey: {
          50: '#0f172a',
          100: '#1e293b',
          200: '#334155',
          300: '#475569',
          400: '#64748b',
          500: '#94a3b8',
          600: '#cbd5e1',
          700: '#e2e8f0',
          800: '#f1f5f9',
          900: '#f8fafc'
        }
      })
    },
    typography: {
      fontFamily: '"Inter", "system-ui", "-apple-system", sans-serif',
      h1: { fontSize: '2.25rem', fontWeight: 700, color: mode === 'light' ? '#0f172a' : '#f8fafc' },
      h2: { fontSize: '1.875rem', fontWeight: 600, color: mode === 'light' ? '#0f172a' : '#f8fafc' },
      h6: { fontWeight: 600, color: mode === 'light' ? '#0f172a' : '#f8fafc' },
      body1: { fontSize: '1rem', lineHeight: 1.5, color: mode === 'light' ? '#0f172a' : '#f8fafc' },
      body2: { fontSize: '0.875rem', lineHeight: 1.43, color: mode === 'light' ? '#475569' : '#cbd5e1' }
    },
    shape: { borderRadius: 8 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: mode === 'light' ? '#ffffff !important' : '#0f172a !important',
            color: mode === 'light' ? '#0f172a !important' : '#f8fafc !important',
            transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out',
          },
          '*': {
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: mode === 'light' ? '#f1f5f9' : '#1e293b',
            },
            '&::-webkit-scrollbar-thumb': {
              background: mode === 'light' ? '#cbd5e1' : '#475569',
              borderRadius: '4px',
            },
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#f8fafc' : '#1e293b',
            border: `1px solid ${mode === 'light' ? '#e2e8f0' : '#334155'}`,
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#f8fafc' : '#1e293b',
            backgroundImage: 'none',
          }
        }
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === 'light' ? '#ffffff' : '#1e293b',
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