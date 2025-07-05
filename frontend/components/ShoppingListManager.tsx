import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Paper,
  Tooltip,
  Stack,
  useTheme,
  alpha,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  UploadFile as ImportIcon,
  Download as ExportIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import SortIcon from '@mui/icons-material/Sort';
import Menu from '@mui/material/Menu';
import { fetchShoppingLists, updateShoppingList, deleteShoppingList, exportShoppingList, importShoppingList, shareShoppingList } from '../src/services/api';

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

interface ShoppingListManagerProps {
  token: string;
  onListSelect: (listId: string) => void;
  selectedListId: string | null;
  onDataChange: () => void;
  onOpenCreateDialog: () => void;
}

const SORT_MODES = [
  { key: 'alpha', label: 'Alphabetical (A-Z)' },
  { key: 'created', label: 'Creation Date (Newest)' },
  { key: 'custom', label: 'Custom Order' },
];

export const ShoppingListManager: React.FC<ShoppingListManagerProps> = ({
  token,
  onListSelect,
  selectedListId,
  onDataChange,
  onOpenCreateDialog,
}) => {
  const theme = useTheme();
  const [listsRaw, setListsRaw] = useState<ShoppingList[]>([]);
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [sortMode, setSortMode] = useState<string>(localStorage.getItem('shoppingListSortMode') || 'alpha');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [editingList, setEditingList] = useState<ShoppingList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingListId, setDeletingListId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Sharing state
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState<'read' | 'write'>('read');
  const [sharingListId, setSharingListId] = useState<string | null>(null);
  const [sharingListName, setSharingListName] = useState('');

  useEffect(() => {
    if (token) {
      loadLists();
    }
  }, [token]);

  useEffect(() => {
    localStorage.setItem('shoppingListSortMode', sortMode);
  }, [sortMode]);

  useEffect(() => {
    let sortedLists = [...listsRaw];
    if (sortMode === 'alpha') {
      sortedLists.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortMode === 'created') {
      sortedLists.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    setLists(sortedLists);
  }, [listsRaw, sortMode]);

  const loadLists = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedLists = await fetchShoppingLists(token);
      setListsRaw(fetchedLists);
      // If no list is selected and we have lists, select the first one
      if (!selectedListId && fetchedLists.length > 0) {
        onListSelect(fetchedLists[0]._id);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load shopping lists');
      console.error('Error loading shopping lists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateList = async () => {
    if (!editingList) return;
    if (!newListName.trim()) {
      setError('List name cannot be empty');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await updateShoppingList(token, editingList._id, newListName.trim());
      setNewListName('');
      setIsEditDialogOpen(false);
      setEditingList(null);
      await loadLists();
    } catch (error: any) {
      setError(error.message || 'Failed to update shopping list');
      console.error('Error updating shopping list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteList = async (listId: string) => {
    setDeletingListId(listId);
    setError(null);
    try {
      await deleteShoppingList(token, listId);
      await loadLists();
      
      // If the deleted list was selected, select the first available list
      if (selectedListId === listId && lists.length > 1) {
        const remainingLists = lists.filter(list => list._id !== listId);
        onListSelect(remainingLists[0]._id);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to delete shopping list');
      console.error('Error deleting shopping list:', error);
    } finally {
      setDeletingListId(null);
    }
  };

  const openEditDialog = (list: ShoppingList) => {
    setEditingList(list);
    setNewListName(list.name);
    setIsEditDialogOpen(true);
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
    if(!selectedListId) {
      setError("Please select a list to export.");
      return;
    }
    try {
      const itemsToExport = await exportShoppingList(token, selectedListId);
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(itemsToExport, null, 2))}`;
      const link = document.createElement("a");
      link.href = jsonString;
      link.download = "shopping-list.json";
      link.click();
    } catch (err: any) {
      setError(err.message || 'Failed to export list.');
    }
  };
  
  const handleImportClick = () => {
    if(!selectedListId){
      setError("Please select a list to import into.");
      return;
    }
    fileInputRef.current?.click();
  };

  // Expose import functionality to parent
  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if(!selectedListId){
      setError("Please select a list to import into.");
      return;
    }
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const items = JSON.parse(e.target?.result as string);
          await importShoppingList(token, selectedListId, items);
          await loadLists(); // This updates the item count in the manager
          onDataChange(); // This triggers the main list refresh in App.tsx
        } catch (err: any) {
          setError(err.message || 'Failed to import items.');
        }
      };
      reader.readAsText(file);
    }
  };

  // Sharing functions
  const openShareDialog = (list: ShoppingList) => {
    setSharingListId(list._id);
    setSharingListName(list.name);
    setIsShareDialogOpen(true);
  };

  const handleShare = async () => {
    if (!sharingListId || !shareEmail.trim()) {
      setError('Please enter an email address');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await shareShoppingList(token, sharingListId, shareEmail.trim(), sharePermission);
      setShareEmail('');
      setSharePermission('read');
      setIsShareDialogOpen(false);
      await loadLists();
      setError(null);
    } catch (error: any) {
      setError(error.message || 'Failed to share list');
    } finally {
      setIsLoading(false);
    }
  };

  const closeShareDialog = () => {
    setIsShareDialogOpen(false);
    setShareEmail('');
    setSharePermission('read');
    setSharingListId(null);
    setSharingListName('');
    setError(null);
  };

  // The import/export functionality is now handled in the parent component (ShoppingApp)

  return (
    <Box sx={{ width: '100%', height: '100%', bgcolor: 'background.default', p: 2 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          My Lists
        </Typography>
        
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Tooltip title="Create New List">
            <IconButton
              onClick={onOpenCreateDialog}
              disabled={isLoading || !!deletingListId}
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
              disabled={!!deletingListId}
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
              onClick={handleImportClick}
              disabled={isLoading || !selectedListId || !!deletingListId}
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
              onClick={handleExport}
              disabled={isLoading || !selectedListId || !!deletingListId}
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
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <Stack spacing={1.5}>
          {lists.map((list) => (
            <Paper
              key={list._id}
              sx={{
                p: 2,
                borderRadius: '12px',
                cursor: deletingListId ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                border: selectedListId === list._id 
                  ? `2px solid ${theme.palette.primary.main}` 
                  : `1px solid ${theme.palette.divider}`,
                background: selectedListId === list._id
                  ? `linear-gradient(135deg, ${theme.palette.primary.main}08, ${theme.palette.secondary.main}08)`
                  : theme.palette.background.paper,
                opacity: deletingListId && deletingListId !== list._id ? 0.5 : 1,
                pointerEvents: deletingListId ? 'none' : 'auto',
                '&:hover': !deletingListId ? {
                  transform: 'translateY(-1px)',
                  boxShadow: theme.shadows[2],
                } : {},
              }}
              onClick={() => !deletingListId && onListSelect(list._id)}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.25 }}>
                    <Typography
                      variant="body1"
                      noWrap
                      sx={{ 
                        fontWeight: selectedListId === list._id ? 600 : 500,
                      }}
                    >
                      {list.name}
                    </Typography>
                    {list.isShared && (
                      <Chip
                        label="Shared"
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 16 }}
                      />
                    )}
                    {!list.isOwner && (
                      <Chip
                        label={list.sharedPermission === 'write' ? 'Write' : 'Read'}
                        size="small"
                        color="secondary"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 16 }}
                      />
                    )}
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {list.items.length} items
                  </Typography>
                </Box>
                
                <Stack direction="row" spacing={0.5}>
                  {/* Show share button only for owners, edit button for owners and write permission users */}
                  {list.isOwner && (
                    <IconButton
                      size="small"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        openShareDialog(list);
                      }}
                      disabled={isLoading || !!deletingListId}
                      sx={{
                        borderRadius: '6px',
                        '&:hover': {
                          background: theme.palette.action.hover,
                        },
                      }}
                    >
                      <ShareIcon sx={{ fontSize: 16, color: theme.palette.primary.main }} />
                    </IconButton>
                  )}
                  {(list.isOwner || list.sharedPermission === 'write') && (
                    <IconButton
                      size="small"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        openEditDialog(list);
                      }}
                      disabled={isLoading || !!deletingListId}
                      sx={{
                        borderRadius: '6px',
                        '&:hover': {
                          background: theme.palette.action.hover,
                        },
                      }}
                    >
                      <EditIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  )}
                  {list.isOwner && (
                    <IconButton
                      size="small"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleDeleteList(list._id);
                      }}
                      disabled={isLoading || !!deletingListId}
                      sx={{
                        borderRadius: '6px',
                        '&:hover': {
                          background: theme.palette.action.hover,
                        },
                      }}
                    >
                      {deletingListId === list._id ? (
                        <CircularProgress size={16} sx={{ color: theme.palette.error.main }} />
                      ) : (
                        <DeleteIcon sx={{ fontSize: 16, color: theme.palette.error.main }} />
                      )}
                    </IconButton>
                  )}
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Box>

      {/* Edit List Dialog */}
      <Dialog open={isEditDialogOpen} onClose={() => !isLoading && !deletingListId && setIsEditDialogOpen(false)}>
        <DialogTitle>Edit Shopping List</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="List Name"
            fullWidth
            value={newListName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewListName(e.target.value)}
            disabled={isLoading || !!deletingListId}
            error={!!error}
            helperText={error}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)} disabled={isLoading || !!deletingListId}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateList} 
            variant="contained" 
            color="primary"
            disabled={isLoading || !!deletingListId || !newListName.trim()}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share List Dialog */}
      <Dialog open={isShareDialogOpen} onClose={() => !isLoading && closeShareDialog()} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <ShareIcon />
            <Typography variant="h6">Share "{sharingListName}"</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Share your shopping list with friends and family. They can view or edit the list based on the permissions you give them.
            </Alert>
            
            <TextField
              label="Email address"
              type="email"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              fullWidth
              disabled={isLoading}
              helperText="Enter the email address of the person you want to share with"
            />
            
            <FormControl fullWidth>
              <InputLabel>Permission</InputLabel>
              <Select
                value={sharePermission}
                onChange={(e) => setSharePermission(e.target.value as 'read' | 'write')}
                label="Permission"
                disabled={isLoading}
              >
                <MenuItem value="read">
                  <Stack>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>Read only</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Can view the list but cannot add, edit, or delete items
                    </Typography>
                  </Stack>
                </MenuItem>
                <MenuItem value="write">
                  <Stack>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>Read & write</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Can view and edit the list, add or remove items
                    </Typography>
                  </Stack>
                </MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeShareDialog} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleShare} 
            variant="contained"
            disabled={isLoading || !shareEmail.trim()}
            startIcon={<ShareIcon />}
          >
            {isLoading ? 'Sharing...' : 'Share List'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};