import { useState, useMemo, useEffect, useCallback } from 'react';
import { createTheme } from '@mui/material/styles';

export const useTheme = () => {
  const [mode, setMode] = useState<'light' | 'dark'>(() => 
    (localStorage.getItem('themeMode') as 'light' | 'dark') || 'light'
  );

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
    
    // Update data attributes for CSS-based styling
    const root = document.documentElement;
    const body = document.body;
    
    body.setAttribute('data-theme', mode);
    root.setAttribute('data-theme', mode);
    
    // Set CSS custom properties for immediate theme switching
    if (mode === 'dark') {
      root.style.setProperty('--bg-color', '#1a1a1a');
      root.style.setProperty('--text-color', '#ffffff');
      root.style.setProperty('--paper-color', '#2a2a2a');
      root.style.setProperty('--border-color', '#404040');
    } else {
      root.style.setProperty('--bg-color', '#ffffff');
      root.style.setProperty('--text-color', '#111827');
      root.style.setProperty('--paper-color', '#f8fafc');
      root.style.setProperty('--border-color', '#e2e8f0');
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
          main: '#60a5fa',
          light: '#93c5fd',
          dark: '#3b82f6'
        },
        secondary: { 
          main: '#a78bfa',
          light: '#c4b5fd',
          dark: '#8b5cf6'
        },
        background: { 
          default: '#1a1a1a', 
          paper: '#2a2a2a' 
        },
        text: { 
          primary: '#f8fafc', 
          secondary: '#cbd5e1' 
        },
        divider: '#404040',
        action: {
          hover: '#374151',
          selected: '#4b5563',
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
            backgroundColor: mode === 'light' ? '#ffffff' : '#1a1a1a',
            color: mode === 'light' ? '#111827' : '#f8fafc',
            transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out',
          },
          '*': {
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: mode === 'light' ? '#f1f5f9' : '#2a2a2a',
            },
            '&::-webkit-scrollbar-thumb': {
              background: mode === 'light' ? '#cbd5e1' : '#6b7280',
              borderRadius: '4px',
              '&:hover': {
                background: mode === 'light' ? '#94a3b8' : '#9ca3af',
              }
            },
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            ...(mode === 'dark' && {
              backgroundColor: '#2a2a2a !important',
              border: '1px solid #404040 !important',
            }),
            transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out',
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            ...(mode === 'dark' && {
              backgroundColor: '#2a2a2a !important',
            }),
            backgroundImage: 'none',
            transition: 'background-color 0.2s ease-in-out',
          }
        }
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            ...(mode === 'dark' && {
              backgroundColor: '#2a2a2a !important',
            }),
            backgroundImage: 'none',
            transition: 'background-color 0.2s ease-in-out',
          }
        }
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(26, 26, 26, 0.9)',
            backdropFilter: 'blur(20px)',
            transition: 'background-color 0.2s ease-in-out',
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            transition: 'all 0.2s ease-in-out',
          }
        }
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            // Remove global overrides to let component-level styles take precedence
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