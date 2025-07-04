import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Stack, MenuItem, Box, useTheme,
  Typography, IconButton
} from '@mui/material';
import { motion } from 'framer-motion';
import { Package, X, Upload, Trash2 } from 'lucide-react';
import NewCategoryModal from './NewCategoryModal';

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
    imageUrl?: string;
  }) => void;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ open, onClose, onAdd }) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    amount: 1,
    units: 'pcs',
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
    notes: '',
    imageUrl: '',
  });
  
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
    { value: '', label: 'Select a category...', emoji: '📋' },
    ...standardCategories,
    ...customCategories.map(cat => ({ value: cat, label: `� ${cat}`, emoji: '�' })),
    { value: 'Other', label: '📦 Add New Category...', emoji: '📦' },
  ];

  const units = [
    'pcs', 'kg', 'g', 'lb', 'oz', 'l', 'ml', 'cups', 'tbsp', 'tsp',
    'packs', 'bottles', 'cans', 'boxes', 'bags', 'loaves', 'bunches',
    'dozen', 'lbs', 'gallon', 'quart', 'pint'
  ];
  const priorities = ['Low', 'Medium', 'High'] as const;

  const handleCategoryChange = (value: string) => {
    if (value === 'Other') {
      setIsNewCategoryModalOpen(true);
    } else {
      setFormData({ ...formData, category: value });
    }
  };

  const handleNewCategoryAdd = (categoryName: string) => {
    saveCustomCategory(categoryName);
    setFormData({ ...formData, category: categoryName });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size too large. Please select an image smaller than 2MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, imageUrl: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() && formData.category && formData.category !== '') {
      // Ensure imageUrl is included in the data being sent
      const itemData = {
        ...formData,
        name: formData.name.trim(),
      };
      
      console.log('Adding item with data:', itemData); // Debug log
      onAdd(itemData);
      
      // Reset form
      setFormData({
        name: '',
        category: '',
        amount: 1,
        units: 'pcs',
        priority: 'Medium',
        notes: '',
        imageUrl: '',
      });
    }
  };

  const handleClose = () => {
    onClose();
    setFormData({
      name: '',
      category: '',
      amount: 1,
      units: 'pcs',
      priority: 'Medium',
      notes: '',
      imageUrl: '',
    });
  };

  // Reset form when modal opens
  React.useEffect(() => {
    if (open) {
      setFormData({
        name: '',
        category: '',
        amount: 1,
        units: 'pcs',
        priority: 'Medium',
        notes: '',
        imageUrl: '',
      });
    }
  }, [open]);

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

              {/* Image Upload Section */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                  Item Image (Optional)
                </Typography>
                {formData.imageUrl ? (
                  <Box sx={{ position: 'relative', mb: 2 }}>
                    <img
                      src={formData.imageUrl}
                      alt="Item preview"
                      style={{
                        width: '100%',
                        maxHeight: '200px',
                        objectFit: 'cover',
                        borderRadius: '12px',
                      }}
                    />
                    <IconButton
                      onClick={handleRemoveImage}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        color: 'white',
                        '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
                      }}
                    >
                      <Trash2 size={18} />
                    </IconButton>
                  </Box>
                ) : (
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    startIcon={<Upload size={20} />}
                    sx={{
                      borderRadius: '12px',
                      borderStyle: 'dashed',
                      height: '60px',
                      color: 'text.secondary',
                    }}
                  >
                    Upload Image
                    <input
                      ref={fileInputRef}
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </Button>
                )}
              </Box>

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
              disabled={!formData.name.trim() || !formData.category}
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
      
      <NewCategoryModal
        open={isNewCategoryModalOpen}
        onClose={() => setIsNewCategoryModalOpen(false)}
        onAdd={handleNewCategoryAdd}
      />
    </Dialog>
  );
};

export default AddItemModal;