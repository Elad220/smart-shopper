import React, { useState, useEffect } from 'react';
import { ShoppingItem, Category, StandardCategory } from '../types';
import ShoppingListItem from './ShoppingListItem';

import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import Box from '@mui/material/Box';
import CategoryIcon from '@mui/icons-material/LabelImportant';
import { useTheme } from '@mui/material/styles';

interface CategorySectionProps {
  categoryName: Category;
  items: ShoppingItem[];
  onToggleComplete: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onEditItem: (item: ShoppingItem) => void;
  onRemoveCategory: (categoryName: Category) => void;
  defaultCollapsed?: boolean;
}

const CATEGORY_COLORS_LIGHT: Record<string, string> = {
  [StandardCategory.PRODUCE]: 'linear-gradient(90deg, #e8f5e9 0%, #a5d6a7 100%)',
  [StandardCategory.DAIRY]: 'linear-gradient(90deg, #e3f2fd 0%, #bbdefb 100%)',
  [StandardCategory.FRIDGE]: 'linear-gradient(90deg, #e1f5fe 0%, #b3e5fc 100%)',
  [StandardCategory.FREEZER]: 'linear-gradient(90deg, #e3f2fd 0%, #bbdefb 100%)',
  [StandardCategory.BAKERY]: 'linear-gradient(90deg, #fff3e0 0%, #ffe0b2 100%)',
  [StandardCategory.PANTRY]: 'linear-gradient(90deg, #f3e5f5 0%, #ce93d8 100%)',
  [StandardCategory.DISPOSABLE]: 'linear-gradient(90deg, #f9fbe7 0%, #fffde7 100%)',
  [StandardCategory.HYGIENE]: 'linear-gradient(90deg, #fce4ec 0%, #f8bbd0 100%)',
  [StandardCategory.CANNED_GOODS]: 'linear-gradient(90deg, #d7ccc8 0%, #bcaaa4 100%)',
  [StandardCategory.ORGANICS]: 'linear-gradient(90deg, #c5e1a5 0%, #8bc34a 100%)',
  [StandardCategory.DELI]: 'linear-gradient(90deg, #ffe082 0%,rgba(255, 217, 0, 0.3) 100%)',
  [StandardCategory.OTHER]: 'linear-gradient(90deg, #eceff1 0%, #cfd8dc 100%)',
};

const CATEGORY_COLORS_DARK: Record<string, string> = {
    [StandardCategory.PRODUCE]: 'linear-gradient(90deg, #1b2e1c 0%, #2e5c30 100%)',
    [StandardCategory.DAIRY]: 'linear-gradient(90deg, #1a2a38 0%, #2a4a68 100%)',
    [StandardCategory.FRIDGE]: 'linear-gradient(90deg, #192a38 0%, #294a68 100%)',
    [StandardCategory.FREEZER]: 'linear-gradient(90deg, #1a2a38 0%, #2a4a68 100%)',
    [StandardCategory.BAKERY]: 'linear-gradient(90deg, #3a2d1a 0%, #685a2a 100%)',
    [StandardCategory.PANTRY]: 'linear-gradient(90deg, #2e1a2e 0%, #5c2e5c 100%)',
    [StandardCategory.DISPOSABLE]: 'linear-gradient(90deg, #33331a 0%, #66662a 100%)',
    [StandardCategory.HYGIENE]: 'linear-gradient(90deg, #381a2e 0%, #682a4a 100%)',
    [StandardCategory.CANNED_GOODS]: 'linear-gradient(90deg, #2e2a2a 0%, #5c4a4a 100%)',
    [StandardCategory.ORGANICS]: 'linear-gradient(90deg, #2a381a 0%, #4a682a 100%)',
    [StandardCategory.DELI]: 'linear-gradient(90deg, #382d1a 0%, #685a2a 100%)',
    [StandardCategory.OTHER]: 'linear-gradient(90deg, #1a1a1a 0%, #383838 100%)',
};

function getCategoryColor(category: string, mode: 'light' | 'dark') {
  const colors = mode === 'light' ? CATEGORY_COLORS_LIGHT : CATEGORY_COLORS_DARK;
  return colors[category] || 'linear-gradient(90deg, #f5f5f5 0%, #e0e0e0 100%)';
}

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
  const theme = useTheme();
  
  // Update isOpen when defaultCollapsed changes
  useEffect(() => {
    setIsOpen(!defaultCollapsed);
  }, [defaultCollapsed]);
  if (items.length === 0) return null;
  const categoryTitle = typeof categoryName === 'string' ? categoryName : 'Unknown Category';
  return (
    <Box
      sx={{
        background: getCategoryColor(categoryName, theme.palette.mode),
        borderRadius: 3,
        boxShadow: '0 4px 24px 0 rgba(0,0,0,0.07)',
        p: 2,
        mb: 2,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'box-shadow 0.2s, transform 0.2s',
        '&:hover': {
          boxShadow: '0 8px 32px 0 rgba(0,0,0,0.12)',
          transform: 'translateY(-2px) scale(1.01)',
        },
      }}
    >
      <Box
        sx={{ display: 'flex', alignItems: 'center', mb: 1, cursor: 'pointer', userSelect: 'none' }}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <CategoryIcon sx={{ color: 'primary.main', mr: 1, fontSize: 28, opacity: 0.7 }} />
        <Typography variant="h6" sx={{ fontWeight: 700, flexGrow: 1, letterSpacing: 1 }}>
          {categoryTitle}
        </Typography>
        <IconButton
          size="small"
          onClick={e => {
            e.stopPropagation();
            if(window.confirm(`Are you sure you want to remove all items in the \"${categoryTitle}\" category?`)) {
              onRemoveCategory(categoryName);
            }
          }}
          aria-label={`Remove all items in ${categoryTitle}`}
          sx={{ color: 'error.main', ml: 1 }}
        >
          <DeleteSweepIcon />
        </IconButton>
        <IconButton
          size="small"
          onClick={e => {
            e.stopPropagation();
            setIsOpen((prev) => !prev);
          }}
          aria-label={isOpen ? 'Collapse' : 'Expand'}
          sx={{ ml: 1 }}
        >
          <ExpandMoreIcon sx={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
        </IconButton>
      </Box>
      {isOpen && (
        <Box>
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