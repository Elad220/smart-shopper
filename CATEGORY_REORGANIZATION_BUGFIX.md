# Category Reorganization Bug Fix

## Problem
Category reorganizations were not persisting properly across different shopping lists. When users would drag and drop categories to reorder them in one list, the reorganization would apply to all lists because of a shared localStorage key.

## Root Cause
The issue was in the `ShoppingListView.tsx` component where the localStorage key for storing category order was using a global key `'categoryOrder'` instead of a list-specific key. This caused all lists to share the same category order.

## Files Modified

### 1. `frontend/components/shopping/ShoppingListView.tsx`
- **Added `listId` prop**: Updated the `ShoppingListViewProps` interface to include a `listId: string` parameter
- **Updated component signature**: Modified the component to accept and use the `listId` prop
- **Fixed localStorage keys**: Changed all localStorage operations from using `'categoryOrder'` to `'categoryOrder_${listId}'`
- **Updated effect dependencies**: Added `listId` to the dependency arrays of useEffect and useCallback hooks

### 2. `frontend/components/app/ShoppingApp.tsx`
- **Added listId prop**: Updated the `ShoppingListView` component usage to pass the `selectedListId` as the `listId` prop
- **Added null check**: Added a conditional render to only show `ShoppingListView` when `selectedListId` is not null
- **Added fallback UI**: Added a fallback message when no list is selected

## Changes Made

### ShoppingListView.tsx Changes:
1. Added `listId: string` to the props interface
2. Updated localStorage key from `'categoryOrder'` to `'categoryOrder_${listId}'` in:
   - Initial load effect
   - Category reset effect
   - Reset category order function
   - Drag end handler
3. Updated dependency arrays to include `listId`

### ShoppingApp.tsx Changes:
1. Added `listId={selectedListId}` prop to ShoppingListView
2. Added conditional rendering to handle null selectedListId
3. Added fallback UI for when no list is selected

## Technical Details

### Before (Buggy):
```typescript
// All lists shared the same key
const savedOrder = localStorage.getItem('categoryOrder');
localStorage.setItem('categoryOrder', JSON.stringify(newOrder));
```

### After (Fixed):
```typescript
// Each list has its own key
const savedOrder = localStorage.getItem(`categoryOrder_${listId}`);
localStorage.setItem(`categoryOrder_${listId}`, JSON.stringify(newOrder));
```

## Testing
- Build compilation successful ✅
- TypeScript type checking passed ✅
- All localStorage operations now use list-specific keys ✅

## Result
Category reorganizations now persist correctly for each individual shopping list. Users can:
1. Drag and drop categories in List A to reorder them
2. Switch to List B and organize categories differently
3. Return to List A and find their original category order preserved
4. Each list maintains its own independent category organization

The fix ensures that category reorganizations are properly scoped to individual shopping lists rather than being shared globally across all lists.