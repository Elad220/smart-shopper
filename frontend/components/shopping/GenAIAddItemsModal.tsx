import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Checkbox, List, ListItem, ListItemText, ListItemSecondaryAction, CircularProgress, Box, Typography } from '@mui/material';
import { generateItemsFromApi } from '../../src/services/api';

const GenAIAddItemsModal = ({ open, onClose, onAddItems, token, categories }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState('');

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