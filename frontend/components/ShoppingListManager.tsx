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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  UploadFile as ImportIcon,
  Download as ExportIcon,
} from '@mui/icons-material';
import SortIcon from '@mui/icons-material/Sort';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { fetchShoppingLists, updateShoppingList, deleteShoppingList, exportShoppingList, importShoppingList } from '../src/services/api';

interface ShoppingList {
  _id: string;
  name: string;
  items: any[];
  createdAt: string;
  updatedAt: string;
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setIsLoading(true);
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
      setIsLoading(false);
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
              onClick={handleImportClick}
              disabled={isLoading || !selectedListId}
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
              disabled={isLoading || !selectedListId}
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
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: selectedListId === list._id 
                  ? `2px solid ${theme.palette.primary.main}` 
                  : `1px solid ${theme.palette.divider}`,
                background: selectedListId === list._id
                  ? `linear-gradient(135deg, ${theme.palette.primary.main}08, ${theme.palette.secondary.main}08)`
                  : theme.palette.background.paper,
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: theme.shadows[2],
                },
              }}
              onClick={() => onListSelect(list._id)}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography
                    variant="body1"
                    noWrap
                    sx={{ 
                      fontWeight: selectedListId === list._id ? 600 : 500,
                      mb: 0.25,
                    }}
                  >
                    {list.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {list.items.length} items
                  </Typography>
                </Box>
                
                <Stack direction="row" spacing={0.5}>
                  <IconButton
                    size="small"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      openEditDialog(list);
                    }}
                    disabled={isLoading}
                    sx={{
                      borderRadius: '6px',
                      '&:hover': {
                        background: theme.palette.action.hover,
                      },
                    }}
                  >
                    <EditIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      handleDeleteList(list._id);
                    }}
                    disabled={isLoading}
                    sx={{
                      borderRadius: '6px',
                      '&:hover': {
                        background: theme.palette.action.hover,
                      },
                    }}
                  >
                    <DeleteIcon sx={{ fontSize: 16, color: theme.palette.error.main }} />
                  </IconButton>
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Box>

      {/* Edit List Dialog */}
      <Dialog open={isEditDialogOpen} onClose={() => !isLoading && setIsEditDialogOpen(false)}>
        <DialogTitle>Edit Shopping List</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="List Name"
            fullWidth
            value={newListName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewListName(e.target.value)}
            disabled={isLoading}
            error={!!error}
            helperText={error}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateList} 
            variant="contained" 
            color="primary"
            disabled={isLoading || !newListName.trim()}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};