const express = require('express');
const cors = require('cors');
const cohere = require('cohere-ai');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Initialize Cohere with your API key
cohere.init(process.env.COHERE_API_KEY);

app.post('/api/tarot', async (req, res) => {
    try {
        const { cards } = req.body;
        let prompt = 'Provide a detailed tarot reading based on these cards:\n';
        cards.forEach(card => {
            prompt += `${card.position}: ${card.name} - ${card.description}\n`;
        });
        prompt += '\nInterpret them in a mystical, insightful way.';

        const response = await cohere.generate({
            model: 'command-xlarge-nightly',
            prompt,
            max_tokens: 300,
            temperature: 0.7,
        });

        const reading = response.body.generations[0].text.trim();
        res.json({ reading });
    } catch (error) {
        console.error('Error generating reading:', error);
        res.status(500).json({ error: 'An error occurred while generating the tarot reading.' });
    }
});

module.exports = app;
