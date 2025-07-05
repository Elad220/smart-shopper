import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  Avatar,
  Stack,
  Paper,
  CircularProgress,
  useTheme,
  alpha,
} from '@mui/material';
import { User, Key, Shield, Info } from 'lucide-react';
import { User as UserType } from '../../hooks/useAuth';
import { saveApiKey, removeApiKey, checkApiKeyStatus } from '../../src/services/api';

interface SettingsPageProps {
  user: UserType;
}

const API_KEY_PLACEHOLDER = '••••••••••••••••••••••••••••••••••••••••';

const SettingsPage: React.FC<SettingsPageProps> = ({ user }) => {
  const theme = useTheme();
  const [apiKey, setApiKey] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchApiKeyStatus = async () => {
      try {
        const { hasApiKey: keyExists } = await checkApiKeyStatus(user.token);
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

    fetchApiKeyStatus();
  }, [user.token]);

  const handleSaveApiKey = async () => {
    if (!apiKey.trim() || apiKey === API_KEY_PLACEHOLDER) {
      setError("API Key cannot be empty.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await saveApiKey(user.token, apiKey);
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
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await removeApiKey(user.token);
      setSuccess("API Key removed successfully!");
      setHasApiKey(false);
      setApiKey('');
    } catch (err: any) {
      setError(err.message || "Failed to remove API key.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApiKeyFocus = () => {
    if (apiKey === API_KEY_PLACEHOLDER) {
      setApiKey('');
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account settings and preferences
        </Typography>
      </Box>

      <Stack spacing={3}>
        {/* User Information */}
        <Card 
          sx={{ 
            borderRadius: '16px',
            border: `1px solid ${theme.palette.divider}`,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}08, ${theme.palette.secondary.main}08)`,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <User size={24} color={theme.palette.primary.main} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                User Information
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Avatar 
                sx={{ 
                  width: 80, 
                  height: 80,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  fontSize: '2rem',
                  fontWeight: 700,
                }}
              >
                {(user.username || user.email.split('@')[0]).charAt(0).toUpperCase()}
              </Avatar>
              
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {user.username || user.email.split('@')[0]}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {user.email}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  User ID: {user.id}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* API Key Management */}
        <Card 
          sx={{ 
            borderRadius: '16px',
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Key size={24} color={theme.palette.primary.main} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Smart Assistant API Key
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              {isCheckingStatus ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2">
                    Checking API key status...
                  </Typography>
                </Box>
              ) : hasApiKey ? (
                <Alert 
                  severity="success" 
                  sx={{ 
                    borderRadius: '8px',
                    border: `1px solid ${theme.palette.success.main}30`,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Shield size={16} />
                    <Typography variant="body2">
                      API key is configured and ready for use
                    </Typography>
                  </Box>
                </Alert>
              ) : (
                <Alert 
                  severity="info"
                  sx={{ 
                    borderRadius: '8px',
                    border: `1px solid ${theme.palette.info.main}30`,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Info size={16} />
                    <Typography variant="body2">
                      No API key found. Enter your Gemini API key to use the Smart Assistant.
                    </Typography>
                  </Box>
                </Alert>
              )}
            </Box>

            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                mb: 3,
                background: alpha(theme.palette.background.paper, 0.6),
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: '8px',
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Your Gemini API key is stored securely and encrypted. It's only used to generate shopping list suggestions through the Smart Assistant feature.
              </Typography>
              
              <TextField
                fullWidth
                label="Gemini API Key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onFocus={handleApiKeyFocus}
                disabled={isLoading}
                placeholder={hasApiKey ? "" : "Enter your Gemini API Key"}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  },
                }}
              />

              <Stack direction="row" spacing={2}>
                <Button
                  onClick={handleSaveApiKey}
                  variant="contained"
                  disabled={isLoading}
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  }}
                >
                  {isLoading ? 'Saving...' : 'Save API Key'}
                </Button>
                
                <Button
                  onClick={handleRemoveApiKey}
                  variant="outlined"
                  color="error"
                  disabled={isLoading || !hasApiKey}
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                  }}
                >
                  Remove Key
                </Button>
              </Stack>
            </Paper>

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  borderRadius: '8px',
                  border: `1px solid ${theme.palette.error.main}30`,
                }}
              >
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert 
                severity="success" 
                sx={{ 
                  borderRadius: '8px',
                  border: `1px solid ${theme.palette.success.main}30`,
                }}
              >
                {success}
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Additional Settings Card - Placeholder for future features */}
        <Card 
          sx={{ 
            borderRadius: '16px',
            border: `1px solid ${theme.palette.divider}`,
            opacity: 0.7,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Shield size={24} color={theme.palette.text.secondary} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
                Additional Settings
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              More settings and preferences will be available in future updates.
            </Typography>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
};

export default SettingsPage;