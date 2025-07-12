import React, { useState, useEffect } from 'react';
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
  Collapse,
  Stack,
  Chip,
  CircularProgress,
} from '@mui/material';
import { 
  List as ListIcon, 
  Settings, 
  LogOut, 
  X, 
  User,
  ChevronDown,
} from 'lucide-react';
import {
  Share as ShareIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { User as UserType } from '../../hooks/useAuth';
import { fetchShoppingLists, deleteShoppingList } from '../../src/services/api';
import toast from 'react-hot-toast';

interface ShoppingList {
  _id: string;
  name: string;
  items: any[];
  createdAt: string;
  updatedAt: string;
  isOwner?: boolean;
  sharedPermission?: 'read' | 'write';
  isShared?: boolean;
  sharedWith?: Array<{
    user: { _id: string; username: string; email: string };
    permission: 'read' | 'write';
  }>;
}

interface SideMenuProps {
  open: boolean;
  onClose: () => void;
  user: UserType;
  onLogout: () => void;
  onNavigate: (view: 'lists' | 'mylists' | 'settings') => void;
  currentView: string;
  isMobile?: boolean;
  selectedListId?: string | null;
  onListSelect?: (listId: string) => void;
}

const SideMenu: React.FC<SideMenuProps> = ({
  open,
  onClose,
  user,
  onLogout,
  onNavigate,
  currentView,
  isMobile = false,
  selectedListId,
  onListSelect,
}) => {
  const theme = useTheme();
  const [isMyListsExpanded, setIsMyListsExpanded] = useState(false);
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [isLoadingLists, setIsLoadingLists] = useState(false);
  const [deletingListId, setDeletingListId] = useState<string | null>(null);


  // Load lists when My Lists is expanded
  useEffect(() => {
    if (isMyListsExpanded && lists.length === 0) {
      loadLists();
    }
  }, [isMyListsExpanded]);

  const loadLists = async () => {
    setIsLoadingLists(true);
    try {
      const fetchedLists = await fetchShoppingLists(user.token);
      setLists(fetchedLists);
    } catch (error: any) {
      console.error('Error loading shopping lists:', error);
      toast.error('Failed to load shopping lists');
    } finally {
      setIsLoadingLists(false);
    }
  };

  const handleDeleteList = async (listId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this list?')) return;
    
    setDeletingListId(listId);
    try {
      await deleteShoppingList(user.token, listId);
      await loadLists();
      toast.success('List deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete list');
    } finally {
      setDeletingListId(null);
    }
  };

  const openShareDialog = (list: ShoppingList, e: React.MouseEvent) => {
    e.stopPropagation();
    // Note: Share dialog functionality would need to be implemented separately
    toast.success('Share functionality coming soon!');
  };

  const handleNavigate = (view: 'lists' | 'mylists' | 'settings') => {
    if (view === 'mylists') {
      setIsMyListsExpanded(!isMyListsExpanded);
    } else {
      onNavigate(view);
      if (isMobile) {
        onClose();
      }
    }
  };

  const handleListClick = (listId: string) => {
    if (onListSelect) {
      onListSelect(listId);
      if (isMobile) {
        onClose();
      }
    }
  };

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        width: isMobile ? '100%' : 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: isMobile ? '100%' : 280,
          maxWidth: isMobile ? '320px' : 280,
          boxSizing: 'border-box',
          top: isMobile ? 0 : 64,
          height: isMobile ? '100dvh' : 'calc(100vh - 64px)',
          borderRight: `1px solid ${theme.palette.divider}`,
          background: theme.palette.background.default,
        },
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        overflow: 'hidden',
        minHeight: isMobile ? '100dvh' : undefined,
      }}>
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
        <Box sx={{ 
          flexGrow: 1, 
          py: 1, 
          overflow: 'auto', 
          minHeight: 0,
          maxHeight: isMobile ? 'calc(100dvh - 250px)' : 'calc(100vh - 280px)',
        }}>
          <List>
            {/* Shopping List */}
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => handleNavigate('lists')}
                selected={currentView === 'lists'}
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
                  <ListIcon 
                    size={20} 
                    color={currentView === 'lists' ? theme.palette.primary.main : theme.palette.text.secondary}
                  />
                </ListItemIcon>
                <ListItemText 
                  primary="Shopping List"
                  sx={{
                    '& .MuiTypography-root': {
                      fontWeight: currentView === 'lists' ? 600 : 400,
                      color: currentView === 'lists' ? theme.palette.primary.main : theme.palette.text.primary,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>

            {/* My Lists Accordion */}
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => handleNavigate('mylists')}
                sx={{
                  mx: 1,
                  borderRadius: '8px',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <ListIcon 
                    size={20} 
                    color={isMyListsExpanded ? theme.palette.primary.main : theme.palette.text.secondary}
                  />
                </ListItemIcon>
                <ListItemText 
                  primary="My Lists"
                  sx={{
                    '& .MuiTypography-root': {
                      fontWeight: isMyListsExpanded ? 600 : 400,
                      color: isMyListsExpanded ? theme.palette.primary.main : theme.palette.text.primary,
                    },
                  }}
                />
                <IconButton
                  size="small"
                  sx={{
                    transform: isMyListsExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                  }}
                >
                  <ChevronDown size={16} />
                </IconButton>
              </ListItemButton>
            </ListItem>

            {/* My Lists Content */}
            <Collapse in={isMyListsExpanded} timeout="auto" unmountOnExit>
              <Box sx={{ pl: 4, pr: 1 }}>
                {isLoadingLists ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <CircularProgress size={20} />
                  </Box>
                ) : lists.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    No lists yet
                  </Typography>
                ) : (
                  <Stack spacing={1} sx={{ py: 1 }}>
                    {lists.map((list) => (
                      <Box
                        key={list._id}
                        sx={{
                          p: 1.5,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          border: selectedListId === list._id 
                            ? `2px solid ${theme.palette.primary.main}` 
                            : `1px solid ${theme.palette.divider}`,
                          background: selectedListId === list._id
                            ? alpha(theme.palette.primary.main, 0.1)
                            : theme.palette.background.paper,
                          '&:hover': {
                            background: alpha(theme.palette.primary.main, 0.05),
                          },
                          transition: 'all 0.2s ease',
                        }}
                        onClick={() => handleListClick(list._id)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Typography
                              variant="body2"
                              noWrap
                              sx={{ 
                                fontWeight: selectedListId === list._id ? 600 : 500,
                                mb: 0.5,
                              }}
                            >
                              {list.name}
                            </Typography>
                            <Stack direction="row" spacing={0.5} sx={{ mb: 1 }}>
                              {list.isShared && (
                                <Chip
                                  label="Shared"
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                  sx={{ fontSize: '0.6rem', height: 16 }}
                                />
                              )}
                              {!list.isOwner && (
                                <Chip
                                  label={list.sharedPermission === 'write' ? 'Write' : 'Read'}
                                  size="small"
                                  color="secondary"
                                  variant="outlined"
                                  sx={{ fontSize: '0.6rem', height: 16 }}
                                />
                              )}
                            </Stack>
                            <Typography variant="caption" color="text.secondary">
                              {list.items.length} items
                            </Typography>
                          </Box>
                          
                          <Stack direction="row" spacing={0.5}>
                            {list.isOwner && (
                              <IconButton
                                size="small"
                                onClick={(e) => openShareDialog(list, e)}
                                disabled={!!deletingListId}
                                sx={{
                                  borderRadius: '4px',
                                  '&:hover': {
                                    background: theme.palette.action.hover,
                                  },
                                }}
                              >
                                <ShareIcon sx={{ fontSize: 12 }} />
                              </IconButton>
                            )}
                            {list.isOwner && (
                              <IconButton
                                size="small"
                                onClick={(e) => handleDeleteList(list._id, e)}
                                disabled={!!deletingListId}
                                sx={{
                                  borderRadius: '4px',
                                  '&:hover': {
                                    background: theme.palette.action.hover,
                                  },
                                }}
                              >
                                {deletingListId === list._id ? (
                                  <CircularProgress size={12} sx={{ color: theme.palette.error.main }} />
                                ) : (
                                  <DeleteIcon sx={{ fontSize: 12, color: theme.palette.error.main }} />
                                )}
                              </IconButton>
                            )}
                          </Stack>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>
            </Collapse>

            {/* Settings */}
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => handleNavigate('settings')}
                selected={currentView === 'settings'}
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
                  <Settings 
                    size={20} 
                    color={currentView === 'settings' ? theme.palette.primary.main : theme.palette.text.secondary}
                  />
                </ListItemIcon>
                <ListItemText 
                  primary="Settings"
                  sx={{
                    '& .MuiTypography-root': {
                      fontWeight: currentView === 'settings' ? 600 : 400,
                      color: currentView === 'settings' ? theme.palette.primary.main : theme.palette.text.primary,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>

        {/* Logout Button */}
        <Box sx={{ 
          p: 1, 
          pb: 1,
          borderTop: `1px solid ${theme.palette.divider}`, 
          flexShrink: 0,
          background: theme.palette.background.paper,
          mt: 'auto',
        }}>
          <ListItemButton
            onClick={onLogout}
            sx={{
              borderRadius: '8px',
              color: theme.palette.error.main,
              minHeight: isMobile ? '48px' : '56px',
              py: isMobile ? 1 : 1.5,
              '&:hover': {
                backgroundColor: alpha(theme.palette.error.main, 0.1),
              },
            }}
          >
            <ListItemIcon sx={{ 
              minWidth: isMobile ? 32 : 40,
              mr: isMobile ? 1 : 2,
            }}>
              <LogOut size={isMobile ? 18 : 20} color={theme.palette.error.main} />
            </ListItemIcon>
            <ListItemText 
              primary="Logout"
              sx={{
                '& .MuiTypography-root': {
                  fontWeight: 500,
                  fontSize: isMobile ? '0.875rem' : '1rem',
                },
              }}
            />
          </ListItemButton>
        </Box>
      </Box>

      {/* Share Dialog */}
      {/* This would need to be implemented as a separate dialog component */}
    </Drawer>
  );
};

export default SideMenu;