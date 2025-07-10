# Smart Shopper Frontend

## Setup Instructions

### 1. Environment Variables

Copy the `.env.example` file to `.env` and configure your environment variables:

```bash
cp .env.example .env
```

Then edit the `.env` file with your actual values:

```env
# API Configuration
VITE_API_URL=http://localhost:3001

# Google OAuth Configuration (Required for Google Auth)
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here

# Gemini AI Configuration (Optional)
VITE_GEMINI_API_KEY=your-gemini-api-key-here
```

### 2. Google OAuth Setup

To enable Google authentication:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API and Google OAuth2 API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Choose "Web application" as the application type
6. Add authorized JavaScript origins:
   - `http://localhost:5173` (for development)
   - Your production domain (when deployed)
7. Copy the Client ID and add it to your `.env` file

### 3. Running the Application

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Troubleshooting

#### Routes Not Working After Google Auth Setup

If the `/auth` and `/register` routes are broken after adding Google auth:

1. **Check Environment Variables**: Make sure `VITE_GOOGLE_CLIENT_ID` is set in your `.env` file
2. **Restart Development Server**: After updating environment variables, restart the dev server
3. **Check Console**: Look for any JavaScript errors in the browser console
4. **Google Auth Not Configured**: If you don't want to use Google auth, the app will still work with email/password authentication

#### Common Issues

- **"Google Auth Not Configured" button**: This appears when `VITE_GOOGLE_CLIENT_ID` is not set or is set to the placeholder value
- **Routes not loading**: Usually caused by missing environment variables or Google OAuth provider errors
- **CORS errors**: Make sure your backend is running and the API URL is correct

### 5. Features

- ✅ Email/Password Authentication
- ✅ Google OAuth Authentication (when configured)
- ✅ Responsive Design
- ✅ Dark/Light Theme
- ✅ Shopping List Management
- ✅ Smart Assistant Integration
- ✅ Offline Support

### 6. Development

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build for production
npm run build
```