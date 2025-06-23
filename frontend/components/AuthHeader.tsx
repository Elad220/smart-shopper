import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Tooltip,
  SvgIcon,
  Popover,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';

const TicklistIcon = () => (
  <SvgIcon viewBox="0 0 48 48" fill="none" sx={{ verticalAlign: 'middle' }}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z"
      fill="currentColor"
    />
  </SvgIcon>
);

interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthHeaderProps {
  mode: 'light' | 'dark';
  setMode: (mode: 'light' | 'dark') => void;
  isLoggedIn: boolean;
  currentUser?: User | null;
  handleLogout?: () => void;
  isMobile?: boolean;
  onDrawerOpen?: () => void;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({
  mode,
  setMode,
  isLoggedIn,
  currentUser,
  handleLogout,
  isMobile,
  onDrawerOpen,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <AppBar position="fixed" elevation={1} sx={{ zIndex: (theme) => (isLoggedIn ? theme.zIndex.drawer + 1 : 'auto') }}>
      <Toolbar
        sx={{
          minHeight: 56,
          px: { xs: 2, sm: 3 },
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isLoggedIn && isMobile && onDrawerOpen && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={onDrawerOpen}
              sx={{ mr: 1, p: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <TicklistIcon />
          <Typography variant="h6" sx={{ fontWeight: 'bold', ml: 1 }}>
            Ticklist
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton sx={{ ml: 1 }} onClick={() => setMode(mode === 'light' ? 'dark' : 'light')} color="inherit">
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          {isLoggedIn && currentUser && handleLogout && (
            <>
              <Tooltip title={currentUser.username || 'User'} placement="bottom-end" arrow>
                <IconButton
                  onClick={handleClick}
                  color="inherit"
                  sx={{ ml: 1 }}
                >
                  <AccountCircleIcon />
                </IconButton>
              </Tooltip>
              <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
              >
                <Typography sx={{ p: 2 }}>{currentUser.username}</Typography>
              </Popover>
              <IconButton color="inherit" onClick={handleLogout} size="small" sx={{ ml: 1 }}>
                <LogoutIcon fontSize="small" />
              </IconButton>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AuthHeader;