const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const Groq = require('groq-sdk');

// Load environment variables
const path = require('path');
const envPath = path.resolve(process.cwd(), '.env');
console.log('Loading environment variables from:', envPath);
dotenv.config({ path: envPath });
console.log('Environment variables loaded');

// Initialize express app
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Groq API
const groqApiKey = process.env.GROQ_API_KEY || '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';
console.log('groqApiKey value:', groqApiKey ? `${groqApiKey.substring(0, 5)}... (${groqApiKey.length} chars)` : 'undefined');

let groqClient;

// Initialize Groq
try {
    if (groqApiKey) {
        console.log('Initializing Groq API');
        groqClient = new Groq({ apiKey: groqApiKey });
        console.log('Groq API initialized successfully');
    } else {
        console.warn('Groq API key not found. Falling back to local generation.');
    }
} catch (error) {
    console.error('Error initializing Groq API:', error);
}

// Function to generate tarot readings using Groq API with retry mechanism
async function generateTarotReadingWithGroq(pastCard, presentCard, futureCard) {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // 1 second delay between retries
    
    // Helper function to delay execution
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    
    // Helper function for the actual API call with retry logic
    async function callGroqWithRetry(attempt = 1) {
        try {
            console.log(`Generating tarot reading with Groq (attempt ${attempt}/${MAX_RETRIES})`);
            
            if (!groqClient) {
                throw new Error('Groq API not initialized');
            }
            
            // Format the cards for the prompt
            const cardsInfo = `
Past Card: ${pastCard.name} - ${pastCard.description}
Present Card: ${presentCard.name} - ${presentCard.description}
Future Card: ${futureCard.name} - ${futureCard.description}
            `.trim();

            // Create the prompt for Groq
            const prompt = `
You are an expert tarot reader with deep knowledge of tarot symbolism and interpretation. 
Please provide a concise and personalized tarot reading based on the following three-card spread (Past, Present, Future):

${cardsInfo}

Your reading should include:
1. A brief interpretation of each card in its position (Past, Present, Future)
2. How the cards connect and influence each other
3. Practical advice based on the overall reading

Format the reading as follows:
- Start with the Past card interpretation (keep it brief)
- Then the Present card interpretation (keep it brief)
- Then the Future card interpretation (keep it brief)
- End with a short conclusion connecting the cards and offering advice

Be direct and to the point. The reading should be personal, insightful, and around 150-200 words total. Focus on clarity and impact rather than length.
            `.trim();

            // Generate content using Groq
            const completion = await groqClient.chat.completions.create({
                messages: [
                    { role: "system", content: "You are an expert tarot reader with deep knowledge of tarot symbolism and interpretation." },
                    { role: "user", content: prompt }
                ],
                model: "llama3-70b-8192",
                temperature: 0.7,
                max_tokens: 1024,
            });
            
            if (completion.choices && completion.choices.length > 0) {
                return completion.choices[0].message.content;
            } else {
                throw new Error('No content in Groq response');
            }
            
        } catch (error) {
            console.error(`Error during Groq API call (attempt ${attempt}):`, error.message);
            
            // If we haven't reached max retries, try again after a delay
            if (attempt < MAX_RETRIES) {
                console.log(`Retrying in ${RETRY_DELAY}ms...`);
                await delay(RETRY_DELAY);
                return callGroqWithRetry(attempt + 1);
            }
            
            // If we've reached max retries, throw the error
            console.error(`Max retries reached. Giving up on Groq.`);
            throw error;
        }
    }
    
    // Start the retry process
    try {
        return await callGroqWithRetry();
    } catch (error) {
        console.error('All attempts to generate reading with Groq failed:', error.message);
        throw error;
    }
}

// Function to generate tarot readings locally
function generateTarotReading(pastCard, presentCard, futureCard) {
    // Template readings based on card positions
    const readings = {
        past: {
            // Major Arcana
            "The Fool": "In the past, you embarked on a journey with innocence and openness. You were willing to take risks without fear of the outcome, which has shaped your current path in profound ways."
            // Add more card readings as needed
        },
        present: {
            // Major Arcana
            "The Fool": "Currently, you stand at the edge of something new. Trust your instincts and embrace this fresh beginning without fear. This moment of potential contains infinite possibilities if you take that first step."
            // Add more card readings as needed
        },
        future: {
            // Major Arcana
            "The Fool": "A new adventure awaits in your future. Approach it with openness and trust in the journey. This beginning will require courage but offers remarkable potential for growth."
            // Add more card readings as needed
        }
    };

    // Get readings for each position, defaulting to generic readings if the card isn't found
    const pastReading = pastCard && readings.past[pastCard.name] ?
        readings.past[pastCard.name] :
        "Your past has laid the foundation for your current journey. The experiences you've had continue to influence your path.";

    const presentReading = presentCard && readings.present[presentCard.name] ?
        readings.present[presentCard.name] :
        "Your present situation contains both challenges and opportunities. How you respond now shapes what comes next.";

    const futureReading = futureCard && readings.future[futureCard.name] ?
        readings.future[futureCard.name] :
        "The future holds potential waiting to be realized. Your choices now will influence the path ahead.";

    // Combine into a cohesive reading that references the specific cards
    return `
The ${pastCard.name} in your past position indicates: ${pastReading} This influence from your past continues to resonate in your current circumstances.

The ${presentCard.name} in your present position shows: ${presentReading} The energies of this card are dynamic and responsive to your awareness and choices right now.

The ${futureCard.name} in your future position suggests: ${futureReading} As you move forward, this card's energy will be particularly significant in shaping your path.

This reading offers specific guidance for your particular situation and journey.
  `.trim();
}

// Basic server test endpoint
app.get('/api/test', (req, res) => {
    res.status(200).json({ message: 'Server is accessible' });
});

// Groq API test endpoint
app.get('/api/test-groq', async (req, res) => {
    console.log('Testing Groq API');
    try {
        // Check if Groq API is initialized
        if (!groqClient) {
            return res.status(500).json({
                success: false,
                message: 'Groq API not initialized',
                details: {
                    apiKeyExists: !!groqApiKey
                }
            });
        }
        
        // Simple test prompt
        const prompt = "Write a one-sentence test response to verify the API is working.";
        
        // Generate content using Groq
        const completion = await groqClient.chat.completions.create({
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: prompt }
            ],
            model: "llama3-70b-8192",
            temperature: 0.7,
            max_tokens: 100,
        });
        
        if (completion.choices && completion.choices.length > 0) {
            const text = completion.choices[0].message.content;
            
            // Return success response
            return res.status(200).json({
                success: true,
                message: 'Groq API is working correctly',
                response: text
            });
        } else {
            throw new Error('No content in Groq response');
        }
    } catch (error) {
        console.error('Error testing Groq API:', error.message);
        
        // Return error information
        return res.status(500).json({
            success: false,
            message: 'Error testing Groq API',
            error: error.message
        });
    }
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

        // Extract the cards by position
        const pastCard = cards.find(card => card.position === 'Past');
        const presentCard = cards.find(card => card.position === 'Present');
        const futureCard = cards.find(card => card.position === 'Future');
        
        console.log('Processing tarot reading for cards:', {
            past: pastCard?.name,
            present: presentCard?.name,
            future: futureCard?.name
        });

        // First, generate the local reading to use as fallback
        const localReading = generateTarotReading(pastCard, presentCard, futureCard);
        let reading = localReading;
        let source = 'local';
        let isLLMGenerated = false;

        // Try Groq if available
        if (groqClient && groqApiKey) {
            try {
                reading = await generateTarotReadingWithGroq(pastCard, presentCard, futureCard);
                source = 'groq';
                isLLMGenerated = true;
                console.log('Successfully generated reading with Groq');
            } catch (error) {
                console.error('Groq API failed, falling back to local generation:', error.message);
                reading = localReading;
                source = 'local';
                isLLMGenerated = false;
            }
        } else {
            console.log('No Groq API available, using local generation');
        }

        // Send the generated reading
        res.status(200).json({
            reading,
            source,
            isLLMGenerated
        });

    } catch (error) {
        console.error('Error generating tarot reading:', error.message);
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