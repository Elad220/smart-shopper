import React, { useState, useEffect } from 'react';
import { ShoppingItem, Category, StandardCategory } from '../types';
import ShoppingListItem from './ShoppingListItem';

import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';

interface CategorySectionProps {
  categoryName: Category;
  items: ShoppingItem[];
  onToggleComplete: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onEditItem: (item: ShoppingItem) => void;
  onRemoveCategory: (categoryName: Category) => void;
  defaultCollapsed?: boolean;
}

const CATEGORY_EMOJIS: Record<string, string> = {
    [StandardCategory.PRODUCE]: '🍎',
    [StandardCategory.DAIRY]: '🧀',
    [StandardCategory.FRIDGE]: '🧊',
    [StandardCategory.FREEZER]: '❄️',
    [StandardCategory.BAKERY]: '🍞',
    [StandardCategory.PANTRY]: '📦',
    [StandardCategory.DISPOSABLE]: '🧻',
    [StandardCategory.HYGIENE]: '🧼',
    [StandardCategory.CANNED_GOODS]: '🥫',
    [StandardCategory.ORGANICS]: '🌿',
    [StandardCategory.DELI]: '🥪',
    [StandardCategory.OTHER]: '🏷️',
};

const getCategoryEmoji = (categoryName: string) => {
    return CATEGORY_EMOJIS[categoryName] || '🛒'; // Default emoji
};

const CategorySection: React.FC<CategorySectionProps> = ({ 
  categoryName, 
  items, 
  onToggleComplete, 
  onDeleteItem, 
  onEditItem,
  onRemoveCategory,
  defaultCollapsed = false
}) => {
  const [isOpen, setIsOpen] = useState(!defaultCollapsed);
  
  useEffect(() => {
    setIsOpen(!defaultCollapsed);
  }, [defaultCollapsed]);

  if (items.length === 0) return null;

  const completedItems = items.filter(item => item.completed).length;
  const totalItems = items.length;
  const categoryTitle = typeof categoryName === 'string' ? categoryName : 'Unknown Category';
  const categoryEmoji = getCategoryEmoji(categoryName);

  return (
    <Box
      sx={{
        backgroundColor: 'background.paper',
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        p: 2,
        mb: 2,
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Box
        sx={{ display: 'flex', alignItems: 'center', mb: 1, cursor: 'pointer', userSelect: 'none' }}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <Typography variant="h5" component="span" sx={{ mr: 1.5 }}>{categoryEmoji}</Typography>
        <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {categoryTitle}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {completedItems} of {totalItems} completed
            </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={e => {
            e.stopPropagation();
            setIsOpen((prev) => !prev);
          }}
          aria-label={isOpen ? 'Collapse' : 'Expand'}
        >
          <ExpandMoreIcon sx={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
        </IconButton>
      </Box>
      {isOpen && (
        <Box sx={{ pt: 1 }}>
          {items.map(item => (
            <ShoppingListItem
              key={item.id}
              item={item}
              onToggleComplete={onToggleComplete}
              onDeleteItem={onDeleteItem}
              onEditItem={onEditItem}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default CategorySection;