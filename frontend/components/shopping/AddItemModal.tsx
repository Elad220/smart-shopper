import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Stack, MenuItem, Box, useTheme, Collapse
} from '@mui/material';
import { motion } from 'framer-motion';
import { Package, X } from 'lucide-react';

interface AddItemModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (item: {
    name: string;
    category: string;
    amount: number;
    units: string;
    priority: 'Low' | 'Medium' | 'High';
    notes: string;
  }) => void;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ open, onClose, onAdd }) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    category: 'Other',
    amount: 1,
    units: 'pcs',
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
    notes: '',
  });
  
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategories, setCustomCategories] = useState<string[]>([]);

  // Load custom categories from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('userCustomCategories');
    if (saved) {
      setCustomCategories(JSON.parse(saved));
    }
  }, []);

  // Save custom category to localStorage
  const saveCustomCategory = (categoryName: string) => {
    if (categoryName && !customCategories.includes(categoryName)) {
      const updated = [...customCategories, categoryName];
      setCustomCategories(updated);
      localStorage.setItem('userCustomCategories', JSON.stringify(updated));
    }
  };

  const standardCategories = [
    { value: 'Produce', label: '🥬 Produce', emoji: '🥬' },
    { value: 'Dairy', label: '🥛 Dairy', emoji: '🥛' },
    { value: 'Fridge', label: '❄️ Fridge', emoji: '❄️' },
    { value: 'Freezer', label: '🧊 Freezer', emoji: '🧊' },
    { value: 'Bakery', label: '🍞 Bakery', emoji: '🍞' },
    { value: 'Pantry', label: '🏺 Pantry', emoji: '🏺' },
    { value: 'Disposable', label: '🗑️ Disposable', emoji: '🗑️' },
    { value: 'Hygiene', label: '🧴 Hygiene', emoji: '🧴' },
    { value: 'Canned Goods', label: '🥫 Canned Goods', emoji: '🥫' },
    { value: 'Organics', label: '🌱 Organics', emoji: '🌱' },
    { value: 'Deli', label: '🥓 Deli', emoji: '🥓' },
  ];

  // Combine standard and custom categories
  const allCategories = [
    ...standardCategories,
    ...customCategories.map(cat => ({ value: cat, label: `📁 ${cat}`, emoji: '📁' })),
    { value: 'Other', label: '📦 Add New Category...', emoji: '📦' },
  ];

  const units = ['pcs', 'kg', 'g', 'lb', 'oz', 'l', 'ml', 'cups', 'tbsp', 'tsp'];
  const priorities = ['Low', 'Medium', 'High'] as const;

  const handleCategoryChange = (value: string) => {
    setFormData({ ...formData, category: value });
    setShowCustomCategory(value === 'Other');
    if (value !== 'Other') {
      setCustomCategory('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      let finalCategory = formData.category;
      
      // If "Other" is selected and user entered a custom category
      if (formData.category === 'Other' && customCategory.trim()) {
        finalCategory = customCategory.trim();
        saveCustomCategory(finalCategory);
      }
      
      onAdd({
        ...formData,
        category: finalCategory,
      });
      
      // Reset form
      setFormData({
        name: '',
        category: 'Other',
        amount: 1,
        units: 'pcs',
        priority: 'Medium',
        notes: '',
      });
      setCustomCategory('');
      setShowCustomCategory(false);
    }
  };

  const handleClose = () => {
    onClose();
    setFormData({
      name: '',
      category: 'Other',
      amount: 1,
      units: 'pcs',
      priority: 'Medium',
      notes: '',
    });
    setCustomCategory('');
    setShowCustomCategory(false);
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
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
              <Package size={20} color="white" />
            </Box>
            Add New Item
          </Stack>
        </DialogTitle>

        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Item Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                autoFocus
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />

              <Stack direction="row" spacing={2}>
                <TextField
                  label="Amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  inputProps={{ min: 1 }}
                  sx={{ 
                    width: '30%',
                    '& .MuiOutlinedInput-root': { borderRadius: '12px' }
                  }}
                />
                <TextField
                  select
                  label="Units"
                  value={formData.units}
                  onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                  sx={{ 
                    width: '70%',
                    '& .MuiOutlinedInput-root': { borderRadius: '12px' }
                  }}
                >
                  {units.map((unit) => (
                    <MenuItem key={unit} value={unit}>
                      {unit}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>

              <Stack direction="row" spacing={2}>
                <TextField
                  select
                  fullWidth
                  label="Category"
                  value={formData.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                >
                  {allCategories.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  fullWidth
                  label="Priority"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'Low' | 'Medium' | 'High' })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                >
                  {priorities.map((priority) => (
                    <MenuItem key={priority} value={priority}>
                      {priority}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>

              <Collapse in={showCustomCategory}>
                <TextField
                  fullWidth
                  label="New Category Name"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Enter new category name..."
                  sx={{ 
                    '& .MuiOutlinedInput-root': { borderRadius: '12px' },
                    mt: 1,
                  }}
                />
              </Collapse>

              <TextField
                fullWidth
                label="Notes (optional)"
                multiline
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Stack>
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
              disabled={!formData.name.trim()}
              startIcon={<Package size={16} />}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              }}
            >
              Add Item
            </Button>
          </DialogActions>
        </form>
      </motion.div>
    </Dialog>
  );
};

export default AddItemModal;