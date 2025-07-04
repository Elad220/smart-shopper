import React, { useState } from 'react';
import { 
  Box, Container, Typography, Button, Stack, Card, 
  CardContent, Fab, useTheme, LinearProgress 
} from '@mui/material';
import { Plus, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { User } from '../../hooks/useAuth';
import { useShoppingList } from '../../hooks/useShoppingList';
import ShoppingListView from '../shopping/ShoppingListView';
import AddItemModal from '../shopping/AddItemModal';

interface ShoppingAppProps {
  user: User;
}

const ShoppingApp: React.FC<ShoppingAppProps> = ({ user }) => {
  const theme = useTheme();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const {
    items,
    isLoading,
    error,
    addItem,
    deleteItem,
    toggleComplete,
    clearCompleted
  } = useShoppingList(user.token);

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
    <Box sx={{ flexGrow: 1, py: 3 }}>
      <Container maxWidth="lg">
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
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                    My Shopping List
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {totalItems} items • {completedItems} completed
                  </Typography>
                </Box>
                
                <Stack direction="row" spacing={2}>
                  {completedItems > 0 && (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={handleClearCompleted}
                      sx={{ borderRadius: '10px', textTransform: 'none' }}
                    >
                      Clear Completed
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    startIcon={<Plus size={20} />}
                    onClick={() => setIsAddModalOpen(true)}
                    sx={{
                      borderRadius: '10px',
                      textTransform: 'none',
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    }}
                  >
                    Add Item
                  </Button>
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
      </Container>
    </Box>
  );
};

export default ShoppingApp;