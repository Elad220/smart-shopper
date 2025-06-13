import React, { useState, useEffect } from 'react';
import {
  Box,
  Select,
  MenuItem,
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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { fetchShoppingLists, createShoppingList, updateShoppingList, deleteShoppingList } from '../services/api';

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

  useEffect(() => {
    loadLists();
  }, [token]);

  const loadLists = async () => {
    try {
      const fetchedLists = await fetchShoppingLists(token);
      setLists(fetchedLists);
      
      // If no list is selected and we have lists, select the first one
      if (!selectedListId && fetchedLists.length > 0) {
        onListSelect(fetchedLists[0]._id);
      }
    } catch (error) {
      console.error('Error loading shopping lists:', error);
    }
  };

  const handleCreateList = async () => {
    try {
      await createShoppingList(token, newListName);
      setNewListName('');
      setIsCreateDialogOpen(false);
      loadLists();
    } catch (error) {
      console.error('Error creating shopping list:', error);
    }
  };

  const handleUpdateList = async () => {
    if (!editingList) return;
    
    try {
      await updateShoppingList(token, editingList._id, newListName);
      setNewListName('');
      setIsEditDialogOpen(false);
      setEditingList(null);
      loadLists();
    } catch (error) {
      console.error('Error updating shopping list:', error);
    }
  };

  const handleDeleteList = async (listId: string) => {
    try {
      await deleteShoppingList(token, listId);
      loadLists();
      
      // If the deleted list was selected, select the first available list
      if (selectedListId === listId && lists.length > 1) {
        const remainingLists = lists.filter(list => list._id !== listId);
        onListSelect(remainingLists[0]._id);
      }
    } catch (error) {
      console.error('Error deleting shopping list:', error);
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
        >
          <AddIcon />
        </IconButton>
      </Box>

      <List>
        {lists.map((list) => (
          <React.Fragment key={list._id}>
            <ListItem disablePadding>
              <ListItemButton
                selected={selectedListId === list._id}
                onClick={() => onListSelect(list._id)}
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
      <Dialog open={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)}>
        <DialogTitle>Create New Shopping List</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="List Name"
            fullWidth
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateList} variant="contained" color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit List Dialog */}
      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)}>
        <DialogTitle>Edit Shopping List</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="List Name"
            fullWidth
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateList} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 