import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Stack, MenuItem, Box,
  FormControl, InputLabel, OutlinedInput,
  InputAdornment, IconButton, Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import ClearIcon from '@mui/icons-material/Clear';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

interface EditItemModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (item: {
    id: string;
    name: string;
    category: string;
    amount: number;
    units: string;
    priority: 'Low' | 'Medium' | 'High';
    notes: string;
    imageUrl?: string;
    completed: boolean;
  }) => void;
  item?: {
    id: string;
    name: string;
    category: string;
    amount: number;
    units: string;
    priority: 'Low' | 'Medium' | 'High';
    notes: string;
    imageUrl?: string;
    completed: boolean;
  } | null;
}

const EditItemModal: React.FC<EditItemModalProps> = ({ open, onClose, onSave, item }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Other',
    amount: 1,
    units: 'pcs',
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
    notes: '',
    imageUrl: '',
  });
  
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Load custom categories from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('userCustomCategories');
    if (saved) {
      setCustomCategories(JSON.parse(saved));
    }
  }, []);

  // Populate form when item changes
  useEffect(() => {
    if (item && open) {
      setFormData({
        name: item.name || '',
        category: item.category || '',
        amount: item.amount || 1,
        units: item.units || 'pcs',
        priority: item.priority || 'Medium',
        notes: item.notes || '',
        imageUrl: item.imageUrl || '',
      });
    } else if (open && !item) {
      // If modal opens without item, reset form
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
  }, [item, open]);

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

  const allCategories = [
    ...standardCategories,
    ...customCategories.map(cat => ({ value: cat, label: `� ${cat}`, emoji: '�' })),
  ];

  const units = [
    'pcs', 'kg', 'g', 'lb', 'oz', 'l', 'ml', 'cups', 'tbsp', 'tsp',
    'packs', 'bottles', 'cans', 'boxes', 'bags', 'loaves', 'bunches',
    'dozen', 'lbs', 'gallon', 'quart', 'pint'
  ];
  
  const priorities = ['Low', 'Medium', 'High'] as const;

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
    if (formData.name.trim() && item) {
      onSave({
        ...item,
        ...formData,
        name: formData.name.trim(),
      });
      onClose();
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!item) return null;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          background: (theme) => theme.palette.mode === 'dark'
            ? 'rgba(26, 26, 26, 0.7)'
            : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(32px)',
          border: (theme) => theme.palette.mode === 'dark' 
            ? '1px solid rgba(255, 255, 255, 0.15)'
            : '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: (theme) => theme.palette.mode === 'dark'
            ? '0 24px 48px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            : '0 24px 48px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
        }
      }}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(12px)',
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Edit Item
        <IconButton aria-label="close" onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Item Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              autoFocus
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
                      backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    }}
                  >
                    <ClearIcon />
                  </IconButton>
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  startIcon={<PhotoCamera />}
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
              <FormControl fullWidth>
                <InputLabel>Amount</InputLabel>
                <OutlinedInput
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Math.max(1, Number(e.target.value)) })}
                  label="Amount"
                  inputProps={{ min: 1 }}
                  startAdornment={
                    <InputAdornment position="start">
                      <IconButton
                        onClick={() => setFormData({ ...formData, amount: Math.max(1, formData.amount - 1) })}
                        disabled={formData.amount <= 1}
                      >
                        <KeyboardArrowDownIcon />
                      </IconButton>
                    </InputAdornment>
                  }
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setFormData({ ...formData, amount: formData.amount + 1 })}
                      >
                        <KeyboardArrowUpIcon />
                      </IconButton>
                    </InputAdornment>
                  }
                />
              </FormControl>

              <TextField
                select
                label="Units"
                value={formData.units}
                onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                sx={{ 
                  width: '140px'
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
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: '16px 24px' }}>
          <Button onClick={handleClose} color="inherit">Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!formData.name.trim()}
            color="primary"
          >
            Save Changes
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditItemModal;