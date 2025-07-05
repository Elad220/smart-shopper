import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Card,
  CardContent,
  Container,
  Button,
  Stack,
  Paper,
  alpha,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import { ShoppingCart, Check, ArrowLeft } from 'lucide-react';
import { ShoppingItem, Category } from '../../types';
import toast from 'react-hot-toast';

interface ShoppingModeViewProps {
  items: ShoppingItem[];
  onToggleComplete: (id: string) => void;
  onExitShoppingMode: () => void;
  currentListName: string;
}

const ShoppingModeView: React.FC<ShoppingModeViewProps> = ({
  items,
  onToggleComplete,
  onExitShoppingMode,
  currentListName,
}) => {
  const theme = useTheme();
  
  // Enhanced toggle function with toast notification
  const handleToggleComplete = (itemId: string) => {
    const item = items.find((i: ShoppingItem) => i.id === itemId);
    if (item) {
      onToggleComplete(itemId);
      
      // Show different messages based on completion status
      if (!item.completed) {
        // Item is being completed
        const encouragingMessages = [
          `✅ Got ${item.name}!`,
          `🎉 ${item.name} checked off!`,
          `✨ ${item.name} added to cart!`,
          `🛒 ${item.name} found!`,
          `👏 ${item.name} completed!`,
        ];
        const randomMessage = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
        toast.success(randomMessage, {
          duration: 2000,
          position: 'top-center',
        });
        
        // Check if this was the last item to complete
        const remainingAfterThis = items.filter((i: ShoppingItem) => !i.completed && i.id !== itemId).length;
        if (remainingAfterThis === 0) {
          // All items completed!
          setTimeout(() => {
            toast.success('🎉 Shopping complete! Great job! 🛍️', {
              duration: 4000,
              position: 'top-center',
            });
          }, 500); // Small delay to show after the individual item toast
        }
      } else {
        // Item is being unchecked
        toast(`📝 ${item.name} back on the list`, {
          duration: 1500,
          position: 'top-center',
        });
      }
    }
  };
  
  // Group items by category
  const groupedItems = items.reduce((acc: Record<Category, ShoppingItem[]>, item: ShoppingItem) => {
    const categoryKey = typeof item.category === 'string' ? item.category : 'Unknown';
    if (!acc[categoryKey]) {
      acc[categoryKey] = [];
    }
    acc[categoryKey].push(item);
    return acc;
  }, {} as Record<Category, ShoppingItem[]>);

  // Sort categories alphabetically with "Other" at the end
  const sortedCategories = Object.keys(groupedItems).sort((a, b) => {
    if (a === 'Other') return 1;
    if (b === 'Other') return -1;
    return a.localeCompare(b);
  });

  // Sort items within each category - incomplete items first, then by priority
  const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
  Object.keys(groupedItems).forEach(category => {
    groupedItems[category].sort((a: ShoppingItem, b: ShoppingItem) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      const priorityA = priorityOrder[a.priority] || 4;
      const priorityB = priorityOrder[b.priority] || 4;
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      return a.name.localeCompare(b.name);
    });
  });

  const totalItems = items.length;
  const completedItems = items.filter((item: ShoppingItem) => item.completed).length;
  const remainingItems = totalItems - completedItems;

  if (items.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: '24px',
            background: `linear-gradient(135deg, ${theme.palette.primary.main}10, ${theme.palette.secondary.main}10)`,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <ShoppingCart size={80} color={theme.palette.text.secondary} />
          <Typography variant="h4" sx={{ mt: 3, mb: 2, fontWeight: 600 }}>
            Shopping Mode
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Your list is empty
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowLeft />}
            onClick={onExitShoppingMode}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: '12px',
              textTransform: 'none',
              fontSize: '1.1rem',
            }}
          >
            Exit Shopping Mode
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          sx={{
            mb: 3,
            borderRadius: '20px',
            background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.secondary.main}15)`,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  🛒 Shopping Mode
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  {currentListName}
                </Typography>
                <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                  {remainingItems} items remaining
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<ArrowLeft />}
                onClick={onExitShoppingMode}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontSize: '1rem',
                  px: 3,
                  py: 1.5,
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                  },
                }}
              >
                Exit
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </motion.div>

      {/* Shopping List */}
      <Box sx={{ pb: 4 }}>
        {sortedCategories.map((categoryName, categoryIndex) => (
          <motion.div
            key={categoryName}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
          >
            <Card
              sx={{
                mb: 3,
                borderRadius: '16px',
                background: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  px: 3,
                  py: 2,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}08, ${theme.palette.secondary.main}08)`,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                  {categoryName}
                </Typography>
              </Box>
              
              <List disablePadding>
                {groupedItems[categoryName].map((item, itemIndex) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: itemIndex * 0.05 }}
                  >
                    <ListItem
                      onClick={() => handleToggleComplete(item.id)}
                      sx={{
                        py: 2.5,
                        px: 3,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        opacity: item.completed ? 0.6 : 1,
                        background: item.completed 
                          ? alpha(theme.palette.success.main, 0.1) 
                          : 'transparent',
                        '&:hover': {
                          background: item.completed 
                            ? alpha(theme.palette.success.main, 0.15)
                            : alpha(theme.palette.primary.main, 0.05),
                        },
                        borderBottom: itemIndex < groupedItems[categoryName].length - 1 
                          ? `1px solid ${theme.palette.divider}` 
                          : 'none',
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 60 }}>
                        <Checkbox
                          edge="start"
                          checked={item.completed}
                          readOnly
                          sx={{
                            transform: 'scale(1.5)',
                            '& .MuiSvgIcon-root': {
                              fontSize: '2rem',
                            },
                            pointerEvents: 'none', // Disable checkbox interaction
                          }}
                          color="success"
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography
                            variant="h6"
                            sx={{
                              fontSize: '1.5rem',
                              fontWeight: 500,
                              textDecoration: item.completed ? 'line-through' : 'none',
                              color: item.completed ? 'text.disabled' : 'text.primary',
                            }}
                          >
                            {item.name}
                          </Typography>
                        }
                        secondary={
                          <Typography
                            variant="body1"
                            sx={{
                              fontSize: '1.1rem',
                              color: item.completed ? 'text.disabled' : 'text.secondary',
                              mt: 0.5,
                            }}
                          >
                            {item.amount} {item.units}
                            {item.notes && ` • ${item.notes}`}
                          </Typography>
                        }
                      />
                      {item.completed && (
                        <Box sx={{ ml: 2, color: 'success.main' }}>
                          <Check size={32} />
                        </Box>
                      )}
                    </ListItem>
                  </motion.div>
                ))}
              </List>
            </Card>
          </motion.div>
        ))}
      </Box>

      {/* Summary */}
      {completedItems > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card
            sx={{
              borderRadius: '16px',
              background: `linear-gradient(135deg, ${theme.palette.success.main}15, ${theme.palette.success.dark}15)`,
              border: `1px solid ${theme.palette.success.main}30`,
              mb: 3,
            }}
          >
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 600, color: 'success.main', mb: 1 }}>
                🎉 Great Progress!
              </Typography>
              <Typography variant="h6" color="text.secondary">
                {completedItems} of {totalItems} items completed
              </Typography>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </Container>
  );
};

export default ShoppingModeView;