// frontend/components/ShoppingListItem.tsx
import React, { useState } from 'react';
import { ShoppingItem } from '../types';

import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Grow } from '@mui/material';

interface ShoppingListItemProps {
  item: ShoppingItem;
  onToggleComplete: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onEditItem: (item: ShoppingItem) => void;
  timeout?: number;
}

const StyledListItem = styled(ListItem, {
  shouldForwardProp: (prop) => prop !== 'completed',
})<{ completed: boolean }>(({ theme, completed }) => ({
  transition: 'all 0.3s ease-in-out',
  backgroundColor: completed 
    ? (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : theme.palette.action.disabledBackground)
    : theme.palette.background.paper,
  opacity: completed ? 0.5 : 1,
  borderRadius: theme.spacing(1.5),
  marginBottom: theme.spacing(1.5),
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 2px 8px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.04)'
    : '0 2px 8px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.04)',
  border: `1px solid ${theme.palette.divider}`,
  backdropFilter: 'blur(8px)',
  '&:hover': {
    backgroundColor: completed 
      ? (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : theme.palette.action.disabledBackground)
      : theme.palette.action.hover,
    transform: 'translateY(-1px)',
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.06)'
      : '0 4px 12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.06)',
  },
  padding: theme.spacing(1, 2.5),
}));


const ShoppingListItem: React.FC<ShoppingListItemProps> = ({ 
  item, 
  onToggleComplete, 
  onDeleteItem, 
  onEditItem,
  timeout = 300 
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    onEditItem(item);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDeleteItem(item.id);
    handleMenuClose();
  };

  const imageUrl = item.imageUrl;
  const secondaryText = `${item.amount} ${item.units}` + (item.notes ? ` - ${item.notes}` : '');

  return (
    <>
      <Grow in={true} timeout={timeout}>
        <StyledListItem
          completed={item.completed}
          secondaryAction={
            <IconButton 
              edge="end" 
              aria-label="more options"
              aria-controls={open ? 'item-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              onClick={handleMenuClick}
              sx={{ padding: '8px' }}
            >
              <MoreVertIcon />
            </IconButton>
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
              color="primary"
            />
          </ListItemIcon>
          {imageUrl ? (
            <Avatar 
              src={imageUrl} 
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
            />
          ) : null}
          <ListItemText 
            primary={
                <Typography variant="body1" sx={{ textDecoration: item.completed ? 'line-through' : 'none', color: item.completed ? 'text.disabled' : 'text.primary' }}>
                    {item.name}
                </Typography>
            }
            secondary={secondaryText} 
          />
        </StyledListItem>
      </Grow>
      <Menu
        id="item-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        MenuListProps={{
          'aria-labelledby': 'more-options-button',
        }}
        PaperProps={{
          sx: {
            borderRadius: 2.5,
            backdropFilter: 'blur(20px)',
            boxShadow: (theme) => theme.palette.mode === 'dark'
              ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)'
              : '0 8px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05)',
            minWidth: 180,
          }
        }}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={handleDelete}
          sx={{ color: 'error.main' }}
        >
           <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default ShoppingListItem;