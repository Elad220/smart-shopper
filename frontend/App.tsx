import React, { useState, useEffect, useCallback } from 'react';
import AddItemForm from './components/AddItemForm';
import ShoppingList from './components/ShoppingList';
import EditItemModal from './components/EditItemModal';
import { ShoppingListManager } from './components/ShoppingListManager';
import { ShoppingItem, Category } from './types';
import * as api from './src/services/api'; // Import API service
import { BASE_URL } from './src/services/api';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import MenuIcon from '@mui/icons-material/Menu';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import LogoutIcon from '@mui/icons-material/Logout';
import CssBaseline from '@mui/material/CssBaseline';
import Drawer from '@mui/material/Drawer';
import useMediaQuery from '@mui/material/useMediaQuery';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// Define a warmer theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#90CAF9', // Soft blue
      light: '#BBDEFB',
      dark: '#64B5F6',
    },
    secondary: {
      main: '#A5D6A7', // Soft sage green
      light: '#C8E6C9',
      dark: '#81C784',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    }
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h1: {
      fontSize: '2.2rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 600,
    }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          padding: 0,
          minHeight: '100vh',
          width: '100%',
          overflowX: 'hidden'
        }
      }
    }
  }
});

interface User {
  id: string;
  email: string;
}

// Utility to check for valid MongoDB ObjectId
const isValidObjectId = (id: string | null) => !!id && /^[a-fA-F0-9]{24}$/.test(id);

const App: React.FC = () => {
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | null>(localStorage.getItem('selectedListId'));
  const [itemToEdit, setItemToEdit] = useState<ShoppingItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('authToken'));
  const [currentUser, setCurrentUser] = useState<User | null>(JSON.parse(localStorage.getItem('currentUser') || 'null'));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Auth form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');

  const [selectedList, setSelectedList] = useState<any | null>(null);

  const isMobile = useMediaQuery('(max-width:600px)');

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(
    localStorage.getItem('sidebarCollapsed') === 'true'
  );

  // Fetch items when authenticated and list is selected
  useEffect(() => {
    if (authToken && selectedListId) {
      if (!isValidObjectId(selectedListId)) {
        setError('Invalid shopping list ID.');
        setShoppingList([]);
        setSelectedList(null);
        return;
      }
      localStorage.setItem('authToken', authToken);
      if (currentUser) localStorage.setItem('currentUser', JSON.stringify(currentUser));
      
      const fetchList = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch(`${BASE_URL}/api/shopping-lists/${selectedListId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` },
          });
          const list = await response.json();
          setSelectedList(list);
          setShoppingList(list.items.sort((a: any, b: any) => a.name.localeCompare(b.name)));
        } catch (err: any) {
          setError(err.message || 'Failed to fetch shopping list.');
          if (err.message === 'Unauthorized' || err.status === 401) handleLogout();
        } finally {
          setIsLoading(false);
        }
      };
      fetchList();
    } else if (!authToken) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      setShoppingList([]);
      setSelectedListId(null);
      setSelectedList(null);
    }
  }, [authToken, currentUser, selectedListId]);

  const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      let loginPayload: any;
      if (isEmail(email)) {
        loginPayload = { email, password };
      } else {
        loginPayload = { username: email, password };
      }
      const data = await api.loginUserFlexible(loginPayload);
      setAuthToken(data.token);
      setCurrentUser({ id: data.userId, email: data.email });
      setEmail('');
      setPassword('');
      
      // Initialize list selection after login
      try {
        const lists = await api.fetchShoppingLists(data.token);
        if (lists.length > 0) {
          setSelectedListId(lists[0]._id);
          localStorage.setItem('selectedListId', lists[0]._id);
        }
      } catch (listError: any) {
        console.error('Error fetching initial lists:', listError);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await api.registerUser(username, email, password);
      setError('Registration successful! Please log in.');
      setIsRegistering(false);
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


  const handleAddItem = useCallback(async (newItemData: Omit<ShoppingItem, 'id' | 'isCompleted'>) => {
    if (!authToken || !selectedListId) { setError("Authentication and list selection required."); return; }
    setIsLoading(true);
    try {
      const newItem = await api.addShoppingItem(authToken, selectedListId, newItemData);
      setShoppingList(prevList => [newItem, ...prevList].sort((a,b) => a.name.localeCompare(b.name)));
    } catch (err: any) {
      setError(err.message || 'Failed to add item.');
    } finally {
      setIsLoading(false);
    }
  }, [authToken, selectedListId]);

  const handleOpenAddItemModal = () => setIsAddItemModalOpen(true);
  const handleCloseAddItemModal = () => setIsAddItemModalOpen(false);

  const handleAddItemAndCloseModal = useCallback(async (newItemData: Omit<ShoppingItem, 'id' | 'isCompleted'>) => {
    await handleAddItem(newItemData);
    if (!error) { // Only close modal if add was successful (or at least no immediate error)
        handleCloseAddItemModal();
    }
  }, [handleAddItem, error]);

  const handleToggleComplete = useCallback(async (id: string) => {
    if (!authToken || !selectedListId) { setError("Authentication and list selection required."); return; }
    const item = shoppingList.find(i => i.id === id);
    if (!item) return;

    const updatedItemData = { ...item, isCompleted: !item.isCompleted };
    
    setShoppingList(prevList =>
      prevList.map(i => (i.id === id ? updatedItemData : i))
    );

    try {
      await api.updateShoppingItem(authToken, selectedListId, id, { isCompleted: updatedItemData.isCompleted });
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
    if (!authToken || !selectedListId) { setError("Authentication and list selection required."); return; }
    const originalList = [...shoppingList];
    setShoppingList(prevList =>
      prevList.map(item => (item.id === updatedItem.id ? updatedItem : item))
    );
    handleCloseEditModal();

    try {
      const { id, ...updatePayload } = updatedItem;
      await api.updateShoppingItem(authToken, selectedListId, updatedItem.id, updatePayload);
    } catch (err: any) {
      setError(err.message || 'Failed to save item.');
      setShoppingList(originalList);
    }
  }, [authToken, selectedListId, shoppingList, handleCloseEditModal]);

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
      const itemsToRemove = shoppingList.filter(item => item.isCompleted);
      if (itemsToRemove.length === 0) return;

      setShoppingList(prevList => prevList.filter(item => !item.isCompleted));
      try {
        await api.deleteCheckedItems(authToken, selectedListId);
      } catch (err: any) {
        setError(err.message || 'Failed to remove checked items.');
        setShoppingList(originalList);
      }
    }
  }, [authToken, selectedListId, shoppingList]);

  const handleRemoveCategory = useCallback(async (categoryName: Category) => {
    if (!authToken || !selectedListId) { setError("Authentication and list selection required."); return; }
    const originalList = [...shoppingList];
    const itemsToRemove = shoppingList.filter(item => item.category === categoryName);
    if (itemsToRemove.length === 0) return;

    setShoppingList(prevList => prevList.filter(item => item.category !== categoryName));
    try {
      await api.deleteCategoryItems(authToken, selectedListId, categoryName);
    } catch (err: any) {
      setError(err.message || 'Failed to remove category items.');
      setShoppingList(originalList);
    }
  }, [authToken, selectedListId, shoppingList]);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      localStorage.setItem('sidebarCollapsed', String(!prev));
      return !prev;
    });
  };

  const renderAuthForm = () => (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        {isRegistering ? 'Create Account' : 'Welcome Back'}
      </Typography>
      <form onSubmit={isRegistering ? handleRegister : handleLogin}>
        {isRegistering && (
          <>
            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email"
              placeholder="Enter your email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
            />
          </>
        )}
        {!isRegistering && (
          <TextField
            fullWidth
            label="Username or Email"
            placeholder="Enter your username or email"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
          />
        )}
        <TextField
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          required
        />
        <Button
          fullWidth
          variant="contained"
          color="primary"
          type="submit"
          disabled={isLoading}
          sx={{ mt: 2 }}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : isRegistering ? (
            'Register'
          ) : (
            'Login'
          )}
        </Button>
        <Button
          fullWidth
          color="primary"
          onClick={() => setIsRegistering(!isRegistering)}
          sx={{ mt: 1 }}
        >
          {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
        </Button>
      </form>
    </Box>
  );

  if (!authToken || !currentUser) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ 
          flex: 1,
          width: '100%',
          minHeight: '100vh',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: { xs: 2, sm: 4 }
        }}>
          <Box sx={{ 
            width: '100%', 
            maxWidth: 400,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            p: { xs: 3, sm: 4 },
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider'
          }}>
            {renderAuthForm()}
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  const renderShoppingList = () => (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? isDrawerOpen : !isSidebarCollapsed}
        onClose={() => setIsDrawerOpen(false)}
        sx={{
          width: isSidebarCollapsed ? 56 : 280,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: isSidebarCollapsed ? 56 : 280,
            boxSizing: 'border-box',
            overflowX: 'hidden',
            transition: 'width 0.3s',
          },
        }}
      >
        <Toolbar sx={{ minHeight: 48, px: 1, justifyContent: isSidebarCollapsed ? 'center' : 'flex-end' }}>
          <IconButton onClick={handleToggleSidebar} size="small">
            {isSidebarCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Toolbar>
        {!isSidebarCollapsed && (
          <ShoppingListManager
            token={authToken!}
            onListSelect={handleListSelect}
            selectedListId={selectedListId}
          />
        )}
        {isSidebarCollapsed && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
            <AddIcon color="primary" />
          </Box>
        )}
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
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
            {selectedList && (
              <Typography variant="h4" component="h2" sx={{ mb: 3 }}>
                {selectedList.name}
              </Typography>
            )}
            <ShoppingList
              items={shoppingList}
              onToggleComplete={handleToggleComplete}
              onDeleteItem={handleDeleteItem}
              onEditItem={handleOpenEditModal}
              onRemoveCategory={handleRemoveCategory}
              onRemoveCheckedItems={handleRemoveCheckedItems}
            />
            <Fab
              color="primary"
              aria-label="add"
              onClick={handleOpenAddItemModal}
              sx={{ position: 'fixed', bottom: 16, right: 16 }}
            >
              <AddIcon />
            </Fab>
          </>
        )}
      </Box>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="fixed">
        <Toolbar sx={{ justifyContent: 'center', position: 'relative' }}>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setIsDrawerOpen(true)}
              sx={{ mr: 2, position: 'absolute', left: 8 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" component="div" sx={{ flexGrow: 0, textAlign: 'center', mx: 'auto' }}>
            Smart Shopper
          </Typography>
          {authToken && (
            <IconButton color="inherit" onClick={handleLogout} sx={{ position: 'absolute', right: 8 }}>
              <LogoutIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {!authToken ? renderAuthForm() : renderShoppingList()}
      </Container>
      {isAddItemModalOpen && (
        <AddItemForm
          isOpen={isAddItemModalOpen}
          onClose={handleCloseAddItemModal}
          onAddItem={handleAddItemAndCloseModal}
        />
      )}
      {isEditModalOpen && itemToEdit && (
        <EditItemModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onSave={handleSaveItem}
          item={itemToEdit}
        />
      )}
    </ThemeProvider>
  );
};

export default App;