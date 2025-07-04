// frontend/components/CategorySection.tsx
import React, { useState, useEffect } from 'react';
import { ShoppingItem, Category, StandardCategory } from '../types';
import ShoppingListItem from './ShoppingListItem';

import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import Checkbox from '@mui/material/Checkbox';
import { Collapse } from '@mui/material';

interface CategorySectionProps {
  categoryName: Category;
  items: ShoppingItem[];
  onToggleComplete: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onEditItem: (item: ShoppingItem) => void;
  onRemoveCategory: (categoryName: Category) => void;
  onToggleCategoryComplete: (categoryName: Category, completed: boolean) => void; // New prop
  defaultCollapsed?: boolean;
  dragHandleProps?: any;
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
  onToggleCategoryComplete,
  defaultCollapsed = false,
  dragHandleProps,
}) => {
  const [isOpen, setIsOpen] = useState(!defaultCollapsed);

  useEffect(() => {
    setIsOpen(!defaultCollapsed);
  }, [defaultCollapsed]);

  if (items.length === 0) return null;

  const completedItems = items.filter((item) => item.completed).length;
  const totalItems = items.length;
  const categoryTitle = typeof categoryName === 'string' ? categoryName : 'Unknown Category';
  const categoryEmoji = getCategoryEmoji(categoryName);

  const isAllChecked = totalItems > 0 && completedItems === totalItems;
  const isIndeterminate = completedItems > 0 && completedItems < totalItems;

  const handleToggleAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    onToggleCategoryComplete(categoryName, event.target.checked);
  };


  return (
    <Box
      sx={{
        backgroundColor: 'background.paper',
        borderRadius: 3,
        boxShadow: (theme) => theme.palette.mode === 'dark'
          ? '0 4px 16px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)'
          : '0 4px 16px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)',
        p: 2.5,
        mb: 2.5,
        border: '1px solid',
        borderColor: 'divider',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: (theme) => theme.palette.mode === 'dark'
            ? '0 6px 20px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.08)'
            : '0 6px 20px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.06)',
        }
      }}
    >
      <Box
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 1.5, 
          cursor: 'pointer', 
          userSelect: 'none',
          p: 1,
          borderRadius: 2,
          transition: 'background-color 0.2s ease-in-out',
          '&:hover': {
            bgcolor: 'action.hover',
          }
        }}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span {...dragHandleProps} style={{ cursor: 'grab', display: 'flex', alignItems: 'center', paddingRight: '12px' }}>
          <DragIndicatorIcon color={'disabled'} />
        </span>
        <Typography variant="h4" component="span" sx={{ mr: 2 }}>
          {categoryEmoji}
        </Typography>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
            {categoryTitle}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
            {completedItems} of {totalItems} completed
          </Typography>
        </Box>
        <Typography 
          variant="body2" 
          sx={{ 
            mr: 2, 
            color: 'text.secondary', 
            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'action.hover',
            px: 2, 
            py: 0.75, 
            borderRadius: '16px',
            fontWeight: 500,
            fontSize: '0.8rem'
          }}
        >
          {totalItems}
        </Typography>
        {/* The new Checkbox */}
        <Checkbox
          size="small"
          checked={isAllChecked}
          indeterminate={isIndeterminate}
          onChange={handleToggleAll}
          onClick={(e) => e.stopPropagation()} // Prevents the click from toggling the collapse state
          inputProps={{ 'aria-label': 'toggle all items in category' }}
        />
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen((prev) => !prev);
          }}
          aria-label={isOpen ? 'Collapse' : 'Expand'}
        >
          <ExpandMoreIcon sx={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
        </IconButton>
      </Box>
      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        <Box sx={{ pt: 1 }}>
          {items.map((item, index) => (
            <ShoppingListItem
              key={item.id}
              item={item}
              onToggleComplete={onToggleComplete}
              onDeleteItem={onDeleteItem}
              onEditItem={onEditItem}
              timeout={150 * (index + 1)}
            />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};

export default CategorySection;