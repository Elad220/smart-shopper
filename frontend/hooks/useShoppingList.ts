import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react';
import * as api from '../src/services/api';
import { ShoppingItem } from '../types';

export interface UseShoppingListReturn {
  selectedListId: string | null;
  setSelectedListId: Dispatch<SetStateAction<string | null>>;
  items: ShoppingItem[];
  currentListName: string;
  isLoading: boolean;
  error: string | null;
  addItem: (itemData: Omit<ShoppingItem, 'id' | 'completed'>) => Promise<ShoppingItem>;
  updateItem: (id: string, updates: Partial<ShoppingItem>) => Promise<ShoppingItem>;
  deleteItem: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<ShoppingItem | undefined>;
  clearCompleted: () => Promise<void>;
}

export const useShoppingList = (token: string, listId?: string | null): UseShoppingListReturn => {
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

  /* ----------------------------------
   * Helpers
   * ----------------------------------*/

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

  const fetchShoppingList = useCallback(async () => {
    if (!token || !selectedListId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const lists = await api.fetchShoppingLists(token);
      const currentList = lists.find(list => list._id === selectedListId);

      // If the stored selectedListId no longer exists (e.g. list deleted from another device),
      // gracefully fall back to the user's first list (or create one).
      if (!currentList) {
        if (lists.length > 0) {
          const fallbackId = lists[0]._id;
          setSelectedListId(fallbackId);
          localStorage.setItem('selectedListId', fallbackId);
          // Exit early – a new effect run will fetch items for the fallback list
          return;
        } else {
          // No lists at all – create a default one, then exit. The subsequent effect
          // triggered by setSelectedListId inside initializeList will fetch its items.
          await initializeList();
          return;
        }
      }

      // We have a valid list – update the name and load items
      setCurrentListName(currentList.name);

      // Fetch list items
      const list = await api.fetchShoppingList(token, selectedListId);
      setItems(list || []);
    } catch (err: any) {
      // If fetching the list itself failed (e.g. 404 because it was deleted),
      // attempt the same graceful fallback as above.
      console.error('Failed to fetch shopping list – trying fallback', err);
      setError(null);
      try {
        await initializeList();
      } catch (initErr: any) {
        setError(initErr.message || 'Failed to initialize shopping list');
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, selectedListId, initializeList]);

  useEffect(() => {
    if (token) {
      if (selectedListId) {
        fetchShoppingList();
      } else {
        initializeList();
      }

      const handleFlushed = () => {
        fetchShoppingList();
      };
      window.addEventListener('offlineSyncFlushed', handleFlushed);

      return () => {
        window.removeEventListener('offlineSyncFlushed', handleFlushed);
      };
    }
  }, [token, selectedListId, fetchShoppingList, initializeList]);

  const addItem = useCallback(async (itemData: Omit<ShoppingItem, 'id' | 'completed'>) => {
    if (!token || !selectedListId) throw new Error('Authentication required');
    
    console.log(' Hook:', itemData.imageUrl ? '✅ Has image' : '❌ No image');
    
    const newItem = await api.addShoppingItem(token, selectedListId, itemData);
    
    console.log(' Hook result:', newItem.imageUrl ? '✅ API returned image' : '❌ API lost image');
    
    setItems(prev => [...prev, newItem].sort((a, b) => a.name.localeCompare(b.name)));
    return newItem;
  }, [token, selectedListId]);

  const updateItem = useCallback(async (id: string, updates: Partial<ShoppingItem>) => {
    if (!token || !selectedListId) throw new Error('Authentication required');

    // Optimistically update UI immediately (shallow merge preserves all fields)
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));

    try {
      await api.updateShoppingItem(token, selectedListId, id, updates);
      // On success, server will eventually send fresh data; no extra state change needed.
    } catch (error) {
      // Offline – request is queued; optimistic state already applied.
      console.warn('Queued updateItem while offline:', error);
    }

    // Return the merged item for API consistency (no await needed)
    const existing = items.find(i => i.id === id);
    return { ...(existing ?? {} as ShoppingItem), ...updates } as ShoppingItem;
  }, [token, selectedListId, items]);

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
    selectedListId,
    setSelectedListId,
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