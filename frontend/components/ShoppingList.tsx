// frontend/components/ShoppingList.tsx
import React, { useState, useEffect } from 'react';
import { ShoppingItem, Category, StandardCategory } from '../types';
import CategorySection from './CategorySection';

import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from '@hello-pangea/dnd';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

interface ShoppingListProps {
  items: ShoppingItem[];
  listId: string;
  onToggleComplete: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onEditItem: (item: ShoppingItem) => void;
  onRemoveCategory: (categoryName: Category) => void;
  onRemoveCheckedItems: () => Promise<void>;
  onAddItem: () => void;
  areAllCollapsed: boolean;
  onToggleCategoryComplete: (categoryName: Category, completed: boolean) => void; // New prop
}

const ShoppingList: React.FC<ShoppingListProps> = ({
  items,
  listId,
  onToggleComplete,
  onDeleteItem,
  onEditItem,
  onRemoveCategory,
  onAddItem,
  areAllCollapsed,
  onToggleCategoryComplete, // Destructure new prop
}) => {
  const [categoryOrder, setCategoryOrder] = useState<string[]>([]);

  // Load custom order from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`categoryOrder_${listId}`);
    if (stored) {
      try {
        const parsedOrder = JSON.parse(stored);
        if (Array.isArray(parsedOrder)) {
          setCategoryOrder(parsedOrder);
        }
      } catch (error) {
        console.warn('Failed to parse stored category order:', error);
        // Clear invalid data
        localStorage.removeItem(`categoryOrder_${listId}`);
      }
    }
  }, [listId]);

  // Save custom order to localStorage
  useEffect(() => {
    if (categoryOrder.length > 0) {
      localStorage.setItem(`categoryOrder_${listId}`, JSON.stringify(categoryOrder));
    } else {
      // Remove from localStorage if we reset to alphabetical order
      localStorage.removeItem(`categoryOrder_${listId}`);
    }
  }, [categoryOrder, listId]);

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
        <Button variant="outlined" startIcon={<AddIcon />} onClick={onAddItem} sx={{ mb: 2 }}>
          Add First Item
        </Button>
      </Box>
    );
  }

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    const categoryKey = typeof item.category === 'string' ? item.category : 'Unknown';
    if (!acc[categoryKey]) {
      acc[categoryKey] = [];
    }
    acc[categoryKey].push(item);
    return acc;
  }, {} as Record<Category, ShoppingItem[]>);

  // Define priority order
  const priorityOrder = {
    'High': 1,
    'Medium': 2,
    'Low': 3,
  };

  // Sort items within each category
  Object.keys(groupedItems).forEach(category => {
    groupedItems[category].sort((a, b) => {
      // 1. By completion status (incomplete items first)
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      // 2. By priority
      const priorityA = priorityOrder[a.priority] || 4;
      const priorityB = priorityOrder[b.priority] || 4;
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      // 3. Alphabetically by name
      return a.name.localeCompare(b.name);
    });
  });
  
  // Get category names and apply sorting
  let sortedCategories = Object.keys(groupedItems);
  
  // Check if we have a custom order stored and if it contains all current categories
  const hasValidCustomOrder = categoryOrder.length > 0 && 
    sortedCategories.every(cat => categoryOrder.includes(cat));
  
  if (hasValidCustomOrder) {
    // Use custom drag-and-drop order
    sortedCategories.sort((a, b) => {
      const ia = categoryOrder.indexOf(a);
      const ib = categoryOrder.indexOf(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
  } else {
    // Default alphabetical sorting with "Other" category at the end
    sortedCategories.sort((a, b) => {
      if (a === StandardCategory.OTHER) return 1;
      if (b === StandardCategory.OTHER) return -1;
      return a.localeCompare(b);
    });
    
    // If we have new categories not in the stored order, reset the custom order
    // to ensure all categories are included for future drag operations
    if (categoryOrder.length > 0 && !hasValidCustomOrder) {
      setCategoryOrder([]);
    }
  }
  
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    // Create a reordered array based on the drag result
    const reordered = Array.from(sortedCategories);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    
    // Store the new custom order - this overrides alphabetical sorting
    setCategoryOrder(reordered);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="category-droppable">
        {(provided: DroppableProvided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {sortedCategories.map((categoryName, idx) => (
              <Draggable key={categoryName} draggableId={categoryName} index={idx}>
                {(provided: DraggableProvided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                  >
                    <CategorySection
                      dragHandleProps={provided.dragHandleProps}
                      categoryName={categoryName}
                      items={groupedItems[categoryName]}
                      onToggleComplete={onToggleComplete}
                      onDeleteItem={onDeleteItem}
                      onEditItem={onEditItem}
                      onRemoveCategory={onRemoveCategory}
                      onToggleCategoryComplete={onToggleCategoryComplete} // Pass handler down
                      defaultCollapsed={areAllCollapsed}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default ShoppingList;