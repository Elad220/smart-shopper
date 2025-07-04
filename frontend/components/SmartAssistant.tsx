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

interface SmartAssistantProps {
  open: boolean;
  onClose: () => void;
  onAddItems: (items: { name: string; category: string }[]) => void;
  token: string | null;
}

const API_KEY_PLACEHOLDER = '••••••••••••••••••••••••••••••••••••••••';

const SmartAssistant: React.FC<SmartAssistantProps> = ({ open, onClose, onAddItems, token }) => {
  const [prompt, setPrompt] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [generatedItems, setGeneratedItems] = useState<{ name: string; category: string }[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (open && token) {
      setError(null);
      setSuccess(null);
      setApiKey('');
      setGeneratedItems([]);
      setSelectedItems(new Set());
      setIsCheckingStatus(true);

      const fetchStatus = async () => {
        try {
          const { hasApiKey: keyExists } = await checkApiKeyStatus(token);
          setHasApiKey(keyExists);
          if (keyExists) {
            setApiKey(API_KEY_PLACEHOLDER);
          }
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

  const handleSaveApiKey = async () => {
    if (!token) {
        setError("You must be logged in to save an API key.");
        return;
    }
    if (!apiKey.trim() || apiKey === API_KEY_PLACEHOLDER) {
        setError("API Key cannot be empty.");
        return;
    }
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
        await saveApiKey(token, apiKey);
        setSuccess("API Key saved successfully!");
        setHasApiKey(true);
        setApiKey(API_KEY_PLACEHOLDER);
    } catch (err: any) {
        setError(err.message || "Failed to save API key.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleRemoveApiKey = async () => {
    if (!token) {
      setError("You must be logged in to remove an API key.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await removeApiKey(token);
      setSuccess("API Key removed successfully!");
      setHasApiKey(false);
      setApiKey('');
    } catch (err: any) {
      setError(err.message || "Failed to remove API key.");
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
  
  const handleApiKeyFocus = () => {
    if (apiKey === API_KEY_PLACEHOLDER) {
      setApiKey('');
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
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
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography sx={{ fontSize: '1.8rem' }}>🤖</Typography>
          Smart Assistant
        </Stack>
        <IconButton aria-label="close" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ minHeight: '60px', mb: 2 }}>
            {isCheckingStatus ? (
                <CircularProgress size={24} />
            ) : hasApiKey ? (
                <Alert severity="success" icon={<CheckCircleOutlineIcon fontSize="inherit" />}>
                    An API key is saved to your account. You can enter a new key to overwrite it.
                </Alert>
            ) : (
                <Alert severity="info">
                    No API key found. Please enter a key to use the Smart Assistant.
                </Alert>
            )}
        </Box>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Enter your Gemini API Key. It will be stored securely for future use.
        </Typography>
        <TextField
          margin="dense"
          label="Gemini API Key"
          fullWidth
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          onFocus={handleApiKeyFocus}
          disabled={isLoading}
          type="password"
          placeholder={hasApiKey ? "" : "Enter your API Key"}
        />
        <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
            <Button onClick={handleSaveApiKey} variant="outlined" disabled={isLoading}>
              Save Key
            </Button>
            <Button onClick={handleRemoveApiKey} color="error" variant="outlined" disabled={isLoading || !hasApiKey}>
              Remove Key
            </Button>
        </Box>
        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
        
        <Typography variant="body1" sx={{ mt: 4, mb: 2 }}>
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
      <DialogActions sx={{ p: 3 }}>
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
          {isLoading && !success ? 'Generating...' : 'Generate'}
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
    </Dialog>
  );
};

export default SmartAssistant;