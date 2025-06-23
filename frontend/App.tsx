import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import AddItemForm from './components/AddItemForm';
import ShoppingList from './components/ShoppingList';
import EditItemModal from './components/EditItemModal';
import { ShoppingListManager } from './components/ShoppingListManager';
import { ShoppingItem, Category, StandardCategory } from './types';
import * as api from './src/services/api'; // Import API service
import { BASE_URL, fetchUserCategories } from './src/services/api';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import AuthHeader from './components/AuthHeader';


import { ThemeProvider, createTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import CssBaseline from '@mui/material/CssBaseline';
import Drawer from '@mui/material/Drawer';
import useMediaQuery from '@mui/material/useMediaQuery';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Dialog, DialogActions, DialogContent, DialogTitle, Fab, LinearProgress, Zoom } from '@mui/material';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';

interface User {
  id: string;
  email: string;
  username: string;
}

// Utility to check for valid MongoDB ObjectId
const isValidObjectId = (id: string | null) => !!id && /^[a-fA-F0-9]{24}$/.test(id);

const App: React.FC = () => {
  useEffect(() => {
    // Log the current API URL for debugging
    console.log('Current API URL:', import.meta.env.VITE_API_URL);
  }, []);

  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | null>(localStorage.getItem('selectedListId'));
  const [itemToEdit, setItemToEdit] = useState<ShoppingItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [mode, setMode] = useState<'light' | 'dark'>(
    () => (localStorage.getItem('themeMode') as 'light' | 'dark') || 'light'
  );
  const [isCreateListDialogOpen, setIsCreateListDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [listManagerKey, setListManagerKey] = useState(0);
  const [areAllCollapsed, setAreAllCollapsed] = useState(false);
  const [showFab, setShowFab] = useState(false);
  const addItemButtonRef = useRef<HTMLButtonElement>(null);

  const isMobile = useMediaQuery('(max-width:600px)');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(
    !isMobile && localStorage.getItem('sidebarCollapsed') === 'true'
  );


  useEffect(() => {
    const handleScroll = () => {
      if (addItemButtonRef.current) {
        const { bottom } = addItemButtonRef.current.getBoundingClientRect();
        if (bottom < 0) {
          setShowFab(true);
        } else {
          setShowFab(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light'
            ? {
                // Light mode palette from Auth pages
                primary: {
                  main: '#0c7ff2',
                },
                background: {
                  default: '#f8fafc',
                  paper: '#ffffff',
                },
                text: {
                    primary: '#0d141c',
                    secondary: '#49739c'
                }
              }
            : {
                // Dark mode palette from Auth pages
                primary: {
                  main: '#dce8f3',
                },
                background: {
                  default: '#141a1f',
                  paper: '#1f272e',
                },
                text: {
                  primary: '#ffffff',
                  secondary: '#9daebe',
                },
              }),
        },
        typography: {
          fontFamily: 'Roboto, Arial, sans-serif',
          h1: { fontSize: '2.2rem', fontWeight: 700 },
          h2: { fontSize: '1.75rem', fontWeight: 600 },
        },
      }),
    [mode]
  );

  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('authToken'));
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const user = localStorage.getItem('currentUser');
    console.log('Initializing currentUser from localStorage:', user);
    return user ? JSON.parse(user) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Auth form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');

  const [selectedList, setSelectedList] = useState<any | null>(null);

  const fetchDataForSelectedList = useCallback(async () => {
    if (!authToken || !selectedListId) return;

    if (!isValidObjectId(selectedListId)) {
        setError('Invalid shopping list ID.');
        setShoppingList([]);
        setSelectedList(null);
        return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const [listResponse, userCategories] = await Promise.all([
        fetch(`${BASE_URL}/api/shopping-lists/${selectedListId}`, {
          headers: { 'Authorization': `Bearer ${authToken}` },
        }),
        fetchUserCategories(authToken)
      ]);
      
      if (!listResponse.ok) {
        throw new Error(`HTTP error! status: ${listResponse.status}`);
      }
      
      const list = await listResponse.json();
      if (!list) {
        throw new Error('No data received from server');
      }
      
      setCategories(userCategories);
      setSelectedList(list);
      const items = Array.isArray(list.items) ? list.items : [];
      setShoppingList([...items].sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err: any) {
        const errorMessage = err.message || 'Failed to fetch shopping list.';
        console.error('Error fetching list:', errorMessage, err);
        setError(errorMessage);
        
        if (err.message === 'Unauthorized' || err.status === 401) {
          handleLogout();
        }
    } finally {
      setIsLoading(false);
    }
  }, [authToken, selectedListId]);

  // Fetch items when authenticated and list is selected
  useEffect(() => {
    if (authToken && selectedListId) {
      localStorage.setItem('authToken', authToken);
      if (currentUser) localStorage.setItem('currentUser', JSON.stringify(currentUser));
      fetchDataForSelectedList();
    } else if (!authToken) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      setShoppingList([]);
      setSelectedListId(null);
      setSelectedList(null);
    }
  }, [authToken, currentUser, selectedListId, fetchDataForSelectedList]);

  const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      let loginPayload: any;
      if (isEmail(email)) {
        loginPayload = { email, password };
      } else {
        loginPayload = { username: email, password };
      }

      const data = await api.loginUserFlexible(loginPayload);
      const userData = {
        id: data.userId,
        email: data.user?.email || email,
        username: data.user?.username,
      };
      
      setAuthToken(data.token);
      setCurrentUser(userData as User);
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      
      const lists = await api.fetchShoppingLists(data.token);
      if (lists.length > 0) {
        setSelectedListId(lists[0]._id);
        localStorage.setItem('selectedListId', lists[0]._id);
      } else {
        setSelectedListId(null);
        localStorage.removeItem('selectedListId');
      }

      setEmail('');
      setPassword('');
      
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if(password !== confirmPassword){
        setError("Passwords do not match.");
        return;
    }
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await api.registerUser(username, email, password);
      setSuccessMessage('Registration successful! Please log in.');
      setIsRegistering(false); // This will switch to the login view
      // Clear fields for login
      setUsername('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    setShoppingList([]);
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  };


  const handleAddItem = useCallback(async (newItemData: Omit<ShoppingItem, 'id' | 'completed'>) => {
    if (!authToken || !selectedListId) { setError("Authentication and list selection required."); return; }
    setIsLoading(true);
    try {
      const newItem = await api.addShoppingItem(authToken, selectedListId, newItemData);
      setShoppingList(prevList => [newItem, ...prevList].sort((a,b) => a.name.localeCompare(b.name)));
      if (!categories.includes(newItem.category)) {
        setCategories(prev => [...prev, newItem.category].sort());
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add item.');
    } finally {
      setIsLoading(false);
    }
  }, [authToken, selectedListId, categories]);

  const handleOpenAddItemModal = () => setIsAddItemModalOpen(true);
  const handleCloseAddItemModal = () => setIsAddItemModalOpen(false);

  const handleAddItemAndCloseModal = useCallback(async (newItemData: Omit<ShoppingItem, 'id' | 'completed'>) => {
    await handleAddItem(newItemData);
    if (!error) { // Only close modal if add was successful (or at least no immediate error)
        handleCloseAddItemModal();
    }
  }, [handleAddItem, error]);

  const handleToggleComplete = useCallback(async (id: string) => {
    if (!authToken || !selectedListId) { setError("Authentication and list selection required."); return; }
    const item = shoppingList.find(i => i.id === id);
    if (!item) return;

    const updatedItemData = { ...item, completed: !item.completed };
    
    setShoppingList(prevList =>
      prevList.map(i => (i.id === id ? updatedItemData : i))
    );

    try {
      await api.updateShoppingItem(authToken, selectedListId, id, { completed: updatedItemData.completed });
    } catch (err: any) {
      setError(err.message || 'Failed to update item.');
      setShoppingList(prevList =>
        prevList.map(i => (i.id === id ? item : i))
      );
    }
  }, [authToken, selectedListId, shoppingList]);

  const handleDeleteItem = useCallback(async (id: string) => {
    if (!authToken || !selectedListId) { setError("Authentication and list selection required."); return; }
    const originalList = [...shoppingList];
    setShoppingList(prevList => prevList.filter(item => item.id !== id));
    try {
      await api.deleteShoppingItem(authToken, selectedListId, id);
    } catch (err: any) {
      setError(err.message || 'Failed to delete item.');
      setShoppingList(originalList);
    }
  }, [authToken, selectedListId, shoppingList]);

  const handleOpenEditModal = useCallback((item: ShoppingItem) => {
    setItemToEdit(item);
    setIsEditModalOpen(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setItemToEdit(null);
    setIsEditModalOpen(false);
  }, []);

  const handleSaveItem = useCallback(async (updatedItem: ShoppingItem) => {
    if (!authToken || !selectedListId) {
      setError("Authentication and list selection required.");
      return;
    }
  
    // Close the modal first for a better user experience.
    handleCloseEditModal();
  
    try {
      const { id, ...updatePayload } = updatedItem;
  
      // Call the API to save the item.
      const savedItem = await api.updateShoppingItem(authToken, selectedListId, id, updatePayload);
  
      // After a successful save, update the local state with the returned item.
      setShoppingList(prevList =>
        prevList.map(item => (item.id === savedItem.id ? savedItem : item))
      );
  
      // Also update the categories list if a new custom category was added.
      if (!categories.includes(savedItem.category)) {
        setCategories(prev => [...prev, savedItem.category].sort());
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save item.');
      console.error("Failed to save item:", err);
    }
  }, [authToken, selectedListId, categories, handleCloseEditModal]);

  const handleListSelect = (listId: string) => {
    setSelectedListId(listId);
    localStorage.setItem('selectedListId', listId);
    if (isMobile) {
      setIsDrawerOpen(false);
    }
  };

  const handleRemoveCheckedItems = useCallback(async () => {
    if (!authToken || !selectedListId) { setError("Authentication and list selection required."); return; }
    if(window.confirm("Are you sure you want to remove all checked items?")) {
      const originalList = [...shoppingList];
      const hasCheckedItems = shoppingList.some(item => item.completed);
      if (!hasCheckedItems) return;

      setShoppingList(prevList => prevList.filter(item => !item.completed));
      try {
        await api.deleteCheckedItems(authToken, selectedListId);
        if (selectedListId) {
          const updatedList = await api.fetchShoppingList(authToken, selectedListId);
          setShoppingList(updatedList);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to remove checked items.');
        setShoppingList(originalList);
      }
    }
  }, [authToken, selectedListId, shoppingList]);

  const handleRemoveCategory = useCallback(async (categoryName: Category) => {
    if (!authToken || !selectedListId) { 
      setError("Authentication and list selection required."); 
      return; 
    }
    
    const originalList = [...shoppingList];
    const itemsToRemove = shoppingList.filter(item => item.category === categoryName);
    if (itemsToRemove.length === 0) return;

    const updatedList = shoppingList.filter(item => item.category !== categoryName);
    setShoppingList(updatedList);
    
    if (selectedList) {
      setSelectedList({
        ...selectedList,
        items: updatedList
      });
    }
    
    try {
      await api.deleteCategoryItems(authToken, selectedListId, categoryName);
    } catch (err: any) {
      setError(err.message || 'Failed to remove category items.');
      setShoppingList(originalList);
      if (selectedList) {
        setSelectedList({
          ...selectedList,
          items: originalList
        });
      }
    }
  }, [authToken, selectedListId, shoppingList, selectedList]);

  const handleDeleteCategory = useCallback(async (categoryToDelete: string) => {
    if (!authToken) {
      setError("Authentication required.");
      return;
    }
    if (Object.values(StandardCategory).includes(categoryToDelete as StandardCategory)) {
        alert("Standard categories cannot be deleted.");
        return;
    }

    if (window.confirm(`Are you sure you want to delete the category "${categoryToDelete}"? This cannot be undone.`)) {
        try {
            await api.deleteUserCategory(authToken, categoryToDelete);
            setCategories(prev => prev.filter(cat => cat !== categoryToDelete));
        } catch (err: any) {
            setError(err.message || "Failed to delete category.");
        }
    }
  }, [authToken]);

  const handleToggleSidebar = () => {
    if (isMobile) {
      setIsDrawerOpen(false);
    } else {
      setIsSidebarCollapsed((prev) => {
        const newState = !prev;
        localStorage.setItem('sidebarCollapsed', String(newState));
        return newState;
      });
    }
  };

  const handleCreateList = async () => {
    if (!newListName.trim() || !authToken) {
      setError('List name cannot be empty');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const newList = await api.createShoppingList(authToken, newListName.trim());
      setNewListName('');
      setIsCreateListDialogOpen(false);
      
      setSelectedListId(newList._id);
      localStorage.setItem('selectedListId', newList._id);
      
      setListManagerKey(prevKey => prevKey + 1);
    } catch (error: any) {
      setError(error.message || 'Failed to create shopping list');
      console.error('Error creating shopping list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAllCategories = () => {
    setAreAllCollapsed(!areAllCollapsed);
  };
  
  if (!authToken || !currentUser) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthHeader
            mode={mode}
            setMode={setMode}
            isLoggedIn={false}
        />
        {isRegistering ? (
          <RegisterPage
            onRegister={handleRegister}
            onSwitchToLogin={() => {
                setIsRegistering(false);
                setError(null);
            }}
            setUsername={setUsername}
            setEmail={setEmail}
            setPassword={setPassword}
            setConfirmPassword={setConfirmPassword}
            isLoading={isLoading}
            username={username}
            email={email}
            password={password}
            confirmPassword={confirmPassword}
            error={error}
          />
        ) : (
          <LoginPage
            onLogin={handleLogin}
            onSwitchToRegister={() => {
                setIsRegistering(true);
                setError(null);
            }}
            setEmail={setEmail}
            setPassword={setPassword}
            isLoading={isLoading}
            email={email}
            password={password}
            error={error}
            successMessage={successMessage}
          />
        )}
      </ThemeProvider>
    );
  }
    
  const completedItems = shoppingList.filter(item => item.completed).length;
  const totalItems = shoppingList.length;
  const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  
  const drawerWidth = (isSidebarCollapsed && !isMobile) ? 56 : 280;
  const showDrawerContents = !isSidebarCollapsed || isMobile;

  return (
    <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex' }}>
            <AuthHeader
              mode={mode}
              setMode={setMode}
              isLoggedIn={true}
              currentUser={currentUser}
              handleLogout={handleLogout}
              isMobile={isMobile}
              onDrawerOpen={() => setIsDrawerOpen(true)}
            />
            <Drawer
              variant={isMobile ? "temporary" : "permanent"}
              open={isMobile ? isDrawerOpen : true}
              onClose={() => setIsDrawerOpen(false)}
              sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                  width: drawerWidth,
                  boxSizing: 'border-box',
                  overflowX: 'hidden',
                  transition: (theme) => theme.transitions.create('width', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen,
                  }),
                },
              }}
            >
              <Toolbar />
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: (isSidebarCollapsed && !isMobile) ? 'center' : 'flex-end', p: 1 }}>
                <IconButton onClick={handleToggleSidebar}>
                  {isMobile ? <ChevronLeftIcon /> : (isSidebarCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />)}
                </IconButton>
              </Box>
              {showDrawerContents && (
                <ShoppingListManager
                  key={listManagerKey}
                  token={authToken!}
                  onListSelect={handleListSelect}
                  selectedListId={selectedListId}
                  onDataChange={fetchDataForSelectedList}
                  onOpenCreateDialog={() => setIsCreateListDialogOpen(true)}
                />
              )}
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: 'background.default' }}>
              <Toolbar />
              {error && (
                <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h5" component="h2" sx={{ color: 'text.primary', flexGrow: 1 }}>
                        {selectedList?.name || 'Shopping List'}
                      </Typography>
                      <Button
                          variant="outlined"
                          size="small"
                          onClick={toggleAllCategories}
                          startIcon={areAllCollapsed ? <UnfoldMoreIcon /> : <UnfoldLessIcon />}
                          sx={{ mr: 2 }}
                        >
                          {areAllCollapsed ? 'Expand' : 'Collapse'}
                      </Button>
                      <Button ref={addItemButtonRef} variant="contained" startIcon={<AddIcon />} onClick={handleOpenAddItemModal}>
                          Add Item
                      </Button>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
                      <Typography variant="body2">{totalItems} items</Typography>
                      <Typography variant="body2" color="text.secondary">
                          <span style={{ color: 'green' }}>✓</span> {completedItems} completed
                      </Typography>
                      <LinearProgress variant="determinate" value={completionPercentage} sx={{ flexGrow: 1, height: '10px', borderRadius: '5px' }}/>
                      <Typography variant="body2" color="text.secondary">{completionPercentage}%</Typography>
                  </Box>
    
                  <ShoppingList
                    items={shoppingList}
                    listId={selectedListId || 'default'}
                    onToggleComplete={handleToggleComplete}
                    onDeleteItem={handleDeleteItem}
                    onEditItem={handleOpenEditModal}
                    onRemoveCategory={handleRemoveCategory}
                    onRemoveCheckedItems={handleRemoveCheckedItems}
                    onAddItem={handleOpenAddItemModal}
                    areAllCollapsed={areAllCollapsed}
                  />
                </>
              )}
            </Box>
        </Box>
    
         {/* Dialogs */}
        <Dialog open={isCreateListDialogOpen} onClose={() => !isLoading && setIsCreateListDialogOpen(false)}>
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
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsCreateListDialogOpen(false)} disabled={isLoading}>
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
        {isAddItemModalOpen && (
          <AddItemForm
            isOpen={isAddItemModalOpen}
            onClose={handleCloseAddItemModal}
            onAddItem={handleAddItemAndCloseModal}
            categories={categories}
            onDeleteCategory={handleDeleteCategory}
          />
        )}
        {isEditModalOpen && itemToEdit && (
          <EditItemModal
            isOpen={isEditModalOpen}
            onClose={handleCloseEditModal}
            onSave={handleSaveItem}
            item={itemToEdit}
            categories={categories}
            onDeleteCategory={handleDeleteCategory}
          />
        )}

        <Zoom in={showFab}>
          <Fab
            color="primary"
            aria-label="add"
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
            }}
            onClick={handleOpenAddItemModal}
          >
            <AddIcon />
          </Fab>
        </Zoom>
    </ThemeProvider>
  );
};

export default App;