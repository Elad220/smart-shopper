import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Checkbox,
  IconButton,
  Chip,
  Avatar,
  Stack,
  Button,
  Collapse,
  useTheme,
  alpha,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  MoreVertical,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronUp,
  Package,
  ShoppingBag,
  CheckCircle2,
  Circle,
  Star,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { ShoppingItem } from '../types';

interface ModernShoppingListProps {
  items: ShoppingItem[];
  listId: string;
  onToggleComplete: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onEditItem: (item: ShoppingItem) => void;
  onRemoveCategory: (categoryName: string) => void;
  onRemoveCheckedItems: () => void;
  onAddItem: () => void;
  areAllCollapsed: boolean;
  onToggleCategoryComplete: (categoryName: string, shouldBeCompleted: boolean) => void;
}

const ModernShoppingList: React.FC<ModernShoppingListProps> = ({
  items,
  onToggleComplete,
  onDeleteItem,
  onEditItem,
  onRemoveCategory,
  onRemoveCheckedItems,
  onAddItem,
  areAllCollapsed,
  onToggleCategoryComplete,
}) => {
  const theme = useTheme();
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    const category = item.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ShoppingItem[]>);

  const toggleCategoryCollapse = (category: string) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(category)) {
      newCollapsed.delete(category);
    } else {
      newCollapsed.add(category);
    }
    setCollapsedCategories(newCollapsed);
  };

  const isCategoryCollapsed = (category: string) => {
    return areAllCollapsed || collapsedCategories.has(category);
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'High':
        return <AlertTriangle size={16} color={theme.palette.error.main} />;
      case 'Medium':
        return <Clock size={16} color={theme.palette.warning.main} />;
      case 'Low':
        return <Circle size={16} color={theme.palette.info.main} />;
      default:
        return <Circle size={16} color={theme.palette.info.main} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return theme.palette.error.main;
      case 'Medium': return theme.palette.warning.main;
      case 'Low': return theme.palette.info.main;
      default: return theme.palette.info.main;
    }
  };

  const getCategoryIcon = (category: string) => {
    // Map common categories to icons
    const iconMap: Record<string, React.ReactNode> = {
      'Fruits & Vegetables': '🥬',
      'Meat & Fish': '🥩',
      'Dairy': '🥛',
      'Bakery': '🍞',
      'Beverages': '🥤',
      'Snacks': '🍿',
      'Household': '🧽',
      'Personal Care': '🧴',
      'Health': '💊',
      'Baby': '🍼',
      'Electronics': '📱',
      'Clothing': '👕',
      'Books': '📚',
      'Other': '📦',
    };
    
    return iconMap[category] || '📦';
  };

  const completedItems = items.filter(item => item.completed).length;
  const totalItems = items.length;

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            px: 4,
            borderRadius: '16px',
            background: `linear-gradient(135deg, ${theme.palette.primary.main}10, ${theme.palette.secondary.main}10)`,
            border: `1px dashed ${theme.palette.divider}`,
          }}
        >
          <ShoppingBag size={64} color={theme.palette.text.secondary} style={{ marginBottom: '16px' }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            Your shopping list is empty
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Add your first item to get started with smart shopping!
          </Typography>
          <Button
            variant="contained"
            onClick={onAddItem}
            startIcon={<Package size={20} />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            }}
          >
            Add First Item
          </Button>
        </Box>
      </motion.div>
    );
  }

  return (
    <Box>
      {/* Summary Card */}
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
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Shopping Progress
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {completedItems} of {totalItems} items completed
                </Typography>
              </Box>
              <Stack direction="row" spacing={2}>
                {completedItems > 0 && (
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={onRemoveCheckedItems}
                    startIcon={<Trash2 size={16} />}
                    sx={{
                      borderRadius: '10px',
                      textTransform: 'none',
                      fontSize: '0.875rem',
                    }}
                  >
                    Clear Completed
                  </Button>
                )}
                <Badge badgeContent={totalItems} color="primary">
                  <Avatar
                    sx={{
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      width: 48,
                      height: 48,
                    }}
                  >
                    <ShoppingBag size={24} />
                  </Avatar>
                </Badge>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </motion.div>

      {/* Category Sections */}
      <Stack spacing={3}>
        {Object.entries(groupedItems).map(([category, categoryItems], categoryIndex) => {
          const isCollapsed = isCategoryCollapsed(category);
          const categoryCompleted = categoryItems.filter(item => item.completed).length;
          const categoryTotal = categoryItems.length;
          const isAllCategoryCompleted = categoryCompleted === categoryTotal;

          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
            >
              <Card
                sx={{
                  borderRadius: '16px',
                  border: `1px solid ${theme.palette.divider}`,
                  overflow: 'hidden',
                  background: theme.palette.background.paper,
                  '&:hover': {
                    boxShadow: theme.shadows[4],
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {/* Category Header */}
                <Box
                  sx={{
                    p: 2,
                    background: isAllCategoryCompleted
                      ? alpha(theme.palette.success.main, 0.1)
                      : alpha(theme.palette.primary.main, 0.05),
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    cursor: 'pointer',
                  }}
                  onClick={() => toggleCategoryCollapse(category)}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box
                        sx={{
                          fontSize: '1.5rem',
                          width: 40,
                          height: 40,
                          borderRadius: '10px',
                          background: alpha(theme.palette.primary.main, 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {getCategoryIcon(category)}
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {category}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {categoryCompleted}/{categoryTotal} completed
                        </Typography>
                      </Box>
                    </Stack>
                    
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Tooltip title={isAllCategoryCompleted ? "Mark all as incomplete" : "Mark all as complete"}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleCategoryComplete(category, !isAllCategoryCompleted);
                          }}
                          sx={{
                            color: isAllCategoryCompleted ? theme.palette.success.main : theme.palette.text.secondary,
                          }}
                        >
                          {isAllCategoryCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Delete category">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveCategory(category);
                          }}
                          sx={{ color: theme.palette.error.main }}
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </Tooltip>
                      
                      <IconButton size="small">
                        {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                      </IconButton>
                    </Stack>
                  </Stack>
                </Box>

                {/* Category Items */}
                <Collapse in={!isCollapsed}>
                  <Box sx={{ p: 2 }}>
                    <AnimatePresence>
                      <Stack spacing={2}>
                        {categoryItems.map((item, index) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            layout
                          >
                            <Card
                              sx={{
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: '12px',
                                transition: 'all 0.3s ease',
                                background: item.completed
                                  ? alpha(theme.palette.success.main, 0.05)
                                  : theme.palette.background.paper,
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                  boxShadow: theme.shadows[4],
                                },
                              }}
                            >
                              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                  <Checkbox
                                    checked={item.completed}
                                    onChange={() => onToggleComplete(item.id)}
                                    sx={{
                                      color: theme.palette.primary.main,
                                      '&.Mui-checked': {
                                        color: theme.palette.success.main,
                                      },
                                    }}
                                  />
                                  
                                  <Box sx={{ flexGrow: 1 }}>
                                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                      <Typography
                                        variant="body1"
                                        sx={{
                                          fontWeight: 500,
                                          textDecoration: item.completed ? 'line-through' : 'none',
                                          opacity: item.completed ? 0.7 : 1,
                                        }}
                                      >
                                        {item.name}
                                      </Typography>
                                      {getPriorityIcon(item.priority)}
                                    </Stack>
                                    
                                    <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                                      <Chip
                                        label={`${item.amount} ${item.units}`}
                                        size="small"
                                        variant="outlined"
                                        sx={{ borderRadius: '8px', fontSize: '0.75rem' }}
                                      />
                                      {item.notes && (
                                        <Chip
                                          label={item.notes}
                                          size="small"
                                          color="default"
                                          sx={{ borderRadius: '8px', fontSize: '0.75rem' }}
                                        />
                                      )}
                                    </Stack>
                                  </Box>
                                  
                                  <Stack direction="row" spacing={1}>
                                    <Tooltip title="Edit item">
                                      <IconButton
                                        size="small"
                                        onClick={() => onEditItem(item)}
                                        sx={{ color: theme.palette.primary.main }}
                                      >
                                        <Edit3 size={16} />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete item">
                                      <IconButton
                                        size="small"
                                        onClick={() => onDeleteItem(item.id)}
                                        sx={{ color: theme.palette.error.main }}
                                      >
                                        <Trash2 size={16} />
                                      </IconButton>
                                    </Tooltip>
                                  </Stack>
                                </Stack>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </Stack>
                    </AnimatePresence>
                  </Box>
                </Collapse>
              </Card>
            </motion.div>
          );
        })}
      </Stack>
    </Box>
  );
};

export default ModernShoppingList;