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
}

const ShoppingList: React.FC<ShoppingListProps> = ({
  items,
  listId,
  onToggleComplete,
  onDeleteItem,
  onEditItem,
  onRemoveCategory,
  onAddItem,
  areAllCollapsed
}) => {
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