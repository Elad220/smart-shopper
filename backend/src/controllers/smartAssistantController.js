const User = require('../models/User');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const { decrypt } = require('../utils/crypto');
const multer = require('multer');
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB max

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

        // Add language instruction based on user preference
        const languageInstruction = getLanguageInstruction(user.preferences?.aiLanguage || 'en');
        
        // Add the new user message with language instruction
        const messageWithLanguage = `${languageInstruction}\n\nUser message: ${message}`;
        conversationHistory.push({
            role: 'user',
            parts: [{ text: messageWithLanguage }]
        });

        // Use stateless generateContent API
        const result = await model.generateContent({
            contents: conversationHistory,
            generationConfig: {
                maxOutputTokens: 1000,
                temperature: 0.7,
            },
        });
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

        // Add language instruction based on user preference
        const languageInstruction = getLanguageInstruction(user.preferences?.aiLanguage || 'en');
        
        const fullPrompt = `${languageInstruction}

Parse the following shopping list: "${prompt}".
For each item, extract:
- "name" (string)
- "category" (one of: Produce, Dairy, Fridge, Freezer, Bakery, Pantry, Disposable, Hygiene, Canned Goods, Organics, Deli, Other)
- "amount" (number, default 1 if not specified)
- "units" (string, e.g. pcs, kg, L, dozen, etc., default "pcs" if not specified)

Format the output as a JSON array of objects, e.g.:
[
  {"name": "Bananas", "category": "Produce", "amount": 6, "units": "pcs"},
  {"name": "Milk", "category": "Dairy", "amount": 2, "units": "L"}
]
Return only the JSON array.`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;

        if (!response.text) {
            throw new Error("The response was blocked for safety reasons. Please try a different theme.");
        }

        const text = await response.text();
        const jsonText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        let items = JSON.parse(jsonText);

        // Ensure all items have amount and units
        items = items.map(item => ({
            name: item.name,
            category: item.category,
            amount: item.amount ?? 1,
            units: item.units ?? 'pcs',
        }));

        res.json(items);

    } catch (error) {
        console.error("Error in smart assistant:", error);
        res.status(500).json({ message: error.message || 'Failed to generate items.' });
    }
};

// Audio transcription endpoint
exports.transcribeAudio = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId);
        if (!user || !user.apiKey) {
            return res.status(400).json({ message: 'API key not configured for this user.' });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'No audio file uploaded.' });
        }
        // Decrypt the API key before using it
        const decryptedApiKey = decrypt(user.apiKey);
        const genAI = new GoogleGenerativeAI(decryptedApiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
        // Gemini expects audio as a part in the request
        const audioBuffer = req.file.buffer;
        const mimeType = req.file.mimetype;
        // Gemini API expects base64 for audio
        const base64Audio = audioBuffer.toString('base64');
        const prompt = "Transcribe this audio to text for shopping list item entry. Only return the transcript.";
        const result = await model.generateContent({
            contents: [
                { role: 'user', parts: [
                    { text: prompt },
                    { inlineData: { data: base64Audio, mimeType } }
                ] }
            ],
            generationConfig: {
                maxOutputTokens: 256,
                temperature: 0.2,
            },
        });
        const response = await result.response;
        if (!response.text) {
            throw new Error("The response was blocked for safety reasons. Please try a different message.");
        }
        const transcript = response.text();
        res.json({ message: transcript, timestamp: new Date() });
    } catch (error) {
        console.error("Error in audio transcription:", error);
        res.status(500).json({ message: error.message || 'Failed to transcribe audio.' });
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

// Autofill item details using GenAI
exports.autofillItemDetails = async (req, res) => {
    try {
        const { itemName } = req.body;
        const userId = req.user.userId;

        if (!itemName || !itemName.trim()) {
            return res.status(400).json({ message: 'Item name is required.' });
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

        // Build context from user preferences
        const userContext = buildUserContext(user);
        
        // Add language instruction based on user preference
        const languageInstruction = getLanguageInstruction(user.preferences?.aiLanguage || 'en');
        
        const fullPrompt = `${languageInstruction}

Based on the item name "${itemName.trim()}", suggest appropriate values for a shopping list item. Consider the user's context: ${userContext}

Available categories: Produce, Dairy, Fridge, Freezer, Bakery, Pantry, Disposable, Hygiene, Canned Goods, Organics, Deli, Other
Available units: pcs, kg, g, lb, oz, l, ml, cups, tbsp, tsp, packs, bottles, cans, boxes, bags, loaves, bunches, dozen, lbs, gallon, quart, pint
Available priorities: Low, Medium, High

Return a JSON object with the following structure:
{
  "category": "suggested_category",
  "amount": suggested_amount_number,
  "units": "suggested_unit",
  "priority": "suggested_priority",
  "notes": "suggested_notes_or_empty_string"
}

For example, for "bananas" you might return:
{
  "category": "Produce",
  "amount": 1,
  "units": "bunches",
  "priority": "Medium",
  "notes": "Choose ripe bananas for immediate use or green ones for later"
}

For "milk" you might return:
{
  "category": "Dairy",
  "amount": 1,
  "units": "gallon",
  "priority": "High",
  "notes": "Check expiration date"
}

Make the suggestions practical and consider typical household usage patterns.`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;

        if (!response.text) {
            throw new Error("The response was blocked for safety reasons. Please try a different item name.");
        }

        const text = await response.text();
        const jsonText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const itemDetails = JSON.parse(jsonText);

        // Validate the response structure
        const requiredFields = ['category', 'amount', 'units', 'priority', 'notes'];
        const missingFields = requiredFields.filter(field => !(field in itemDetails));
        
        if (missingFields.length > 0) {
            throw new Error(`Invalid response structure. Missing fields: ${missingFields.join(', ')}`);
        }

        // Ensure amount is a number
        if (typeof itemDetails.amount !== 'number' || itemDetails.amount < 1) {
            itemDetails.amount = 1;
        }

        res.json(itemDetails);

    } catch (error) {
        console.error("Error in autofill item details:", error);
        res.status(500).json({ message: error.message || 'Failed to autofill item details.' });
    }
};

// Helper function to get language instruction for AI
function getLanguageInstruction(languageCode) {
    const languageInstructions = {
        'en': 'Please respond in English.',
        'es': 'Por favor, responde en español.',
        'fr': 'Veuillez répondre en français.',
        'de': 'Bitte antworten Sie auf Deutsch.',
        'it': 'Per favore, rispondi in italiano.',
        'pt': 'Por favor, responda em português.',
        'ru': 'Пожалуйста, отвечайте на русском языке.',
        'zh': '请用中文回答。',
        'ja': '日本語でお答えください。',
        'ko': '한국어로 답변해 주세요.',
        'ar': 'يرجى الرد باللغة العربية.',
        'hi': 'कृपया हिंदी में जवाब दें।',
        'he': 'אנא ענה בעברית.'
    };
    
    return languageInstructions[languageCode] || languageInstructions['en'];
}