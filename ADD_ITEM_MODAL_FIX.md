# Add Item Modal Loading Fix

## Problem
When adding an item to the list, the add item modal gets stuck blank for a few seconds until it disappears. This happens because the modal was closing immediately when the "Add Item" button was clicked, but the API call was still processing in the background, leaving a blank modal visible.

## Root Cause
The issue was in the `handleAddItem` function in `ShoppingApp.tsx`:
1. User clicks "Add Item" button
2. `handleAddItem` calls `addItem()` (async API call)
3. `setIsAddModalOpen(false)` is called immediately after
4. Modal starts closing but API call is still processing
5. Modal remains visible but blank until API call completes

## Solution
Implemented a proper loading state management system:

### 1. Updated AddItemModal Component (`frontend/components/shopping/AddItemModal.tsx`)
- Added `isLoading` prop to the component interface
- Modified `onAdd` prop to be async: `Promise<void>`
- Added loading UI with spinner when `isLoading` is true
- Disabled form inputs and buttons during loading
- Changed submit button to show "Adding..." text and spinner icon

### 2. Updated ShoppingApp Component (`frontend/components/app/ShoppingApp.tsx`)
- Added `isAddingItem` state to track loading status
- Modified `handleAddItem` to:
  - Set `setIsAddingItem(true)` at start
  - Only close modal after API call completes (success/error)
  - Set `setIsAddingItem(false)` in finally block
- Updated AddItemModal props to include `isLoading={isAddingItem}`
- Prevented modal from closing during loading: `onClose={() => !isAddingItem && setIsAddModalOpen(false)}`

## Key Changes

### Loading State UI
When loading, the modal shows:
- A centered loading spinner
- "Adding item..." text
- "Please wait while we add your item to the list" subtitle
- Disabled Cancel and Add Item buttons

### Button States
- Cancel button: Disabled during loading
- Add Item button: Shows spinner icon and "Adding..." text during loading

## User Experience Improvement
- Modal no longer appears blank during API calls
- Clear visual feedback that item is being added
- Prevents user confusion and multiple submissions
- Professional loading state with spinner and helpful text

## Files Modified
1. `frontend/components/shopping/AddItemModal.tsx` - Added loading UI and state handling
2. `frontend/components/app/ShoppingApp.tsx` - Added loading state management

The fix ensures a smooth user experience where the modal shows clear loading feedback instead of appearing blank during API operations.