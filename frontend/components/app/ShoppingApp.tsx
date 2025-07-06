import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Box, Container, Card, Typography, useTheme, useMediaQuery,
  Fab, Button
} from '@mui/material';
import { Plus, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { User } from '../../hooks/useAuth';
import { useShoppingList } from '../../hooks/useShoppingList';
import Header from '../layout/Header';
import SideMenu from '../layout/SideMenu';
import ShoppingListView from '../shopping/ShoppingListView';
import ShoppingModeView from '../shopping/ShoppingModeView';
import AddItemModal from '../shopping/AddItemModal';
import EditItemModal from '../EditItemModal';
import SmartAssistant from '../SmartAssistant';
import SettingsPage from '../settings/SettingsPage';
import MyListsPage from '../lists/MyListsPage';
import * as api from '../../src/services/api';

interface ShoppingAppProps {
  user: User;
  mode: 'light' | 'dark';
  onToggleMode: () => void;
  onLogout: () => void;
}

const ShoppingApp: React.FC<ShoppingAppProps> = ({ user, mode, onToggleMode, onLogout }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(!isMobile);
  const [isSmartAssistantOpen, setIsSmartAssistantOpen] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isShoppingMode, setIsShoppingMode] = useState(false);
  const [currentView, setCurrentView] = useState<'lists' | 'mylists' | 'settings'>('lists');
  
  const {
    items,
    currentListName,
    isLoading,
    error,
    addItem,
    updateItem,
    deleteItem,
    toggleComplete,
    clearCompleted,
    selectedListId,
    setSelectedListId
  } = useShoppingList(user.token);

  // Debug logging for items
  console.log('🛒 ShoppingApp - Items state:', {
    itemsCount: items.length,
    items: items.map(item => ({ id: item.id, name: item.name, completed: item.completed })),
    currentListName,
    selectedListId,
    isLoading
  });

  const completedItems = items.filter(item => item.completed).length;
  const totalItems = items.length;
  const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const handleAddItem = async (itemData: any) => {
    try {
      setIsAddingItem(true);
      
      // Debug: Track image through the flow
      console.log('🛒 ShoppingApp:', itemData.imageUrl ? '✅ Has image' : '❌ No image');
      
      const newItem = await addItem(itemData);
      
      console.log('🛒 ShoppingApp result:', newItem.imageUrl ? '✅ Image saved' : '❌ Image lost');
      
      setIsAddModalOpen(false);
      toast.success(`Added "${itemData.name}" to your list! ✅`);
    } catch (error: any) {
      console.error('🖼️ ShoppingApp - Error adding item:', error);
      toast.error(error.message);
    } finally {
      setIsAddingItem(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    const item = items.find(i => i.id === id);
    try {
      await deleteItem(id);
      toast.success(`Removed "${item?.name}" from your list! 🗑️`);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleToggleComplete = async (id: string) => {
    try {
      await toggleComplete(id);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  const handleUpdateItem = async (itemData: any) => {
    try {
      await updateItem(editingItem.id, itemData);
      setIsEditModalOpen(false);
      setEditingItem(null);
      toast.success(`Updated "${itemData.name}" successfully! ✅`);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleClearCompleted = async () => {
    if (window.confirm('Are you sure you want to remove all completed items?')) {
      try {
        await clearCompleted();
        toast.success('Cleared completed items! 🧹');
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };

  const handleListSelect = async (listId: string) => {
    setSelectedListId(listId);
    localStorage.setItem('selectedListId', listId);
    
    // Update the last used list in the backend
    try {
      await api.updateLastUsedList(user.token, listId);
      console.log('💾 Updated last used list in backend');
    } catch (error) {
      console.log('⚠️ Could not update last used list in backend');
    }
    
    if (isMobile) {
      setIsDrawerOpen(false);
    }
    // Ensure we're on the lists view when a list is selected
    setCurrentView('lists');
  };

  const handleDataChange = () => {
    // Handle data changes (functionality moved to MyListsPage)
  };

  const handleNavigateToList = () => {
    setCurrentView('lists');
  };

  const handleSmartAssistantAddItems = async (aiItems: { name: string; category: string }[]) => {
    try {
      for (const aiItem of aiItems) {
        await addItem({
          name: aiItem.name,
          category: aiItem.category,
          amount: 1,
          units: 'pcs',
          priority: 'Medium',
          notes: '',
        });
      }
      toast.success(`Added ${aiItems.length} items from Smart Assistant! 🤖`);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleToggleShoppingMode = () => {
    setIsShoppingMode(!isShoppingMode);
    if (!isShoppingMode) {
      toast.success('Shopping Mode activated! 🛒');
    } else {
      toast.success('Shopping Mode deactivated! 📝');
    }
  };

  const handleExitShoppingMode = () => {
    setIsShoppingMode(false);
    toast.success('Shopping Mode deactivated! 📝');
  };

  const handleNavigate = (view: 'lists' | 'mylists' | 'settings') => {
    setCurrentView(view);
    // If navigating away from lists view, exit shopping mode
    if (view !== 'lists' && isShoppingMode) {
      setIsShoppingMode(false);
    }
  };

  // Shopping list actions are now handled in ShoppingListManager

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card sx={{ p: 4, textAlign: 'center', borderRadius: '16px' }}>
          <Typography color="error" variant="h6" gutterBottom>
            Something went wrong
          </Typography>
          <Typography color="text.secondary">
            {error}
          </Typography>
        </Card>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Header
        mode={mode}
        onToggleMode={onToggleMode}
        isAuthenticated={true}
        user={user}
        onMenuOpen={() => setIsDrawerOpen(!isDrawerOpen)}
        isMobile={isMobile}
      />

      {/* Main Content Area */}
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        {/* Side Menu - Hidden in Shopping Mode */}
        {!isShoppingMode && (
          <SideMenu
            open={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            user={user}
            onLogout={onLogout}
            onNavigate={handleNavigate}
            currentView={currentView}
            isMobile={isMobile}
          />
        )}

        {/* Main Content */}
        <Box sx={{
          flexGrow: 1,
          py: currentView === 'settings' ? 0 : 3,
          ml: !isMobile && isDrawerOpen && !isShoppingMode ? '280px' : 0,
          transition: 'margin-left 0.3s ease',
          minWidth: 0,
          width: '100%',
          overflow: 'hidden',
        }}>
          {/* Shopping Mode takes priority */}
          {isShoppingMode ? (
            <Container maxWidth="md" sx={{ mx: 'auto', px: { xs: 2, sm: 3 }, py: 3 }}>
              <ShoppingModeView
                items={items}
                onToggleComplete={handleToggleComplete}
                onExitShoppingMode={handleExitShoppingMode}
                currentListName={currentListName}
              />
            </Container>
          ) : currentView === 'settings' ? (
            <SettingsPage user={user} />
          ) : currentView === 'mylists' ? (
            <MyListsPage
              user={user}
              selectedListId={selectedListId}
              onListSelect={handleListSelect}
              onDataChange={handleDataChange}
              onNavigateToList={handleNavigateToList}
            />
          ) : currentView === 'lists' ? (
            <Container
              maxWidth="md"
              sx={{
                mx: 'auto',
                px: { xs: 2, sm: 3 },
                py: 3,
                width: '100%',
              }}
            >
              {/* Loading State */}
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Package size={40} color={theme.palette.primary.main} />
                  </motion.div>
                </Box>
              ) : (
                <>
                  {/* Shopping List */}
                  {selectedListId ? (
                    <ShoppingListView
                      items={items}
                      listId={selectedListId}
                      userId={user.id}
                      onToggleComplete={handleToggleComplete}
                      onDeleteItem={handleDeleteItem}
                      onEditItem={handleEditItem}
                      onAddItem={() => setIsAddModalOpen(true)}
                      currentListName={currentListName}
                      totalItems={totalItems}
                      completedItems={completedItems}
                      completionPercentage={completionPercentage}
                      onClearCompleted={handleClearCompleted}
                      onToggleShoppingMode={handleToggleShoppingMode}
                      isShoppingMode={isShoppingMode}
                      onOpenSmartAssistant={() => setIsSmartAssistantOpen(true)}
                    />
                  ) : (
                     <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
                       <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                         No shopping list selected
                       </Typography>
                       <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                         Choose a shopping list to start adding items and managing your shopping.
                       </Typography>
                       <Button
                         variant="contained"
                         onClick={() => setCurrentView('mylists')}
                         sx={{
                           borderRadius: '8px',
                           textTransform: 'none',
                           background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                         }}
                       >
                         Browse My Lists
                       </Button>
                     </Box>
                  )}
                </>
              )}
            </Container>
          ) : null}
        </Box>
        
        {/* Floating Action Button - Hidden in Shopping Mode */}
        {!isShoppingMode && currentView === 'lists' && (
          <Fab
            color="primary"
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            }}
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={24} />
          </Fab>
        )}

        {/* Add Item Modal */}
        <AddItemModal
          open={isAddModalOpen}
          onClose={() => !isAddingItem && setIsAddModalOpen(false)}
          onAdd={handleAddItem}
          isLoading={isAddingItem}
        />

        {/* Edit Item Modal */}
        <EditItemModal
          open={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingItem(null);
          }}
          onSave={handleUpdateItem}
          item={editingItem}
        />

        {/* Smart Assistant Modal */}
        <SmartAssistant
          open={isSmartAssistantOpen}
          onClose={() => setIsSmartAssistantOpen(false)}
          onAddItems={handleSmartAssistantAddItems}
          token={user.token}
        />

      </Box>
    </Box>
  );
};

export default ShoppingApp;