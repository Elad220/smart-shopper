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
  ListItemText,
  Paper,
  Alert,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    // When the dialog opens, fetch the API key status
    if (open && token) {
      // Reset local states
      setError(null);
      setSuccess(null);
      setApiKey('');
      setGeneratedItems([]);
      setIsCheckingStatus(true);

      const fetchStatus = async () => {
        try {
          const { hasApiKey: keyExists } = await checkApiKeyStatus(token);
          setHasApiKey(keyExists);
          // If a key exists, pre-fill the input with the placeholder
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

    try {
      const items = await generateItemsFromApi(token, prompt);
      setGeneratedItems(items);
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
    // Prevent saving the placeholder text as a key
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
        setApiKey(API_KEY_PLACEHOLDER); // Show placeholder after successful save
    } catch (err: any) {
        setError(err.message || "Failed to save API key.");
    } finally {
        setIsLoading(false);
    }
  }

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
      setApiKey(''); // Clear the input field
    } catch (err: any) {
      setError(err.message || "Failed to remove API key.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClick = () => {
    onAddItems(generatedItems);
    onClose();
  };

  const handleApiKeyFocus = () => {
    // Clear the placeholder text when the user focuses the input
    if (apiKey === API_KEY_PLACEHOLDER) {
      setApiKey('');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Smart Assistant</DialogTitle>
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
              <Typography variant="h6" sx={{ mb: 1 }}>Generated Items:</Typography>
              <List>
                {generatedItems.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={item.name} secondary={item.category} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>Cancel</Button>
        <Button onClick={handleGenerate} variant="outlined" disabled={isLoading || !hasApiKey}>
          Generate
        </Button>
        <Button onClick={handleAddClick} variant="contained" disabled={isLoading || generatedItems.length === 0}>
          Add Items to List
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SmartAssistant;