import { useState, useEffect, useCallback } from 'react';
import * as api from '../src/services/api';
import { ShoppingItem } from '../types';

export const useShoppingList = (token: string, listId?: string | null) => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [currentListName, setCurrentListName] = useState<string>('My Shopping List');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedListId, setSelectedListId] = useState<string | null>(
    listId || (token ? localStorage.getItem('selectedListId') : null)
  );
  const [hasInitialized, setHasInitialized] = useState(false);

  // Update selectedListId when listId prop changes
  useEffect(() => {
    if (listId !== undefined) {
      setSelectedListId(listId);
    }
  }, [listId]);

  // Clear stale localStorage data when token becomes available
  useEffect(() => {
    if (token && !selectedListId) {
      // Clear any stale localStorage data when we have a token but no selectedListId
      const storedListId = localStorage.getItem('selectedListId');
      if (storedListId) {
        console.log('🧹 Clearing potentially stale selectedListId from localStorage');
        localStorage.removeItem('selectedListId');
      }
    }
  }, [token, selectedListId]);

  const initializeList = useCallback(async () => {
    if (!token) {
      console.log('❌ No token available for initialization');
      return;
    }
    
    console.log('🔄 Initializing shopping list with token:', token.substring(0, 10) + '...');
    setIsLoading(true);
    setError(null);
    try {
      // First, try to get the user's last used list
      let lastUsedList = null;
      try {
        const lastUsedResponse = await api.getLastUsedList(token);
        lastUsedList = lastUsedResponse.lastUsedList;
        console.log('📋 Last used list found:', lastUsedList ? lastUsedList.name : 'none');
      } catch (error) {
        console.log('⚠️ Could not fetch last used list, will use first available list');
      }

      // Get all available lists
      const lists = await api.fetchShoppingLists(token);
      console.log('📋 Found lists:', lists.length);
      
      let targetListId: string;
      
      if (lists.length > 0) {
        // If we have a last used list, check if it still exists and is accessible
        if (lastUsedList) {
          const lastUsedListExists = lists.find(list => list._id === lastUsedList._id);
          if (lastUsedListExists) {
            targetListId = lastUsedList._id;
            setCurrentListName(lastUsedList.name);
            console.log('✅ Using last used list:', lastUsedList.name, 'with ID:', targetListId);
          } else {
            // Last used list no longer exists, use first available list
            targetListId = lists[0]._id;
            setCurrentListName(lists[0].name);
            console.log('✅ Last used list no longer accessible, using first list:', lists[0].name, 'with ID:', targetListId);
          }
        } else {
          // No last used list, use first available list
          targetListId = lists[0]._id;
          setCurrentListName(lists[0].name);
          console.log('✅ Using first available list:', lists[0].name, 'with ID:', targetListId);
        }
      } else {
        // Create a default list if none exists
        console.log('📝 Creating default list...');
        const newList = await api.createShoppingList(token, 'My Shopping List');
        targetListId = newList._id;
        setCurrentListName(newList.name);
        console.log('✅ Created default list:', newList.name, 'with ID:', targetListId);
      }
      
      setSelectedListId(targetListId);
      localStorage.setItem('selectedListId', targetListId);
      console.log('💾 Saved selectedListId:', targetListId);
      
      // Update the last used list in the backend
      try {
        await api.updateLastUsedList(token, targetListId);
        console.log('💾 Updated last used list in backend');
      } catch (error) {
        console.log('⚠️ Could not update last used list in backend');
      }
      
      // Fetch items for the selected list
      const items = await api.fetchShoppingList(token, targetListId);
      setItems(items || []);
      console.log('📦 Loaded items:', items?.length || 0);
    } catch (err: any) {
      console.error('❌ Error initializing shopping list:', err);
      setError(err.message || 'Failed to initialize shopping list');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const fetchShoppingList = useCallback(async () => {
    if (!token || !selectedListId) return;
    
    console.log('🔄 fetchShoppingList called with:', { selectedListId, tokenPreview: token.substring(0, 10) + '...' });
    setIsLoading(true);
    setError(null);
    try {
      // Fetch list details to get the name
      console.log('📋 Fetching all lists to find current list...');
      const lists = await api.fetchShoppingLists(token);
      const currentList = lists.find(list => list._id === selectedListId);
      
      console.log('📋 Current list found:', currentList ? currentList.name : 'NOT FOUND');
      
      // If the selected list doesn't exist, fall back to initialization
      if (!currentList) {
        console.log('❌ Selected list not found, falling back to initialization');
        setSelectedListId(null);
        localStorage.removeItem('selectedListId');
        // Trigger initialization by setting selectedListId to null
        // This will cause the main effect to run again
        return;
      }
      
      setCurrentListName(currentList.name);
      console.log('✅ Set current list name to:', currentList.name);
      
      // Fetch list items
      console.log('📦 Fetching items for list:', selectedListId);
      const list = await api.fetchShoppingList(token, selectedListId);
      console.log('📦 API returned items:', list ? list.length : 'null/undefined');
      setItems(list || []);
      console.log('✅ Set items state to:', list ? list.length : 0, 'items');
    } catch (err: any) {
      console.error('❌ Error fetching shopping list:', err);
      // If there's an error fetching the list, it might not exist
      // Fall back to initialization
      setSelectedListId(null);
      localStorage.removeItem('selectedListId');
      // Trigger initialization by setting selectedListId to null
      // This will cause the main effect to run again
    } finally {
      setIsLoading(false);
    }
  }, [token, selectedListId]);

  // Main effect to handle initialization and fetching
  useEffect(() => {
    console.log('🔄 Main effect triggered:', { 
      hasToken: !!token, 
      selectedListId, 
      hasInitialized,
      tokenPreview: token ? token.substring(0, 10) + '...' : 'none' 
    });
    
    if (!token) {
      console.log('❌ No token, skipping initialization');
      return;
    }
    
    // If we haven't initialized yet, always check for last used list
    if (!hasInitialized) {
      console.log('🔄 First time initialization, checking for last used list...');
      setHasInitialized(true);
      initializeList();
    } else if (selectedListId) {
      console.log('📋 Fetching existing list:', selectedListId);
      fetchShoppingList();
    } else {
      console.log('🔄 Re-initializing shopping list...');
      initializeList();
    }
  }, [token, selectedListId, hasInitialized, initializeList, fetchShoppingList]);

  const addItem = useCallback(async (itemData: Omit<ShoppingItem, 'id' | 'completed'>) => {
    if (!token || !selectedListId) throw new Error('Authentication required');
    
    console.log('🔄 Hook:', itemData.imageUrl ? '✅ Has image' : '❌ No image');
    
    const newItem = await api.addShoppingItem(token, selectedListId, itemData);
    
    console.log('💾 Hook result:', newItem.imageUrl ? '✅ API returned image' : '❌ API lost image');
    
    setItems(prev => [...prev, newItem].sort((a, b) => a.name.localeCompare(b.name)));
    return newItem;
  }, [token, selectedListId]);

  const updateItem = useCallback(async (id: string, updates: Partial<ShoppingItem>) => {
    if (!token || !selectedListId) throw new Error('Authentication required');
    
    const updatedItem = await api.updateShoppingItem(token, selectedListId, id, updates);
    setItems(prev => prev.map(item => item.id === id ? updatedItem : item));
    return updatedItem;
  }, [token, selectedListId]);

  const deleteItem = useCallback(async (id: string) => {
    if (!token || !selectedListId) throw new Error('Authentication required');
    
    await api.deleteShoppingItem(token, selectedListId, id);
    setItems(prev => prev.filter(item => item.id !== id));
  }, [token, selectedListId]);

  const toggleComplete = useCallback(async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    
    return updateItem(id, { completed: !item.completed });
  }, [items, updateItem]);

  const clearCompleted = useCallback(async () => {
    if (!token || !selectedListId) throw new Error('Authentication required');
    
    await api.deleteCheckedItems(token, selectedListId);
    setItems(prev => prev.filter(item => !item.completed));
  }, [token, selectedListId]);

  const reset = useCallback(() => {
    setItems([]);
    setCurrentListName('My Shopping List');
    setSelectedListId(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    items,
    currentListName,
    isLoading,
    error,
    addItem,
    updateItem,
    deleteItem,
    toggleComplete,
    clearCompleted,
    selectedListId,
    setSelectedListId
  };
};