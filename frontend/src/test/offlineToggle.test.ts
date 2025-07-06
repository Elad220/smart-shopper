import { describe, it, expect, vi, beforeEach } from 'vitest';

import localforage from 'localforage';
import '../services/offlineSync';

const listId = 'abc123';
const BASE = 'http://localhost:3001';
const listUrl = `${BASE}/api/shopping-lists/${listId}`;
const itemId = 'item1';

const sampleList = {
  _id: listId,
  name: 'Test',
  items: [
    { id: itemId, name: 'Milk', completed: false, category: 'Dairy', units: 'pcs', amount: 1, priority: 'Medium', notes: '' },
  ],
  createdAt: '',
  updatedAt: ''
};

describe('offline toggle flow', () => {
  beforeEach(async () => {
    await localforage.clear();
    // seed cache with list
    await localforage.setItem(`cache:${listUrl}`, sampleList);
    // offline
    Object.defineProperty(navigator, 'onLine', { get: () => false, configurable: true });
  });

  it('keeps item visible after offline toggle and updates cache', async () => {
    // Mock fetch for PUT (should queue, optimistic)
    const fetchMock = vi.fn();
    globalThis.fetch = fetchMock;

    // Call PUT toggle completed
    await fetch(`${BASE}/api/shopping-lists/${listId}/items/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: true })
    });

    // Check cache updated
    const cachedAfter = await localforage.getItem<any>(`cache:${listUrl}`);
    expect(cachedAfter.items[0].completed).toBe(true);
  });
});