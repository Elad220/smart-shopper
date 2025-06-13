import { ShoppingItem, Category } from '../../types';

// Get the hostname from the current window location
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // If accessing from localhost, use localhost:3001
    // Otherwise, use the same hostname with port 3001
    return hostname === 'localhost' || hostname === '127.0.0.1'
      ? 'http://localhost:3001'
      : `http://${hostname}:3001`;
  }
  return 'http://localhost:3001'; // Fallback for SSR
};

export const BASE_URL = getBaseUrl();

interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  message?: string; // For registration success message
}

interface ApiErrorData {
    message?: string;
    error?: string; // Common alternative for error messages
    errors?: Array<{msg: string}>; // For validation errors from some backends
}

// New interfaces for shopping lists
interface ShoppingList {
  _id: string;
  name: string;
  items: ShoppingItem[];
  createdAt: string;
  updatedAt: string;
}

interface CreateListResponse {
  _id: string;
  name: string;
  items: string[];
  createdAt: string;
  updatedAt: string;
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  const contentType = response.headers.get("content-type");
  let data: any;

  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    // If not JSON, attempt to read as text (e.g., for 204 No Content or plain text errors)
    data = await response.text(); 
  }

  if (!response.ok) {
    let errorMessage = `API Error: ${response.status} ${response.statusText || ''}`;
    if (data) {
        if (typeof data === 'string') {
            errorMessage = data;
        } else {
            const errorData = data as ApiErrorData;
            if (errorData.message) errorMessage = errorData.message;
            else if (errorData.error) errorMessage = errorData.error;
            else if (errorData.errors && errorData.errors.length > 0) errorMessage = errorData.errors[0].msg;
            else if (typeof data === 'object') errorMessage = JSON.stringify(data);
        }
    }
    const error: any = new Error(errorMessage);
    error.status = response.status;
    error.data = data; // Attach full data for further inspection if needed
    throw error;
  }
  return data as T;
};

// Authentication
export const registerUser = async (username: string, email: string, password: string): Promise<AuthResponse> => {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  return handleResponse<AuthResponse>(response);
};

export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<AuthResponse>(response);
};

export const loginUserFlexible = async (payload: { email?: string; username?: string; password: string }): Promise<AuthResponse> => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<AuthResponse>(response);
};

// Shopping Lists
export const fetchShoppingLists = async (token: string): Promise<ShoppingList[]> => {
  const response = await fetch(`${BASE_URL}/api/shopping-lists`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return handleResponse<ShoppingList[]>(response);
};

export const createShoppingList = async (token: string, name: string): Promise<CreateListResponse> => {
  const response = await fetch(`${BASE_URL}/api/shopping-lists`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });
  return handleResponse<CreateListResponse>(response);
};

export const updateShoppingList = async (token: string, listId: string, name: string): Promise<ShoppingList> => {
  const response = await fetch(`${BASE_URL}/api/shopping-lists/${listId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });
  return handleResponse<ShoppingList>(response);
};

export const deleteShoppingList = async (token: string, listId: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/api/shopping-lists/${listId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  await handleResponse<void>(response);
};

// Shopping Items
export const fetchShoppingList = async (token: string, listId: string): Promise<ShoppingItem[]> => {
  const response = await fetch(`${BASE_URL}/api/shopping-lists/${listId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const list = await handleResponse<ShoppingList>(response);
  return list.items;
};

export const addShoppingItem = async (
  token: string,
  listId: string,
  itemData: Omit<ShoppingItem, 'id' | 'isCompleted'>
): Promise<ShoppingItem> => {
  const response = await fetch(`${BASE_URL}/api/shopping-lists/${listId}/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(itemData),
  });
  return handleResponse<ShoppingItem>(response);
};

export const updateShoppingItem = async (
  token: string,
  listId: string,
  itemId: string,
  itemData: Partial<Omit<ShoppingItem, 'id'>> // Cannot update ID
): Promise<ShoppingItem> => {
  const response = await fetch(`${BASE_URL}/api/shopping-lists/${listId}/items/${itemId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(itemData),
  });
  return handleResponse<ShoppingItem>(response);
};

export const deleteShoppingItem = async (token: string, listId: string, itemId: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/api/shopping-lists/${listId}/items/${itemId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  await handleResponse<void>(response);
};

export const deleteCheckedItems = async (token: string, listId: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/api/shopping-lists/${listId}/items/delete-checked`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  await handleResponse<void>(response);
};

export const deleteCategoryItems = async (token: string, listId: string, categoryName: Category): Promise<void> => {
  const response = await fetch(`${BASE_URL}/api/shopping-lists/${listId}/items/delete-category`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ categoryName }),
  });
  await handleResponse<void>(response);
};
