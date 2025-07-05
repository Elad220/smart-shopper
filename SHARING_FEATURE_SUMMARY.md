# Shopping List Sharing Feature Implementation

## Overview
Added a comprehensive sharing feature that allows users to share their shopping lists with other users. Users can share lists with different permission levels (read-only or read-write) and manage who has access to their lists.

## Backend Implementation

### 1. Database Model Updates
**File:** `backend/src/models/ShoppingList.js`
- Added `sharedWith` array field to store users who have access to the list
- Added `isShared` boolean flag to indicate if the list is shared
- Each shared user entry contains:
  - `user`: Reference to the User model
  - `permission`: Either 'read' or 'write'
  - `sharedAt`: Timestamp when the list was shared

### 2. New API Endpoints
**File:** `backend/src/routes/shoppingList.js`
- `POST /:listId/share` - Share a list with another user
- `POST /:listId/unshare` - Remove sharing access from a user
- `GET /:listId/shares` - Get all users who have access to a list
- `PUT /:listId/share-permission` - Update sharing permission for a user

### 3. Controller Updates
**File:** `backend/src/controllers/shoppingListController.js`

#### New Helper Function
- `hasListAccess()` - Checks if a user has access to a list (either as owner or shared user)

#### Updated Existing Methods
- `getLists()` - Now returns both owned and shared lists
- `getList()` - Uses the new access control helper
- `addItem()`, `updateItem()`, `removeItem()` - Now check for write permissions

#### New Sharing Methods
- `shareList()` - Share a list with another user by email
- `unshareList()` - Remove sharing access from a user
- `getListShares()` - Get sharing information for a list
- `updateSharePermission()` - Update permission level for a shared user

## Frontend Implementation

### 1. API Service Updates
**File:** `frontend/src/services/api.ts`
- Added `shareShoppingList()` function
- Added `unshareShoppingList()` function
- Added `getShoppingListShares()` function
- Added `updateSharePermission()` function

### 2. UI Components Updates
**File:** `frontend/components/ShoppingListManager.tsx`

#### New Features Added
- **Share Button**: Added share button for list owners
- **Sharing Dialog**: Modal dialog for sharing lists with others
- **Permission System**: 
  - Read-only: Can view items but cannot modify
  - Read-write: Can view and modify items
- **Visual Indicators**: 
  - "Shared" chip for lists that are shared with others
  - Permission indicator for lists shared with the current user

#### Access Control
- Only list owners can share lists
- Only list owners can delete lists
- Edit functionality available to owners and users with write permission
- Share button only visible to list owners

### 3. User Experience Improvements
- **Visual Feedback**: Clear indicators showing shared status and permissions
- **Intuitive Sharing**: Email-based sharing with clear permission options
- **Permission Descriptions**: Clear explanations of what each permission level allows
- **Error Handling**: Comprehensive error messages for sharing operations

## Permission System

### Read Permission
- Can view the shopping list
- Can see all items in the list
- Cannot add, edit, or delete items
- Cannot share the list with others

### Write Permission
- All read permissions plus:
- Can add new items to the list
- Can edit existing items
- Can remove items from the list
- Can mark items as completed/uncompleted
- Cannot delete the entire list
- Cannot share the list with others

### Owner Permissions
- All write permissions plus:
- Can share the list with others
- Can manage sharing permissions
- Can delete the entire list
- Can remove users from shared access

## Security Features
- **Access Control**: All API endpoints check user permissions before allowing operations
- **Owner Validation**: Only list owners can perform administrative actions
- **Email Validation**: Users are found by email address for sharing
- **Permission Validation**: Write operations require write permission or ownership

## Database Schema Changes
```javascript
// ShoppingList model additions
sharedWith: [{
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  permission: {
    type: String,
    enum: ['read', 'write'],
    default: 'read'
  },
  sharedAt: {
    type: Date,
    default: Date.now
  }
}],
isShared: {
  type: Boolean,
  default: false
}
```

## Usage Instructions

### For List Owners
1. **Share a List**: Click the share button (🔗) next to any list you own
2. **Enter Email**: Type the email address of the person you want to share with
3. **Choose Permission**: Select either "Read only" or "Read & write"
4. **Send Share**: Click "Share List" to send the invitation

### For Shared Users
1. **View Shared Lists**: Shared lists appear in your list alongside your own lists
2. **Identify Shared Lists**: Look for permission indicators ("Read" or "Write" chips)
3. **Respect Permissions**: Edit functionality is only available if you have write permission

## Benefits
- **Collaboration**: Multiple users can work on the same shopping list
- **Family Shopping**: Share household shopping lists with family members
- **Flexible Permissions**: Control what shared users can do with your lists
- **Real-time Updates**: Changes are reflected for all users with access
- **Easy Management**: Simple interface to manage who has access to your lists

## Technical Notes
- Uses MongoDB references for efficient data relationships
- Implements proper access control at the API level
- Responsive UI that works on both desktop and mobile
- Comprehensive error handling and user feedback
- Follows RESTful API design principles