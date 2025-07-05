import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Stack, MenuItem, Box, useTheme,
  Typography, IconButton, CircularProgress, FormControl,
  InputLabel, OutlinedInput, InputAdornment
} from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, X, Upload, Trash2, Sparkles, ImageIcon } from 'lucide-react';
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
  }) => Promise<void>;
  isLoading?: boolean;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ open, onClose, onAdd, isLoading = false }) => {
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
    ...customCategories.map(cat => ({ value: cat, label: `🛒 ${cat}`, emoji: '🛒' })),
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

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() && formData.category && formData.category !== '') {
      // Ensure imageUrl is included in the data being sent
      const itemData = {
        ...formData,
        name: formData.name.trim(),
      };
      
      // Debug: Comprehensive image data check
      console.log('🖼️ Modal Debug - Full form data:', {
        hasImage: !!itemData.imageUrl,
        imageLength: itemData.imageUrl ? itemData.imageUrl.length : 0,
        imagePrefix: itemData.imageUrl ? itemData.imageUrl.substring(0, 50) : 'N/A',
        formData: { ...itemData, imageUrl: itemData.imageUrl ? '[IMAGE_DATA]' : undefined }
      });
      
      await onAdd(itemData);
      
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
        className: 'glass-modal',
        sx: {
          borderRadius: '24px',
          overflow: 'hidden',
          maxHeight: '90vh', // Limit modal height to 90% of viewport
          display: 'flex',
          flexDirection: 'column',
        }
      }}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(20px)',
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
                      <Package size={24} color="white" />
                    </motion.div>
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, background: `linear-gradient(135deg, ${theme.palette.text.primary}, ${theme.palette.primary.main})`, backgroundClip: 'text', WebkitBackgroundClip: 'text' }}>
                      Add New Item
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.8 }}>
                      <Sparkles size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                      Create your perfect shopping item
                    </Typography>
                  </Box>
                </Stack>
              </motion.div>
            </DialogTitle>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <DialogContent sx={{ 
                px: 3,
                flex: 1,
                overflowY: 'auto',
                maxHeight: 'calc(90vh - 200px)', // Reserve space for header and footer
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                  },
                },
              }}>
                {isLoading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Box className="glass-card" sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center', 
                      justifyContent: 'center',
                      minHeight: '300px',
                      py: 4,
                      borderRadius: '20px',
                    }}>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <CircularProgress size={60} sx={{ mb: 3, color: theme.palette.primary.main }} />
                      </motion.div>
                      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                        Adding item...
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', opacity: 0.8 }}>
                        Please wait while we add your item to the list
                      </Typography>
                    </Box>
                  </motion.div>
                ) : (
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
                          <ImageIcon size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                          Item Image (Optional)
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
                                  <Trash2 size={18} />
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
                              startIcon={<Upload size={20} />}
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
                              inputProps={{ min: 1, style: { textAlign: 'center' } }}
                              sx={{ 
                                borderRadius: '16px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                backdropFilter: 'blur(10px)',
                                '&:hover': {
                                  background: 'rgba(255, 255, 255, 0.08)',
                                },
                                '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                                  display: 'none',
                                },
                                '& input[type=number]': {
                                  '-moz-appearance': 'textfield',
                                },
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
                            onChange={(e) => handleCategoryChange(e.target.value)}
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
                )}
              </DialogContent>

              <DialogActions sx={{ p: 3, pt: 2 }}>
                <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ flex: 1 }}>
                    <Button
                      onClick={handleClose}
                      disabled={isLoading}
                      startIcon={<X size={16} />}
                      sx={{
                        width: '100%',
                        borderRadius: '16px',
                        textTransform: 'none',
                        height: '48px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${theme.palette.divider}`,
                        color: theme.palette.text.primary,
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.1)',
                          transform: 'translateY(-1px)',
                        }
                      }}
                    >
                      Cancel
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ flex: 1 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isLoading || !formData.name.trim() || !formData.category}
                      startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <Package size={16} />}
                      sx={{
                        width: '100%',
                        borderRadius: '16px',
                        textTransform: 'none',
                        height: '48px',
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        boxShadow: `0 8px 24px ${theme.palette.primary.main}40`,
                        '&:hover': {
                          background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                          boxShadow: `0 12px 32px ${theme.palette.primary.main}50`,
                          transform: 'translateY(-2px)',
                        },
                        '&:disabled': {
                          background: theme.palette.action.disabledBackground,
                          color: theme.palette.action.disabled,
                        }
                      }}
                    >
                      {isLoading ? 'Adding...' : 'Add Item'}
                    </Button>
                  </motion.div>
                </Stack>
              </DialogActions>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      
      <NewCategoryModal
        open={isNewCategoryModalOpen}
        onClose={() => setIsNewCategoryModalOpen(false)}
        onAdd={handleNewCategoryAdd}
      />
    </Dialog>
  );
};

export default AddItemModal;