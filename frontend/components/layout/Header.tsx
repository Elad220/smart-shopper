import React from 'react';
import { 
  AppBar, Toolbar, Typography, IconButton, Button, Box, useTheme 
} from '@mui/material';
import { Moon, Sun, ShoppingCart, Menu, LogOut } from 'lucide-react';
import { User } from '../../hooks/useAuth';

interface HeaderProps {
  mode: 'light' | 'dark';
  onToggleMode: () => void;
  isAuthenticated: boolean;
  user?: User;
  onLogout?: () => void;
  onMenuOpen?: () => void;
  isMobile?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  mode, 
  onToggleMode, 
  isAuthenticated, 
  user, 
  onLogout,
  onMenuOpen,
  isMobile 
}) => {
  const theme = useTheme();

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{ 
        background: mode === 'dark' 
          ? 'rgba(0, 0, 0, 0.95)' 
          : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${mode === 'dark' ? '#1a1a1a' : theme.palette.divider}`,
        color: mode === 'dark' ? '#ffffff' : theme.palette.text.primary,
        transition: 'all 0.2s ease-in-out',
      }}
    >
      <Toolbar>
        {/* Mobile Menu Button */}
        {isAuthenticated && isMobile && (
          <IconButton 
            edge="start" 
            sx={{ 
              mr: 2,
              color: mode === 'dark' ? '#ffffff' : theme.palette.text.primary,
              '&:hover': {
                backgroundColor: mode === 'dark' ? '#1a1a1a' : theme.palette.action.hover,
              }
            }}
            onClick={onMenuOpen}
          >
            <Menu size={24} />
          </IconButton>
        )}

        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '8px',
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
            }}
          >
            <ShoppingCart size={20} color="white" />
          </Box>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Smart Shopper
          </Typography>
        </Box>

        {/* User Info */}
        {isAuthenticated && user && (
          <Box sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: mode === 'dark' ? '#d1d5db' : theme.palette.text.secondary,
                transition: 'color 0.2s ease-in-out',
              }}
            >
              Welcome, {user.username || user.email.split('@')[0]}
            </Typography>
          </Box>
        )}

        {/* Theme Toggle */}
        <IconButton 
          onClick={onToggleMode}
          sx={{ 
            mr: 1,
            color: mode === 'dark' ? '#ffffff' : theme.palette.text.primary,
            backgroundColor: mode === 'dark' ? '#1a1a1a' : 'transparent',
            border: mode === 'dark' ? '1px solid #2a2a2a' : '1px solid transparent',
            '&:hover': {
              backgroundColor: mode === 'dark' ? '#2a2a2a' : theme.palette.action.hover,
              transform: 'scale(1.05)',
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          {mode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </IconButton>

        {/* Logout Button */}
        {isAuthenticated && onLogout && (
          <Button
            onClick={onLogout}
            startIcon={<LogOut size={16} />}
            sx={{
              textTransform: 'none',
              borderRadius: '8px',
              color: mode === 'dark' ? '#ffffff' : theme.palette.text.primary,
              backgroundColor: mode === 'dark' ? '#1a1a1a' : 'transparent',
              border: mode === 'dark' ? '1px solid #2a2a2a' : '1px solid transparent',
              '&:hover': {
                backgroundColor: mode === 'dark' ? '#2a2a2a' : theme.palette.action.hover,
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            Logout
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;