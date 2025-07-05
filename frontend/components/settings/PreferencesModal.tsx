import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Stack,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  useTheme,
  alpha,
} from '@mui/material';
import { X, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { UserPreferences, updateUserPreferences } from '../../src/services/api';
import toast from 'react-hot-toast';

interface PreferencesModalProps {
  open: boolean;
  onClose: () => void;
  token: string | null;
  currentPreferences: UserPreferences;
  onPreferencesUpdate: (preferences: UserPreferences) => void;
}

const PreferencesModal: React.FC<PreferencesModalProps> = ({
  open,
  onClose,
  token,
  currentPreferences,
  onPreferencesUpdate,
}) => {
  const theme = useTheme();
  const [preferences, setPreferences] = useState<UserPreferences>(currentPreferences);
  const [newDietaryRestriction, setNewDietaryRestriction] = useState('');
  const [newCuisine, setNewCuisine] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await updateUserPreferences(token, preferences);
      onPreferencesUpdate(response.preferences);
      toast.success('Preferences updated successfully!');
      onClose();
    } catch (error: any) {
      toast.error('Failed to update preferences.');
    } finally {
      setIsLoading(false);
    }
  };

  const addDietaryRestriction = () => {
    if (newDietaryRestriction.trim() && !preferences.dietaryRestrictions?.includes(newDietaryRestriction.trim())) {
      setPreferences(prev => ({
        ...prev,
        dietaryRestrictions: [...(prev.dietaryRestrictions || []), newDietaryRestriction.trim()]
      }));
      setNewDietaryRestriction('');
    }
  };

  const removeDietaryRestriction = (restriction: string) => {
    setPreferences(prev => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions?.filter(r => r !== restriction) || []
    }));
  };

  const addCuisine = () => {
    if (newCuisine.trim() && !preferences.favoriteCuisines?.includes(newCuisine.trim())) {
      setPreferences(prev => ({
        ...prev,
        favoriteCuisines: [...(prev.favoriteCuisines || []), newCuisine.trim()]
      }));
      setNewCuisine('');
    }
  };

  const removeCuisine = (cuisine: string) => {
    setPreferences(prev => ({
      ...prev,
      favoriteCuisines: prev.favoriteCuisines?.filter(c => c !== cuisine) || []
    }));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        className: 'glass-modal',
        sx: {
          borderRadius: '24px',
          overflow: 'hidden',
        }
      }}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(20px)',
        }
      }}
    >
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
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Smart Assistant Preferences
          </Typography>
          <IconButton onClick={onClose}>
            <X />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={3}>
            {/* Dietary Restrictions */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Dietary Restrictions
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <TextField
                  size="small"
                  placeholder="Add dietary restriction..."
                  value={newDietaryRestriction}
                  onChange={(e) => setNewDietaryRestriction(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addDietaryRestriction()}
                  sx={{ flexGrow: 1 }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={addDietaryRestriction}
                  disabled={!newDietaryRestriction.trim()}
                >
                  <Plus size={16} />
                </Button>
              </Stack>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {preferences.dietaryRestrictions?.map((restriction, index) => (
                  <Chip
                    key={index}
                    label={restriction}
                    onDelete={() => removeDietaryRestriction(restriction)}
                    deleteIcon={<Trash2 size={16} />}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>

            {/* Favorite Cuisines */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Favorite Cuisines
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <TextField
                  size="small"
                  placeholder="Add favorite cuisine..."
                  value={newCuisine}
                  onChange={(e) => setNewCuisine(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCuisine()}
                  sx={{ flexGrow: 1 }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={addCuisine}
                  disabled={!newCuisine.trim()}
                >
                  <Plus size={16} />
                </Button>
              </Stack>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {preferences.favoriteCuisines?.map((cuisine, index) => (
                  <Chip
                    key={index}
                    label={cuisine}
                    onDelete={() => removeCuisine(cuisine)}
                    deleteIcon={<Trash2 size={16} />}
                    color="secondary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>

            {/* Cooking Skill Level */}
            <FormControl fullWidth>
              <InputLabel>Cooking Skill Level</InputLabel>
              <Select
                value={preferences.cookingSkillLevel || 'intermediate'}
                label="Cooking Skill Level"
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  cookingSkillLevel: e.target.value as 'beginner' | 'intermediate' | 'advanced'
                }))}
              >
                <MenuItem value="beginner">Beginner</MenuItem>
                <MenuItem value="intermediate">Intermediate</MenuItem>
                <MenuItem value="advanced">Advanced</MenuItem>
              </Select>
            </FormControl>

            {/* Household Size */}
            <TextField
              fullWidth
              label="Household Size"
              type="number"
              value={preferences.householdSize || 2}
              onChange={(e) => setPreferences(prev => ({
                ...prev,
                householdSize: parseInt(e.target.value) || 1
              }))}
              inputProps={{ min: 1, max: 10 }}
            />

            {/* Budget Preference */}
            <FormControl fullWidth>
              <InputLabel>Budget Preference</InputLabel>
              <Select
                value={preferences.budgetPreference || 'moderate'}
                label="Budget Preference"
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  budgetPreference: e.target.value as 'budget' | 'moderate' | 'premium'
                }))}
              >
                <MenuItem value="budget">Budget</MenuItem>
                <MenuItem value="moderate">Moderate</MenuItem>
                <MenuItem value="premium">Premium</MenuItem>
              </Select>
            </FormControl>

            {/* Shopping Frequency */}
            <FormControl fullWidth>
              <InputLabel>Shopping Frequency</InputLabel>
              <Select
                value={preferences.shoppingFrequency || 'weekly'}
                label="Shopping Frequency"
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  shoppingFrequency: e.target.value as 'daily' | 'weekly' | 'biweekly' | 'monthly'
                }))}
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="biweekly">Bi-weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <Button onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={isLoading}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
              }
            }}
          >
            {isLoading ? 'Saving...' : 'Save Preferences'}
          </Button>
        </DialogActions>
      </motion.div>
    </Dialog>
  );
};

export default PreferencesModal; 