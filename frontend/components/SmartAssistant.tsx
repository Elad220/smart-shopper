// frontend/components/SmartAssistant.tsx
import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  CircularProgress,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Alert,
  Checkbox,
  FormControlLabel,
  Stack,
  IconButton,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import { saveApiKey, generateItemsFromApi, removeApiKey, checkApiKeyStatus } from '../src/services/api';
import { motion, AnimatePresence } from 'framer-motion';

interface SmartAssistantProps {
  open: boolean;
  onClose: () => void;
  onAddItems: (items: { name: string; category: string }[]) => void;
  token: string | null;
}

const API_KEY_PLACEHOLDER = '••••••••••••••••••••••••••••••••••••••••';

const SmartAssistant: React.FC<SmartAssistantProps> = ({ open, onClose, onAddItems, token }) => {
  const [prompt, setPrompt] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [generatedItems, setGeneratedItems] = useState<{ name: string; category: string }[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && token) {
      setError(null);
      setGeneratedItems([]);
      setSelectedItems(new Set());
      setIsCheckingStatus(true);

      const fetchStatus = async () => {
        try {
          const { hasApiKey: keyExists } = await checkApiKeyStatus(token);
          setHasApiKey(keyExists);
        } catch (err) {
          setError("Could not verify API key status.");
          setHasApiKey(false);
        } finally {
          setIsCheckingStatus(false);
        }
      };

      fetchStatus();
    }
  }, [open, token]);

  const handleGenerate = async () => {
    if (!token) {
      setError("You must be logged in to use the smart assistant.");
      return;
    }
    if (!prompt.trim()) {
      setError("Please enter a theme for your shopping list.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedItems([]);
    setSelectedItems(new Set());

    try {
      const items = await generateItemsFromApi(token, prompt);
      setGeneratedItems(items);
      // Pre-select all generated items
      setSelectedItems(new Set(items.map((_, index) => index)));
    } catch (err: any) {
      console.error("Error generating items:", err);
      setError(err.message || "Failed to generate items. Please check your API key and try again.");
    } finally {
      setIsLoading(false);
    }
  };



  const handleToggleItem = (index: number) => {
    setSelectedItems(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(index)) {
        newSelected.delete(index);
      } else {
        newSelected.add(index);
      }
      return newSelected;
    });
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedItems(new Set(generatedItems.map((_, index) => index)));
    } else {
      setSelectedItems(new Set());
    }
  };
  
  const handleAddClick = () => {
    const itemsToAdd = generatedItems.filter((_, index) => selectedItems.has(index));
    onAddItems(itemsToAdd);
    onClose();
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
          maxHeight: '90vh',
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
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
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
                      background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: (theme) => `0 8px 24px ${theme.palette.primary.main}40`,
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
                      <span style={{ fontSize: 24 }}>🤖</span>
                    </motion.div>
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, background: (theme) => `linear-gradient(135deg, ${theme.palette.text.primary}, ${theme.palette.primary.main})`, backgroundClip: 'text', WebkitBackgroundClip: 'text' }}>
                      Smart Assistant
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.8 }}>
                      Generate a shopping list with AI
                    </Typography>
                  </Box>
                </Stack>
              </motion.div>
              <IconButton aria-label="close" onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ 
              flex: 1,
              overflowY: 'auto',
              maxHeight: 'calc(90vh - 200px)',
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
              <Box sx={{ minHeight: '60px', mb: 2 }}>
                  {isCheckingStatus ? (
                      <CircularProgress size={24} />
                  ) : hasApiKey ? (
                      <Alert severity="success" icon={<CheckCircleOutlineIcon fontSize="inherit" />}>
                          API key is configured. You can manage your API key in Settings.
                      </Alert>
                  ) : (
                      <Alert severity="info">
                          No API key found. Please configure your API key in Settings to use the Smart Assistant.
                      </Alert>
                  )}
              </Box>
              
              <Typography variant="body1" sx={{ mb: 2 }}>
                Enter a theme (e.g., "Taco Night", "Pasta Dinner", "Beach Picnic") and the assistant will generate a list of suggested items.
              </Typography>
              <TextField
                autoFocus
                margin="dense"
                label="Shopping List Theme"
                fullWidth
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isLoading || !hasApiKey}
              />
              {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
              {isLoading && !success ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                  <CircularProgress />
                </Box>
              ) : (
                generatedItems.length > 0 && (
                  <Paper elevation={2} sx={{ mt: 2, p: 2 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedItems.size === generatedItems.length}
                          indeterminate={selectedItems.size > 0 && selectedItems.size < generatedItems.length}
                          onChange={handleSelectAll}
                        />
                      }
                      label="Select All"
                    />
                    <List>
                      {generatedItems.map((item, index) => (
                        <ListItem key={index} dense disablePadding>
                          <ListItemButton onClick={() => handleToggleItem(index)}>
                            <Checkbox
                              edge="start"
                              checked={selectedItems.has(index)}
                              tabIndex={-1}
                              disableRipple
                            />
                            <ListItemText primary={item.name} secondary={item.category} />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                )
              )}
            </DialogContent>
            <DialogActions sx={{ p: '16px 24px' }}>
              <Button 
                onClick={onClose} 
                disabled={isLoading}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleGenerate} 
                variant="outlined" 
                disabled={isLoading || !hasApiKey}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                }}
              >
                {isLoading ? 'Generating...' : 'Generate'}
              </Button>
              <Button 
                onClick={handleAddClick} 
                variant="contained" 
                disabled={isLoading || generatedItems.length === 0}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                }}
              >
                Add Selected Items
              </Button>
            </DialogActions>
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  );
};

export default SmartAssistant;