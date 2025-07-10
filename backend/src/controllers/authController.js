const User = require('../models/User');
const jwt = require('jsonwebtoken');
const ShoppingList = require('../models/ShoppingList');
const { OAuth2Client } = require('google-auth-library');

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Validation functions
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 8 && 
         /[A-Z]/.test(password) && 
         /[a-z]/.test(password) && 
         /[0-9]/.test(password) && 
         /[^A-Za-z0-9]/.test(password);
};

// Google OAuth authentication
exports.googleAuth = async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ message: 'Google access token is required' });
    }

    // Get user info from Google using the access token
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!userInfoResponse.ok) {
      return res.status(401).json({ message: 'Invalid Google access token' });
    }

    const userInfo = await userInfoResponse.json();
    const { id: googleId, email, name, picture, locale } = userInfo;

    // Check if user already exists
    let user = await User.findOne({ 
      $or: [
        { googleId },
        { email }
      ]
    });

    if (user) {
      // Update existing user with Google info if they don't have it
      if (!user.googleId) {
        user.googleId = googleId;
        user.authMethod = 'google';
        user.googleProfile = { name, picture, locale };
        await user.save();
      }
    } else {
      // Create new user
      user = new User({
        email,
        googleId,
        authMethod: 'google',
        googleProfile: { name, picture, locale },
        username: email.split('@')[0], // Use email prefix as username
        customCategories: [],
        preferences: {
          dietaryRestrictions: [],
          favoriteCuisines: [],
          cookingSkillLevel: 'intermediate',
          householdSize: 2,
          budgetPreference: 'moderate',
          shoppingFrequency: 'weekly'
        }
      });

      await user.save();

      // Create default shopping list for the new user
      const defaultList = new ShoppingList({
        name: 'Shopping List',
        user: user._id,
        items: []
      });
      await defaultList.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, jti: Date.now() },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        authMethod: user.authMethod,
        googleProfile: user.googleProfile,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: error.message || 'Google authentication failed' });
  }
};

// Register a new user
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate email
    if (!email || !validateEmail(email)) {
      return res.status(400).json({ 
        message: 'Invalid email format. Please provide a valid email address.' 
      });
    }

    // Validate password
    if (!password || !validatePassword(password)) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.' 
      });
    }

    // Validate username
    if (!username || username.length < 3) {
      return res.status(400).json({
        message: 'Username is required and must be at least 3 characters.'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password
    });

    await user.save();

    // Create default shopping list for the new user
    const defaultList = new ShoppingList({
      name: 'Shopping List',
      user: user._id,
      items: []
    });
    await defaultList.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, jti: Date.now() },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    // Mongoose validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: messages.join(' ') });
    }
    res.status(500).json({ message: error.message || 'An unexpected error occurred.' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required.' });
    }
    const orConditions = [];
    if (username && username.length >= 3) {
      orConditions.push({ username });
    }
    if (email && validateEmail(email)) {
      orConditions.push({ email });
    }
    if (orConditions.length === 0) {
      return res.status(400).json({ message: 'Please provide a valid username or email.' });
    }
    // Find user by username or email
    const user = await User.findOne({ $or: orConditions });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, jti: Date.now() },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    // Mongoose validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: messages.join(' ') });
    }
    res.status(500).json({ message: error.message || 'An unexpected error occurred.' });
  }
};