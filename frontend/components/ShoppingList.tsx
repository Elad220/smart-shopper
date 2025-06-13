import React, { useState, useEffect } from 'react';
import { ShoppingItem, Category } from '../types';
import CategorySection from './CategorySection';
import { CATEGORY_OPTIONS } from '../constants'; 

import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'; // For "Remove Checked"
import TextField from '@mui/material/TextField';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

interface ShoppingListProps {
  items: ShoppingItem[];
  onToggleComplete: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onEditItem: (item: ShoppingItem) => void;
  onRemoveCategory: (categoryName: Category) => void;
  onRemoveCheckedItems: () => void;
}

const ShoppingList: React.FC<ShoppingListProps> = ({ 
  items, 
  onToggleComplete, 
  onDeleteItem, 
  onEditItem, 
  onRemoveCategory,
  onRemoveCheckedItems
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryOrder, setCategoryOrder] = useState<string[]>([]);

  // Get listId from the first item (assumes all items are from the same list)
  const listId = items[0]?.listId || 'default';

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
      localStorage.setItem(`categoryOrder_${listId}` , JSON.stringify(categoryOrder));
    }
  }, [categoryOrder, listId]);

  // Filter items by search query (name or category)
  const filteredItems = searchQuery.trim() === ''
    ? items
    : items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  if (filteredItems.length === 0 && items.length > 0) {
    return (
      <Box>
        <TextField
          fullWidth
          label="Search by product or isle"
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

  if (items.length === 0) {
    return (
      <Box>
        <TextField
          fullWidth
          label="Search by product or isle"
          variant="outlined"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          sx={{ mb: 3 }}
        />
        <Typography variant="subtitle1" color="text.secondary" align="center" sx={{ py: 4 }}>
          Your shopping list is empty. Add some items!
        </Typography>
      </Box>
    );
  }

  // Group items by category and sort items within each category
  const groupedItems = filteredItems.reduce((acc, item) => {
    const categoryKey = typeof item.category === 'string' ? item.category : 'Unknown';
    if (!acc[categoryKey]) {
      acc[categoryKey] = [];
    }
    acc[categoryKey].push(item);
    return acc;
  }, {} as Record<Category, ShoppingItem[]>);

  // Sort items within each category (unchecked first, then alphabetically)
  Object.keys(groupedItems).forEach(category => {
    groupedItems[category].sort((a, b) => {
      // First sort by completion status
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }
      // Then sort alphabetically by name
      return a.name.localeCompare(b.name);
    });
  });

  // Define category order
  const standardCategoryOrder = [...CATEGORY_OPTIONS, "Other"];
  
  // Sort categories
  let sortedCategories = Object.keys(groupedItems);
  if (categoryOrder.length) {
    sortedCategories.sort((a, b) => {
      const ia = categoryOrder.indexOf(a);
      const ib = categoryOrder.indexOf(b);
      if (ia === -1 && ib === -1) return 0;
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
  } else {
    sortedCategories = sortedCategories.sort((a, b) => {
      const indexA = standardCategoryOrder.indexOf(a as any);
      const indexB = standardCategoryOrder.indexOf(b as any);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });
  }

  const hasCheckedItems = items.some(item => item.isCompleted);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(sortedCategories);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setCategoryOrder(reordered);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        fullWidth
        label="Search by product or isle"
        variant="outlined"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        sx={{ mb: 3 }}
      />
      {hasCheckedItems && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DeleteForeverIcon />}
            onClick={onRemoveCheckedItems}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
              py: 1
            }}
          >
            Remove Checked Items
          </Button>
        </Box>
      )}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="category-droppable">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {sortedCategories.map((categoryName, idx) => (
                <Draggable key={categoryName} draggableId={categoryName} index={idx}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      style={{ marginBottom: 16, ...provided.draggableProps.style }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <span {...provided.dragHandleProps} style={{ cursor: 'grab', marginRight: 8 }}>
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