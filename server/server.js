require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// Update static path to match your build directory
app.use(express.static(path.join(__dirname, '../build')));

// Initialize Gemini with error handling
let genAI;
try {
    if (!process.env.GOOGLE_API_KEY) {
        throw new Error('GOOGLE_API_KEY is not configured');
    }
    genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
} catch (error) {
    console.error('Error initializing Gemini:', error);
}

// Helper function to generate mystical prompt
const createMysticalPrompt = (cards) => {
    return `You are a wise and mystical tarot reader with centuries of experience. 
    Speaking with ethereal wisdom and a touch of the otherworldly, interpret these cards 
    for the seeker's past, present, and future:
    
    Past Card: ${cards[0].name} - ${cards[0].description}
    Present Card: ${cards[1].name} - ${cards[1].description}
    Future Card: ${cards[2].name} - ${cards[2].description}
    
    Weave these meanings together into a cohesive 150-200 word reading that reveals 
    the seeker's journey. Speak with the authority of one who peers through the veil 
    of time, using mystical yet clear language. Focus on how the cards interact to 
    tell the seeker's story through time.`;
};

// API endpoint for tarot readings
app.post('/api/gemini-tarot', async (req, res) => {
    try {
        if (!genAI) {
            throw new Error('Gemini AI is not properly initialized');
        }

        const { cards } = req.body;

        if (!cards || !Array.isArray(cards) || cards.length !== 3) {
            return res.status(400).json({
                success: false,
                error: 'Invalid request: Exactly three cards are required'
            });
        }

        const validCards = cards.every(card =>
            card && typeof card.name === 'string' &&
            typeof card.description === 'string'
        );

        if (!validCards) {
            return res.status(400).json({
                success: false,
                error: 'Invalid card data: Each card must have name and description'
            });
        }

        const prompt = createMysticalPrompt(cards);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const reading = response.text();

        res.json({
            success: true,
            reading
        });

    } catch (error) {
        console.error('Error generating tarot reading:', error);

        const errorMessage = process.env.NODE_ENV === 'development'
            ? `Error: ${error.message}`
            : 'The spirits are unclear at this moment. Please try again later.';

        res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error handler:', err.stack);
    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'development'
            ? err.message
            : 'Something went wrong! The mystical forces need time to realign.'
    });
});

// For Vercel serverless deployment
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
        console.log(`✨ Mystical server running on port ${PORT}`);
    });

    // Graceful shutdown for development
    process.on('SIGTERM', () => {
        console.log('SIGTERM received. Closing server gracefully...');
        server.close(() => {
            console.log('Server closed.');
            process.exit(0);
        });
    });
}

// Export for Vercel
module.exports = app;