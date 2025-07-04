import React, { useState, useCallback, useEffect } from 'react';
import { ShoppingItem, StandardCategory, Category } from '../types';
import { UNIT_OPTIONS } from '../constants';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  SelectChangeEvent,
  FormHelperText,
  OutlinedInput,
  InputAdornment,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

interface AddItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: Omit<ShoppingItem, 'id' | 'completed'>) => void;
  categories: Category[];
  onDeleteCategory: (categoryName: string) => void;
}

const AddItemForm: React.FC<AddItemFormProps> = ({ isOpen, onClose, onAddItem, categories, onDeleteCategory }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | ''>('');
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [units, setUnits] = useState(UNIT_OPTIONS[0]);
  const [amount, setAmount] = useState<number>(1);
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const standardCategories = Object.values(StandardCategory);

  const sortedCategories = [...categories].sort((a, b) => {
    const aIsStandard = standardCategories.includes(a as StandardCategory);
    const bIsStandard = standardCategories.includes(b as StandardCategory);

    if (a === StandardCategory.OTHER) return 1;
    if (b === StandardCategory.OTHER) return -1;

    if (aIsStandard && !bIsStandard) return -1;
    if (!aIsStandard && bIsStandard) return 1;

    return a.localeCompare(b);
  });

  useEffect(() => {
    if (isOpen) {
      setName('');
      setNameError('');
      setSelectedCategory(''); // Default to the placeholder
      setCustomCategoryName('');
      setCategoryError('');
      setUnits(UNIT_OPTIONS[0]);
      setAmount(1);
      setPriority('Medium');
      setNotes('');
      setImageUrl(undefined);
      setShowCustomCategoryInput(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset file input
      }
    }
  }, [isOpen]);

  const handleCategoryChange = (event: SelectChangeEvent<Category | ''>) => {
    const value = event.target.value as Category;
    setSelectedCategory(value);
    setShowCustomCategoryInput(value === StandardCategory.OTHER);
    if (value !== StandardCategory.OTHER) {
      setCustomCategoryName('');
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.onerror = () => {
        console.error("Error reading file.");
        setImageUrl(undefined);
        alert("Could not read image file. Please try another image.");
      };
      if (file.size > 2 * 1024 * 1024) {
        alert("File is too large. Please select an image smaller than 2MB.");
        event.target.value = "";
        return;
      }
      reader.readAsDataURL(file);
    } else {
      setImageUrl(undefined);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNameError('');
    setCategoryError('');

    let isValid = true;
    if (!name.trim()) {
      setNameError("Item name cannot be empty.");
      isValid = false;
    }
    if (!selectedCategory) {
      setCategoryError("Please select a category.");
      isValid = false;
    }
    if (selectedCategory === StandardCategory.OTHER && !customCategoryName.trim()) {
      setCategoryError("Please specify a name for the 'Other' category.");
      isValid = false;
    }

    if (!isValid) return;

    const finalCategory = selectedCategory === StandardCategory.OTHER ? customCategoryName.trim() : selectedCategory;

    onAddItem({
      name: name.trim(),
      category: finalCategory,
      units: units,
      amount,
      priority,
      notes,
      imageUrl: imageUrl,
    });
    onClose();
  };

  const handleAmountChange = useCallback((newAmount: number) => {
    setAmount(Math.max(1, newAmount));
  }, []);

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      fullScreen={false}
      scroll="body"
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
          // Mobile responsiveness: Set max height and ensure dialog fits on screen
          maxHeight: isMobile ? '100vh' : '90vh',
          margin: isMobile ? '0px' : '32px',
          width: isMobile ? '100%' : 'auto',
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
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Add New Item
        <IconButton aria-label="close" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent 
        dividers
        sx={{
          // Mobile responsiveness: Make content scrollable
          paddingBottom: '16px',
          WebkitOverflowScrolling: 'touch', // Enable momentum scrolling on iOS
          // With scroll="body", the entire content should be scrollable
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
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="itemName"
            label="Item Name"
            name="itemName"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Milk, Bread, Apples"
            error={!!nameError}
            helperText={nameError}
          />
          <Box sx={{ my: 2 }}>
            <InputLabel shrink sx={{ mb: 0.5, fontSize: '0.9rem' }}>Item Image (Optional)</InputLabel>
            <Button
              variant="outlined"
              component="label"
              startIcon={<PhotoCamera />}
              fullWidth
            >
              Click to upload image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageChange}
                ref={fileInputRef}
              />
            </Button>
            <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
              Max 2MB, JPG/PNG
            </Typography>
          </Box>
          {imageUrl && (
            <Box mt={1} textAlign="center" sx={{ position: 'relative', border: '1px solid #ddd', padding: '8px', borderRadius: '4px' }}>
              <img
                src={imageUrl}
                alt="Preview"
                style={{ display: 'block', maxHeight: '150px', maxWidth: '100%', borderRadius: '4px', objectFit: 'contain', margin: '0 auto' }}
              />
              <IconButton
                aria-label="remove image"
                onClick={handleRemoveImage}
                size="small"
                sx={{ position: 'absolute', top: 0, right: 0, backgroundColor: 'rgba(255,255,255,0.7)' }}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </Box>
          )}

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: isMobile ? 1 : 2, mb: 2 }}>
            <Box sx={{ width: isMobile ? '100%' : (showCustomCategoryInput ? 'calc(50% - 8px)' : 'calc(50% - 8px)') }}>
              <FormControl fullWidth margin="normal" error={!!categoryError}>
                <InputLabel id="category-label" shrink={true}>Category</InputLabel>
                <Select
                  labelId="category-label"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  label="Category"
                  displayEmpty
                  renderValue={(value) => {
                    if (value === "") {
                      return <em style={{ color: 'grey' }}>Select a category</em>;
                    }
                    return value;
                  }}
                >
                  {sortedCategories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <span>{cat}</span>
                        {!standardCategories.includes(cat as StandardCategory) && (
                          <IconButton
                            size="small"
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteCategory(cat);
                            }}
                            sx={{ p: 0.5 }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {categoryError && <FormHelperText>{categoryError}</FormHelperText>}
              </FormControl>
            </Box>
            {showCustomCategoryInput && (
              <Box sx={{ width: isMobile ? '100%' : 'calc(50% - 8px)' }}>
                  <TextField
                      margin="normal"
                      required
                      fullWidth
                      label="Custom Category"
                      value={customCategoryName}
                      onChange={(e) => setCustomCategoryName(e.target.value)}
                      error={!!categoryError}
                      helperText={categoryError}
                  />
              </Box>
            )}
            <Box sx={{ width: isMobile ? '100%' : 'calc(50% - 8px)' }}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="priority-label">Priority</InputLabel>
                <Select
                  labelId="priority-label"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as 'Low' | 'Medium' | 'High')}
                  label="Priority"
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 1 : 2, mb: 2 }}>
            <FormControl variant="outlined" sx={{ flex: 1, mt: 2 }}>
              <InputLabel htmlFor="add-amount-input">Amount</InputLabel>
              <OutlinedInput
                  id="add-amount-input"
                  type="number"
                  value={amount}
                  onChange={(e) => handleAmountChange(parseInt(e.target.value, 10) || 1)}
                  inputProps={{ min: 1, style: { textAlign: 'center' } }}
                  sx={{
                    '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                        display: 'none',
                    },
                    '& input[type=number]': {
                        '-moz-appearance': 'textfield',
                    },
                  }}
                  label="Amount"
                  startAdornment={
                    <InputAdornment position="start">
                      <IconButton
                        aria-label="decrease amount"
                        onClick={() => handleAmountChange(amount - 1)}
                        edge="start"
                        disabled={amount <= 1}
                        size="small"
                      >
                        <KeyboardArrowDownIcon />
                      </IconButton>
                    </InputAdornment>
                  }
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="increase amount"
                        onClick={() => handleAmountChange(amount + 1)}
                        edge="end"
                        size="small"
                      >
                        <KeyboardArrowUpIcon />
                      </IconButton>
                    </InputAdornment>
                  }
              />
            </FormControl>
            <FormControl fullWidth margin="normal" sx={{ mt: 2, flex: 1 }}>
                <InputLabel id="units-label">Unit</InputLabel>
                <Select
                  labelId="units-label"
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                  label="Unit"
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300,
                      },
                    },
                  }}
                >
                  {UNIT_OPTIONS.map(unit => (
                    <MenuItem key={unit} value={unit}>{unit}</MenuItem>
                  ))}
                </Select>
            </FormControl>
          </Box>

          <TextField
            margin="normal"
            fullWidth
            id="notes"
            label="Notes (Optional)"
            name="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            rows={4}
            placeholder="Any additional notes..."
            sx={{ mb: 2 }}
          />
          
          {/* Add some extra content to ensure scrolling is triggered on mobile */}
          <Box sx={{ height: '20px' }} /> {/* Spacer */}
          <Box sx={{ height: '20px' }} /> {/* Spacer */}
          <Box sx={{ height: '20px' }} /> {/* Spacer */}
        </Box>
      </DialogContent>
      <DialogActions 
        sx={{ 
          p: '16px 24px',
          // Mobile responsiveness: Ensure buttons remain visible and accessible
          backgroundColor: (theme) => theme.palette.mode === 'dark'
            ? 'rgba(26, 26, 26, 0.95)'
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          borderTop: (theme) => `1px solid ${theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(0, 0, 0, 0.1)'}`,
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 1 : 1,
          '& .MuiButton-root': {
            minHeight: '44px', // Ensure buttons are touch-friendly on mobile
            width: isMobile ? '100%' : 'auto',
          }
        }}
      >
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Add Item
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddItemForm;