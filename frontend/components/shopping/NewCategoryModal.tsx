import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, useTheme, Stack
} from '@mui/material';
import { motion } from 'framer-motion';
import { FolderPlus, X } from 'lucide-react';

interface NewCategoryModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (categoryName: string) => void;
}

const NewCategoryModal: React.FC<NewCategoryModalProps> = ({ open, onClose, onAdd }) => {
  const theme = useTheme();
  const [categoryName, setCategoryName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (categoryName.trim()) {
      onAdd(categoryName.trim());
      setCategoryName('');
      onClose();
    }
  };

  const handleClose = () => {
    setCategoryName('');
    onClose();
  };

  // Reset form when modal opens
  React.useEffect(() => {
    if (open) {
      setCategoryName('');
    }
  }, [open]);

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          background: theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.05)'
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '8px',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FolderPlus size={20} color="white" />
            </Box>
            Add New Category
          </Stack>
        </DialogTitle>

        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pb: 2 }}>
            <TextField
              fullWidth
              label="Category Name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              required
              autoFocus
              placeholder="e.g., Beverages, Snacks, etc."
              sx={{ 
                '& .MuiOutlinedInput-root': { borderRadius: '12px' },
                mt: 1,
              }}
            />
          </DialogContent>

          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={handleClose}
              startIcon={<X size={16} />}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={!categoryName.trim()}
              startIcon={<FolderPlus size={16} />}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              }}
            >
              Add Category
            </Button>
          </DialogActions>
        </form>
      </motion.div>
    </Dialog>
  );
};

export default NewCategoryModal;