# Token Not Valid Error - Resolution Guide

## Error Location
The "token not valid" error is thrown from `backend/src/middleware/auth.js` (line 19) when JWT verification fails.

## Common Causes & Solutions

### 1. Missing or Mismatched JWT_SECRET

**Problem**: The backend uses `process.env.JWT_SECRET || 'your-secret-key'` for token signing and verification. If the JWT_SECRET changes between token generation and verification, tokens become invalid.

**Solution**: 
- Created `backend/.env` file with a consistent JWT_SECRET
- This ensures all tokens are signed with the same secret

### 2. Token Expiration

**Problem**: Tokens are set to expire after 24 hours (`expiresIn: '24h'`).

**Solution**: 
- Users need to log in again after 24 hours
- Clear localStorage and re-authenticate:
  ```javascript
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
  window.location.reload();
  ```

### 3. Corrupted Token in localStorage

**Problem**: The token stored in localStorage might be corrupted or incomplete.

**Solution**: 
- Check the token format in browser DevTools:
  ```javascript
  const token = localStorage.getItem('authToken');
  console.log(token); // Should be a JWT format: xxx.yyy.zzz
  ```
- If corrupted, clear and re-login

### 4. Server Restart with Different Secret

**Problem**: If the backend server was restarted with a different JWT_SECRET environment variable, all existing tokens become invalid.

**Solution**: 
- Ensure the `.env` file is properly loaded
- All users need to re-authenticate after a secret change

## Quick Debugging Steps

1. **Check Token in Browser Console**:
   ```javascript
   // Decode token to check expiration
   const token = localStorage.getItem('authToken');
   if (token) {
     const parts = token.split('.');
     const payload = JSON.parse(atob(parts[1]));
     console.log('Token expires at:', new Date(payload.exp * 1000));
     console.log('Is expired:', new Date() > new Date(payload.exp * 1000));
   }
   ```

2. **Clear and Re-login**:
   ```javascript
   localStorage.clear();
   window.location.href = '/';
   ```

3. **Check Backend Logs**:
   - Look for JWT verification errors
   - Ensure JWT_SECRET is loaded correctly

## Prevention

1. **Use Environment Variables**: Always use `.env` files for secrets
2. **Monitor Token Expiry**: Implement token refresh logic or automatic re-authentication
3. **Consistent Secret Management**: Never change JWT_SECRET in production without a migration plan
4. **Error Handling**: Implement proper error handling for expired/invalid tokens in the frontend

## Next Steps

1. Restart your backend server to load the new `.env` file:
   ```bash
   cd backend
   npm restart
   ```

2. Clear your browser's localStorage and log in again

3. If the issue persists, check the backend logs for more specific error messages