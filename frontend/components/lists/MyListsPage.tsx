import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
} from '@mui/material';
import { Plus, List } from 'lucide-react';
import { User as UserType } from '../../hooks/useAuth';
import { ShoppingListManager } from '../ShoppingListManager';
import { createShoppingList } from '../../src/services/api';
import toast from 'react-hot-toast';

interface MyListsPageProps {
  user: UserType;
  selectedListId: string | null;
  onListSelect: (listId: string) => void;
  onDataChange: () => void;
  onNavigateToList: () => void;
}

const MyListsPage: React.FC<MyListsPageProps> = ({ 
  user, 
  selectedListId, 
  onListSelect, 
  onDataChange,
  onNavigateToList
}) => {
  const theme = useTheme();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [listRefreshKey, setListRefreshKey] = useState(0);

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      toast.error('Please enter a list name');
      return;
    }

    setIsCreatingList(true);
    try {
      const newList = await createShoppingList(user.token, newListName.trim());
      onListSelect(newList._id);
      localStorage.setItem('selectedListId', newList._id);
      setIsCreateDialogOpen(false);
      setNewListName('');
      setListRefreshKey((prev: number) => prev + 1);
      onDataChange();
      toast.success(`Created "${newListName}" successfully! ✅`);
      // Navigate to the new list after a short delay
      setTimeout(() => {
        onNavigateToList();
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create shopping list');
    } finally {
      setIsCreatingList(false);
    }
  };

  const handleDataChange = () => {
    setListRefreshKey((prev: number) => prev + 1);
    onDataChange();
  };

  const handleListSelectAndNavigate = (listId: string) => {
    onListSelect(listId);
    // Small delay to ensure the list is selected before navigating
    setTimeout(() => {
      onNavigateToList();
    }, 100);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 8px 24px ${theme.palette.primary.main}40`,
            }}
          >
            <List size={24} color="white" />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              My Shopping Lists
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create, manage, and select your shopping lists. Click any list to start shopping!
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={() => setIsCreateDialogOpen(true)}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            px: 3,
            py: 1.5,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            boxShadow: `0 4px 16px ${theme.palette.primary.main}40`,
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
              transform: 'translateY(-1px)',
              boxShadow: `0 6px 20px ${theme.palette.primary.main}50`,
            },
            transition: 'all 0.2s ease',
          }}
        >
          Create New List
        </Button>
      </Box>

      <Card 
        sx={{ 
          borderRadius: '16px',
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.shadows[4],
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}>
            <ShoppingListManager
              key={listRefreshKey}
              token={user.token}
              selectedListId={selectedListId}
              onListSelect={handleListSelectAndNavigate}
              onDataChange={handleDataChange}
              onOpenCreateDialog={() => setIsCreateDialogOpen(true)}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Create Shopping List Dialog */}
      <Dialog 
        open={isCreateDialogOpen} 
        onClose={() => !isCreatingList && setIsCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            border: `1px solid ${theme.palette.divider}`,
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Create New Shopping List
          </Typography>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="List Name"
            fullWidth
            variant="outlined"
            value={newListName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewListName(e.target.value)}
            disabled={isCreatingList}
            onKeyPress={(e: React.KeyboardEvent) => {
              if (e.key === 'Enter' && !isCreatingList && newListName.trim()) {
                handleCreateList();
              }
            }}
            sx={{ 
              mt: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
              },
            }}
            placeholder="e.g., Weekly Groceries, Party Supplies..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setIsCreateDialogOpen(false)} 
            disabled={isCreatingList}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateList} 
            variant="contained" 
            disabled={isCreatingList || !newListName.trim()}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            }}
          >
            {isCreatingList ? 'Creating...' : 'Create List'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyListsPage;