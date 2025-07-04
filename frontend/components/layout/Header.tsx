import React, { useState, useRef } from 'react';
import { 
  AppBar, Toolbar, Typography, IconButton, Button, Box, useTheme, 
  Tooltip, Stack, Menu, MenuItem, alpha 
} from '@mui/material';
import { Moon, Sun, ShoppingCart, Menu as MenuIcon, LogOut } from 'lucide-react';
import {
  Add as AddIcon,
  UploadFile as ImportIcon,
  Download as ExportIcon,
} from '@mui/icons-material';
import SortIcon from '@mui/icons-material/Sort';
import { User } from '../../hooks/useAuth';

interface HeaderProps {
  mode: 'light' | 'dark';
  onToggleMode: () => void;
  isAuthenticated: boolean;
  user?: User;
  onLogout?: () => void;
  onMenuOpen?: () => void;
  isMobile?: boolean;
  // Shopping list action props
  onCreateList?: () => void;
  onImportItems?: () => void;
  onExportList?: () => void;
  onSortChange?: (mode: string) => void;
  currentSortMode?: string;
  hasSelectedList?: boolean;
  isLoading?: boolean;
}

const SORT_MODES = [
  { key: 'alpha', label: 'Alphabetical (A-Z)' },
  { key: 'created', label: 'Creation Date (Newest)' },
  { key: 'custom', label: 'Custom Order' },
];

const Header: React.FC<HeaderProps> = ({ 
  mode, 
  onToggleMode, 
  isAuthenticated, 
  user, 
  onLogout,
  onMenuOpen,
  isMobile,
  onCreateList,
  onImportItems,
  onExportList,
  onSortChange,
  currentSortMode = 'alpha',
  hasSelectedList = false,
  isLoading = false
}) => {
  const theme = useTheme();
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);

  const handleSortClick = (event: React.MouseEvent<HTMLElement>) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  const handleSortSelect = (mode: string) => {
    onSortChange?.(mode);
    setSortAnchorEl(null);
  };

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{ 
        background: theme.palette.mode === 'dark' 
          ? 'rgba(0, 0, 0, 0.95)' 
          : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${theme.palette.divider}`,
        color: theme.palette.text.primary,
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
              color: theme.palette.text.primary,
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              }
            }}
            onClick={onMenuOpen}
          >
            <MenuIcon size={24} />
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

        {/* Shopping List Actions */}
        {isAuthenticated && (
          <Stack direction="row" spacing={1} sx={{ mr: 2 }}>
            <Tooltip title="Create New List">
              <IconButton
                onClick={onCreateList}
                disabled={isLoading}
                sx={{
                  borderRadius: '8px',
                  border: `1px solid ${theme.palette.divider}`,
                  '&:hover': {
                    background: alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Sort Lists">
              <IconButton
                onClick={handleSortClick}
                sx={{
                  borderRadius: '8px',
                  border: `1px solid ${theme.palette.divider}`,
                  '&:hover': {
                    background: alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                <SortIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Import Items">
              <IconButton
                onClick={onImportItems}
                disabled={isLoading || !hasSelectedList}
                sx={{
                  borderRadius: '8px',
                  border: `1px solid ${theme.palette.divider}`,
                  '&:hover': {
                    background: alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                <ImportIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export Selected List">
              <IconButton
                onClick={onExportList}
                disabled={isLoading || !hasSelectedList}
                sx={{
                  borderRadius: '8px',
                  border: `1px solid ${theme.palette.divider}`,
                  '&:hover': {
                    background: alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                <ExportIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        )}

        {/* Sort Menu */}
        <Menu anchorEl={sortAnchorEl} open={Boolean(sortAnchorEl)} onClose={handleSortClose}>
          {SORT_MODES.map(mode => (
            <MenuItem
              key={mode.key}
              selected={currentSortMode === mode.key}
              onClick={() => handleSortSelect(mode.key)}
            >
              {mode.label}
            </MenuItem>
          ))}
        </Menu>

        {/* User Info */}
        {isAuthenticated && user && (
          <Box sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: theme.palette.text.secondary,
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
            color: theme.palette.text.primary,
            backgroundColor: 'transparent',
            border: `1px solid ${theme.palette.divider}`,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
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
              color: theme.palette.text.primary,
              backgroundColor: 'transparent',
              border: `1px solid ${theme.palette.divider}`,
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
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