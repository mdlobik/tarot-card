// api/server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Debug middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// CORS configuration
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ status: 'Server is running' });
});

// Tarot reading endpoint
app.post('/api/gemini-tarot', async (req, res) => {
    console.log('Received request for tarot reading');
    console.log('Request body:', req.body);

    try {
        const { cards } = req.body;

        if (!cards || !Array.isArray(cards)) {
            console.log('Invalid request format:', req.body);
            return res.status(400).json({ message: 'Invalid request format' });
        }

        const promptTemplate = `Based on these tarot cards, provide a mystical and insightful reading:

${cards.map(card => `${card.position}: ${card.name} - ${card.description}`).join('\n')}

Consider how these cards interact with each other and what story they tell about:
- The past influences and their impact
- The present situation and its significance
- The future possibilities and potential outcomes

Provide a cohesive narrative that weaves these elements together into a meaningful reading.`;

        console.log('Sending request to Gemini API with prompt:', promptTemplate);

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generate?key=${process.env.GOOGLE_API_KEY}`,
            {
                prompt: {
                    text: promptTemplate,
                },
                maxOutputTokens: 250,
                temperature: 0.7,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );

        if (response.data?.candidates?.[0]?.output) {
            res.json({ reading: response.data.candidates[0].output });
        } else {
            console.log('Invalid API response:', response.data);
            throw new Error('Invalid API response format');
        }
    } catch (error) {
        console.error('Error details:', error);
        res.status(500).json({
            message: 'Error generating reading',
            error: error.message
        });
    }
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`\n=== Server Started ===`);
    console.log(`Time: ${new Date().toISOString()}`);
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`\nAvailable endpoints:`);
    console.log(`  GET  /api/test`);
    console.log(`  POST /api/gemini-tarot\n`);
});