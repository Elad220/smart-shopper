import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingItem, StandardCategory } from '../types';
import { CATEGORY_OPTIONS, UNIT_OPTIONS } from '../constants';

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
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import ClearIcon from '@mui/icons-material/Clear';

interface EditItemModalProps {
  item: ShoppingItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedItem: ShoppingItem) => void;
}

const EditItemModal: React.FC<EditItemModalProps> = ({ item, isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<StandardCategory | ''>('');
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [units, setUnits] = useState(UNIT_OPTIONS[0]);
  const [amount, setAmount] = useState<number>(1);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined); // Will store base64 data URL
  const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);


  useEffect(() => {
    if (item && isOpen) {
      setName(item.name);
      setUnits(item.units || UNIT_OPTIONS[0]);
      setAmount(item.amount);
      setImageUrl(item.imageUrl || undefined); // Expecting data URL or undefined

      const isStandard = CATEGORY_OPTIONS.includes(item.category as StandardCategory);
      if (isStandard) {
        setSelectedCategory(item.category as StandardCategory);
        const showCustom = item.category === StandardCategory.OTHER;
        setShowCustomCategoryInput(showCustom);
        setCustomCategoryName(showCustom ? item.customCategoryName || '' : '');
      } else {
        setSelectedCategory(StandardCategory.OTHER);
        setShowCustomCategoryInput(true);
        setCustomCategoryName(item.category as string);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset file input
      }
    } else if (!isOpen) { 
        setName('');
        setSelectedCategory(CATEGORY_OPTIONS[0]);
        setCustomCategoryName('');
        setUnits(UNIT_OPTIONS[0]);
        setAmount(1);
        setImageUrl(undefined);
        setShowCustomCategoryInput(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Reset file input
        }
    }
  }, [item, isOpen]);

  const handleCategoryChange = (event: SelectChangeEvent<StandardCategory | ''>) => {
    const value = event.target.value as StandardCategory;
    setSelectedCategory(value);
    setShowCustomCategoryInput(value === StandardCategory.OTHER);
    if (value !== StandardCategory.OTHER) {
      setCustomCategoryName('');
    } else if (item && item.category !== StandardCategory.OTHER && typeof item.category === 'string' && !CATEGORY_OPTIONS.includes(item.category as StandardCategory)) {
      setCustomCategoryName(item.category);
    } else {
      setCustomCategoryName(item?.customCategoryName && value === StandardCategory.OTHER ? item.customCategoryName : '');
    }
  };
  
  const handleAmountChange = useCallback((newAmount: number) => {
    setAmount(Math.max(1, newAmount));
  }, []);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.onerror = () => {
        console.error("Error reading file.");
        setImageUrl(item?.imageUrl || undefined); // Revert to original if error
         alert("Could not read image file. Please try another image.");
      }
      if (file.size > 2 * 1024 * 1024) { // Limit file size to 2MB
        alert("File is too large. Please select an image smaller than 2MB.");
        event.target.value = ""; 
        return;
      }
      reader.readAsDataURL(file);
    } else {
        // If no file selected (e.g., user cancels dialog), keep current or original image
        // setImageUrl(item?.imageUrl || undefined); // Or could clear it: setImageUrl(undefined)
    }
  };

  const handleRemoveImage = () => {
    setImageUrl(undefined);
    if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset file input
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    if (!name.trim()) {
      alert("Item name cannot be empty.");
      return;
    }
    if (selectedCategory === StandardCategory.OTHER && !customCategoryName.trim()) {
      alert("Please specify a name for the 'Other' category.");
      return;
    }
    
    const finalCategory = selectedCategory === StandardCategory.OTHER ? customCategoryName.trim() : selectedCategory;

    onSave({
      ...item,
      name: name.trim(),
      category: finalCategory,
      customCategoryName: selectedCategory === StandardCategory.OTHER ? customCategoryName.trim() : undefined,
      units: units,
      amount,
      imageUrl: imageUrl,
    });
    onClose();
  };

  if (!isOpen || !item) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Edit Item
        <IconButton aria-label="close" onClick={onClose}>
            <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="editItemName"
            label="Item Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <Box sx={{ width: { xs: '100%', sm: showCustomCategoryInput ? 'calc(50% - 8px)' : '100%' } }}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="edit-category-label">Category</InputLabel>
                <Select
                  labelId="edit-category-label"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  label="Category"
                >
                  {Object.values(StandardCategory).map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                  <MenuItem value="custom">Custom Category</MenuItem>
                </Select>
              </FormControl>
            </Box>
            {showCustomCategoryInput && (
              <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Custom Category"
                  value={customCategoryName}
                  onChange={(e) => setCustomCategoryName(e.target.value)}
                />
              </Box>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, alignItems: 'center' }}>
            <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
              <InputLabel shrink htmlFor="edit-amount-input" sx={{mb:0.5, fontSize: '0.9rem'}}>Amount</InputLabel>
              <Box display="flex" alignItems="center">
                <IconButton onClick={() => handleAmountChange(amount - 1)} disabled={amount <= 1} aria-label="Decrease amount" size="small">
                  <RemoveCircleOutlineIcon />
                </IconButton>
                <TextField
                  id="edit-amount-input"
                  type="number"
                  value={amount}
                  onChange={(e) => handleAmountChange(parseInt(e.target.value, 10) || 1)}
                  inputProps={{ min: 1, style: { textAlign: 'center', width: '40px', MozAppearance: 'textfield' } }}
                  sx={{ mx: 0.5, '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': { WebkitAppearance: 'none', margin: 0 } }}
                  size="small"
                />
                <IconButton onClick={() => handleAmountChange(amount + 1)} aria-label="Increase amount" size="small">
                  <AddCircleOutlineIcon />
                </IconButton>
              </Box>
            </Box>
            <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
              <FormControl fullWidth margin="normal" sx={{mt:0}}>
                <InputLabel id="edit-units-label">Units</InputLabel>
                <Select
                  labelId="edit-units-label"
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                  label="Units"
                >
                  {UNIT_OPTIONS.map(unit => (
                    <MenuItem key={unit} value={unit}>{unit}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
          
          <Box sx={{ my: 2 }}>
            <InputLabel shrink sx={{mb:0.5, fontSize: '0.9rem'}}>Image (Optional)</InputLabel>
            <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoCamera />}
                fullWidth
            >
                Change Image
                <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                    ref={fileInputRef}
                />
            </Button>
            <Typography variant="caption" display="block" color="text.secondary" sx={{mt: 0.5}}>
                Max file size: 2MB.
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
                sx={{position: 'absolute', top: 0, right: 0, backgroundColor: 'rgba(255,255,255,0.7)'}}
              >
                <ClearIcon fontSize="small"/>
              </IconButton>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditItemModal;
