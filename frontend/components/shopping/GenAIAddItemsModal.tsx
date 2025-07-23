import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Checkbox, List, ListItem, ListItemText, CircularProgress, Typography } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import { generateItemsFromApi, sendAudioMessage } from '../../src/services/api';
import { UNIT_OPTIONS } from '../../constants';

interface GenAIAddItemsModalProps {
  open: boolean;
  onClose: () => void;
  onAddItems: (items: { name: string; category: string }[]) => void;
  token: string;
}

const GenAIAddItemsModal: React.FC<GenAIAddItemsModalProps> = ({ open, onClose, onAddItems, token }) => {
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [items, setItems] = useState<{ name: string; category: string }[]>([]);
  const [selected, setSelected] = useState<boolean[]>([]);
  const [error, setError] = useState<string>('');
  const [recording, setRecording] = useState<boolean>(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [amounts, setAmounts] = useState<number[]>([]);
  const [units, setUnits] = useState<string[]>([]);

  // Voice input logic (MediaRecorder)
  const handleVoiceInput = async () => {
    if (recording) {
      if (mediaRecorder) mediaRecorder.stop();
      setRecording(false);
      return;
    }
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      setError('Audio recording is not supported in this browser.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new window.MediaRecorder(stream);
      setMediaRecorder(recorder);
      setAudioChunks([]);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) setAudioChunks((prev) => [...prev, e.data]);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        setRecording(false);
        if (audioChunks.length === 0) return;
        setUploading(true);
        try {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          const response = await sendAudioMessage(token, audioBlob);
          if (response && response.message) {
            setInput(response.message);
          }
        } catch (err) {
          setError('Failed to process audio.');
        } finally {
          setUploading(false);
          setAudioChunks([]);
        }
      };
      recorder.start();
      setRecording(true);
    } catch (err) {
      setError('Could not access microphone.');
    }
  };

  const handleProcess = async () => {
    setLoading(true);
    setError('');
    if (!token) {
      setError('You must be logged in to use this feature. Please log in and try again.');
      setLoading(false);
      return;
    }
    try {
      // Try to support amount/units if returned by API, else fallback
      const result: { name: string; category: string; amount?: number; units?: string }[] = await generateItemsFromApi(token, input);
      setItems(result);
      setSelected(result.map(() => true));
      setAmounts(result.map(item => item.amount ?? 1));
      setUnits(result.map(item => item.units ?? 'pcs'));
    } catch (e: any) {
      if (e && e.status === 401) {
        setError('Session expired or unauthorized. Please log in again.');
      } else {
        setError('Failed to parse items.');
      }
    }
    setLoading(false);
  };

  const handleClear = () => {
    setItems([]);
    setSelected([]);
    setAmounts([]);
    setUnits([]);
    setError('');
  };

  const handleAmountChange = (idx: number, value: number) => {
    setAmounts(arr => arr.map((v, i) => (i === idx ? value : v)));
  };
  const handleUnitChange = (idx: number, value: string) => {
    setUnits(arr => arr.map((v, i) => (i === idx ? value : v)));
  };

  const handleToggle = (idx: number) => {
    setSelected(sel => sel.map((v, i) => (i === idx ? !v : v)));
  };

  // Add handler for select/deselect all
  const handleSelectAll = (checked: boolean) => {
    setSelected(selected => selected.map(() => checked));
  };

  const handleAdd = () => {
    const selectedItems = items
      .map((item, i) => selected[i] ? {
        name: item.name,
        category: item.category,
        amount: amounts[i],
        units: units[i],
      } : null)
      .filter(Boolean) as { name: string; category: string; amount: number; units: string }[];
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
                  <Button onClick={handleVoiceInput} sx={{ minWidth: 0 }} disabled={uploading}>
                    {recording ? <MicOffIcon color="error" /> : <MicIcon color="primary" />}
                  </Button>
                )
              }}
            />
            {error && <Typography color="error">{error}</Typography>}
          </>
        ) : (
          <>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Found {items.length} Items</Typography>
            {/* Select/Deselect All Checkbox */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <Checkbox
                indeterminate={selected.some(s => s) && !selected.every(s => s)}
                checked={selected.length > 0 && selected.every(s => s)}
                onChange={e => handleSelectAll(e.target.checked)}
                inputProps={{ 'aria-label': 'Select/Deselect All Items' }}
              />
              <Typography variant="body2">Select/Deselect All</Typography>
            </div>
            <List>
              {items.map((item, idx) => (
                <ListItem key={idx} button onClick={() => handleToggle(idx)} alignItems="flex-start">
                  <Checkbox checked={selected[idx]} tabIndex={-1} disableRipple />
                  <ListItemText primary={item.name} secondary={item.category} />
                  <TextField
                    type="number"
                    label="Amount"
                    value={amounts[idx]}
                    onChange={e => handleAmountChange(idx, Math.max(1, parseInt(e.target.value) || 1))}
                    size="small"
                    sx={{ width: 80, mr: 1 }}
                    inputProps={{ min: 1 }}
                  />
                  <TextField
                    select
                    label="Unit"
                    value={units[idx]}
                    onChange={e => handleUnitChange(idx, e.target.value)}
                    size="small"
                    sx={{ width: 100 }}
                    SelectProps={{ native: true }}
                  >
                    {UNIT_OPTIONS.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </TextField>
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
          <Button onClick={handleClear}>Clear</Button>
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