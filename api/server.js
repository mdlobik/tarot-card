const express = require('express');
const cors = require('cors');
const { Gemini } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Health check endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working' });
});

// Endpoint to generate tarot reading using Google Gemini
app.post('/api/gemini-tarot', async (req, res) => {
    try {
        const { cards } = req.body;
        if (!cards || !Array.isArray(cards)) {
            return res.status(400).json({ error: 'Invalid card data' });
        }

        // Build a prompt from the selected tarot cards
        let prompt = 'Provide a detailed tarot reading based on the following cards:\n';
        cards.forEach(card => {
            prompt += `${card.position}: ${card.name} - ${card.description}\n`;
        });
        prompt += '\nInterpret the cards in a mystical and insightful manner.';

        // Initialize the Gemini client with your API key
        const client = new Gemini({ apiKey: process.env.GOOGLE_API_KEY });

        // IMPORTANT: specify a model in generateText()
        const result = await client.generateText({
            model: 'models/text-bison-001',
            prompt,
            temperature: 0.7,
            maxOutputTokens: 256,
        });

        // Log the entire result to see the structure
        console.log('Gemini API raw response:', result);

        // Some versions store text in result.candidates[0].output
        // Adjust if needed. For example:
        // const readingText = result.candidates?.[0]?.output || 'No reading found.';
        const readingText = result.text || 'No reading found.';

        res.json({ reading: readingText });
    } catch (error) {
        console.error('Error generating tarot reading:', error);
        res.status(500).json({ error: 'An error occurred while generating the tarot reading.' });
    }
});

module.exports = app;
