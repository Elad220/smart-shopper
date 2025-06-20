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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  UploadFile as ImportIcon,
  Download as ExportIcon,
} from '@mui/icons-material';
import { fetchShoppingLists, createShoppingList, updateShoppingList, deleteShoppingList, exportShoppingList, importShoppingList } from '../src/services/api';
import SortIcon from '@mui/icons-material/Sort';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';

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
}) => {
  const [listsRaw, setListsRaw] = useState<ShoppingList[]>([]);
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [sortMode, setSortMode] = useState<string>(localStorage.getItem('shoppingListSortMode') || 'alpha');
  const [customOrder, setCustomOrder] = useState<string[]>(JSON.parse(localStorage.getItem('shoppingListCustomOrder') || '[]'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [editingList, setEditingList] = useState<ShoppingList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadLists();
  }, [token]);

  useEffect(() => {
    localStorage.setItem('shoppingListSortMode', sortMode);
  }, [sortMode]);

  useEffect(() => {
    localStorage.setItem('shoppingListCustomOrder', JSON.stringify(customOrder));
  }, [customOrder]);

  useEffect(() => {
    let sortedLists = [...listsRaw];
    if (sortMode === 'alpha') {
      sortedLists.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortMode === 'created') {
      sortedLists.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortMode === 'custom' && customOrder.length) {
      sortedLists.sort((a, b) => {
        const ia = customOrder.indexOf(a._id);
        const ib = customOrder.indexOf(b._id);
        if (ia === -1 && ib === -1) return 0;
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
      });
    }
    setLists(sortedLists);
  }, [listsRaw, sortMode, customOrder]);

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

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(lists);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    const newOrder = reordered.map(l => l._id);
    setCustomOrder(newOrder);
    console.log('Drag ended. New custom order:', newOrder);
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

  return (
    <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper', p: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Shopping Lists
        </Typography>
        <Tooltip title="Sort Lists">
            <IconButton
              color="primary"
              onClick={handleSortClick}
              size="medium"
              sx={{ ml: 1 }}
            >
              <SortIcon />
            </IconButton>
        </Tooltip>
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
        <Tooltip title="Create New List">
            <IconButton
              color="primary"
              onClick={() => setIsCreateDialogOpen(true)}
              size="medium"
              disabled={isLoading}
              sx={{ ml: 1 }}
            >
              <AddIcon />
            </IconButton>
        </Tooltip>
        <Tooltip title="Import Items to Selected List">
            <IconButton
              color="primary"
              onClick={handleImportClick}
              size="medium"
              disabled={isLoading || !selectedListId}
              sx={{ ml: 1 }}
            >
              <ImportIcon />
            </IconButton>
        </Tooltip>
        <Tooltip title="Export Selected List">
            <IconButton
              color="primary"
              onClick={handleExport}
              size="medium"
              disabled={isLoading || !selectedListId}
              sx={{ ml: 1 }}
            >
              <ExportIcon />
            </IconButton>
        </Tooltip>
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

      <Box sx={{ maxHeight: 400, overflowY: 'auto', pr: 1 }}>
        {sortMode === 'custom' ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="shopping-lists-droppable">
              {(provided: DroppableProvided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {lists.map((list, idx) => (
                    <Draggable key={list._id} draggableId={list._id} index={idx}>
                      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            marginBottom: 16,
                            ...provided.draggableProps.style,
                          }}
                        >
                          <Paper
                            elevation={selectedListId === list._id ? 6 : 1}
                            sx={{
                              p: 2,
                              borderRadius: 3,
                              display: 'flex',
                              alignItems: 'center',
                              background: selectedListId === list._id ? 'linear-gradient(90deg, #e3f2fd 0%, #bbdefb 100%)' : 'background.paper',
                              border: selectedListId === list._id ? '2px solid #90caf9' : '1px solid #e0e0e0',
                              boxShadow: selectedListId === list._id ? 4 : 1,
                              cursor: 'pointer',
                              transition: 'box-shadow 0.2s, border 0.2s',
                              opacity: snapshot.isDragging ? 0.7 : 1,
                            }}
                            onClick={() => onListSelect(list._id)}
                          >
                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                              <Typography
                                variant="subtitle1"
                                noWrap
                                sx={{ fontWeight: selectedListId === list._id ? 700 : 500 }}
                              >
                                {list.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {list.items.length} items
                              </Typography>
                            </Box>
                            <IconButton
                              edge="end"
                              aria-label="edit"
                              onClick={e => {
                                e.stopPropagation();
                                openEditDialog(list);
                              }}
                              size="small"
                              sx={{ ml: 1 }}
                              disabled={isLoading}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              edge="end"
                              aria-label="delete"
                              onClick={e => {
                                e.stopPropagation();
                                handleDeleteList(list._id);
                              }}
                              size="small"
                              sx={{ ml: 1 }}
                              disabled={isLoading}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Paper>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          lists.map((list) => (
            <Paper
              key={list._id}
              elevation={selectedListId === list._id ? 6 : 1}
              sx={{
                mb: 2,
                p: 2,
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                background: selectedListId === list._id ? 'linear-gradient(90deg, #e3f2fd 0%, #bbdefb 100%)' : 'background.paper',
                border: selectedListId === list._id ? '2px solid #90caf9' : '1px solid #e0e0e0',
                boxShadow: selectedListId === list._id ? 4 : 1,
                cursor: 'pointer',
                transition: 'box-shadow 0.2s, border 0.2s',
              }}
              onClick={() => onListSelect(list._id)}
            >
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography
                  variant="subtitle1"
                  noWrap
                  sx={{ fontWeight: selectedListId === list._id ? 700 : 500 }}
                >
                  {list.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {list.items.length} items
                </Typography>
              </Box>
              <IconButton
                edge="end"
                aria-label="edit"
                onClick={e => {
                  e.stopPropagation();
                  openEditDialog(list);
                }}
                size="small"
                sx={{ ml: 1 }}
                disabled={isLoading}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={e => {
                  e.stopPropagation();
                  handleDeleteList(list._id);
                }}
                size="small"
                sx={{ ml: 1 }}
                disabled={isLoading}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Paper>
          ))
        )}
      </Box>

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