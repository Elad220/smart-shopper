import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box, Card, CardContent, Typography, Checkbox, IconButton,
  Stack, Chip, useTheme, alpha
} from '@mui/material';
import { Trash2, ShoppingBag, AlertTriangle, Clock, Circle } from 'lucide-react';
import { ShoppingItem } from '../../types';

interface ShoppingListViewProps {
  items: ShoppingItem[];
  onToggleComplete: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: () => void;
}

const ShoppingListView: React.FC<ShoppingListViewProps> = ({
  items,
  onToggleComplete,
  onDeleteItem,
  onAddItem,
}) => {
  const theme = useTheme();

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'High':
        return <AlertTriangle size={16} color={theme.palette.error.main} />;
      case 'Medium':
        return <Clock size={16} color={theme.palette.warning.main} />;
      case 'Low':
        return <Circle size={16} color={theme.palette.info.main} />;
      default:
        return <Circle size={16} color={theme.palette.info.main} />;
    }
  };

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            px: 4,
            borderRadius: '16px',
            background: `linear-gradient(135deg, ${theme.palette.primary.main}10, ${theme.palette.secondary.main}10)`,
            border: `1px dashed ${theme.palette.divider}`,
          }}
        >
          <ShoppingBag size={64} color={theme.palette.text.secondary} style={{ marginBottom: '16px' }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            Your shopping list is empty
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Add your first item to get started with smart shopping!
          </Typography>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAddItem}
            style={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              padding: '12px 24px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '1rem',
            }}
          >
            Add First Item
          </motion.button>
        </Box>
      </motion.div>
    );
  }

  return (
    <Box>
      <AnimatePresence>
        <Stack spacing={2}>
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              layout
            >
              <Card
                sx={{
                  borderRadius: '12px',
                  border: `1px solid ${theme.palette.divider}`,
                  transition: 'all 0.3s ease',
                  background: item.completed
                    ? alpha(theme.palette.success.main, 0.05)
                    : theme.palette.background.paper,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[4],
                  },
                }}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Checkbox
                      checked={item.completed}
                      onChange={() => onToggleComplete(item.id)}
                      sx={{
                        color: theme.palette.primary.main,
                        '&.Mui-checked': {
                          color: theme.palette.success.main,
                        },
                      }}
                    />
                    
                    <Box sx={{ flexGrow: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 500,
                            textDecoration: item.completed ? 'line-through' : 'none',
                            opacity: item.completed ? 0.7 : 1,
                          }}
                        >
                          {item.name}
                        </Typography>
                        {getPriorityIcon(item.priority)}
                      </Stack>
                      
                      <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                        <Chip
                          label={`${item.amount} ${item.units}`}
                          size="small"
                          variant="outlined"
                          sx={{ borderRadius: '8px', fontSize: '0.75rem' }}
                        />
                        {item.category && (
                          <Chip
                            label={item.category}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ borderRadius: '8px', fontSize: '0.75rem' }}
                          />
                        )}
                        {item.notes && (
                          <Chip
                            label={item.notes}
                            size="small"
                            color="default"
                            sx={{ borderRadius: '8px', fontSize: '0.75rem' }}
                          />
                        )}
                      </Stack>
                    </Box>
                    
                    <IconButton
                      size="small"
                      onClick={() => onDeleteItem(item.id)}
                      sx={{ 
                        color: theme.palette.error.main,
                        '&:hover': {
                          background: alpha(theme.palette.error.main, 0.1),
                        },
                      }}
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </Stack>
      </AnimatePresence>
    </Box>
  );
};

export default ShoppingListView;