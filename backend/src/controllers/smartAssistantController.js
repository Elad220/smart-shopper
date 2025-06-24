const User = require('../models/User');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const { decrypt } = require('../utils/crypto'); // Import the decrypt function

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