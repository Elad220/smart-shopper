import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box, Card, CardContent, Typography, Checkbox, IconButton,
  Stack, Chip, useTheme, alpha, Collapse, Button, TextField, InputAdornment
} from '@mui/material';
import { Trash2, ShoppingBag, AlertTriangle, Clock, Circle, ChevronDown, Edit, GripVertical, Search, X, Sparkles } from 'lucide-react';
import { ShoppingItem } from '../../types';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface ShoppingListViewProps {
  items: ShoppingItem[];
  onToggleComplete: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onEditItem: (item: ShoppingItem) => void;
  onAddItem: () => void;
}

// Floating particles component
const FloatingParticles: React.FC = () => {
  const [particles, setParticles] = useState<Array<{ id: number; left: number; size: number; delay: number }>>([]);

  useEffect(() => {
    const generateParticles = () => {
      const newParticles = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: Math.random() * 4 + 2,
        delay: Math.random() * 20,
      }));
      setParticles(newParticles);
    };

    generateParticles();
    const interval = setInterval(generateParticles, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box className="particles-container" sx={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: -1, overflow: 'hidden' }}>
      {particles.map((particle: { id: number; left: number; size: number; delay: number }) => (
        <Box
          key={particle.id}
          className="particle"
          sx={{
            position: 'absolute',
            left: `${particle.left}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDelay: `${particle.delay}s`,
            background: 'linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
            borderRadius: '50%',
            animation: 'float 20s infinite linear',
          }}
        />
      ))}
    </Box>
  );
};

const ShoppingListView: React.FC<ShoppingListViewProps> = ({
  items,
  onToggleComplete,
  onDeleteItem,
  onEditItem,
  onAddItem,
}) => {
  const theme = useTheme();
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [categoryOrder, setCategoryOrder] = useState<string[]>([]);
  const [areAllCollapsed, setAreAllCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Category emoji mapping
  const getCategoryEmoji = (category: string) => {
    const emojiMap: { [key: string]: string } = {
      'Produce': '🥬',
      'Dairy': '🥛',
      'Fridge': '❄️',
      'Freezer': '🧊',
      'Bakery': '🍞',
      'Pantry': '🏺',
      'Disposable': '🗑️',
      'Hygiene': '🧴',
      'Canned Goods': '🥫',
      'Organics': '🌱',
      'Deli': '🥓',
      'Other': '📦',
    };
    return emojiMap[category] || '🛒';
  };

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    
    const query = searchQuery.toLowerCase();
    return items.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.notes?.toLowerCase().includes(query) ||
      item.units.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  // Group filtered items by category
  const groupedItems = filteredItems.reduce((acc, item) => {
    const categoryKey = typeof item.category === 'string' ? item.category : 'Other';
    if (!acc[categoryKey]) {
      acc[categoryKey] = [];
    }
    acc[categoryKey].push(item);
    return acc;
  }, {} as Record<string, ShoppingItem[]>);

  // Sort items within each category by completion and priority
  Object.keys(groupedItems).forEach(category => {
    groupedItems[category].sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
      const priorityA = priorityOrder[a.priority as keyof typeof priorityOrder] || 4;
      const priorityB = priorityOrder[b.priority as keyof typeof priorityOrder] || 4;
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      return a.name.localeCompare(b.name);
    });
  });

  // Get sorted category names
  const sortedCategories = (() => {
    const categoryNames = Object.keys(groupedItems);
    
    // Check if we have a valid custom order that includes all current categories
    const hasValidCustomOrder = categoryOrder.length > 0 && 
      categoryNames.every(cat => categoryOrder.includes(cat)) &&
      categoryOrder.every(cat => categoryNames.includes(cat));
    
    // If we have a valid custom order, use it
    if (hasValidCustomOrder) {
      return categoryNames.sort((a, b) => {
        const indexA = categoryOrder.indexOf(a);
        const indexB = categoryOrder.indexOf(b);
        return indexA - indexB;
      });
    }
    
    // Default alphabetical sort with Other last
    return categoryNames.sort((a, b) => {
      if (a === 'Other') return 1;
      if (b === 'Other') return -1;
      return a.localeCompare(b);
    });
  })();

  // Load category order from localStorage
  useEffect(() => {
    const savedOrder = localStorage.getItem('categoryOrder');
    if (savedOrder) {
      try {
        const parsedOrder = JSON.parse(savedOrder);
        if (Array.isArray(parsedOrder)) {
          setCategoryOrder(parsedOrder);
        }
      } catch (error) {
        console.warn('Failed to parse stored category order:', error);
        // Clear invalid data
        localStorage.removeItem('categoryOrder');
      }
    }
  }, []);

  // Reset custom order if categories have changed significantly
  useEffect(() => {
    const categoryNames = Object.keys(groupedItems);
    if (categoryOrder.length > 0 && categoryNames.length > 0) {
      const hasValidCustomOrder = categoryNames.every(cat => categoryOrder.includes(cat)) &&
        categoryOrder.every(cat => categoryNames.includes(cat));
      
      if (!hasValidCustomOrder) {
        // Reset to empty array to fall back to alphabetical sorting
        setCategoryOrder([]);
        localStorage.removeItem('categoryOrder');
      }
    }
  }, [groupedItems, categoryOrder]);

  const toggleCategoryCollapse = (category: string) => {
    setCollapsedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const toggleAllCategories = () => {
    if (areAllCollapsed) {
      // Expand all
      setCollapsedCategories(new Set());
      setAreAllCollapsed(false);
    } else {
      // Collapse all
      setCollapsedCategories(new Set(sortedCategories));
      setAreAllCollapsed(true);
    }
  };

  const resetCategoryOrder = () => {
    setCategoryOrder([]);
    localStorage.removeItem('categoryOrder');
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    // Create new order based on current sorted categories
    const newOrder = Array.from(sortedCategories);
    const [reorderedItem] = newOrder.splice(sourceIndex, 1);
    newOrder.splice(destinationIndex, 0, reorderedItem);

    // Update state and persist to localStorage
    setCategoryOrder(newOrder);
    localStorage.setItem('categoryOrder', JSON.stringify(newOrder));
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

  if (items.length === 0) {
    return (
      <>
        <FloatingParticles />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Box
            className="glass-card"
            sx={{
              textAlign: 'center',
              py: 8,
              px: 4,
              borderRadius: '24px',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.secondary.main}15)`,
                borderRadius: '24px',
              },
            }}
          >
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <ShoppingBag size={64} color={theme.palette.primary.main} style={{ marginBottom: '16px' }} />
            </motion.div>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent' }}>
              Your shopping list is empty
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, opacity: 0.8 }}>
              Add your first item to get started with smart shopping!
            </Typography>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: `0 10px 25px ${alpha(theme.palette.primary.main, 0.3)}` }}
              whileTap={{ scale: 0.95 }}
              onClick={onAddItem}
              style={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                border: 'none',
                borderRadius: '16px',
                color: 'white',
                padding: '16px 32px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '1.1rem',
                backdropFilter: 'blur(10px)',
                boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            >
              <Sparkles size={20} style={{ marginRight: '8px' }} />
              Add First Item
            </motion.button>
          </Box>
        </motion.div>
      </>
    );
  }

  return (
    <>
      <FloatingParticles />
      <Box>
        {/* Enhanced Search and Controls */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box className="glass-card" sx={{ mb: 3, p: 2, borderRadius: '20px' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                size="small"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                sx={{ 
                  flexGrow: 1,
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: '16px',
                    background: alpha(theme.palette.background.paper, 0.5),
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: alpha(theme.palette.background.paper, 0.7),
                      borderColor: theme.palette.primary.main,
                    },
                    '&.Mui-focused': {
                      background: alpha(theme.palette.background.paper, 0.8),
                      borderColor: theme.palette.primary.main,
                      boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.2)}`,
                    }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={18} color={theme.palette.primary.main} />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <IconButton
                          size="small"
                          onClick={() => setSearchQuery('')}
                          sx={{ p: 0.5 }}
                        >
                          <X size={16} />
                        </IconButton>
                      </motion.div>
                    </InputAdornment>
                  )
                }}
              />
              
              {sortedCategories.length > 1 && !searchQuery && (
                <>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={toggleAllCategories}
                      sx={{
                        textTransform: 'none',
                        borderRadius: '12px',
                        borderColor: alpha(theme.palette.primary.main, 0.3),
                        color: theme.palette.primary.main,
                        background: alpha(theme.palette.primary.main, 0.05),
                        backdropFilter: 'blur(10px)',
                        whiteSpace: 'nowrap',
                        '&:hover': {
                          background: alpha(theme.palette.primary.main, 0.1),
                          borderColor: theme.palette.primary.main,
                          boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.2)}`,
                        },
                      }}
                    >
                      {areAllCollapsed ? 'Expand All' : 'Collapse All'}
                    </Button>
                  </motion.div>
                  
                  {categoryOrder.length > 0 && (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={resetCategoryOrder}
                        sx={{
                          textTransform: 'none',
                          borderRadius: '12px',
                          borderColor: alpha(theme.palette.secondary.main, 0.3),
                          color: theme.palette.secondary.main,
                          background: alpha(theme.palette.secondary.main, 0.05),
                          backdropFilter: 'blur(10px)',
                          whiteSpace: 'nowrap',
                          '&:hover': {
                            background: alpha(theme.palette.secondary.main, 0.1),
                            borderColor: theme.palette.secondary.main,
                            boxShadow: `0 4px 20px ${alpha(theme.palette.secondary.main, 0.2)}`,
                          },
                        }}
                      >
                        Reset Order
                      </Button>
                    </motion.div>
                  )}
                </>
              )}
            </Stack>
          </Box>
        </motion.div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="categories" type="CATEGORY">
            {(provided, snapshot) => (
              <Box
                ref={provided.innerRef}
                {...provided.droppableProps}
                sx={{
                  minHeight: snapshot.isDraggingOver ? 100 : 'auto',
                  transition: 'min-height 0.3s ease',
                }}
              >
                <Stack spacing={4}>
                  <AnimatePresence>
                    {sortedCategories.map((categoryName, index) => (
                      <Draggable 
                        key={categoryName} 
                        draggableId={categoryName} 
                        index={index}
                        isDragDisabled={false}
                      >
                        {(provided, snapshot) => (
                          <motion.div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            style={{
                              ...provided.draggableProps.style,
                              transform: snapshot.isDragging 
                                ? `${provided.draggableProps.style?.transform} rotate(2deg)` 
                                : provided.draggableProps.style?.transform,
                            }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                          >
                            <Card
                              className="glass-card"
                              sx={{
                                borderRadius: '20px',
                                overflow: 'hidden',
                                transform: snapshot.isDragging ? 'rotate(3deg) scale(1.02)' : 'rotate(0deg) scale(1)',
                                transition: snapshot.isDragging ? 'none' : 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'translateY(-4px)',
                                  boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
                                }
                              }}
                            >
                              {/* Enhanced Category Header */}
                              <CardContent 
                                sx={{ 
                                  p: 3, 
                                  cursor: 'pointer',
                                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.secondary.main, 0.08)})`,
                                  backdropFilter: 'blur(20px)',
                                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                  '&:hover': {
                                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)}, ${alpha(theme.palette.secondary.main, 0.15)})`,
                                  },
                                }}
                                onClick={() => toggleCategoryCollapse(categoryName)}
                              >
                                <Stack direction="row" alignItems="center" spacing={2}>
                                  <Box 
                                    {...provided.dragHandleProps}
                                    sx={{ 
                                      display: 'flex', 
                                      cursor: 'grab',
                                      padding: '8px',
                                      borderRadius: '8px',
                                      background: alpha(theme.palette.action.hover, 0.5),
                                      transition: 'transform 0.2s ease',
                                      '&:hover': {
                                        transform: 'scale(1.1)',
                                      }
                                    }}
                                  >
                                    <GripVertical size={16} color={theme.palette.text.secondary} />
                                  </Box>
                                  <motion.div
                                    animate={{ rotate: [0, 10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                  >
                                    <Typography variant="h4" sx={{ fontSize: '1.5rem' }}>
                                      {getCategoryEmoji(categoryName)}
                                    </Typography>
                                  </motion.div>
                                  <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600, background: `linear-gradient(135deg, ${theme.palette.text.primary}, ${theme.palette.primary.main})`, backgroundClip: 'text', WebkitBackgroundClip: 'text' }}>
                                    {categoryName}
                                  </Typography>
                                  <motion.div whileHover={{ scale: 1.05 }}>
                                    <Chip 
                                      label={`${groupedItems[categoryName].length} items`}
                                      size="small"
                                      sx={{ 
                                        borderRadius: '12px',
                                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                        color: 'white',
                                        fontWeight: 600,
                                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                                      }}
                                    />
                                  </motion.div>
                                  <motion.div
                                    animate={{ rotate: collapsedCategories.has(categoryName) ? 0 : 180 }}
                                    transition={{ duration: 0.3 }}
                                  >
                                    <IconButton size="small" sx={{ color: theme.palette.primary.main }}>
                                      <ChevronDown size={20} />
                                    </IconButton>
                                  </motion.div>
                                </Stack>
                              </CardContent>

                              {/* Enhanced Category Items */}
                              <Collapse in={!collapsedCategories.has(categoryName)}>
                                <Box sx={{ p: 3, pt: 0 }}>
                                  <Stack spacing={3}>
                                    <AnimatePresence>
                                      {groupedItems[categoryName].map((item, itemIndex) => (
                                        <motion.div
                                          key={item.id}
                                          initial={{ opacity: 0, x: -20, scale: 0.9 }}
                                          animate={{ opacity: 1, x: 0, scale: 1 }}
                                          exit={{ opacity: 0, x: 20, scale: 0.9 }}
                                          transition={{ duration: 0.3, delay: itemIndex * 0.05 }}
                                          layout
                                          whileHover={{ scale: 1.02 }}
                                        >
                                          <Card
                                            className="glass-card"
                                            sx={{
                                              borderRadius: '16px',
                                              transition: 'all 0.3s ease',
                                              background: item.completed
                                                ? alpha(theme.palette.success.main, 0.08)
                                                : 'inherit',
                                              '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.1)}`,
                                              },
                                            }}
                                          >
                                            <CardContent sx={{ p: item.imageUrl ? 2 : 3, overflow: 'hidden' }}>
                                              <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
                                                {/* Checkbox */}
                                                <Box sx={{ flexShrink: 0 }}>
                                                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                                    <Checkbox
                                                      checked={item.completed}
                                                      onChange={() => onToggleComplete(item.id)}
                                                      sx={{
                                                        color: theme.palette.primary.main,
                                                        '&.Mui-checked': {
                                                          color: theme.palette.success.main,
                                                        },
                                                        '& .MuiSvgIcon-root': {
                                                          fontSize: '1.5rem',
                                                        }
                                                      }}
                                                    />
                                                  </motion.div>
                                                </Box>
                                                
                                                {/* Enhanced Item Image */}
                                                {item.imageUrl && (
                                                  <Box sx={{ flexShrink: 0 }}>
                                                    <motion.div whileHover={{ scale: 1.05 }}>
                                                      <Box
                                                        sx={{
                                                          width: '60px',
                                                          height: '60px',
                                                          borderRadius: '12px',
                                                          overflow: 'hidden',
                                                          position: 'relative',
                                                          boxShadow: `0 8px 16px ${alpha(theme.palette.common.black, 0.2)}`,
                                                        }}
                                                      >
                                                        <img
                                                          src={item.imageUrl}
                                                          alt={item.name}
                                                          style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover',
                                                          }}
                                                        />
                                                      </Box>
                                                    </motion.div>
                                                  </Box>
                                                )}
                                                
                                                {/* Content Area */}
                                                <Box sx={{ flexGrow: 1, minWidth: 0, overflow: 'hidden', pr: item.imageUrl ? 0.5 : 1 }}>
                                                  <Stack direction="row" alignItems="flex-start" spacing={1} sx={{ mb: 0.5 }}>
                                                    <Typography
                                                      variant="subtitle1"
                                                      sx={{
                                                        fontWeight: 600,
                                                        textDecoration: item.completed ? 'line-through' : 'none',
                                                        opacity: item.completed ? 0.7 : 1,
                                                        fontSize: item.imageUrl ? '1.0rem' : '1.05rem',
                                                        flexGrow: 1,
                                                        lineHeight: 1.3,
                                                        // Allow text wrapping when images are present to give more room for item names
                                                        ...(item.imageUrl ? {
                                                          whiteSpace: 'normal',
                                                          wordBreak: 'break-word',
                                                          maxWidth: 'calc(100% - 24px)', // Account for priority icon space
                                                        } : {
                                                          overflow: 'hidden',
                                                          textOverflow: 'ellipsis',
                                                          whiteSpace: 'nowrap',
                                                        }),
                                                      }}
                                                    >
                                                      {item.name}
                                                    </Typography>
                                                    <Box sx={{ flexShrink: 0, mt: 0.2 }}>
                                                      <motion.div whileHover={{ scale: 1.2 }}>
                                                        {getPriorityIcon(item.priority)}
                                                      </motion.div>
                                                    </Box>
                                                  </Stack>
                                                  
                                                  {/* Enhanced Item Details */}
                                                  <Stack direction="row" alignItems="center" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.5, mt: 0.5 }}>
                                                    <motion.div whileHover={{ scale: 1.05 }}>
                                                      <Chip
                                                        label={`${item.amount} ${item.units}`}
                                                        size="small"
                                                        sx={{ 
                                                          borderRadius: '10px', 
                                                          fontSize: '0.7rem',
                                                          height: '22px',
                                                          background: alpha(theme.palette.primary.main, 0.1),
                                                          color: theme.palette.primary.main,
                                                          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                                          '& .MuiChip-label': {
                                                            px: 1,
                                                          }
                                                        }}
                                                      />
                                                    </motion.div>
                                                    {item.notes && (
                                                      <motion.div whileHover={{ scale: 1.05 }}>
                                                        <Chip
                                                          label={item.notes}
                                                          size="small"
                                                          sx={{ 
                                                            borderRadius: '10px', 
                                                            fontSize: '0.7rem',
                                                            height: '22px',
                                                            maxWidth: item.imageUrl ? '100px' : '140px',
                                                            background: alpha(theme.palette.secondary.main, 0.1),
                                                            color: theme.palette.secondary.main,
                                                            border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                                                            '& .MuiChip-label': {
                                                              px: 1,
                                                              overflow: 'hidden',
                                                              textOverflow: 'ellipsis',
                                                              whiteSpace: 'nowrap',
                                                            }
                                                          }}
                                                        />
                                                      </motion.div>
                                                    )}
                                                  </Stack>
                                                </Box>
                                                
                                                {/* Action Buttons */}
                                                <Box sx={{ flexShrink: 0, ml: item.imageUrl ? 0.5 : 1 }}>
                                                  <Stack direction="row" spacing={item.imageUrl ? 0.5 : 1}>
                                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                                      <IconButton
                                                        size="small"
                                                        onClick={() => onEditItem(item)}
                                                        sx={{ 
                                                          width: item.imageUrl ? '32px' : '36px',
                                                          height: item.imageUrl ? '32px' : '36px',
                                                          background: alpha(theme.palette.primary.main, 0.1),
                                                          color: theme.palette.primary.main,
                                                          '&:hover': {
                                                            background: alpha(theme.palette.primary.main, 0.2),
                                                            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                                                          },
                                                        }}
                                                      >
                                                        <Edit size={item.imageUrl ? 14 : 16} />
                                                      </IconButton>
                                                    </motion.div>
                                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                                      <IconButton
                                                        size="small"
                                                        onClick={() => onDeleteItem(item.id)}
                                                        sx={{ 
                                                          width: item.imageUrl ? '32px' : '36px',
                                                          height: item.imageUrl ? '32px' : '36px',
                                                          background: alpha(theme.palette.error.main, 0.1),
                                                          color: theme.palette.error.main,
                                                          '&:hover': {
                                                            background: alpha(theme.palette.error.main, 0.2),
                                                            boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.3)}`,
                                                          },
                                                        }}
                                                      >
                                                        <Trash2 size={item.imageUrl ? 14 : 16} />
                                                      </IconButton>
                                                    </motion.div>
                                                  </Stack>
                                                </Box>
                                              </Stack>
                                            </CardContent>
                                          </Card>
                                        </motion.div>
                                      ))}
                                    </AnimatePresence>
                                  </Stack>
                                </Box>
                              </Collapse>
                            </Card>
                          </motion.div>
                        )}
                      </Draggable>
                    ))}
                  </AnimatePresence>
                  {provided.placeholder}
                </Stack>
              </Box>
            )}
          </Droppable>
        </DragDropContext>
      </Box>
    </>
  );
};

export default ShoppingListView;