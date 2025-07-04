import { useState, useEffect, useCallback } from 'react';
import * as api from '../src/services/api';
import { ShoppingItem } from '../types';

export const useShoppingList = (token: string, listId?: string | null) => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [currentListName, setCurrentListName] = useState<string>('My Shopping List');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedListId, setSelectedListId] = useState<string | null>(
    listId || localStorage.getItem('selectedListId')
  );

  // Update selectedListId when listId prop changes
  useEffect(() => {
    if (listId !== undefined) {
      setSelectedListId(listId);
    }
  }, [listId]);

  const fetchShoppingList = useCallback(async () => {
    if (!token || !selectedListId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      // Fetch list details to get the name
      const lists = await api.fetchShoppingLists(token);
      const currentList = lists.find(list => list._id === selectedListId);
      
      if (!currentList) {
        // Selected list doesn't exist, clear it and initialize a new one
        setSelectedListId(null);
        localStorage.removeItem('selectedListId');
        setError('Selected list no longer exists');
        return;
      }
      
      setCurrentListName(currentList.name);
      
      // Fetch list items
      const list = await api.fetchShoppingList(token, selectedListId);
      setItems(list || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch shopping list');
    } finally {
      setIsLoading(false);
    }
  }, [token, selectedListId]);

  const initializeList = useCallback(async () => {
    if (!token) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const lists = await api.fetchShoppingLists(token);
      if (lists.length > 0) {
        const listId = lists[0]._id;
        setSelectedListId(listId);
        localStorage.setItem('selectedListId', listId);
      } else {
        // Create a default list if none exists
        const newList = await api.createShoppingList(token, 'My Shopping List');
        setSelectedListId(newList._id);
        localStorage.setItem('selectedListId', newList._id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initialize shopping list');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      if (selectedListId) {
        fetchShoppingList();
      } else {
        initializeList();
      }
    }
  }, [token, selectedListId, fetchShoppingList, initializeList]);

  const addItem = useCallback(async (itemData: Omit<ShoppingItem, 'id' | 'completed'>) => {
    if (!token || !selectedListId) throw new Error('Authentication required');
    
    console.log('� Hook:', itemData.imageUrl ? '✅ Has image' : '❌ No image');
    
    const newItem = await api.addShoppingItem(token, selectedListId, itemData);
    
    console.log('� Hook result:', newItem.imageUrl ? '✅ API returned image' : '❌ API lost image');
    
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
  };
};