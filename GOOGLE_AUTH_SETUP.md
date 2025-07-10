# Google Authentication Setup Guide

This guide will help you set up Google OAuth authentication for your Smart Shopper app.

## Prerequisites

1. A Google Cloud Console account
2. Access to create OAuth 2.0 credentials

## Step 1: Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API and Google OAuth2 API
4. Go to "Credentials" in the left sidebar
5. Click "Create Credentials" → "OAuth 2.0 Client IDs"
6. Choose "Web application" as the application type
7. Add authorized JavaScript origins:
   - `http://localhost:5173` (for development)
   - `http://localhost:3000` (if using different port)
   - Your production domain (when deployed)
8. Add authorized redirect URIs:
   - `http://localhost:5173` (for development)
   - Your production domain (when deployed)
9. Copy the Client ID

## Step 2: Configure Environment Variables

### Backend (.env file in backend directory)
```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/smart-shopper

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id-here

# Server Configuration
PORT=3001
NODE_ENV=development
```

### Frontend (.env file in frontend directory)
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3001

# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
```

## Step 3: Install Dependencies

The required dependencies have already been installed:

### Backend
- `google-auth-library` - For verifying Google ID tokens

### Frontend
- `@react-oauth/google` - For Google OAuth integration

## Step 4: Test the Implementation

1. Start your backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start your frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

3. Navigate to your app and try the Google login button

## Features Implemented

### Backend
- ✅ Google OAuth authentication endpoint (`/auth/google`)
- ✅ User model updated to support Google authentication
- ✅ Automatic user creation for new Google users
- ✅ JWT token generation for Google users
- ✅ Support for both local and Google authentication methods

### Frontend
- ✅ Google login button component
- ✅ Integration with existing login/register forms
- ✅ Google OAuth provider setup
- ✅ Updated authentication hook to handle Google login
- ✅ User profile support for Google users

## User Flow

1. **New Google User**: 
   - Clicks "Continue with Google"
   - Authorizes with Google
   - Account is automatically created
   - User is logged in and redirected to the main app

2. **Existing Google User**:
   - Clicks "Continue with Google"
   - Authorizes with Google
   - User is logged in and redirected to the main app

3. **Existing Local User with Google Email**:
   - If a user has a local account with the same email as their Google account
   - The accounts are automatically linked
   - User can now use either authentication method

## Security Features

- ✅ Google ID token verification
- ✅ Secure JWT token generation
- ✅ Password hashing for local users
- ✅ Environment variable configuration
- ✅ CORS protection

## Troubleshooting

### Common Issues

1. **"Invalid Google token" error**:
   - Check that your Google Client ID is correct
   - Ensure the Google OAuth API is enabled
   - Verify the authorized origins and redirect URIs

2. **CORS errors**:
   - Make sure your backend CORS configuration includes your frontend URL
   - Check that the API base URL is correct

3. **"Google login failed" error**:
   - Check the browser console for detailed error messages
   - Verify that all environment variables are set correctly
   - Ensure the backend server is running

### Debug Steps

1. Check browser console for JavaScript errors
2. Check backend server logs for authentication errors
3. Verify environment variables are loaded correctly
4. Test Google OAuth flow in Google Cloud Console

## Production Deployment

When deploying to production:

1. Update the Google OAuth credentials with your production domain
2. Set secure environment variables
3. Use HTTPS in production (required for Google OAuth)
4. Update the API base URL to your production backend URL
5. Consider using a more secure JWT secret

## Additional Notes

- Google users don't need to set a password
- Username is automatically generated from email prefix
- Google profile information (name, picture) is stored
- Users can still use traditional email/password authentication
- The system supports both authentication methods simultaneously 