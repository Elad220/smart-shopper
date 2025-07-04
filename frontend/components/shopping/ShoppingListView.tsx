import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
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
  const [isDragging, setIsDragging] = useState(false);

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

  const toggleCategoryCollapse = useCallback((category: string) => {
    setCollapsedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  }, []);

  const toggleAllCategories = useCallback(() => {
    if (areAllCollapsed) {
      // Expand all
      setCollapsedCategories(new Set());
      setAreAllCollapsed(false);
    } else {
      // Collapse all
      setCollapsedCategories(new Set(sortedCategories));
      setAreAllCollapsed(true);
    }
  }, [areAllCollapsed, sortedCategories]);

  const resetCategoryOrder = useCallback(() => {
    setCategoryOrder([]);
    localStorage.removeItem('categoryOrder');
  }, []);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback((result: DropResult) => {
    setIsDragging(false);
    
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
  }, [sortedCategories]);

  const getPriorityIcon = useCallback((priority: string) => {
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
  }, [theme.palette]);

  // Memoized category component for better performance
  const CategoryCard = memo(({ 
    categoryName, 
    items, 
    index, 
    isCollapsed, 
    isDragging: globalIsDragging 
  }: { 
    categoryName: string;
    items: ShoppingItem[];
    index: number;
    isCollapsed: boolean;
    isDragging: boolean;
  }) => (
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
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            rotate: snapshot.isDragging ? 3 : 0,
            scale: snapshot.isDragging ? 1.05 : 1,
          }}
          transition={{ 
            type: snapshot.isDragging ? "tween" : "spring",
            duration: snapshot.isDragging ? 0.2 : 0.6,
            ease: snapshot.isDragging ? "easeOut" : "easeInOut",
            stiffness: 300,
            damping: 25,
          }}
          whileHover={!globalIsDragging ? { 
            y: -4, 
            transition: { duration: 0.2 } 
          } : {}}
        >
          <Card
            className="glass-card"
            sx={{
              borderRadius: '20px',
              overflow: 'hidden',
              // Enhanced shadow during drag
              boxShadow: snapshot.isDragging 
                ? `0 20px 40px ${alpha(theme.palette.primary.main, 0.3)}, 0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`
                : globalIsDragging 
                  ? '0 4px 12px rgba(0,0,0,0.1)' 
                  : '0 4px 20px rgba(0,0,0,0.08)',
              // Smooth transition when not dragging
              transition: snapshot.isDragging ? 'none' : 'box-shadow 0.3s ease',
              // Improved backdrop blur during drag
              backdropFilter: snapshot.isDragging ? 'blur(20px)' : 'blur(10px)',
              // Add border during drag for better visual feedback
              border: snapshot.isDragging 
                ? `2px solid ${alpha(theme.palette.primary.main, 0.3)}`
                : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            {/* Simplified Category Header */}
            <CardContent 
              sx={{ 
                p: 3, 
                cursor: 'pointer',
                background: snapshot.isDragging 
                  ? alpha(theme.palette.primary.main, 0.15)
                  : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.secondary.main, 0.08)})`,
                // Simplified backdrop filter for performance
                backdropFilter: snapshot.isDragging ? 'none' : 'blur(10px)',
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                transition: snapshot.isDragging || globalIsDragging ? 'none' : 'background 0.2s ease',
                '&:hover': !globalIsDragging ? {
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.12)}, ${alpha(theme.palette.secondary.main, 0.12)})`,
                } : {},
              }}
              onClick={() => !snapshot.isDragging && toggleCategoryCollapse(categoryName)}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <motion.div
                  {...provided.dragHandleProps}
                  whileHover={!globalIsDragging ? { 
                    scale: 1.1,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1)
                  } : {}}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    display: 'flex', 
                    cursor: snapshot.isDragging ? 'grabbing' : 'grab',
                    padding: '10px',
                    borderRadius: '12px',
                    background: snapshot.isDragging 
                      ? alpha(theme.palette.primary.main, 0.2)
                      : alpha(theme.palette.action.hover, 0.3),
                    border: snapshot.isDragging 
                      ? `2px solid ${alpha(theme.palette.primary.main, 0.4)}`
                      : `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <GripVertical 
                    size={16} 
                    color={snapshot.isDragging 
                      ? theme.palette.primary.main 
                      : theme.palette.text.secondary
                    } 
                  />
                </motion.div>
                <motion.div
                  animate={snapshot.isDragging ? {
                    rotate: [0, -5, 5, 0],
                    scale: [1, 1.1, 1.1, 1],
                  } : {
                    rotate: 0,
                    scale: 1,
                  }}
                  transition={{
                    duration: snapshot.isDragging ? 0.6 : 0.3,
                    repeat: snapshot.isDragging ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                >
                  <Typography variant="h4" sx={{ fontSize: '1.5rem' }}>
                    {getCategoryEmoji(categoryName)}
                  </Typography>
                </motion.div>
                <Typography variant="h6" sx={{ 
                  flexGrow: 1, 
                  fontWeight: 600,
                  // Simplified gradient for performance
                  color: theme.palette.text.primary,
                }}>
                  {categoryName}
                </Typography>
                <motion.div
                  animate={snapshot.isDragging ? {
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
                      `0 4px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                      `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`
                    ],
                  } : {}}
                  transition={{
                    duration: 1,
                    repeat: snapshot.isDragging ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                >
                  <Chip 
                    label={`${items.length} items`}
                    size="small"
                    sx={{ 
                      borderRadius: '12px',
                      background: snapshot.isDragging 
                        ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                        : theme.palette.primary.main,
                      color: 'white',
                      fontWeight: 600,
                      boxShadow: snapshot.isDragging 
                        ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`
                        : `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
                      transition: 'all 0.3s ease',
                    }}
                  />
                </motion.div>
                <motion.div
                  animate={{
                    rotate: isCollapsed ? 0 : 180,
                    scale: snapshot.isDragging ? 1.1 : 1,
                  }}
                  whileHover={!globalIsDragging ? { scale: 1.2 } : {}}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <IconButton 
                    size="small" 
                    sx={{ 
                      color: snapshot.isDragging 
                        ? theme.palette.primary.main 
                        : theme.palette.text.primary,
                      background: snapshot.isDragging 
                        ? alpha(theme.palette.primary.main, 0.1)
                        : 'transparent',
                      transition: 'all 0.3s ease',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!snapshot.isDragging) {
                        toggleCategoryCollapse(categoryName);
                      }
                    }}
                  >
                    <ChevronDown size={20} />
                  </IconButton>
                </motion.div>
              </Stack>
            </CardContent>

            {/* Items remain the same but with performance optimizations */}
            <Collapse in={!isCollapsed}>
              <Box sx={{ p: 3, pt: 0 }}>
                <Stack spacing={2}>
                  {items.map((item, itemIndex) => (
                    <Card
                      key={item.id}
                      className="glass-card"
                      sx={{
                        borderRadius: '16px',
                        // Disable transitions during global drag
                        transition: globalIsDragging ? 'none' : 'all 0.2s ease',
                        background: item.completed
                          ? alpha(theme.palette.success.main, 0.08)
                          : 'inherit',
                        '&:hover': !globalIsDragging ? {
                          transform: 'translateY(-1px)',
                          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.08)}`,
                        } : {},
                      }}
                    >
                      <CardContent sx={{ p: item.imageUrl ? 2 : 3 }}>
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
                          
                          {item.imageUrl && (
                            <Box
                              sx={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                flexShrink: 0,
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
                          )}
                          
                          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Typography
                                variant="subtitle1"
                                sx={{
                                  fontWeight: 600,
                                  textDecoration: item.completed ? 'line-through' : 'none',
                                  opacity: item.completed ? 0.7 : 1,
                                  flexGrow: 1,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {item.name}
                              </Typography>
                              {getPriorityIcon(item.priority)}
                            </Stack>
                            
                            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                              <Chip
                                label={`${item.amount} ${item.units}`}
                                size="small"
                                sx={{ 
                                  borderRadius: '8px', 
                                  fontSize: '0.7rem',
                                  height: '20px',
                                }}
                              />
                              {item.notes && (
                                <Chip
                                  label={item.notes}
                                  size="small"
                                  variant="outlined"
                                  sx={{ 
                                    borderRadius: '8px',
                                    fontSize: '0.7rem',
                                    height: '20px',
                                  }}
                                />
                              )}
                            </Stack>
                          </Box>
                          
                          <Stack direction="row" spacing={0.5}>
                            <IconButton
                              size="small"
                              onClick={() => onEditItem(item)}
                              sx={{ borderRadius: '6px' }}
                            >
                              <Edit size={14} />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => onDeleteItem(item.id)}
                              sx={{ 
                                borderRadius: '6px',
                                color: theme.palette.error.main,
                              }}
                            >
                              <Trash2 size={14} />
                            </IconButton>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </Box>
            </Collapse>
          </Card>
        </motion.div>
      )}
    </Draggable>
  ));

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

        <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <Droppable droppableId="categories" type="CATEGORY">
            {(provided, snapshot) => (
              <Box
                ref={provided.innerRef}
                {...provided.droppableProps}
                sx={{
                  minHeight: snapshot.isDraggingOver ? 120 : 'auto',
                  transition: 'all 0.3s ease',
                  borderRadius: snapshot.isDraggingOver ? '16px' : '0px',
                  background: snapshot.isDraggingOver 
                    ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.secondary.main, 0.08)})`
                    : 'transparent',
                  border: snapshot.isDraggingOver 
                    ? `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`
                    : '2px dashed transparent',
                  padding: snapshot.isDraggingOver ? '8px' : '0px',
                }}
              >
                <Stack spacing={3}>
                  {sortedCategories.map((categoryName, index) => (
                    <CategoryCard
                      key={categoryName}
                      categoryName={categoryName}
                      items={groupedItems[categoryName]}
                      index={index}
                      isCollapsed={collapsedCategories.has(categoryName)}
                      isDragging={isDragging}
                    />
                  ))}
                  {/* Enhanced placeholder with animation */}
                  <motion.div
                    style={{ 
                      display: isDragging ? 'block' : 'none',
                    }}
                    animate={isDragging ? {
                      opacity: [0.3, 0.6, 0.3],
                      scale: [0.98, 1.02, 0.98],
                    } : {}}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    {provided.placeholder}
                  </motion.div>
                  {!isDragging && provided.placeholder}
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