const User = require('../models/User');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const { decrypt } = require('../utils/crypto');

// Chat with the smart assistant
exports.chat = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user.userId;

        if (!message || !message.trim()) {
            return res.status(400).json({ message: 'Message is required.' });
        }

        const user = await User.findById(userId);
        if (!user || !user.apiKey) {
            return res.status(400).json({ message: 'API key not configured for this user.' });
        }

        // Decrypt the API key before using it
        const decryptedApiKey = decrypt(user.apiKey);
        const genAI = new GoogleGenerativeAI(decryptedApiKey);

        const safetySettings = [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ];

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", safetySettings });

        // Build context from user preferences and recent chat history
        const context = buildUserContext(user);
        
        // Get recent chat history (last 10 messages for context)
        const recentHistory = user.chatHistory.slice(-10);
        
        // Build conversation history for the AI
        const conversationHistory = recentHistory.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.content }]
        }));

        // Add the new user message
        conversationHistory.push({
            role: 'user',
            parts: [{ text: message }]
        });

        // Create the chat session
        const chat = model.startChat({
            history: conversationHistory.slice(0, -1), // Exclude the current message
            generationConfig: {
                maxOutputTokens: 1000,
                temperature: 0.7,
            },
        });

        // Send the message and get response
        const result = await chat.sendMessage(message);
        const response = await result.response;

        if (!response.text) {
            throw new Error("The response was blocked for safety reasons. Please try a different message.");
        }

        const assistantMessage = response.text();

        // Save the conversation to user's chat history
        user.chatHistory.push(
            { role: 'user', content: message },
            { role: 'assistant', content: assistantMessage }
        );

        // Keep only the last 50 messages to prevent the history from growing too large
        if (user.chatHistory.length > 50) {
            user.chatHistory = user.chatHistory.slice(-50);
        }

        await user.save();

        res.json({
            message: assistantMessage,
            timestamp: new Date()
        });

    } catch (error) {
        console.error("Error in smart assistant chat:", error);
        res.status(500).json({ message: error.message || 'Failed to process chat message.' });
    }
};

// Get user's chat history
exports.getChatHistory = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.json({
            chatHistory: user.chatHistory,
            preferences: user.preferences
        });

    } catch (error) {
        console.error("Error getting chat history:", error);
        res.status(500).json({ message: 'Failed to get chat history.' });
    }
};

// Clear chat history
exports.clearChatHistory = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        user.chatHistory = [];
        await user.save();

        res.json({ message: 'Chat history cleared successfully.' });

    } catch (error) {
        console.error("Error clearing chat history:", error);
        res.status(500).json({ message: 'Failed to clear chat history.' });
    }
};

// Update user preferences
exports.updatePreferences = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { preferences } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Update preferences
        if (preferences) {
            user.preferences = { ...user.preferences, ...preferences };
        }

        await user.save();

        res.json({
            message: 'Preferences updated successfully.',
            preferences: user.preferences
        });

    } catch (error) {
        console.error("Error updating preferences:", error);
        res.status(500).json({ message: 'Failed to update preferences.' });
    }
};

// Generate shopping items (keeping the original functionality as a fallback)
exports.generateItems = async (req, res) => {
    try {
        const { prompt } = req.body;
        const userId = req.user.userId;

        if (!prompt) {
            return res.status(400).json({ message: 'Prompt is required.' });
        }

        const user = await User.findById(userId);
        if (!user || !user.apiKey) {
            return res.status(400).json({ message: 'API key not configured for this user.' });
        }

        // Decrypt the API key before using it
        const decryptedApiKey = decrypt(user.apiKey);
        const genAI = new GoogleGenerativeAI(decryptedApiKey);

        const safetySettings = [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ];

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", safetySettings });

        const fullPrompt = `Based on the theme "${prompt}", generate a list of 5-10 shopping items. For each item, suggest a relevant category from the following list: Produce, Dairy, Fridge, Freezer, Bakery, Pantry, Disposable, Hygiene, Canned Goods, Organics, Deli, Other. Format the output as a JSON array of objects, where each object has a "name" and "category" property. For example: [{"name": "Taco Shells", "category": "Pantry"}]`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;

        if (!response.text) {
            throw new Error("The response was blocked for safety reasons. Please try a different theme.");
        }

        const text = await response.text();
        const jsonText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const items = JSON.parse(jsonText);

        res.json(items);

    } catch (error) {
        console.error("Error in smart assistant:", error);
        res.status(500).json({ message: error.message || 'Failed to generate items.' });
    }
};

// Helper function to build user context for the AI
function buildUserContext(user) {
    const context = [];
    
    if (user.preferences) {
        if (user.preferences.dietaryRestrictions && user.preferences.dietaryRestrictions.length > 0) {
            context.push(`Dietary restrictions: ${user.preferences.dietaryRestrictions.join(', ')}`);
        }
        
        if (user.preferences.favoriteCuisines && user.preferences.favoriteCuisines.length > 0) {
            context.push(`Favorite cuisines: ${user.preferences.favoriteCuisines.join(', ')}`);
        }
        
        if (user.preferences.cookingSkillLevel) {
            context.push(`Cooking skill level: ${user.preferences.cookingSkillLevel}`);
        }
        
        if (user.preferences.householdSize) {
            context.push(`Household size: ${user.preferences.householdSize} people`);
        }
        
        if (user.preferences.budgetPreference) {
            context.push(`Budget preference: ${user.preferences.budgetPreference}`);
        }
        
        if (user.preferences.shoppingFrequency) {
            context.push(`Shopping frequency: ${user.preferences.shoppingFrequency}`);
        }
    }
    
    return context.join('. ');
}