import React, { useState, useEffect } from 'react';
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
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { fetchShoppingLists, createShoppingList, updateShoppingList, deleteShoppingList } from '../src/services/api';

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
}

export const ShoppingListManager: React.FC<ShoppingListManagerProps> = ({
  token,
  onListSelect,
  selectedListId,
}) => {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [editingList, setEditingList] = useState<ShoppingList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadLists();
  }, [token]);

  const loadLists = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedLists = await fetchShoppingLists(token);
      setLists(fetchedLists);
      
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

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      setError('List name cannot be empty');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const newList = await createShoppingList(token, newListName.trim());
      setNewListName('');
      setIsCreateDialogOpen(false);
      await loadLists();
      onListSelect(newList._id); // Select the newly created list
    } catch (error: any) {
      setError(error.message || 'Failed to create shopping list');
      console.error('Error creating shopping list:', error);
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

  return (
    <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Shopping Lists
        </Typography>
        <IconButton
          color="primary"
          onClick={() => setIsCreateDialogOpen(true)}
          size="small"
          disabled={isLoading}
        >
          <AddIcon />
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <List>
        {lists.map((list) => (
          <React.Fragment key={list._id}>
            <ListItem disablePadding>
              <ListItemButton
                selected={selectedListId === list._id}
                onClick={() => onListSelect(list._id)}
                disabled={isLoading}
              >
                <ListItemText
                  primary={list.name}
                  secondary={`${list.items.length} items`}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditDialog(list);
                    }}
                    size="small"
                    disabled={isLoading}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteList(list._id);
                    }}
                    size="small"
                    disabled={isLoading}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItemButton>
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>

      {/* Create List Dialog */}
      <Dialog open={isCreateDialogOpen} onClose={() => !isLoading && setIsCreateDialogOpen(false)}>
        <DialogTitle>Create New Shopping List</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="List Name"
            fullWidth
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            disabled={isLoading}
            error={!!error}
            helperText={error}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateDialogOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateList} 
            variant="contained" 
            color="primary"
            disabled={isLoading || !newListName.trim()}
          >
            {isLoading ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

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
            onChange={(e) => setNewListName(e.target.value)}
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