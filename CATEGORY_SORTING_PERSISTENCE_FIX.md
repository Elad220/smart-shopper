# Category Custom Sorting Persistence Bug Fix

## Problem Description
Category custom sorting was not persisting when user sessions ended. Users would lose their customized category order after logging out and logging back in.

## Root Cause
The issue was caused by the localStorage key pattern used for storing category order preferences. The original implementation used:
- `categoryOrder_${listId}` - tied to list ID only

When users logged out:
1. The `selectedListId` was cleared from localStorage
2. When users logged back in, they might be assigned to a different list (first available list or newly created list)
3. This made their previous category order (stored with the old list ID) inaccessible

## Solution
Modified the localStorage key pattern to include the user ID, ensuring each user has their own persistent category preferences:

### Before
```javascript
localStorage.getItem(`categoryOrder_${listId}`)
localStorage.setItem(`categoryOrder_${listId}`, JSON.stringify(order))
```

### After  
```javascript
localStorage.getItem(`categoryOrder_${userId}_${listId}`)
localStorage.setItem(`categoryOrder_${userId}_${listId}`, JSON.stringify(order))
```

## Files Modified

### 1. `frontend/components/app/ShoppingApp.tsx`
- Added `userId={user.id}` prop to `ShoppingListView` component

### 2. `frontend/components/shopping/ShoppingListView.tsx`
- Added `userId: string` to `ShoppingListViewProps` interface
- Updated component to accept `userId` parameter
- Modified all localStorage operations to use `categoryOrder_${userId}_${listId}` key pattern
- Updated dependency arrays to include `userId`

### 3. `frontend/components/ShoppingList.tsx` 
- Added `userId?: string` to `ShoppingListProps` interface (optional for backward compatibility)
- Updated component to accept `userId` parameter
- Modified localStorage operations to use user-specific keys when `userId` is available
- Added fallback to old key pattern for backward compatibility

## Benefits
1. **User-specific preferences**: Each user now has their own category ordering preferences
2. **Session persistence**: Category order survives logout/login cycles  
3. **Multi-user support**: Different users on the same device don't interfere with each other's preferences
4. **Backward compatibility**: Existing code without userId still works

## Testing
- Category order should persist after logout/login
- Multiple users on the same device should have independent category preferences
- Existing lists without userId should continue to work normally