import React, { useState } from 'react';
import { 
  Box, Container, Typography, Button, Stack, Card, 
  CardContent, Fab, useTheme, LinearProgress, Drawer,
  IconButton, useMediaQuery, alpha
} from '@mui/material';
import { Plus, Package, Menu, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { User } from '../../hooks/useAuth';
import { useShoppingList } from '../../hooks/useShoppingList';
import ShoppingListView from '../shopping/ShoppingListView';
import AddItemModal from '../shopping/AddItemModal';
import EditItemModal from '../EditItemModal';
import { ShoppingListManager } from '../ShoppingListManager';
import SmartAssistant from '../SmartAssistant';

interface ShoppingAppProps {
  user: User;
}

const ShoppingApp: React.FC<ShoppingAppProps> = ({ user }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(!isMobile);
  const [isSmartAssistantOpen, setIsSmartAssistantOpen] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string | null>(
    localStorage.getItem('selectedListId')
  );
  
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
      await addItem(itemData);
      setIsAddModalOpen(false);
      toast.success(`Added "${itemData.name}" to your list! ✅`);
    } catch (error: any) {
      toast.error(error.message);
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
    // Trigger a data refresh by updating the list selection
    if (selectedListId) {
      setSelectedListId(selectedListId);
    }
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
    <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
      {/* Drawer for Shopping List Manager */}
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        anchor="left"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        sx={{
          width: 360,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 360,
            boxSizing: 'border-box',
            top: 64, // Account for header height
            height: 'calc(100vh - 64px)',
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        <ShoppingListManager
          key={isDrawerOpen ? 'open' : 'closed'}
          token={user.token}
          selectedListId={selectedListId}
          onListSelect={handleListSelect}
          onDataChange={handleDataChange}
          onOpenCreateDialog={() => {/* TODO: Implement create dialog */}}
        />
      </Drawer>

      {/* Main Content */}
      <Box sx={{ 
        flexGrow: 1, 
        py: 3, 
        ml: !isMobile && isDrawerOpen ? '360px' : 0,
        transition: 'margin-left 0.3s ease',
        minWidth: 0, // Prevent overflow
        width: !isMobile && isDrawerOpen ? 'calc(100vw - 360px)' : '100%',
        overflow: 'hidden',
      }}>
        <Container 
          maxWidth="lg" 
          sx={{ 
            width: '100%',
            maxWidth: '100%',
            px: { xs: 2, sm: 3 }
          }}
        >
          {/* Header */}
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
                    <IconButton
                      onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                      sx={{ 
                        display: { md: 'none' },
                        p: 1
                      }}
                    >
                      <Menu size={18} />
                    </IconButton>
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

        {/* Shopping List */}
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
          <ShoppingListView
            items={items}
            onToggleComplete={handleToggleComplete}
            onDeleteItem={handleDeleteItem}
            onEditItem={handleEditItem}
            onAddItem={() => setIsAddModalOpen(true)}
          />
        )}

        {/* Floating Action Button */}
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

        {/* Add Item Modal */}
        <AddItemModal
          open={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddItem}
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
      </Container>
    </Box>
  </Box>
  );
};

export default ShoppingApp;