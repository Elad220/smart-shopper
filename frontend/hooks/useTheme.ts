import { useState, useMemo, useEffect, useCallback } from 'react';
import { createTheme } from '@mui/material/styles';

export const useTheme = () => {
  const [mode, setMode] = useState<'light' | 'dark'>(() => 
    (localStorage.getItem('themeMode') as 'light' | 'dark') || 'light'
  );

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
    
    // Immediately update CSS custom properties for instant theme switching
    const root = document.documentElement;
    const body = document.body;
    
    // Add data attributes for immediate CSS updates
    body.setAttribute('data-theme', mode);
    root.setAttribute('data-theme', mode);
    
    if (mode === 'dark') {
      root.style.setProperty('--bg-color', '#000000');
      root.style.setProperty('--text-color', '#ffffff');
      root.style.setProperty('--paper-color', '#0a0a0a');
      root.style.setProperty('--border-color', '#1a1a1a');
      body.style.backgroundColor = '#000000';
      body.style.color = '#ffffff';
      root.style.backgroundColor = '#000000';
    } else {
      // Light mode - use proper light colors
      root.style.setProperty('--bg-color', '#ffffff');
      root.style.setProperty('--text-color', '#111827');
      root.style.setProperty('--paper-color', '#f8fafc');
      root.style.setProperty('--border-color', '#e2e8f0');
      body.style.backgroundColor = '#ffffff';
      body.style.color = '#111827';
      root.style.backgroundColor = '#ffffff';
      
      // Clear any dark mode overrides
      body.style.removeProperty('color');
      body.style.removeProperty('background-color');
      root.style.removeProperty('color');
      root.style.removeProperty('background-color');
      
      // Let Material-UI handle the rest
      requestAnimationFrame(() => {
        body.style.backgroundColor = '';
        body.style.color = '';
        root.style.backgroundColor = '';
      });
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
          default: '#000000', 
          paper: '#0a0a0a' 
        },
        text: { 
          primary: '#ffffff', 
          secondary: '#d1d5db' 
        },
        divider: '#1a1a1a',
        action: {
          hover: '#1a1a1a',
          selected: '#2a2a2a',
          disabled: '#404040'
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
            backgroundColor: mode === 'light' ? '#ffffff !important' : '#000000 !important',
            color: mode === 'light' ? '#111827 !important' : '#ffffff !important',
            transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out',
          },
          html: {
            backgroundColor: mode === 'light' ? '#ffffff !important' : '#000000 !important',
          },
          '#root': {
            backgroundColor: mode === 'light' ? '#ffffff !important' : '#000000 !important',
            minHeight: '100vh',
          },
          '*': {
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: mode === 'light' ? '#f1f5f9' : '#0a0a0a',
            },
            '&::-webkit-scrollbar-thumb': {
              background: mode === 'light' ? '#cbd5e1' : '#404040',
              borderRadius: '4px',
              '&:hover': {
                background: mode === 'light' ? '#94a3b8' : '#606060',
              }
            },
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#f8fafc' : '#0a0a0a',
            border: `1px solid ${mode === 'light' ? '#e2e8f0' : '#1a1a1a'}`,
            transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out',
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#f8fafc' : '#0a0a0a',
            backgroundImage: 'none',
            transition: 'background-color 0.2s ease-in-out',
          }
        }
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === 'light' ? '#ffffff' : '#0a0a0a',
            backgroundImage: 'none',
            transition: 'background-color 0.2s ease-in-out',
          }
        }
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
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
            '& .MuiOutlinedInput-root': {
              backgroundColor: mode === 'light' ? '#ffffff' : '#0a0a0a',
              '& fieldset': {
                borderColor: mode === 'light' ? '#e2e8f0' : '#1a1a1a',
              },
              '&:hover fieldset': {
                borderColor: mode === 'light' ? '#cbd5e1' : '#2a2a2a',
              },
              '&.Mui-focused fieldset': {
                borderColor: mode === 'light' ? '#3b82f6' : '#60a5fa',
              },
            },
          }
        }
      }
    }
  }), [mode]);

  const toggleMode = useCallback(() => {
    setMode(prev => {
      const newMode = prev === 'light' ? 'dark' : 'light';
      
      // Force immediate DOM updates
      requestAnimationFrame(() => {
        const body = document.body;
        const root = document.documentElement;
        
        // Update data attributes immediately
        body.setAttribute('data-theme', newMode);
        root.setAttribute('data-theme', newMode);
        
        if (newMode === 'dark') {
          body.style.backgroundColor = '#000000';
          body.style.color = '#ffffff';
          root.style.backgroundColor = '#000000';
          root.style.setProperty('--bg-color', '#000000');
          root.style.setProperty('--text-color', '#ffffff');
          root.style.setProperty('--paper-color', '#0a0a0a');
          root.style.setProperty('--border-color', '#1a1a1a');
        } else {
          // Light mode - reset to Material-UI defaults
          root.style.setProperty('--bg-color', '#ffffff');
          root.style.setProperty('--text-color', '#111827');
          root.style.setProperty('--paper-color', '#f8fafc');
          root.style.setProperty('--border-color', '#e2e8f0');
          
          // Clear inline styles to let Material-UI take over
          body.style.backgroundColor = '';
          body.style.color = '';
          root.style.backgroundColor = '';
          
          // Additional cleanup
          body.style.removeProperty('background-color');
          body.style.removeProperty('color');
          root.style.removeProperty('background-color');
        }
      });
      
      return newMode;
    });
  }, []);

  return { theme, mode, setMode, toggleMode };
};