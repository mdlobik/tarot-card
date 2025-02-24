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

        // Initialize the Gemini client with your API key (set in Vercel as an environment variable)
        const client = new Gemini({ apiKey: process.env.GOOGLE_API_KEY });

        // Call the Gemini API (adjust parameters as needed)
        const result = await client.generateText({
            prompt: prompt,
            temperature: 0.7,
            maxOutputTokens: 256,
        });

        res.json({ reading: result.text });
    } catch (error) {
        console.error('Error generating tarot reading:', error);
        res.status(500).json({ error: 'An error occurred while generating the tarot reading.' });
    }
});

module.exports = app;
