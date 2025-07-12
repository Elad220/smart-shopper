import React, { useState, useEffect, useRef } from 'react';
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
  Tooltip,
  Menu,
  MenuItem,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
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
  Add as AddIcon,
  Sort as SortIcon,
  UploadFile as ImportIcon,
  Download as ExportIcon,
} from '@mui/icons-material';
import { User as UserType } from '../../hooks/useAuth';
import { fetchShoppingLists, deleteShoppingList, createShoppingList, exportShoppingList, importShoppingList, shareShoppingList } from '../../src/services/api';
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
  onListDeleted?: (deletedListId: string) => void;
}

const SORT_MODES = [
  { key: 'alpha', label: 'Alphabetical (A-Z)' },
  { key: 'created', label: 'Creation Date (Newest)' },
  { key: 'custom', label: 'Custom Order' },
];

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
  onListDeleted,
}) => {
  const theme = useTheme();
  const [isMyListsExpanded, setIsMyListsExpanded] = useState(false);
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [isLoadingLists, setIsLoadingLists] = useState(false);
  const [deletingListId, setDeletingListId] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<string>(localStorage.getItem('shoppingListSortMode') || 'alpha');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Sharing state
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState<'read' | 'write'>('read');
  const [sharingListId, setSharingListId] = useState<string | null>(null);
  const [sharingListName, setSharingListName] = useState('');
  const [isSharing, setIsSharing] = useState(false);

  // Delete confirmation dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingListName, setDeletingListName] = useState('');
  const [listToDeleteId, setListToDeleteId] = useState<string | null>(null);

  // Load lists when My Lists is expanded
  useEffect(() => {
    if (isMyListsExpanded && lists.length === 0) {
      loadLists();
    }
  }, [isMyListsExpanded]);

  useEffect(() => {
    localStorage.setItem('shoppingListSortMode', sortMode);
  }, [sortMode]);

  const loadLists = async () => {
    setIsLoadingLists(true);
    setError(null);
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

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      toast.error('Please enter a list name');
      return;
    }

    setIsCreatingList(true);
    try {
      const newList = await createShoppingList(user.token, newListName.trim());
      setNewListName('');
      setIsCreateDialogOpen(false);
      await loadLists();
      if (onListSelect) {
        onListSelect(newList._id);
      }
      toast.success(`Created "${newListName}" successfully! ✅`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create shopping list');
    } finally {
      setIsCreatingList(false);
    }
  };

  const openDeleteDialog = (list: ShoppingList, e: React.MouseEvent) => {
    e.stopPropagation();
    setListToDeleteId(list._id);
    setDeletingListName(list.name);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setListToDeleteId(null);
    setDeletingListName('');
  };

  const handleDeleteList = async () => {
    if (!listToDeleteId) return;
    
    setDeletingListId(listToDeleteId);
    try {
      await deleteShoppingList(user.token, listToDeleteId);
      await loadLists();
      
      // Check if the deleted list was the currently selected one
      if (selectedListId === listToDeleteId) {
        // Find another list to select, or navigate to no lists view
        const remainingLists = lists.filter(list => list._id !== listToDeleteId);
        if (remainingLists.length > 0) {
          // Select the first available list
          const newSelectedListId = remainingLists[0]._id;
          if (onListSelect) {
            onListSelect(newSelectedListId);
          }
          toast.success(`List deleted. Switched to "${remainingLists[0].name}"`);
        } else {
          // No lists remaining, clear selection
          if (onListSelect) {
            onListSelect('');
          }
          toast.success('List deleted. No lists remaining.');
        }
      } else {
        toast.success('List deleted successfully');
      }
      
      // Notify parent component about the deletion
      if (onListDeleted) {
        onListDeleted(listToDeleteId);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete list');
    } finally {
      setDeletingListId(null);
      closeDeleteDialog();
    }
  };

  const handleSortClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setAnchorEl(null);
  };

  const handleSortChange = (mode: string) => {
    setSortMode(mode);
    setAnchorEl(null);
  };

  const handleExport = async () => {
    if (!selectedListId) {
      toast.error('Please select a list to export');
      return;
    }
    try {
      const itemsToExport = await exportShoppingList(user.token, selectedListId);
      const dataStr = JSON.stringify(itemsToExport, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `shopping-list-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('List exported successfully! 📁');
    } catch (error: any) {
      toast.error(error.message || 'Failed to export list');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const items = JSON.parse(text);
      await importShoppingList(user.token, selectedListId!, items);
      toast.success('Items imported successfully! 📥');
      await loadLists();
    } catch (error: any) {
      toast.error(error.message || 'Failed to import items');
    } finally {
      event.target.value = '';
    }
  };

  const openShareDialog = (list: ShoppingList, e: React.MouseEvent) => {
    e.stopPropagation();
    setSharingListId(list._id);
    setSharingListName(list.name);
    setIsShareDialogOpen(true);
  };

  const handleShare = async () => {
    if (!shareEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setIsSharing(true);
    try {
      await shareShoppingList(user.token, sharingListId!, shareEmail.trim(), sharePermission);
      setIsShareDialogOpen(false);
      setShareEmail('');
      setSharePermission('read');
      await loadLists();
      toast.success(`List shared with ${shareEmail} successfully! 📤`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to share list');
    } finally {
      setIsSharing(false);
    }
  };

  const closeShareDialog = () => {
    setIsShareDialogOpen(false);
    setShareEmail('');
    setSharePermission('read');
  };

  const openCreateDialog = () => {
    setIsCreateDialogOpen(true);
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

  // Sort lists based on current sort mode
  const sortedLists = [...lists].sort((a, b) => {
    if (sortMode === 'alpha') {
      return a.name.localeCompare(b.name);
    } else if (sortMode === 'created') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return 0;
  });

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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {/* Control Buttons - Only show when expanded */}
                  {isMyListsExpanded && (
                    <>
                      <Tooltip title="Create New List">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            openCreateDialog();
                          }}
                          disabled={isCreatingList}
                          sx={{
                            borderRadius: '4px',
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            color: 'white',
                            '&:hover': {
                              background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                            },
                          }}
                        >
                          <AddIcon sx={{ fontSize: 12 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Sort Lists">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSortClick(e);
                          }}
                          sx={{
                            borderRadius: '4px',
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            color: 'white',
                            '&:hover': {
                              background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                            },
                          }}
                        >
                          <SortIcon sx={{ fontSize: 12 }} />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                  <IconButton
                    size="small"
                    sx={{
                      transform: isMyListsExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                    }}
                  >
                    <ChevronDown size={16} />
                  </IconButton>
                </Box>
              </ListItemButton>
            </ListItem>

            {/* My Lists Content */}
            <Collapse in={isMyListsExpanded} timeout="auto" unmountOnExit>
              <Box sx={{ pl: 4, pr: 1 }}>
                {error && (
                  <Alert severity="error" sx={{ mb: 2, fontSize: '0.75rem' }} onClose={() => setError(null)}>
                    {error}
                  </Alert>
                )}

                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleSortClose}>
                  {SORT_MODES.map(mode => (
                    <MenuItem
                      key={mode.key}
                      selected={sortMode === mode.key}
                      onClick={() => handleSortChange(mode.key)}
                    >
                      {mode.label}
                    </MenuItem>
                  ))}
                </Menu>

                {/* Hidden file input for import functionality */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileImport}
                  style={{ display: 'none' }}
                  accept=".json"
                />

                {isLoadingLists ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <CircularProgress size={20} />
                  </Box>
                ) : sortedLists.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    No lists yet
                  </Typography>
                ) : (
                  <Stack spacing={1} sx={{ py: 1 }}>
                    {sortedLists.map((list) => (
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
                            {/* Import button - only show for selected list */}
                            {selectedListId === list._id && (
                              <Tooltip title="Import Items">
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleImportClick();
                                  }}
                                  disabled={!!deletingListId}
                                  sx={{
                                    borderRadius: '4px',
                                    '&:hover': {
                                      background: theme.palette.action.hover,
                                    },
                                  }}
                                >
                                  <ImportIcon sx={{ fontSize: 12, color: theme.palette.primary.main }} />
                                </IconButton>
                              </Tooltip>
                            )}
                            {/* Export button - only show for selected list */}
                            {selectedListId === list._id && (
                              <Tooltip title="Export List">
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleExport();
                                  }}
                                  disabled={!!deletingListId}
                                  sx={{
                                    borderRadius: '4px',
                                    '&:hover': {
                                      background: theme.palette.action.hover,
                                    },
                                  }}
                                >
                                  <ExportIcon sx={{ fontSize: 12, color: theme.palette.primary.main }} />
                                </IconButton>
                              </Tooltip>
                            )}
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
                                onClick={(e) => openDeleteDialog(list, e)}
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

      {/* Create Shopping List Dialog */}
      <Dialog 
        open={isCreateDialogOpen} 
        onClose={() => !isCreatingList && setIsCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            border: `1px solid ${theme.palette.divider}`,
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Create New Shopping List
          </Typography>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="List Name"
            fullWidth
            variant="outlined"
            value={newListName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewListName(e.target.value)}
            disabled={isCreatingList}
            onKeyPress={(e: React.KeyboardEvent) => {
              if (e.key === 'Enter' && !isCreatingList && newListName.trim()) {
                handleCreateList();
              }
            }}
            sx={{ 
              mt: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
              },
            }}
            placeholder="e.g., Weekly Groceries, Party Supplies..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setIsCreateDialogOpen(false)} 
            disabled={isCreatingList}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateList} 
            variant="contained" 
            disabled={isCreatingList || !newListName.trim()}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            }}
          >
            {isCreatingList ? 'Creating...' : 'Create List'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share List Dialog */}
      <Dialog 
        open={isShareDialogOpen} 
        onClose={() => !isSharing && closeShareDialog()} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            border: `1px solid ${theme.palette.divider}`,
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShareIcon />
            <Typography variant="h6">Share "{sharingListName}"</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Share your shopping list with friends and family. They can view or edit the list based on the permissions you give them.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
            disabled={isSharing}
            helperText="Enter the email address of the person you want to share with"
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
              },
            }}
          />
          <FormControl fullWidth variant="outlined">
            <InputLabel>Permission</InputLabel>
            <Select
              value={sharePermission}
              onChange={(e) => setSharePermission(e.target.value as 'read' | 'write')}
              disabled={isSharing}
              label="Permission"
              sx={{
                borderRadius: '12px',
              }}
            >
              <MenuItem value="read">Read Only - Can view the list</MenuItem>
              <MenuItem value="write">Read & Write - Can view and edit the list</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={closeShareDialog} 
            disabled={isSharing}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleShare} 
            variant="contained" 
            disabled={isSharing || !shareEmail.trim()}
            startIcon={<ShareIcon />}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            }}
          >
            {isSharing ? 'Sharing...' : 'Share List'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={isDeleteDialogOpen} 
        onClose={() => !deletingListId && closeDeleteDialog()} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            border: `1px solid ${theme.palette.divider}`,
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DeleteIcon sx={{ color: theme.palette.error.main }} />
            <Typography variant="h6">Delete List</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Are you sure you want to delete "{deletingListName}"? This action cannot be undone and will permanently remove all items in this list.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ 
            p: 2, 
            borderRadius: '8px', 
            background: alpha(theme.palette.warning.main, 0.1),
            border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
            fontSize: '0.875rem'
          }}>
            <strong>Note:</strong> If this is your currently selected list, you'll be automatically moved to another available list, or to the no lists screen if none remain.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={closeDeleteDialog} 
            disabled={!!deletingListId}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteList} 
            variant="contained" 
            disabled={!!deletingListId}
            startIcon={<DeleteIcon />}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              background: `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.error.dark}, ${theme.palette.error.main})`,
              },
            }}
          >
            {deletingListId ? 'Deleting...' : 'Delete List'}
          </Button>
        </DialogActions>
      </Dialog>
    </Drawer>
  );
};

export default SideMenu;