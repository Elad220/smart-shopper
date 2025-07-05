import { ShoppingItem, Category } from '../../types';

// Get the API URL from environment variable or fallback to localhost
const getBaseUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:3001';
};

export const BASE_URL = getBaseUrl();

// ... (keep all existing functions from the previous steps)

// Add the new removeApiKey function
export const removeApiKey = async (token: string): Promise<{ message: string }> => {
    const response = await fetch(`${BASE_URL}/api/user/api-key`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    return handleResponse<{ message: string }>(response);
};

// --- REST OF THE FILE ---
// (The rest of the file remains the same)

// Health check function to test backend connection
export const checkBackendHealth = async (): Promise<{ status: string, version?: string }> => {
  try {
    const response = await fetch(`${BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Backend health check failed:', error);
    throw error;
  }
};

interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  user?: {
    email?: string;
    [key: string]: any;
  };
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

// New functions for user API key and smart assistant
export const saveApiKey = async (token: string, apiKey: string): Promise<{ message: string }> => {
    const response = await fetch(`${BASE_URL}/api/user/api-key`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ apiKey }),
    });
    return handleResponse<{ message: string }>(response);
};

export const generateItemsFromApi = async (token: string, prompt: string): Promise<{ name: string, category: string }[]> => {
    const response = await fetch(`${BASE_URL}/api/smart-assistant/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt }),
    });
    return handleResponse<{ name: string, category: string }[]>(response);
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
  itemData: Omit<ShoppingItem, 'id' | 'completed'>
): Promise<ShoppingItem> => {
  
  // Debug: Log what we're sending to backend
  console.log('🖼️ API Debug - Sending to backend:', {
    hasImage: !!itemData.imageUrl,
    imageLength: itemData.imageUrl ? itemData.imageUrl.length : 0,
    imagePrefix: itemData.imageUrl ? itemData.imageUrl.substring(0, 50) : 'N/A',
    endpoint: `${BASE_URL}/api/shopping-lists/${listId}/items`,
    payload: { ...itemData, imageUrl: itemData.imageUrl ? '[IMAGE_DATA]' : undefined }
  });
  
  const response = await fetch(`${BASE_URL}/api/shopping-lists/${listId}/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(itemData),
  });
  
  const result = await handleResponse<ShoppingItem>(response);
  
  // Debug: Check what backend returned
  console.log('🖼️ API Debug - Backend response:', {
    hasImageUrl: !!result.imageUrl,
    hasImage: !!(result as any).image,
    imageUrlLength: result.imageUrl ? result.imageUrl.length : 0,
    imageLength: (result as any).image ? (result as any).image.length : 0,
    fullResult: { ...result, imageUrl: result.imageUrl ? '[IMAGE_DATA]' : undefined, image: (result as any).image ? '[IMAGE_DATA]' : undefined }
  });
  
  return result;
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
  console.log('Sending delete category request:', { listId, categoryName });
  const response = await fetch(`${BASE_URL}/api/shopping-lists/${listId}/items/delete-category`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ categoryName }),
  });
  
  console.log('Delete category response status:', response.status);
  const responseData = await response.json().catch(() => null);
  console.log('Delete category response data:', responseData);
  
  if (!response.ok) {
    const errorMessage = responseData?.message || 'Failed to delete category items';
    console.error('Delete category error:', { status: response.status, message: errorMessage });
    throw new Error(errorMessage);
  }
  
  if (responseData && responseData.message) {
    console.log('Delete category success:', responseData.message);
  }
};

export const fetchUserCategories = async (token: string): Promise<string[]> => {
  const response = await fetch(`${BASE_URL}/api/items/categories`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return handleResponse<string[]>(response);
};

export const deleteUserCategory = async (token: string, categoryName: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/api/items/categories/${encodeURIComponent(categoryName)}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  await handleResponse<void>(response);
};

export const exportShoppingList = async (token: string, listId: string): Promise<ShoppingItem[]> => {
  const response = await fetch(`${BASE_URL}/api/shopping-lists/${listId}/export`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return handleResponse<ShoppingItem[]>(response);
};
// New function to check API key status
export const checkApiKeyStatus = async (token: string): Promise<{ hasApiKey: boolean }> => {
  const response = await fetch(`${BASE_URL}/api/user/api-key/status`, {
      method: 'GET',
      headers: {
          'Authorization': `Bearer ${token}`,
      },
  });
  return handleResponse<{ hasApiKey: boolean }>(response);
};

export const importShoppingList = async (token: string, listId: string, items: Omit<ShoppingItem, 'id'>[]): Promise<ShoppingItem[]> => {
  const response = await fetch(`${BASE_URL}/api/shopping-lists/${listId}/import`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ items }),
  });
  return handleResponse<ShoppingItem[]>(response);
};

// Sharing functionality
export const shareShoppingList = async (token: string, listId: string, email: string, permission: 'read' | 'write' = 'read'): Promise<{ message: string; sharedWith: any[] }> => {
  const response = await fetch(`${BASE_URL}/api/shopping-lists/${listId}/share`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ email, permission }),
  });
  return handleResponse<{ message: string; sharedWith: any[] }>(response);
};

export const unshareShoppingList = async (token: string, listId: string, userId: string): Promise<{ message: string }> => {
  const response = await fetch(`${BASE_URL}/api/shopping-lists/${listId}/unshare`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ userId }),
  });
  return handleResponse<{ message: string }>(response);
};

export const getShoppingListShares = async (token: string, listId: string): Promise<{ owner: any; sharedWith: any[]; isShared: boolean }> => {
  const response = await fetch(`${BASE_URL}/api/shopping-lists/${listId}/shares`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return handleResponse<{ owner: any; sharedWith: any[]; isShared: boolean }>(response);
};

export const updateSharePermission = async (token: string, listId: string, userId: string, permission: 'read' | 'write'): Promise<{ message: string }> => {
  const response = await fetch(`${BASE_URL}/api/shopping-lists/${listId}/share-permission`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ userId, permission }),
  });
  return handleResponse<{ message: string }>(response);
};

// Smart Assistant Chat Functions
export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export interface UserPreferences {
    dietaryRestrictions?: string[];
    favoriteCuisines?: string[];
    cookingSkillLevel?: 'beginner' | 'intermediate' | 'advanced';
    householdSize?: number;
    budgetPreference?: 'budget' | 'moderate' | 'premium';
    shoppingFrequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly';
}

export interface ChatHistoryResponse {
    chatHistory: ChatMessage[];
    preferences: UserPreferences;
}

export const sendChatMessage = async (token: string, message: string): Promise<{ message: string; timestamp: Date }> => {
    const response = await fetch(`${BASE_URL}/api/smart-assistant/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
    });
    return handleResponse<{ message: string; timestamp: Date }>(response);
};

export const getChatHistory = async (token: string): Promise<ChatHistoryResponse> => {
    const response = await fetch(`${BASE_URL}/api/smart-assistant/chat/history`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    return handleResponse<ChatHistoryResponse>(response);
};

export const clearChatHistory = async (token: string): Promise<{ message: string }> => {
    const response = await fetch(`${BASE_URL}/api/smart-assistant/chat/history`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    return handleResponse<{ message: string }>(response);
};

export const updateUserPreferences = async (token: string, preferences: Partial<UserPreferences>): Promise<{ message: string; preferences: UserPreferences }> => {
    const response = await fetch(`${BASE_URL}/api/smart-assistant/preferences`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ preferences }),
    });
    return handleResponse<{ message: string; preferences: UserPreferences }>(response);
};