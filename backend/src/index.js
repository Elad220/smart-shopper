// Load and validate environment variables first
const { PORT, MONGODB_URI } = require('./config');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');
const shoppingListRoutes = require('./routes/shoppingList');
const userRoutes = require('./routes/user');
const smartAssistantRoutes = require('./routes/smartAssistant');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/shopping-lists', shoppingListRoutes);
app.use('/api/user', userRoutes);
app.use('/api/smart-assistant', smartAssistantRoutes);

// Handle malformed JSON errors from body-parser
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Malformed JSON in request body.' });
  }
  next(err);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Only start the server if this file is run directly
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
    console.log('To access from other devices on the network, use your computer\'s IP address');
  });
}

module.exports = app;