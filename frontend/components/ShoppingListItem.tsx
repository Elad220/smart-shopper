import React from 'react';
import { ShoppingItem } from '../types';

import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

interface ShoppingListItemProps {
  item: ShoppingItem;
  onToggleComplete: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onEditItem: (item: ShoppingItem) => void;
}

const StyledListItem = styled(ListItem, {
  shouldForwardProp: (prop) => prop !== 'completed',
})<{ completed: boolean }>(({ theme, completed }) => ({
  transition: 'background-color 0.3s ease-in-out, opacity 0.3s ease-in-out',
  backgroundColor: completed ? theme.palette.action.hover : theme.palette.background.paper,
  opacity: completed ? 0.6 : 1,
  '&:hover': {
    backgroundColor: completed ? theme.palette.action.hover : theme.palette.action.selectedOpacity,
  },
  borderBottom: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(1, 2),
}));


const ShoppingListItem: React.FC<ShoppingListItemProps> = ({ 
  item, 
  onToggleComplete, 
  onDeleteItem, 
  onEditItem 
}) => {
  return (
    <StyledListItem
      completed={item.completed}
      secondaryAction={
        <Box>
          <IconButton 
            edge="end" 
            aria-label="edit" 
            onClick={(e) => {
              e.stopPropagation();
              onEditItem(item);
            }}
            sx={{
              padding: '4px',
              '&:hover': { color: 'primary.main' },
              marginRight: '4px'
            }}
          >
            <EditIcon />
          </IconButton>
          <IconButton 
            edge="end" 
            aria-label="delete" 
            onClick={(e) => {
              e.stopPropagation();
              onDeleteItem(item.id);
            }}
            sx={{ 
              padding: '4px',
              '&:hover': { color: 'error.main' }
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      }
      disablePadding
    >
      <ListItemIcon sx={{minWidth: 'auto', mr: 1.5}}>
        <Checkbox
          edge="start"
          checked={item.completed}
          onChange={() => onToggleComplete(item.id)}
          tabIndex={-1}
          disableRipple
          color="primary" // Uses the theme's primary color when checked
        />
      </ListItemIcon>
      {item.imageUrl ? (
        <Avatar 
          src={item.imageUrl} 
          alt={item.name} 
          variant="rounded"
          sx={{ 
            width: 48, 
            height: 48, 
            mr: 1.5, 
            bgcolor: 'grey.200',
            '& img': {
              objectFit: 'cover'
            }
          }}
          imgProps={{ 
            onError: (e: any) => { 
              e.target.onerror = null; 
              e.target.src = "https://via.placeholder.com/48?text=NoImg";
            },
            crossOrigin: "anonymous"
          }}
        />
      ) : (
        <Avatar 
          variant="rounded" 
          sx={{ 
            width: 48, 
            height: 48, 
            mr: 1.5, 
            bgcolor: 'grey.200', 
            fontSize: '0.7rem',
            color: 'text.secondary'
          }}
        >
          NoImg
        </Avatar>
      )}
      <ListItemText 
        primary={
            <Typography variant="body1" sx={{ textDecoration: item.completed ? 'line-through' : 'none', color: item.completed ? 'text.disabled' : 'text.primary' }}>
                {item.name}
            </Typography>
        }
        secondary={`${item.amount} ${item.units}`} 
      />
    </StyledListItem>
  );
};

export default ShoppingListItem;