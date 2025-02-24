const express = require('express');
const cors = require('cors');
const cohere = require('cohere-ai');
require('dotenv').config();

// Initialize Cohere with your API key (make sure COHERE_API_KEY is set in your environment)
cohere.init(process.env.COHERE_API_KEY);

const app = express();
app.use(express.json());
app.use(cors());

// Health-check endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working' });
});

// Endpoint to generate tarot reading using Cohere
app.post('/api/tarot', async (req, res) => {
    try {
        const { cards } = req.body;
        if (!cards || !Array.isArray(cards)) {
            return res.status(400).json({ error: 'Invalid card data' });
        }

        // Build a prompt based on the selected tarot cards
        let prompt = 'Provide a detailed tarot reading based on the following cards:\n';
        cards.forEach(card => {
            prompt += `${card.position}: ${card.name} - ${card.description}\n`;
        });
        prompt += '\nInterpret the cards in a mystical and insightful manner.';

        // Generate the reading using Cohere
        const response = await cohere.generate({
            model: 'command-xlarge-nightly', // Adjust this if needed; this model is available on the free tier
            prompt: prompt,
            max_tokens: 300,
            temperature: 0.7,
        });

        // Cohere returns the text in response.body.generations[0].text
        const reading = response.body.generations[0].text.trim();
        res.json({ reading });
    } catch (error) {
        console.error('Error generating tarot reading:', error);
        res.status(500).json({ error: 'An error occurred while generating the tarot reading.' });
    }
});

module.exports = app;
