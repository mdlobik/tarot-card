const express = require('express');
const cors = require('cors');
const { CohereClient } = require('cohere-ai');

// Initialize express app
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Cohere client
const cohere = new CohereClient({
    token: process.env.COHERE_API_KEY
});

// Testing endpoint
app.get('/api/test', (req, res) => {
    res.status(200).json({ message: 'Server is accessible' });
});

// Main tarot reading endpoint
app.post('/api/tarot', async (req, res) => {
    try {
        const { cards } = req.body;

        if (!cards || !Array.isArray(cards) || cards.length !== 3) {
            return res.status(400).json({
                error: 'Invalid request. Please provide exactly 3 cards with position, name, and description.'
            });
        }

        // Format the cards for the prompt
        const formattedCards = cards.map(card =>
            `${card.position}: ${card.name} - ${card.description}`
        ).join('\n\n');

        // Build the prompt for Cohere
        const prompt = `
As a mystic tarot reader, provide an insightful and meaningful reading based on the following three-card spread:

${formattedCards}

Provide a personalized reading that interprets how these cards interact with each other and what they reveal about the querent's past, present, and future. Make the reading feel mystical, thoughtful, and personal. The reading should be 3-4 paragraphs long.
`;

        // Generate reading with Cohere
        const response = await cohere.generate({
            prompt: prompt,
            maxTokens: 500,
            temperature: 0.8,
            k: 0,
            stopSequences: [],
            returnLikelihoods: 'NONE'
        });

        // Send the generated reading
        res.status(200).json({
            reading: response.generations[0].text.trim()
        });

    } catch (error) {
        console.error('Error generating tarot reading:', error);
        res.status(500).json({
            error: 'Failed to generate reading. The mystical forces are unclear at this moment.'
        });
    }
});

// Catch-all for unrecognized routes
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start the server
if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

// Export for testing
module.exports = app;