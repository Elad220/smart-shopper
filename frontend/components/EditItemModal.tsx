import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Stack, MenuItem, Box, useTheme,
  FormControl, InputLabel, OutlinedInput,
  InputAdornment, IconButton, Typography, useMediaQuery
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
      scroll="paper"
      disableScrollLock={false}
      disableEscapeKeyDown={false}
      keepMounted={false}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? '0px' : '20px',
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
          maxHeight: isMobile ? '90vh' : '85vh',
          margin: isMobile ? '16px' : '32px',
          width: isMobile ? 'calc(100% - 32px)' : 'auto',
          position: 'relative',
        }
      }}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(12px)',
        }
      }}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
          >
            <DialogTitle sx={{ pb: 1 }}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '16px',
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 8px 24px ${theme.palette.primary.main}40`,
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(45deg, rgba(255,255,255,0.2), transparent)',
                        borderRadius: '16px',
                      }
                    }}
                  >
                    <motion.div
                      animate={{ rotate: [0, 10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      ✏️
                    </motion.div>
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, background: `linear-gradient(135deg, ${theme.palette.text.primary}, ${theme.palette.primary.main})`, backgroundClip: 'text', WebkitBackgroundClip: 'text' }}>
                      Edit Item
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.8 }}>
                      ✨ Update your shopping item details
                    </Typography>
                  </Box>
                </Stack>
              </motion.div>
            </DialogTitle>

            <form onSubmit={handleSubmit}>
              <DialogContent 
                dividers
                sx={{ 
                  px: 3,
                  maxHeight: isMobile ? '60vh' : '50vh', // Force a height constraint
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  paddingBottom: '16px',
                  WebkitOverflowScrolling: 'touch', // Enable momentum scrolling on iOS
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'rgba(0, 0, 0, 0.1)',
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    background: 'rgba(0, 0, 0, 0.5)',
                  },
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Stack spacing={4} sx={{ mt: 1 }}>
                    <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                      <TextField
                        fullWidth
                        label="Item Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        autoFocus
                        sx={{ 
                          '& .MuiOutlinedInput-root': { 
                            borderRadius: '16px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              background: 'rgba(255, 255, 255, 0.08)',
                              transform: 'translateY(-1px)',
                            },
                            '&.Mui-focused': {
                              background: 'rgba(255, 255, 255, 0.1)',
                              boxShadow: `0 0 20px ${theme.palette.primary.main}30`,
                            }
                          },
                          '& .MuiInputLabel-root': {
                            fontWeight: 500,
                          }
                        }}
                      />
                    </motion.div>

                    {/* Enhanced Image Upload Section */}
                    <Box>
                      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                        📷 Item Image (Optional)
                      </Typography>
                      {formData.imageUrl ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Box className="glass-card" sx={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', p: 1 }}>
                            <img
                              src={formData.imageUrl}
                              alt="Item preview"
                              style={{
                                width: '100%',
                                maxHeight: '200px',
                                objectFit: 'cover',
                                borderRadius: '16px',
                              }}
                            />
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              style={{
                                position: 'absolute',
                                top: 12,
                                right: 12,
                              }}
                            >
                              <IconButton
                                onClick={handleRemoveImage}
                                sx={{
                                  background: 'rgba(0, 0, 0, 0.7)',
                                  color: 'white',
                                  backdropFilter: 'blur(10px)',
                                  '&:hover': { 
                                    background: 'rgba(255, 0, 0, 0.7)',
                                    transform: 'scale(1.1)',
                                  },
                                }}
                              >
                                🗑️
                              </IconButton>
                            </motion.div>
                          </Box>
                        </motion.div>
                      ) : (
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            variant="outlined"
                            component="label"
                            fullWidth
                            startIcon={<span>📤</span>}
                            sx={{
                              borderRadius: '20px',
                              borderStyle: 'dashed',
                              borderWidth: '2px',
                              height: '80px',
                              color: theme.palette.primary.main,
                              borderColor: theme.palette.primary.main,
                              background: 'rgba(255, 255, 255, 0.03)',
                              backdropFilter: 'blur(10px)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                background: `${theme.palette.primary.main}10`,
                                borderColor: theme.palette.primary.dark,
                                transform: 'translateY(-2px)',
                                boxShadow: `0 8px 25px ${theme.palette.primary.main}20`,
                              },
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
                        </motion.div>
                      )}
                    </Box>

                    <Stack direction="row" spacing={2}>
                      <motion.div whileHover={{ scale: 1.02 }} style={{ width: '40%' }}>
                        <FormControl fullWidth>
                          <InputLabel>Amount</InputLabel>
                          <OutlinedInput
                            type="number"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: Math.max(1, Number(e.target.value)) })}
                            label="Amount"
                            inputProps={{ min: 1 }}
                            sx={{ 
                              borderRadius: '16px',
                              background: 'rgba(255, 255, 255, 0.05)',
                              backdropFilter: 'blur(10px)',
                              '&:hover': {
                                background: 'rgba(255, 255, 255, 0.08)',
                              }
                            }}
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
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} style={{ width: '60%' }}>
                        <TextField
                          select
                          label="Units"
                          value={formData.units}
                          onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                          sx={{ 
                            width: '100%',
                            '& .MuiOutlinedInput-root': { 
                              borderRadius: '16px',
                              background: 'rgba(255, 255, 255, 0.05)',
                              backdropFilter: 'blur(10px)',
                              '&:hover': {
                                background: 'rgba(255, 255, 255, 0.08)',
                              }
                            }
                          }}
                        >
                          {units.map((unit) => (
                            <MenuItem key={unit} value={unit}>
                              {unit}
                            </MenuItem>
                          ))}
                        </TextField>
                      </motion.div>
                    </Stack>

                    <Stack direction="row" spacing={2}>
                      <motion.div whileHover={{ scale: 1.02 }} style={{ flex: 1 }}>
                        <TextField
                          select
                          fullWidth
                          label="Category"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          sx={{ 
                            '& .MuiOutlinedInput-root': { 
                              borderRadius: '16px',
                              background: 'rgba(255, 255, 255, 0.05)',
                              backdropFilter: 'blur(10px)',
                              '&:hover': {
                                background: 'rgba(255, 255, 255, 0.08)',
                              }
                            }
                          }}
                        >
                          {allCategories.map((category) => (
                            <MenuItem key={category.value} value={category.value}>
                              {category.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </motion.div>

                      <motion.div whileHover={{ scale: 1.02 }} style={{ flex: 1 }}>
                        <TextField
                          select
                          fullWidth
                          label="Priority"
                          value={formData.priority}
                          onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'Low' | 'Medium' | 'High' })}
                          sx={{ 
                            '& .MuiOutlinedInput-root': { 
                              borderRadius: '16px',
                              background: 'rgba(255, 255, 255, 0.05)',
                              backdropFilter: 'blur(10px)',
                              '&:hover': {
                                background: 'rgba(255, 255, 255, 0.08)',
                              }
                            }
                          }}
                        >
                          {priorities.map((priority) => (
                            <MenuItem key={priority} value={priority}>
                              {priority}
                            </MenuItem>
                          ))}
                        </TextField>
                      </motion.div>
                    </Stack>

                    <motion.div whileHover={{ scale: 1.02 }}>
                      <TextField
                        fullWidth
                        label="Notes (optional)"
                        multiline
                        rows={3}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        sx={{ 
                          '& .MuiOutlinedInput-root': { 
                            borderRadius: '16px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(10px)',
                            '&:hover': {
                              background: 'rgba(255, 255, 255, 0.08)',
                            }
                          }
                        }}
                      />
                    </motion.div>
                  </Stack>
                </motion.div>
              </DialogContent>

              <DialogActions 
                sx={{ 
                  p: '16px 24px',
                  '& .MuiButton-root': {
                    minHeight: '44px', // Ensure buttons are touch-friendly on mobile
                    width: isMobile ? '100%' : 'auto',
                  }
                }}
              >
                <Button onClick={handleClose} color="inherit">Cancel</Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  disabled={!formData.name.trim()}
                >
                  Save Changes
                </Button>
              </DialogActions>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  );
};

export default EditItemModal;