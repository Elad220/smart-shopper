import React, { useState } from 'react';
import { 
  Box, Container, Typography, Button, Stack, Card, 
  CardContent, Fab, useTheme, LinearProgress,
  IconButton, useMediaQuery, alpha
} from '@mui/material';
import { Plus, Package, Brain, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { User } from '../../hooks/useAuth';
import { useShoppingList } from '../../hooks/useShoppingList';
import ShoppingListView from '../shopping/ShoppingListView';
import ShoppingModeView from '../shopping/ShoppingModeView';
import AddItemModal from '../shopping/AddItemModal';
import EditItemModal from '../EditItemModal';
import SmartAssistant from '../SmartAssistant';
import Header from '../layout/Header';
import SideMenu from '../layout/SideMenu';
import SettingsPage from '../settings/SettingsPage';
import MyListsPage from '../lists/MyListsPage';

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
  const [selectedListId, setSelectedListId] = useState<string | null>(
    localStorage.getItem('selectedListId')
  );
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
    clearCompleted
  } = useShoppingList(user.token, selectedListId);

  const completedItems = items.filter(item => item.completed).length;
  const totalItems = items.length;
  const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const handleAddItem = async (itemData: any) => {
    try {
      setIsAddingItem(true);
      
      // Debug: Track image through the flow
      console.log('� ShoppingApp:', itemData.imageUrl ? '✅ Has image' : '❌ No image');
      
      const newItem = await addItem(itemData);
      
      console.log('� ShoppingApp result:', newItem.imageUrl ? '✅ Image saved' : '❌ Image lost');
      
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

  const handleListSelect = (listId: string) => {
    setSelectedListId(listId);
    localStorage.setItem('selectedListId', listId);
    if (isMobile) {
      setIsDrawerOpen(false);
    }
  };

  const handleDataChange = () => {
    // Handle data changes (functionality moved to MyListsPage)
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
              onNavigateToList={() => setCurrentView('lists')}
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
                  {/* Header - Hidden in Shopping Mode */}
                  {!isShoppingMode && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Card
                        sx={{
                          mb: 3,
                          borderRadius: '16px',
                          background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.secondary.main}15)`,
                          border: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        <CardContent sx={{ p: 2.5 }}>
                          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                              <Box sx={{ minWidth: 0 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                  {currentListName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {totalItems} items • {completedItems} completed
                                </Typography>
                              </Box>
                            </Box>
                            
                            <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                              {completedItems > 0 && (
                                <Button
                                  variant="text"
                                  size="small"
                                  onClick={handleClearCompleted}
                                  sx={{ 
                                    borderRadius: '8px', 
                                    textTransform: 'none',
                                    color: theme.palette.error.main,
                                    minWidth: 'auto',
                                    px: 1.5,
                                    fontSize: '0.75rem',
                                    '&:hover': {
                                      background: alpha(theme.palette.error.main, 0.1),
                                    },
                                  }}
                                >
                                  Clear
                                </Button>
                              )}
                              <IconButton
                                onClick={handleToggleShoppingMode}
                                sx={{
                                  borderRadius: '8px',
                                  background: isShoppingMode 
                                    ? `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`
                                    : `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
                                  color: 'white',
                                  '&:hover': {
                                    background: isShoppingMode 
                                      ? `linear-gradient(135deg, ${theme.palette.success.dark}, ${theme.palette.success.main})`
                                      : `linear-gradient(135deg, ${theme.palette.secondary.dark}, ${theme.palette.secondary.main})`,
                                  },
                                }}
                              >
                                <ShoppingCart size={18} />
                              </IconButton>
                              <IconButton
                                onClick={() => setIsAddModalOpen(true)}
                                sx={{
                                  borderRadius: '8px',
                                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                                  color: 'white',
                                  '&:hover': {
                                    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                                  },
                                }}
                              >
                                <Plus size={18} />
                              </IconButton>
                              <IconButton
                                onClick={() => setIsSmartAssistantOpen(true)}
                                sx={{ 
                                  borderRadius: '8px',
                                  border: `1px solid ${theme.palette.divider}`,
                                  '&:hover': {
                                    background: alpha(theme.palette.primary.main, 0.1),
                                  },
                                }}
                              >
                                <Brain size={18} />
                              </IconButton>
                            </Stack>
                          </Stack>
                        
                        {totalItems > 0 && (
                          <Box sx={{ mt: 3 }}>
                            <LinearProgress
                              variant="determinate"
                              value={completionPercentage}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: `${theme.palette.primary.main}20`,
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 4,
                                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                },
                              }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                              {completionPercentage}% complete
                            </Typography>
                          </Box>
                        )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

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