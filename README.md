# 🛒 Smart Shopper - AI-Powered Shopping List App

A modern, intelligent shopping list application that combines the power of AI with intuitive shopping management. Built with React, Node.js, and Google's Gemini AI, Smart Shopper transforms how you plan, organize, and execute your shopping trips.

![Smart Shopper](https://img.shields.io/badge/React-18.2.0-blue) ![Smart Shopper](https://img.shields.io/badge/Node.js-20.13.1-green) ![Smart Shopper](https://img.shields.io/badge/AI-Gemini%202.0-orange) ![Smart Shopper](https://img.shields.io/badge/TypeScript-5.8.3-purple)

## 🚀 Key Features

### 🤖 AI-Powered Smart Assistant
- **Intelligent Chatbot**: Full conversational AI assistant powered by Google Gemini 2.0 Flash
- **Personalized Recommendations**: Learns your preferences and provides tailored shopping suggestions
- **Context-Aware Conversations**: Remembers chat history and user preferences for personalized responses
- **Multi-Language Support**: AI responses in 13+ languages including English, Spanish, French, German, Italian, Portuguese, Russian, Chinese, Japanese, Korean, Arabic, Hindi, and Hebrew
- **Smart Item Generation**: Generate shopping lists based on themes (e.g., "Taco Night", "Beach Picnic")
- **Autofill Item Details**: AI automatically suggests categories, amounts, units, and priority levels for items

### 🛍️ Advanced Shopping List Management
- **Multiple Lists**: Create and manage unlimited shopping lists
- **Smart Categorization**: Automatic organization into 12+ categories (Produce, Dairy, Fridge, Freezer, Bakery, Pantry, etc.)
- **Drag & Drop Reordering**: Customize category order with persistent storage
- **Priority System**: High, Medium, Low priority levels with visual indicators
- **Collapsible Categories**: Organize items by category with expand/collapse functionality
- **Search & Filter**: Find items quickly with real-time search and filtering

### 🛒 Shopping Mode
- **Store-Optimized Interface**: Large, easy-to-read text designed for in-store use
- **One-Hand Operation**: Touch-friendly interface perfect for mobile shopping
- **Quick Check-off**: Streamlined interface focused on completing items
- **Progress Tracking**: Real-time completion percentage and remaining items count
- **Visual Feedback**: Clear visual confirmation when items are completed

### 👥 Collaboration & Sharing
- **List Sharing**: Share shopping lists with family and friends
- **Permission System**: Read-only or read-write access control
- **Real-time Collaboration**: Multiple users can work on the same list simultaneously
- **Email-based Sharing**: Simple sharing via email addresses
- **Access Management**: Add/remove users and update permissions

### 📱 Mobile-First Design
- **Responsive Layout**: Optimized for all devices and screen sizes
- **Offline Support**: Continue using the app even without internet connection
- **Progressive Web App**: Install as a native app on mobile devices
- **Touch-Optimized**: Large touch targets and intuitive gestures

### 🔐 Secure Authentication
- **Multiple Auth Methods**: Email/password and Google OAuth authentication
- **JWT Tokens**: Secure session management
- **Encrypted API Keys**: Secure storage of AI API credentials
- **User Privacy**: Your data is protected and encrypted

### 🎨 Modern UI/UX
- **Dark/Light Themes**: Toggle between themes with instant switching
- **Glassmorphism Design**: Modern glass-like interface elements
- **Smooth Animations**: Framer Motion powered transitions and micro-interactions
- **Material-UI**: Professional design system with custom theming
- **Accessibility**: WCAG compliant with keyboard navigation support

## 🧠 AI Capabilities

### Smart Assistant Features
- **Conversational AI**: Natural language chat interface for shopping and cooking assistance
- **Preference Learning**: AI learns your dietary restrictions, cooking skills, budget, and household size
- **Meal Planning**: Get personalized meal suggestions and shopping recommendations
- **Recipe Integration**: AI suggests recipes and required ingredients
- **Shopping Tips**: Receive personalized shopping advice and money-saving tips
- **Multi-language Support**: Chat in your preferred language

### AI-Powered Item Management
- **Smart Categorization**: AI automatically categorizes items based on context
- **Quantity Suggestions**: AI suggests appropriate amounts and units
- **Priority Assignment**: Intelligent priority level recommendations
- **Notes Generation**: AI adds helpful notes and reminders for items
- **Theme-based Generation**: Create lists for specific occasions or cuisines

### User Preference System
- **Dietary Restrictions**: Track vegetarian, gluten-free, dairy-free, and other dietary needs
- **Cooking Skill Level**: Beginner, intermediate, or advanced cooking assistance
- **Household Size**: Personalized portion and quantity recommendations
- **Budget Preferences**: Budget, moderate, or premium shopping guidance
- **Shopping Frequency**: Daily, weekly, biweekly, or monthly planning

## 🛠️ Technical Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Material-UI** for professional design system
- **Framer Motion** for smooth animations
- **React Router** for navigation
- **LocalForage** for offline data storage
- **React Hot Toast** for notifications
- **Vitest** for testing

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Google Generative AI** for AI features
- **bcryptjs** for password hashing
- **Jest** for testing

### AI Integration
- **Google Gemini 2.0 Flash** for conversational AI
- **Safety Settings** for content filtering
- **Context Management** for personalized responses
- **Encrypted API Keys** for secure AI access

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB database
- Google Gemini API key (optional for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/smart-shopper.git
   cd smart-shopper
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install frontend dependencies
   cd frontend && npm install
   
   # Install backend dependencies
   cd ../backend && npm install
   ```

3. **Environment Setup**
   
   Create `.env` files in both frontend and backend directories:
   
   **Backend (.env)**
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=3001
   GOOGLE_CLIENT_ID=your_google_oauth_client_id
   ```
   
   **Frontend (.env)**
   ```env
   VITE_API_URL=http://localhost:3001
   VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Start the application**
   ```bash
   # Start backend (from backend directory)
   npm run dev
   
   # Start frontend (from frontend directory)
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## 🔧 Configuration

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API and Google OAuth2 API
4. Create OAuth 2.0 Client ID for web application
5. Add authorized origins and redirect URIs
6. Copy Client ID to environment variables

### Gemini AI Setup
1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add API key to frontend environment variables
3. Configure in Settings page within the app

## 📱 Usage

### Creating Shopping Lists
1. Sign up or log in to your account
2. Create a new shopping list or use the default list
3. Add items manually or use AI suggestions
4. Organize items by categories
5. Set priorities and add notes

### Using the Smart Assistant
1. Click the "Smart Assistant" button in the header
2. Configure your preferences (dietary restrictions, cooking skills, etc.)
3. Ask questions like:
   - "What should I buy for dinner?"
   - "Help me plan meals for the week"
   - "Give me shopping tips"
   - "Suggest recipes for Italian cuisine"

### Sharing Lists
1. Click the share button (🔗) next to any list you own
2. Enter the email address of the person you want to share with
3. Choose permission level (read-only or read-write)
4. Send the share invitation

### Shopping Mode
1. Click the shopping cart icon in the header
2. Use the simplified interface for in-store shopping
3. Check off items as you find them
4. Track your progress in real-time

## 🧪 Testing

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test

# Run with coverage
npm run test:coverage
```

## 🚀 Deployment

### Frontend Deployment
```bash
cd frontend
npm run build
# Deploy the dist folder to your hosting service
```

### Backend Deployment
```bash
cd backend
npm start
# Deploy to your preferred hosting service (Heroku, Vercel, etc.)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Google Gemini AI](https://ai.google.dev/) for powerful AI capabilities
- [Material-UI](https://mui.com/) for the design system
- [Framer Motion](https://www.framer.com/motion/) for animations
- [React](https://reactjs.org/) for the frontend framework
- [Node.js](https://nodejs.org/) for the backend runtime

## 📞 Support

For support, email support@smartshopper.com or create an issue in this repository.

---

**Smart Shopper** - Making shopping smarter with AI 🛒✨
