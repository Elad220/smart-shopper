import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Checkbox, List, ListItem, ListItemText, ListItemSecondaryAction, CircularProgress, Box, Typography } from '@mui/material';
import { generateItemsFromApi } from '../../src/services/api';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';

const GenAIAddItemsModal = ({ open, onClose, onAddItems, token, categories }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState('');
  const [listening, setListening] = useState(false);
  const recognitionRef = React.useRef(null);

  // Voice input logic
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setError('Voice recognition not supported in this browser.');
      return;
    }
    if (listening) {
      recognitionRef.current && recognitionRef.current.stop();
      setListening(false);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev ? prev + ', ' + transcript : transcript);
    };
    recognition.onerror = (event) => {
      setError('Voice recognition error: ' + event.error);
      setListening(false);
    };
    recognition.onend = () => {
      setListening(false);
    };
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const handleProcess = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await generateItemsFromApi(token, input);
      setItems(result);
      setSelected(result.map((_, i) => true));
    } catch (e) {
      setError('Failed to parse items.');
    }
    setLoading(false);
  };

  const handleToggle = idx => {
    setSelected(sel => sel.map((v, i) => (i === idx ? !v : v)));
  };

  const handleAdd = () => {
    const selectedItems = items.filter((_, i) => selected[i]);
    onAddItems(selectedItems);
    onClose();
  };

  const handleCancel = () => {
    setInput('');
    setItems([]);
    setSelected([]);
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>What do you need?</DialogTitle>
      <DialogContent>
        {items.length === 0 ? (
          <>
            <TextField
              label="Enter items (e.g. Milk, eggs, 2 loaves of bread, bananas)"
              value={input}
              onChange={e => setInput(e.target.value)}
              fullWidth
              multiline
              minRows={2}
              autoFocus
              margin="normal"
              InputProps={{
                endAdornment: (
                  <Button onClick={handleVoiceInput} sx={{ minWidth: 0 }}>
                    {listening ? <MicOffIcon color="error" /> : <MicIcon color="primary" />}
                  </Button>
                )
              }}
            />
            {error && <Typography color="error">{error}</Typography>}
          </>
        ) : (
          <>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Found {items.length} Items</Typography>
            <List>
              {items.map((item, idx) => (
                <ListItem key={idx} button onClick={() => handleToggle(idx)}>
                  <Checkbox checked={selected[idx]} tabIndex={-1} disableRipple />
                  <ListItemText primary={item.name} secondary={item.category} />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </DialogContent>
      <DialogActions>
        {items.length === 0 ? (
          <Button onClick={handleCancel}>Cancel</Button>
        ) : (
          <Button onClick={handleCancel}>Clear</Button>
        )}
        {items.length === 0 ? (
          <Button onClick={handleProcess} disabled={loading || !input.trim()} variant="contained">
            {loading ? <CircularProgress size={20} /> : 'Process Items'}
          </Button>
        ) : (
          <Button onClick={handleAdd} variant="contained" disabled={selected.every(s => !s)}>
            Add {selected.filter(Boolean).length} Items
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default GenAIAddItemsModal;