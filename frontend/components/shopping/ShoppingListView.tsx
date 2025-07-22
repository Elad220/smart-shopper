import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Box, Card, CardContent, Typography, Checkbox, IconButton,
  Stack, Chip, useTheme, alpha, Collapse, Button, TextField, InputAdornment
} from '@mui/material';
import { Trash2, ShoppingBag, AlertTriangle, Clock, Circle, ChevronDown, Edit, GripVertical, Search, X, Sparkles } from 'lucide-react';
import { ShoppingItem } from '../../types';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface ShoppingListViewProps {
  items: ShoppingItem[];
  listId: string;
  userId: string;
  onToggleComplete: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onEditItem: (item: ShoppingItem) => void;
  onAddItem: () => void;
}

// Enhanced floating particles component with more variety
const FloatingParticles: React.FC = () => {
  const [particles, setParticles] = useState<Array<{ id: number; left: number; size: number; delay: number; color: string }>>([]);

  useEffect(() => {
    const generateParticles = () => {
      const colors = [
        'rgba(59, 130, 246, 0.2)',
        'rgba(37, 99, 235, 0.18)', 
        'rgba(96, 165, 250, 0.15)',
        'rgba(147, 197, 253, 0.12)',
        'rgba(29, 78, 216, 0.2)'
      ];
      const newParticles = Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: Math.random() * 3 + 1.5,
        delay: Math.random() * 25,
        color: colors[Math.floor(Math.random() * colors.length)]
      }));
      setParticles(newParticles);
    };

    generateParticles();
    const interval = setInterval(generateParticles, 25000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box className="particles-container" sx={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: -1, overflow: 'hidden' }}>
      {particles.map((particle) => (
        <Box
          key={particle.id}
          className="particle"
          sx={{
            position: 'absolute',
            left: `${particle.left}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDelay: `${particle.delay}s`,
            background: `linear-gradient(45deg, ${particle.color}, ${particle.color.replace('0.2', '0.1')})`,
            borderRadius: '50%',
            animation: 'float 25s infinite linear',
            boxShadow: `0 0 15px ${particle.color.replace('0.2', '0.1')}`
          }}
        />
      ))}
    </Box>
  );
};

const ShoppingListView: React.FC<ShoppingListViewProps> = ({
  items,
  listId,
  userId,
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
  const [showUncheckedOnly, setShowUncheckedOnly] = useState(false);
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

  // Filter items based on search query and unchecked filter
  const filteredItems = useMemo(() => {
    let result = items;
    
    // Apply unchecked filter
    if (showUncheckedOnly) {
      result = result.filter(item => !item.completed);
    }
    
    // Apply search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.notes?.toLowerCase().includes(query) ||
        item.units.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [items, searchQuery, showUncheckedOnly]);

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
    
    // If we have a custom order, use it to sort the visible categories
    // Categories not in the custom order will be sorted alphabetically at the end
    if (categoryOrder.length > 0) {
      return categoryNames.sort((a, b) => {
        const indexA = categoryOrder.indexOf(a);
        const indexB = categoryOrder.indexOf(b);
        
        // If both categories are in the custom order, sort by their position
        if (indexA !== -1 && indexB !== -1) {
          return indexA - indexB;
        }
        
        // If only one is in the custom order, prioritize the one in the order
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        
        // If neither is in the custom order, sort alphabetically
        if (a === 'Other') return 1;
        if (b === 'Other') return -1;
        return a.localeCompare(b);
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
    const savedOrder = localStorage.getItem(`categoryOrder_${userId}_${listId}`);
    if (savedOrder) {
      try {
        const parsedOrder = JSON.parse(savedOrder);
        if (Array.isArray(parsedOrder)) {
          setCategoryOrder(parsedOrder);
        }
      } catch (error) {
        console.warn('Failed to parse stored category order:', error);
        // Clear invalid data
        localStorage.removeItem(`categoryOrder_${userId}_${listId}`);
      }
    }
  }, [userId, listId]);

  // Reset custom order if categories have changed significantly
  useEffect(() => {
    // Get all categories from the original unfiltered items to avoid resetting order during filtering
    const allCategoryNames = [...new Set(items.map(item => 
      typeof item.category === 'string' ? item.category : 'Other'
    ))];
    
    if (categoryOrder.length > 0 && allCategoryNames.length > 0) {
      const hasValidCustomOrder = allCategoryNames.every(cat => categoryOrder.includes(cat)) &&
        categoryOrder.every(cat => allCategoryNames.includes(cat));
      
      if (!hasValidCustomOrder) {
        // Reset to empty array to fall back to alphabetical sorting
        setCategoryOrder([]);
        localStorage.removeItem(`categoryOrder_${userId}_${listId}`);
      }
    }
  }, [items, categoryOrder, userId, listId]);

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
    localStorage.removeItem(`categoryOrder_${userId}_${listId}`);
  }, [userId, listId]);

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
    localStorage.setItem(`categoryOrder_${userId}_${listId}`, JSON.stringify(newOrder));
  }, [sortedCategories, userId, listId]);

  const getPriorityIcon = useCallback((priority: string) => {
    switch (priority) {
      case 'High':
        return <AlertTriangle size={14} color={theme.palette.error.main} />;
      case 'Medium':
        return <Clock size={14} color={theme.palette.warning.main} />;
      case 'Low':
        return <Circle size={14} color={theme.palette.info.main} />;
      default:
        return <Circle size={14} color={theme.palette.info.main} />;
    }
  }, [theme.palette]);

  // Simplified category component without memo for drag and drop reliability
  const renderCategoryCard = (categoryName: string, items: ShoppingItem[], index: number, isCollapsed: boolean) => (
    <Draggable 
      draggableId={categoryName} 
      index={index}
      isDragDisabled={false}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          style={{
            ...provided.draggableProps.style,
            marginBottom: '6px',
          }}
          className="compact-fade-in"
        >
          <Card
            className={`glass-category glass-hover ${snapshot.isDragging ? 'glow-primary' : ''}`}
            sx={{
              borderRadius: '12px',
              overflow: 'hidden',
              transform: snapshot.isDragging ? 'rotate(0.5deg) scale(1.01)' : 'none',
              transition: snapshot.isDragging ? 'none' : 'all 0.2s ease',
            }}
            >
            {/* Ultra Compact Category Header */}
            <CardContent 
              sx={{ 
                p: 1.5, 
                cursor: 'pointer',
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                transition: 'all 0.2s ease',
              }}
              onClick={() => !snapshot.isDragging && toggleCategoryCollapse(categoryName)}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <div
                  {...provided.dragHandleProps}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: snapshot.isDragging ? 'grabbing' : 'grab',
                    padding: '4px',
                    borderRadius: '6px',
                    backgroundColor: snapshot.isDragging 
                      ? alpha(theme.palette.primary.main, 0.2)
                      : alpha(theme.palette.action.hover, 0.3),
                    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                    userSelect: 'none',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <GripVertical size={14} color={theme.palette.text.primary} />
                </div>
                <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>
                  {getCategoryEmoji(categoryName)}
                </Typography>
                <Typography variant="subtitle1" sx={{ 
                  flexGrow: 1, 
                  fontWeight: 600,
                  fontSize: '1rem',
                  color: theme.palette.text.primary,
                }}>
                  {categoryName}
                </Typography>
                <Chip 
                  label={items.length}
                  size="small"
                  sx={{ 
                    borderRadius: '8px',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    height: '20px',
                    minWidth: '20px',
                  }}
                />
                <IconButton 
                  size="small" 
                  sx={{ 
                    transform: `rotate(${isCollapsed ? 0 : 180}deg)`,
                    transition: 'transform 0.3s ease',
                    padding: '3px',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!snapshot.isDragging) {
                      toggleCategoryCollapse(categoryName);
                    }
                  }}
                >
                  <ChevronDown size={16} />
                </IconButton>
              </Stack>
            </CardContent>

            <Collapse in={!isCollapsed}>
              <Box sx={{ p: 1.5, pt: 0 }}>
                <Stack spacing={0.5}>
                  {items.map((item) => (
                    <Card
                      key={item.id}
                      className="glass-item glass-hover"
                      sx={{
                        borderRadius: '10px',
                        background: item.completed
                          ? alpha(theme.palette.success.main, 0.06)
                          : 'inherit',
                      }}
                    >
                      <CardContent sx={{ p: '8px 12px 2px 12px' }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Checkbox
                            checked={item.completed}
                            onChange={() => onToggleComplete(item.id)}
                            size="small"
                            sx={{
                              padding: '2px',
                              color: theme.palette.primary.main,
                              '&.Mui-checked': {
                                color: theme.palette.success.main,
                              },
                            }}
                          />
                          
                          {item.imageUrl && (
                            <Box
                              sx={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '6px',
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
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600,
                                  fontSize: '0.85rem',
                                  textDecoration: item.completed ? 'line-through' : 'none',
                                  opacity: item.completed ? 0.7 : 1,
                                  flexGrow: 1,
                                  overflowWrap: 'break-word',
                                  whiteSpace: 'normal',
                                }}
                              >
                                {item.name}
                              </Typography>
                              {getPriorityIcon(item.priority)}
                            </Stack>
                            
                            <Stack direction="row" spacing={0.25} sx={{ mt: 0.125 }}>
                              <Chip
                                label={`${item.amount} ${item.units}`}
                                size="small"
                                sx={{ 
                                  borderRadius: '4px', 
                                  fontSize: '0.6rem',
                                  height: '16px',
                                  background: alpha(theme.palette.primary.main, 0.08),
                                  color: theme.palette.primary.main,
                                }}
                              />
                              {item.notes && (
                                <Chip
                                  label={item.notes}
                                  size="small"
                                  variant="outlined"
                                  sx={{ 
                                    borderRadius: '4px',
                                    fontSize: '0.6rem',
                                    height: '16px',
                                    borderColor: alpha(theme.palette.text.secondary, 0.25),
                                  }}
                                />
                              )}
                            </Stack>
                          </Box>
                          
                          <Stack direction="row" spacing={0.25}>
                            <IconButton
                              size="small"
                              onClick={() => onEditItem(item)}
                              sx={{ 
                                borderRadius: '4px',
                                padding: '3px',
                                '&:hover': {
                                  background: alpha(theme.palette.primary.main, 0.08),
                                }
                              }}
                            >
                              <Edit size={10} />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => onDeleteItem(item.id)}
                              sx={{ 
                                borderRadius: '4px',
                                padding: '3px',
                                color: theme.palette.error.main,
                                '&:hover': {
                                  background: alpha(theme.palette.error.main, 0.08),
                                }
                              }}
                            >
                              <Trash2 size={10} />
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
        </div>
      )}
    </Draggable>
  );

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
              <ShoppingBag size={56} color={theme.palette.primary.main} style={{ marginBottom: '16px' }} />
            </motion.div>
            <Typography variant="h5" sx={{ 
              mb: 2, 
              fontWeight: 600, 
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, 
              backgroundClip: 'text', 
              WebkitBackgroundClip: 'text', 
              color: 'transparent' 
            }}>
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
                padding: '14px 28px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '1rem',
                backdropFilter: 'blur(10px)',
                boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            >
              <Sparkles size={18} style={{ marginRight: '8px' }} />
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
      <Box sx={{ 
        overflow: 'visible', 
        position: 'relative',
        width: '100%',
        minHeight: '100vh'
      }}>
        {/* Ultra Compact Search and Controls */}
        <Box className="glass-search compact-fade-in" sx={{ mb: 1.5, p: 1, borderRadius: '12px' }}>
          <Stack spacing={1.5}>
            {/* Search Input Row */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <TextField
                size="small"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                sx={{ 
                  flexGrow: 1,
                  minWidth: '200px',
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: '10px',
                    height: '32px',
                    background: alpha(theme.palette.background.paper, 0.4),
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: alpha(theme.palette.background.paper, 0.6),
                      borderColor: theme.palette.primary.main,
                    },
                    '&.Mui-focused': {
                      background: alpha(theme.palette.background.paper, 0.7),
                      borderColor: theme.palette.primary.main,
                      boxShadow: `0 0 15px ${alpha(theme.palette.primary.main, 0.2)}`,
                    }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={16} color={theme.palette.primary.main} />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setSearchQuery('')}
                        sx={{ p: 0.5 }}
                      >
                        <X size={14} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              
              {/* Compact Filter Button */}
              <Button
                variant={showUncheckedOnly ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setShowUncheckedOnly(!showUncheckedOnly)}
                startIcon={<Circle size={14} />}
                className="glass-button"
                sx={{
                  textTransform: 'none',
                  borderRadius: '10px',
                  fontSize: '0.75rem',
                  height: '32px',
                  minWidth: 'auto',
                  px: 2,
                  whiteSpace: 'nowrap',
                }}
              >
                Unchecked
              </Button>
            </Box>
            
            {/* Additional Controls - only show when needed */}
            {sortedCategories.length > 1 && !searchQuery && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={toggleAllCategories}
                  className="glass-button"
                  sx={{
                    textTransform: 'none',
                    borderRadius: '8px',
                    fontSize: '0.7rem',
                    height: '28px',
                    minWidth: 'auto',
                    px: 1.5,
                  }}
                >
                  {areAllCollapsed ? 'Expand All' : 'Collapse All'}
                </Button>
                
                {categoryOrder.length > 0 && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={resetCategoryOrder}
                    className="glass-button"
                    sx={{
                      textTransform: 'none',
                      borderRadius: '8px',
                      fontSize: '0.7rem',
                      height: '28px',
                      minWidth: 'auto',
                      px: 1.5,
                    }}
                  >
                    Reset Order
                  </Button>
                )}
              </Box>
            )}
          </Stack>
        </Box>

        <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <Droppable droppableId="categories" type="CATEGORY" direction="vertical">
            {(provided, snapshot) => (
              <Box
                ref={provided.innerRef}
                {...provided.droppableProps}
                sx={{
                  minHeight: snapshot.isDraggingOver ? 80 : 40,
                  width: '100%',
                  overflow: 'visible',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  borderRadius: snapshot.isDraggingOver ? '10px' : '0px',
                  background: snapshot.isDraggingOver 
                    ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.04)})`
                    : 'transparent',
                  border: snapshot.isDraggingOver 
                    ? `1px dashed ${alpha(theme.palette.primary.main, 0.25)}`
                    : '1px dashed transparent',
                  padding: snapshot.isDraggingOver ? '4px' : '0px',
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 1,
                  width: '100%',
                  minHeight: 40,
                  position: 'relative',
                  overflow: 'visible'
                }}>
                  {sortedCategories.map((categoryName, index) => (
                    <div key={categoryName}>
                      {renderCategoryCard(categoryName, groupedItems[categoryName], index, collapsedCategories.has(categoryName))}
                    </div>
                  ))}
                  {/* Compact placeholder */}
                  <Box
                    sx={{ 
                      display: isDragging ? 'block' : 'none',
                      minHeight: '40px',
                      animation: isDragging ? 'placeholderPulse 1.5s ease-in-out infinite' : 'none',
                      '@keyframes placeholderPulse': {
                        '0%, 100%': { opacity: 0.3, transform: 'scale(0.98)' },
                        '50%': { opacity: 0.6, transform: 'scale(1.02)' },
                      },
                    }}
                  >
                    {provided.placeholder}
                  </Box>
                  {!isDragging && provided.placeholder}
                </Box>
              </Box>
            )}
          </Droppable>
        </DragDropContext>
      </Box>
    </>
  );
};

export default ShoppingListView;