const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();  // Load environment variables

const app = express();

app.use(cors());
app.use(express.json());

const apiKey = process.env.GOOGLE_API_KEY;

// Route to handle tarot card AI reading
app.post('/api/gemini-tarot', async (req, res) => {
    try {
        const { cards } = req.body;

        // Construct the prompt for the Gemini API
        const prompt = cards.map(card => `${card.position}: ${card.name} - ${card.description}`).join('\n');
        console.log("Generated Prompt:", prompt);  // Log the prompt being sent

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generate?key=${apiKey}`,
            {
                prompt: {
                    text: prompt,
                },
                maxOutputTokens: 150,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );

        // Log the entire response from the API
        console.log("Gemini API Response:", response.data);

        // Handle the response
        if (response.data && response.data.candidates && response.data.candidates.length > 0) {
            res.json({ reading: response.data.candidates[0].output });
        } else {
            console.error("No valid response from Gemini API:", response.data);
            throw new Error("No valid reading from Gemini API");
        }
    } catch (error) {
        console.error("Error generating tarot reading:", error);  // Log the error details
        res.status(500).json({ message: 'Error generating tarot reading.' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
