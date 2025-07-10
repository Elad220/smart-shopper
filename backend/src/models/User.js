const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: function() { return !this.googleId; }, // Required only if not Google user
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters.'],
    match: [/^[a-zA-Z0-9_\-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens.']
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address.']
  },
  password: {
    type: String,
    required: function() { return !this.googleId; }, // Required only if not Google user
  },
  // Google OAuth fields
  googleId: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple null values
  },
  googleProfile: {
    name: String,
    picture: String,
    locale: String,
  },
  // Authentication method
  authMethod: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  customCategories: {
    type: [String],
    default: []
  },
  apiKey: { // New field for Gemini API Key
    type: String,
    trim: true,
  },
  // New fields for smart assistant chatbot
  chatHistory: [{
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  preferences: {
    dietaryRestrictions: [String],
    favoriteCuisines: [String],
    cookingSkillLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate'
    },
    householdSize: {
      type: Number,
      default: 2
    },
    budgetPreference: {
      type: String,
      enum: ['budget', 'moderate', 'premium'],
      default: 'moderate'
    },
    shoppingFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'biweekly', 'monthly'],
      default: 'weekly'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving (only for local auth)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to check if user is Google user
userSchema.methods.isGoogleUser = function() {
  return this.authMethod === 'google' || !!this.googleId;
};

module.exports = mongoose.model('User', userSchema);