import React, { useState, useEffect, useCallback } from 'react';
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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';

interface EditItemModalProps {
  item: ShoppingItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedItem: ShoppingItem) => void;
  categories: Category[];
  onDeleteCategory: (categoryName: string) => void;
}

const EditItemModal: React.FC<EditItemModalProps> = ({ item, isOpen, onClose, onSave, categories, onDeleteCategory }) => {
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

    if(a === StandardCategory.OTHER) return 1;
    if(b === StandardCategory.OTHER) return -1;

    if (aIsStandard && !bIsStandard) return -1;
    if (!aIsStandard && bIsStandard) return 1;

    return a.localeCompare(b);
  });


  useEffect(() => {
    if (item && isOpen) {
      setName(item.name);
      setNameError('');
      setUnits(item.units || UNIT_OPTIONS[0]);
      setAmount(item.amount);
      setPriority(item.priority || 'Medium');
      setNotes(item.notes || '');
      setImageUrl(item.imageUrl || undefined);

      const isStandard = Object.values(StandardCategory).some(v => v === item.category);
      
      if (categories.includes(item.category) && item.category !== StandardCategory.OTHER) {
          setSelectedCategory(item.category);
          setShowCustomCategoryInput(false);
          setCustomCategoryName('');
      } else {
          setSelectedCategory(StandardCategory.OTHER);
          setShowCustomCategoryInput(true);
          setCustomCategoryName(isStandard ? '' : item.category);
      }
      setCategoryError('');
      
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset file input
      }
    }
  }, [item, isOpen, categories]);

  const handleCategoryChange = (event: SelectChangeEvent<Category>) => {
    const value = event.target.value as Category;
    setSelectedCategory(value);
    setShowCustomCategoryInput(value === StandardCategory.OTHER);
    if (value !== StandardCategory.OTHER) {
      setCustomCategoryName('');
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
    if (!item) return;

    let isValid = true;
    if (!name.trim()) {
      setNameError("Item name cannot be empty.");
      isValid = false;
    }
    if (selectedCategory === StandardCategory.OTHER && !customCategoryName.trim()) {
      setCategoryError("Please specify a name for the 'Other' category.");
      isValid = false;
    }

    if (!isValid) return;
    
    const finalCategory = selectedCategory === StandardCategory.OTHER ? customCategoryName.trim() : selectedCategory;

    onSave({
      ...item,
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
            error={!!nameError}
            helperText={nameError}
          />
           <Box sx={{ my: 2 }}>
            <InputLabel shrink sx={{mb:0.5, fontSize: '0.9rem'}}>Item Image (Optional)</InputLabel>
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
            <Typography variant="caption" display="block" color="text.secondary" sx={{mt: 0.5}}>
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
                sx={{position: 'absolute', top: 0, right: 0, backgroundColor: 'rgba(255,255,255,0.7)'}}
              >
                <ClearIcon fontSize="small"/>
              </IconButton>
            </Box>
          )}

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="edit-category-label">Category</InputLabel>
                <Select
                  labelId="edit-category-label"
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
             <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
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
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, alignItems: 'center' }}>
            <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
              <InputLabel shrink htmlFor="edit-amount-input" sx={{mb:0.5, fontSize: '0.9rem'}}>Amount</InputLabel>
               <TextField
                  id="edit-amount-input"
                  type="number"
                  value={amount}
                  onChange={(e) => handleAmountChange(parseInt(e.target.value, 10) || 1)}
                  inputProps={{ min: 1 }} 
                  size="small"
                  fullWidth
                />
            </Box>
            <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
              <FormControl fullWidth margin="normal" sx={{mt:0}}>
                <InputLabel id="edit-units-label">Unit</InputLabel>
                <Select
                  labelId="edit-units-label"
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                  label="Unit"
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300, // Prevent the menu from getting too tall
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
            rows={3}
            placeholder="Any additional notes..."
          />
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