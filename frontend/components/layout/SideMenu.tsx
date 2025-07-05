import React from 'react';
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  useTheme,
  Avatar,
  alpha,
} from '@mui/material';
import { 
  List as ListIcon, 
  Settings, 
  LogOut, 
  X, 
  User
} from 'lucide-react';
import { User as UserType } from '../../hooks/useAuth';

interface SideMenuProps {
  open: boolean;
  onClose: () => void;
  user: UserType;
  onLogout: () => void;
  onNavigate: (view: 'lists' | 'mylists' | 'settings') => void;
  currentView: string;
  isMobile?: boolean;
}

const SideMenu: React.FC<SideMenuProps> = ({
  open,
  onClose,
  user,
  onLogout,
  onNavigate,
  currentView,
  isMobile = false,
}) => {
  const theme = useTheme();

  const menuItems = [
    { key: 'lists', icon: ListIcon, label: 'Current List' },
    { key: 'mylists', icon: ListIcon, label: 'My Lists' },
    { key: 'settings', icon: Settings, label: 'Settings' },
  ];

  const handleNavigate = (view: 'lists' | 'mylists' | 'settings') => {
    onNavigate(view);
    if (isMobile) {
      onClose();
    }
  };

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        width: 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          top: 64, // Account for header height
          height: 'calc(100vh - 64px)',
          borderRight: `1px solid ${theme.palette.divider}`,
          background: theme.palette.background.default,
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Menu
          </Typography>
          <IconButton 
            onClick={onClose}
            size="small"
            sx={{
              '&:hover': {
                background: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            <X size={20} />
          </IconButton>
        </Box>

        {/* User Info */}
        <Box sx={{ 
          p: 2, 
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}10, ${theme.palette.secondary.main}10)`,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ 
              width: 40, 
              height: 40,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            }}>
              <User size={20} />
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {user.username || user.email.split('@')[0]}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {user.email}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Navigation Items */}
        <Box sx={{ flexGrow: 1, py: 1 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.key} disablePadding>
                <ListItemButton
                  onClick={() => handleNavigate(item.key as 'lists' | 'mylists' | 'settings')}
                  selected={currentView === item.key}
                  sx={{
                    mx: 1,
                    borderRadius: '8px',
                    '&.Mui-selected': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.15),
                      },
                    },
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <item.icon 
                      size={20} 
                      color={currentView === item.key ? theme.palette.primary.main : theme.palette.text.secondary}
                    />
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label}
                    sx={{
                      '& .MuiTypography-root': {
                        fontWeight: currentView === item.key ? 600 : 400,
                        color: currentView === item.key ? theme.palette.primary.main : theme.palette.text.primary,
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Logout Button */}
        <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <ListItemButton
            onClick={onLogout}
            sx={{
              borderRadius: '8px',
              color: theme.palette.error.main,
              '&:hover': {
                backgroundColor: alpha(theme.palette.error.main, 0.1),
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <LogOut size={20} color={theme.palette.error.main} />
            </ListItemIcon>
            <ListItemText 
              primary="Logout"
              sx={{
                '& .MuiTypography-root': {
                  fontWeight: 500,
                },
              }}
            />
          </ListItemButton>
        </Box>
      </Box>
    </Drawer>
  );
};

export default SideMenu;