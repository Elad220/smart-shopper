import React, { useState } from 'react';
import { ShoppingItem, Category } from '../types';
import CategorySection from './CategorySection';
import { CATEGORY_OPTIONS } from '../constants'; 

import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'; // For "Remove Checked"
import TextField from '@mui/material/TextField';

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
  const sortedCategories = Object.keys(groupedItems).sort((a, b) => {
    const indexA = standardCategoryOrder.indexOf(a as any);
    const indexB = standardCategoryOrder.indexOf(b as any);

    if (indexA !== -1 && indexB !== -1) return indexA - indexB; // Both are standard categories
    if (indexA !== -1) return -1; // A is standard, B is custom
    if (indexB !== -1) return 1;  // B is standard, A is custom
    return a.localeCompare(b);    // Both are custom categories
  });

  const hasCheckedItems = items.some(item => item.isCompleted);

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
      {sortedCategories.map(categoryName => (
        <CategorySection
          key={categoryName}
          categoryName={categoryName}
          items={groupedItems[categoryName]}
          onToggleComplete={onToggleComplete}
          onDeleteItem={onDeleteItem}
          onEditItem={onEditItem}
          onRemoveCategory={onRemoveCategory}
        />
      ))}
    </Box>
  );
};

export default ShoppingList;