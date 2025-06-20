import React, { useState, useCallback, useEffect } from 'react';
import { ShoppingItem, StandardCategory, Category } from '../types';
import { UNIT_OPTIONS } from '../constants';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import Box from '@mui/material/Box';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import ClearIcon from '@mui/icons-material/Clear';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';

interface AddItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: Omit<ShoppingItem, 'id' | 'completed'>) => void;
  categories: Category[];
  onDeleteCategory: (categoryName: string) => void;
}

const AddItemForm: React.FC<AddItemFormProps> = ({ isOpen, onClose, onAddItem, categories, onDeleteCategory }) => {
  const [name, setName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | ''>(categories[0] || '');
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [units, setUnits] = useState(UNIT_OPTIONS[0]);
  const [amount, setAmount] = useState<number>(1);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined); // Will store base64 data URL
  const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const standardCategories = Object.values(StandardCategory);

  const sortedCategories = [...categories].sort((a, b) => {
    const aIsStandard = standardCategories.includes(a as StandardCategory);
    const bIsStandard = standardCategories.includes(b as StandardCategory);

    if(a === StandardCategory.OTHER) return 1;
    if(b === StandardCategory.OTHER) return -1;

    if (aIsStandard && !bIsStandard) return -1;
    if (!aIsStandard && bIsStandard) return 1;

    return a.localeCompare(b);
  });

  useEffect(() => {
    if (isOpen) {
        setName('');
        setSelectedCategory(categories.includes(StandardCategory.PRODUCE) ? StandardCategory.PRODUCE : (categories[0] || ''));
        setCustomCategoryName('');
        setUnits(UNIT_OPTIONS[0]);
        setAmount(1);
        setImageUrl(undefined);
        setShowCustomCategoryInput(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Reset file input
        }
    }
  }, [isOpen, categories]);

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
      }
      if (file.size > 2 * 1024 * 1024) { // Limit file size to 2MB for example
        alert("File is too large. Please select an image smaller than 2MB.");
        event.target.value = ""; // Clear the file input
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
        fileInputRef.current.value = ""; // Reset file input
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Item name cannot be empty.");
      return;
    }
    if (selectedCategory === StandardCategory.OTHER && !customCategoryName.trim()) {
      alert("Please specify a name for the 'Other' category.");
      return;
    }

    const finalCategory = selectedCategory === StandardCategory.OTHER ? customCategoryName.trim() : selectedCategory;

    onAddItem({
      name: name.trim(),
      category: finalCategory,
      units: units,
      amount,
      image: imageUrl,
    });
    onClose(); 
  };

  const handleAmountChange = useCallback((newAmount: number) => {
    setAmount(Math.max(1, newAmount));
  }, []);

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Add New Item
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
            id="itemName"
            label="Item Name"
            name="itemName"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Whole Milk"
          />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <Box sx={{ width: { xs: '100%', sm: showCustomCategoryInput ? 'calc(50% - 8px)' : '100%' } }}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  label="Category"
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300,
                      },
                    },
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
              <InputLabel shrink htmlFor="amount-input" sx={{mb:0.5, fontSize: '0.9rem'}}>Amount</InputLabel>
              <Box display="flex" alignItems="center">
                <IconButton onClick={() => handleAmountChange(amount - 1)} disabled={amount <= 1} aria-label="Decrease amount" size="small">
                  <RemoveCircleOutlineIcon />
                </IconButton>
                <TextField
                  id="amount-input"
                  type="number"
                  value={amount}
                  onChange={(e) => handleAmountChange(parseInt(e.target.value, 10) || 1)}
                  inputProps={{ min: 1, style: { textAlign: 'center', width: '40px',MozAppearance: 'textfield' } }} 
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
                <InputLabel id="units-label">Units</InputLabel>
                <Select
                  labelId="units-label"
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                  label="Units"
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300, // Prevent the menu from getting too tall
                      },
                    },
                  }}
                >
                  {UNIT_OPTIONS.map((unit) => (
                    <MenuItem key={unit} value={unit}>
                      {unit}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
          
          <Box sx={{ my: 2 }}>
            <InputLabel shrink sx={{mb:0.5, fontSize: '0.9rem'}}>Image (Optional)</InputLabel>
            <Button
                variant="outlined"
                component="label" // Makes the button act as a label for the hidden input
                startIcon={<PhotoCamera />}
                fullWidth
            >
                Upload Image
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
          Add Item
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddItemForm;