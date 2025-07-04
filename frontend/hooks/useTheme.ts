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
          disabled: '#64748b'
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
            backgroundColor: mode === 'light' ? '#ffffff' : '#0f172a',
            color: mode === 'light' ? '#111827' : '#f8fafc',
            transition: 'background-color 0.3s ease-in-out, color 0.3s ease-in-out',
          },
          '*': {
            transition: 'background-color 0.3s ease-in-out, color 0.3s ease-in-out',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: mode === 'light' ? '#f1f5f9' : '#1e293b',
            },
            '&::-webkit-scrollbar-thumb': {
              background: mode === 'light' ? '#cbd5e1' : '#64748b',
              borderRadius: '4px',
              '&:hover': {
                background: mode === 'light' ? '#94a3b8' : '#475569',
              }
            },
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#f8fafc' : '#1e293b',
            border: `1px solid ${mode === 'light' ? '#e2e8f0' : '#334155'}`,
            transition: 'background-color 0.3s ease-in-out, border-color 0.3s ease-in-out',
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#f8fafc' : '#1e293b',
            backgroundImage: 'none',
            transition: 'background-color 0.3s ease-in-out',
          }
        }
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === 'light' ? '#ffffff' : '#1e293b',
            backgroundImage: 'none',
            transition: 'background-color 0.3s ease-in-out',
          }
        }
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(30, 41, 59, 0.8)',
            backdropFilter: 'blur(20px)',
            transition: 'background-color 0.3s ease-in-out',
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            transition: 'all 0.3s ease-in-out',
          }
        }
      }
    }
  }), [mode]);

  const toggleMode = useCallback(() => {
    setMode(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  return { theme, mode, setMode, toggleMode };
};