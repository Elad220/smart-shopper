import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, useTheme, Stack, Typography
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderPlus, X, Sparkles } from 'lucide-react';

interface NewCategoryModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (categoryName: string) => void;
}

const NewCategoryModal: React.FC<NewCategoryModalProps> = ({ open, onClose, onAdd }) => {
  const theme = useTheme();
  const [categoryName, setCategoryName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (categoryName.trim()) {
      onAdd(categoryName.trim());
      setCategoryName('');
      onClose();
    }
  };

  const handleClose = () => {
    setCategoryName('');
    onClose();
  };

  // Reset form when modal opens
  React.useEffect(() => {
    if (open) {
      setCategoryName('');
    }
  }, [open]);

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="xs"
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
            <DialogTitle sx={{ pb: 1 }}>
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
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 8px 24px ${theme.palette.primary.main}40`,
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
                      <FolderPlus size={24} color="white" />
                    </motion.div>
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, background: `linear-gradient(135deg, ${theme.palette.text.primary}, ${theme.palette.primary.main})`, backgroundClip: 'text', WebkitBackgroundClip: 'text' }}>
                      Add New Category
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.8 }}>
                      <Sparkles size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                      Create your custom category
                    </Typography>
                  </Box>
                </Stack>
              </motion.div>
            </DialogTitle>

            <form onSubmit={handleSubmit}>
              <DialogContent sx={{ px: 3, pb: 2 }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                    <TextField
                      fullWidth
                      label="Category Name"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      required
                      autoFocus
                      placeholder="e.g., Beverages, Snacks, Pet Supplies..."
                      sx={{ 
                        '& .MuiOutlinedInput-root': { 
                          borderRadius: '16px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          backdropFilter: 'blur(10px)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: 'rgba(255, 255, 255, 0.08)',
                            transform: 'translateY(-1px)',
                          },
                          '&.Mui-focused': {
                            background: 'rgba(255, 255, 255, 0.1)',
                            boxShadow: `0 0 20px ${theme.palette.primary.main}30`,
                          }
                        },
                        '& .MuiInputLabel-root': {
                          fontWeight: 500,
                        },
                        mt: 2,
                      }}
                    />
                  </motion.div>
                </motion.div>
              </DialogContent>

              <DialogActions sx={{ p: 3, pt: 2 }}>
                <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ flex: 1 }}>
                    <Button
                      onClick={handleClose}
                      startIcon={<X size={16} />}
                      sx={{
                        width: '100%',
                        borderRadius: '16px',
                        textTransform: 'none',
                        height: '48px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${theme.palette.divider}`,
                        color: theme.palette.text.primary,
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.1)',
                          transform: 'translateY(-1px)',
                        }
                      }}
                    >
                      Cancel
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ flex: 1 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={!categoryName.trim()}
                      startIcon={<FolderPlus size={16} />}
                      sx={{
                        width: '100%',
                        borderRadius: '16px',
                        textTransform: 'none',
                        height: '48px',
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        boxShadow: `0 8px 24px ${theme.palette.primary.main}40`,
                        '&:hover': {
                          background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                          boxShadow: `0 12px 32px ${theme.palette.primary.main}50`,
                          transform: 'translateY(-2px)',
                        },
                        '&:disabled': {
                          background: theme.palette.action.disabledBackground,
                          color: theme.palette.action.disabled,
                        }
                      }}
                    >
                      Add Category
                    </Button>
                  </motion.div>
                </Stack>
              </DialogActions>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  );
};

export default NewCategoryModal;