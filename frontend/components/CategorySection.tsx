import React, { useState } from 'react';
import { ShoppingItem, Category } from '../types';
import ShoppingListItem from './ShoppingListItem';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'; // Changed for "remove all in category"
import Box from '@mui/material/Box';

interface CategorySectionProps {
  categoryName: Category;
  items: ShoppingItem[];
  onToggleComplete: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onEditItem: (item: ShoppingItem) => void;
  onRemoveCategory: (categoryName: Category) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({ 
  categoryName, 
  items, 
  onToggleComplete, 
  onDeleteItem, 
  onEditItem,
  onRemoveCategory
}) => {
  const [isOpen, setIsOpen] = useState(true); // MUI Accordion uses `expanded` prop

  if (items.length === 0) return null;

  const handleAccordionChange = (event: React.SyntheticEvent, isExpanded: boolean) => {
    setIsOpen(isExpanded);
  };
  
  const categoryTitle = typeof categoryName === 'string' ? categoryName : 'Unknown Category';

  return (
    <Accordion expanded={isOpen} onChange={handleAccordionChange} sx={{ boxShadow: 2, '&:before': { display: 'none' } /* remove default top border */ }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`panel-${categoryName}-content`}
        id={`panel-${categoryName}-header`}
        sx={{ 
          backgroundColor: 'grey.100',
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          '& .MuiAccordionSummary-content': { // Target content area for spacing
             justifyContent: 'space-between',
             alignItems: 'center',
          }
        }}
      >
        <Typography variant="h6" component="h2" sx={{ fontWeight: 'medium' }}>{categoryTitle}</Typography>
        <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation(); // Prevent toggling accordion
              if(window.confirm(`Are you sure you want to remove all items in the "${categoryTitle}" category?`)) {
                onRemoveCategory(categoryName);
              }
            }}
            aria-label={`Remove all items in ${categoryTitle}`}
            sx={{color: 'error.main'}}
          >
            <DeleteSweepIcon />
          </IconButton>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0, '& .MuiListItem-root:last-child': { borderBottom: 'none' } /* Remove border from last item */ }}>
        <Box> {/* Changed from div to Box for potential sx props */}
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
      </AccordionDetails>
    </Accordion>
  );
};

export default CategorySection;