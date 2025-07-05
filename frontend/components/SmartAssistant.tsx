// frontend/components/SmartAssistant.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  CircularProgress,
  Box,
  Typography,
  Paper,
  Alert,
  Stack,
  IconButton,
  Chip,
  Avatar,
  useTheme,
  alpha,
  Fab,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Send,
  X,
  Settings,
  Trash2,
  User,
  Bot,
  Sparkles,
  MessageCircle,
  MoreVertical,
  Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  sendChatMessage, 
  getChatHistory, 
  clearChatHistory, 
  checkApiKeyStatus,
  ChatMessage,
  UserPreferences
} from '../src/services/api';
import toast from 'react-hot-toast';
import PreferencesModal from './settings/PreferencesModal';

interface SmartAssistantProps {
  open: boolean;
  onClose: () => void;
  onAddItems?: (items: { name: string; category: string }[]) => void;
  token: string | null;
}

const SmartAssistant: React.FC<SmartAssistantProps> = ({ open, onClose, token }) => {
  const theme = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({});
  const [showPreferences, setShowPreferences] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history and check API key status
  useEffect(() => {
    if (open && token) {
      setError(null);
      setIsCheckingStatus(true);

      const initializeChat = async () => {
        try {
          // Check API key status
          const { hasApiKey: keyExists } = await checkApiKeyStatus(token);
          setHasApiKey(keyExists);

          if (keyExists) {
            // Load chat history
            const { chatHistory, preferences: userPrefs } = await getChatHistory(token);
            setMessages(chatHistory);
            setPreferences(userPrefs);
          }
        } catch (err: any) {
          setError("Could not load chat history.");
          console.error("Error initializing chat:", err);
        } finally {
          setIsCheckingStatus(false);
        }
      };

      initializeChat();
    }
  }, [open, token]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !token || !hasApiKey) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await sendChatMessage(token, userMessage.content);
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.message,
        timestamp: response.timestamp
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      setError(err.message || "Failed to send message.");
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = async () => {
    if (!token) return;

    try {
      await clearChatHistory(token);
      setMessages([]);
      toast.success("Chat history cleared!");
      setAnchorEl(null);
    } catch (err: any) {
      toast.error("Failed to clear chat history.");
    }
  };



  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderMessage = (message: ChatMessage, index: number) => {
    const isUser = message.role === 'user';
    
    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ marginBottom: '16px' }}
      >
        <Box sx={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
          <Box
            sx={{
              maxWidth: '70%',
              display: 'flex',
              flexDirection: isUser ? 'row-reverse' : 'row',
              alignItems: 'flex-start',
              gap: 1,
            }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: isUser 
                  ? theme.palette.primary.main 
                  : `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                color: 'white',
                fontSize: '14px',
              }}
            >
              {isUser ? <User size={16} /> : <Bot size={16} />}
            </Avatar>
            
            <Paper
              elevation={1}
              sx={{
                p: 2,
                borderRadius: '16px',
                backgroundColor: isUser 
                  ? alpha(theme.palette.primary.main, 0.1)
                  : alpha(theme.palette.background.paper, 0.8),
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                backdropFilter: 'blur(10px)',
                maxWidth: '100%',
                wordBreak: 'break-word',
              }}
            >
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {message.content}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ mt: 1, display: 'block' }}
              >
                {formatTime(message.timestamp)}
              </Typography>
            </Paper>
          </Box>
        </Box>
      </motion.div>
    );
  };

  const renderPreferences = () => (
    <Box sx={{ p: 2, backgroundColor: alpha(theme.palette.background.paper, 0.5), borderRadius: '12px', mb: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Info size={20} />
        Your Preferences
      </Typography>
      
      <Stack spacing={2}>
        {preferences.dietaryRestrictions && preferences.dietaryRestrictions.length > 0 && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Dietary Restrictions:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {preferences.dietaryRestrictions.map((restriction, index) => (
                <Chip key={index} label={restriction} size="small" />
              ))}
            </Box>
          </Box>
        )}
        
        {preferences.favoriteCuisines && preferences.favoriteCuisines.length > 0 && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Favorite Cuisines:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {preferences.favoriteCuisines.map((cuisine, index) => (
                <Chip key={index} label={cuisine} size="small" variant="outlined" />
              ))}
            </Box>
          </Box>
        )}
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {preferences.cookingSkillLevel && (
            <Chip 
              label={`Cooking: ${preferences.cookingSkillLevel}`} 
              size="small" 
              color="primary" 
            />
          )}
          {preferences.householdSize && (
            <Chip 
              label={`Household: ${preferences.householdSize} people`} 
              size="small" 
              color="secondary" 
            />
          )}
          {preferences.budgetPreference && (
            <Chip 
              label={`Budget: ${preferences.budgetPreference}`} 
              size="small" 
              color="info" 
            />
          )}
        </Box>
      </Stack>
    </Box>
  );

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
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
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            {/* Header */}
            <DialogTitle sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              pb: 1,
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
            }}>
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
                      boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
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
                      <Sparkles size={24} color="white" />
                    </motion.div>
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ 
                      fontWeight: 700, 
                      background: `linear-gradient(135deg, ${theme.palette.text.primary}, ${theme.palette.primary.main})`, 
                      backgroundClip: 'text', 
                      WebkitBackgroundClip: 'text' 
                    }}>
                      Smart Assistant
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.8 }}>
                      Your AI shopping companion
                    </Typography>
                  </Box>
                </Stack>
              </motion.div>
              
              <Stack direction="row" spacing={1}>
                <Tooltip title="Settings">
                  <IconButton 
                    onClick={() => setShowPreferencesModal(true)}
                    sx={{ color: theme.palette.primary.main }}
                  >
                    <Settings size={20} />
                  </IconButton>
                </Tooltip>
                
                <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                  <MoreVertical />
                </IconButton>
                
                <IconButton onClick={onClose}>
                  <X />
                </IconButton>
              </Stack>
            </DialogTitle>

            {/* Chat Content */}
            <DialogContent 
              dividers 
              sx={{ 
                flex: 1,
                overflowY: 'auto',
                maxHeight: 'calc(90vh - 200px)',
                p: 0,
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: alpha(theme.palette.background.paper, 0.1),
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.3),
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.5),
                  },
                },
              }}
            >
              <Box sx={{ p: 3 }}>
                {/* Status Messages */}
                {isCheckingStatus ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : !hasApiKey ? (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    No API key found. Please configure your API key in Settings to use the Smart Assistant.
                  </Alert>
                ) : error ? (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                ) : null}

                {/* Preferences Panel */}
                {showPreferences && Object.keys(preferences).length > 0 && renderPreferences()}

                {/* Welcome Message */}
                {messages.length === 0 && hasApiKey && !isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 4,
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      borderRadius: '16px',
                      mb: 3
                    }}>
                      <MessageCircle size={48} color={theme.palette.primary.main} style={{ marginBottom: '16px' }} />
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        Welcome to your Smart Assistant! 🤖
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Ask me anything about shopping, cooking, meal planning, or get personalized recommendations based on your preferences.
                      </Typography>
                      <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
                        <Chip 
                          label="What should I buy for dinner?" 
                          onClick={() => setInputMessage("What should I buy for dinner?")}
                          sx={{ cursor: 'pointer' }}
                        />
                        <Chip 
                          label="Help me plan meals" 
                          onClick={() => setInputMessage("Help me plan meals for the week")}
                          sx={{ cursor: 'pointer' }}
                        />
                        <Chip 
                          label="Shopping tips" 
                          onClick={() => setInputMessage("Give me some shopping tips")}
                          sx={{ cursor: 'pointer' }}
                        />
                      </Stack>
                    </Box>
                  </motion.div>
                )}

                {/* Chat Messages */}
                <Box sx={{ minHeight: '200px' }}>
                  {messages.map((message, index) => renderMessage(message, index))}
                  
                  {/* Loading indicator */}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ marginBottom: '16px' }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                              color: 'white',
                            }}
                          >
                            <Bot size={16} />
                          </Avatar>
                          <Paper
                            elevation={1}
                            sx={{
                              p: 2,
                              borderRadius: '16px',
                              backgroundColor: alpha(theme.palette.background.paper, 0.8),
                              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                              backdropFilter: 'blur(10px)',
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CircularProgress size={16} />
                              <Typography variant="body2" color="text.secondary">
                                Thinking...
                              </Typography>
                            </Box>
                          </Paper>
                        </Box>
                      </Box>
                    </motion.div>
                  )}
                </Box>
                
                <div ref={messagesEndRef} />
              </Box>
            </DialogContent>

            {/* Input Area */}
            <Box sx={{ p: 3, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <Stack direction="row" spacing={2} alignItems="flex-end">
                <TextField
                  ref={inputRef}
                  fullWidth
                  multiline
                  maxRows={4}
                  placeholder="Ask me anything about shopping, cooking, or meal planning..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading || !hasApiKey}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '16px',
                      backgroundColor: alpha(theme.palette.background.paper, 0.5),
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                      },
                      '&.Mui-focused': {
                        borderColor: theme.palette.primary.main,
                        boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.2)}`,
                      }
                    }
                  }}
                />
                <Fab
                  color="primary"
                  size="medium"
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading || !hasApiKey}
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                    }
                  }}
                >
                  <Send size={20} />
                </Fab>
              </Stack>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            backgroundColor: alpha(theme.palette.background.paper, 0.9),
          }
        }}
      >
        <MenuItem onClick={handleClearHistory}>
          <ListItemIcon>
            <Trash2 size={16} />
          </ListItemIcon>
          <ListItemText>Clear Chat History</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => setShowPreferences(!showPreferences)}>
          <ListItemIcon>
            <Settings size={16} />
          </ListItemIcon>
          <ListItemText>Toggle Preferences</ListItemText>
                 </MenuItem>
       </Menu>

       {/* Preferences Modal */}
       <PreferencesModal
         open={showPreferencesModal}
         onClose={() => setShowPreferencesModal(false)}
         token={token}
         currentPreferences={preferences}
         onPreferencesUpdate={setPreferences}
       />
     </Dialog>
   );
 };

export default SmartAssistant;