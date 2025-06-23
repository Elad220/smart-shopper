import React, { useState, useMemo } from 'react';
import { 
  GoogleGenerativeAI, 
  HarmCategory, 
  HarmBlockThreshold 
} from '@google/generative-ai';
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
  Alert
} from '@mui/material';

interface SmartAssistantProps {
  open: boolean;
  onClose: () => void;
  onAddItems: (items: { name: string; category: string }[]) => void;
}

const SmartAssistant: React.FC<SmartAssistantProps> = ({ open, onClose, onAddItems }) => {
  const [prompt, setPrompt] = useState('');
  const [generatedItems, setGeneratedItems] = useState<{ name: string; category: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Safely get the API key and initialize the model only when needed
  const model = useMemo(() => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      return null;
    }
    const genAI = new GoogleGenerativeAI(apiKey);

    // Add these safety settings to avoid overly aggressive blocking
    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    return genAI.getGenerativeModel({ model: "gemini-2.0-flash", safetySettings });
  }, []);

  const handleGenerate = async () => {
    if (!model) {
      setError("Gemini API key not found. Please make sure VITE_GEMINI_API_KEY is set in your .env.local file.");
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
      const fullPrompt = `Based on the theme "${prompt}", generate a list of 5-10 shopping items. For each item, suggest a relevant category from the following list: Produce, Dairy, Fridge, Freezer, Bakery, Pantry, Disposable, Hygiene, Canned Goods, Organics, Deli, Other. Format the output as a JSON array of objects, where each object has a "name" and "category" property. For example: [{"name": "Taco Shells", "category": "Pantry"}]`;

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      
      // Check if the response was blocked
      if (!response.text) {
          throw new Error("The response was blocked for safety reasons. Please try a different theme.");
      }
      
      const text = await response.text();
      
      const jsonText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const items = JSON.parse(jsonText);
      setGeneratedItems(items);

    } catch (err: any) {
      console.error("Error generating items:", err);
      setError(err.message || "Failed to generate items. Please check your API key and try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddClick = () => {
    onAddItems(generatedItems);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Smart Assistant</DialogTitle>
      <DialogContent>
        {!model && (
           <Alert severity="error" sx={{ mb: 2 }}>
            Smart Assistant is not configured. Please add your `VITE_GEMINI_API_KEY` to the .env.local file and restart the server.
          </Alert>
        )}
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
          disabled={isLoading || !model}
        />
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {isLoading ? (
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
        <Button onClick={handleGenerate} variant="outlined" disabled={isLoading || !model}>
          Generate
        </Button>
        <Button onClick={handleAddClick} variant="contained" disabled={isLoading || generatedItems.length === 0 || !model}>
          Add Items to List
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SmartAssistant;