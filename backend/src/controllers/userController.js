const User = require('../models/User');
const { encrypt } = require('../utils/crypto'); // Import the encrypt function

// Update user's API key
exports.updateApiKey = async (req, res) => {
    try {
      const { apiKey } = req.body;
      const userId = req.user.userId;
  
      if (typeof apiKey !== 'string' || !apiKey) {
        return res.status(400).json({ message: 'A valid API key must be provided.' });
      }
  
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
  
      // Encrypt the key before saving
      user.apiKey = encrypt(apiKey);
      await user.save();
  
      res.json({ message: 'API key updated successfully.' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

// Remove user's API key
exports.removeApiKey = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.apiKey = undefined; // Setting to undefined removes it from the document
    await user.save();

    res.json({ message: 'API key removed successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get API key status for the user
exports.getApiKeyStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    // Use .select() to only retrieve the apiKey field for efficiency
    const user = await User.findById(userId).select('apiKey');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // The '!!' operator converts the value to a boolean.
    // It will be true if a non-empty string exists, false otherwise.
    const hasApiKey = !!user.apiKey;

    res.json({ hasApiKey });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};