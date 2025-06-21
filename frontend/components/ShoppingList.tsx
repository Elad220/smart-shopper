import React, { useState, useEffect } from 'react';
import { ShoppingItem, Category, StandardCategory } from '../types';
import CategorySection from './CategorySection';

import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import AddIcon from '@mui/icons-material/Add';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

interface ShoppingListProps {
  items: ShoppingItem[];
  listId: string;
  onToggleComplete: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onEditItem: (item: ShoppingItem) => void;
  onRemoveCategory: (categoryName: Category) => void;
  onRemoveCheckedItems: () => void;
  onAddItem: () => void;
}

const ShoppingList: React.FC<ShoppingListProps> = ({ 
  items, 
  listId,
  onToggleComplete, 
  onDeleteItem, 
  onEditItem,
  onRemoveCategory,
  onRemoveCheckedItems,
  onAddItem
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [allCollapsed, setAllCollapsed] = useState(false);
  const [categoryOrder, setCategoryOrder] = useState<string[]>([]);

  // Load custom order from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`categoryOrder_${listId}`);
    if (stored) {
      setCategoryOrder(JSON.parse(stored));
    }
  }, [listId]);

  // Save custom order to localStorage
  useEffect(() => {
    if (categoryOrder.length) {
      localStorage.setItem(`categoryOrder_${listId}`, JSON.stringify(categoryOrder));
    }
  }, [categoryOrder, listId]);

  // Filter items by search query (name or category)
  const filteredItems = searchQuery.trim() === ''
    ? items
    : items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  if (items.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
          textAlign: 'center',
        }}
      >
        <ShoppingCartIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h5" component="p" sx={{ fontWeight: 'bold' }}>
          Your list is empty
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Add your first item to get started
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onAddItem}>
          Add First Item
        </Button>
      </Box>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <Box>
        <TextField
          fullWidth
          label="Search..."
          variant="outlined"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          sx={{ mb: 3 }}
        />
        <Typography variant="subtitle1" color="text.secondary" align="center" sx={{ py: 4 }}>
          No items match your search.
        </Typography>
      </Box>
    );
  }

  // Group items by category
  const groupedItems = filteredItems.reduce((acc, item) => {
    const categoryKey = typeof item.category === 'string' ? item.category : 'Unknown';
    if (!acc[categoryKey]) {
      acc[categoryKey] = [];
    }
    acc[categoryKey].push(item);
    return acc;
  }, {} as Record<Category, ShoppingItem[]>);

  // Sort items within each category
  Object.keys(groupedItems).forEach(category => {
    groupedItems[category].sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      return a.name.localeCompare(b.name);
    });
  });
  
  // Get category names and apply sorting
  let sortedCategories = Object.keys(groupedItems);
  if (categoryOrder.length > 0) {
    sortedCategories.sort((a, b) => {
      const ia = categoryOrder.indexOf(a);
      const ib = categoryOrder.indexOf(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
  } else {
    sortedCategories.sort((a, b) => {
      if (a === StandardCategory.OTHER) return 1;
      if (b === StandardCategory.OTHER) return -1;
      return a.localeCompare(b);
    });
  }
  
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(sortedCategories);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setCategoryOrder(reordered);
  };

  const totalItems = items.length;
  const completedItems = items.filter(item => item.completed).length;
  const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <TextField
            fullWidth
            label="Search..."
            variant="outlined"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            sx={{
                mr: 2,
                '& .MuiOutlinedInput-root': {
                    borderRadius: '20px',
                },
            }}
        />
        <IconButton onClick={() => setAllCollapsed(!allCollapsed)}>
            {allCollapsed ? <UnfoldMoreIcon /> : <UnfoldLessIcon />}
        </IconButton>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onAddItem}>
            Add
        </Button>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
          <Typography variant="body1">{totalItems} items</Typography>
          <Typography variant="body1" color="text.secondary">
              <span style={{ color: 'green' }}>✓</span> {completedItems} completed
          </Typography>
          <Typography variant="body1" color="text.secondary">{completionPercentage}%</Typography>
      </Box>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="category-droppable">
          {(provided: DroppableProvided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {sortedCategories.map((categoryName, idx) => (
                <Draggable key={categoryName} draggableId={categoryName} index={idx}>
                  {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <span {...provided.dragHandleProps} style={{ cursor: 'grab', display: 'flex', alignItems: 'center', paddingRight: '8px' }}>
                          <DragIndicatorIcon color={snapshot.isDragging ? 'primary' : 'disabled'} />
                        </span>
                        <Box sx={{ flexGrow: 1 }}>
                          <CategorySection
                            categoryName={categoryName}
                            items={groupedItems[categoryName]}
                            onToggleComplete={onToggleComplete}
                            onDeleteItem={onDeleteItem}
                            onEditItem={onEditItem}
                            onRemoveCategory={onRemoveCategory}
                            defaultCollapsed={allCollapsed}
                          />
                        </Box>
                      </Box>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </Box>
  );
};

export default ShoppingList;