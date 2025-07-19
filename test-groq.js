// Simple script to test Groq client initialization
const Groq = require('groq-sdk');
const dotenv = require('dotenv');

// Load environment variables
const path = require('path');
const envPath = path.resolve(process.cwd(), '.env');
console.log('Loading environment variables from:', envPath);
dotenv.config({ path: envPath });
console.log('Environment variables loaded');

// Initialize Groq API
const groqApiKey = process.env.GROQ_API_KEY || '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';
console.log('groqApiKey value:', groqApiKey ? `${groqApiKey.substring(0, 5)}... (${groqApiKey.length} chars)` : 'undefined');

// Initialize Groq
try {
    if (groqApiKey) {
        console.log('Initializing Groq API');
        const groqClient = new Groq({ apiKey: groqApiKey });
        console.log('Groq API initialized successfully');
        
        // Test the API with a simple prompt
        async function testGroqAPI() {
            try {
                console.log('Testing Groq API with a simple prompt');
                const prompt = "Write a one-sentence test response to verify the API is working.";
                
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
                    console.log('Groq API response:', text);
                    console.log('Groq API is working correctly');
                } else {
                    console.error('No content in Groq response');
                }
            } catch (error) {
                console.error('Error testing Groq API:', error.message);
            }
        }
        
        // Run the test
        testGroqAPI();
    } else {
        console.warn('Groq API key not found. Cannot test Groq API.');
    }
} catch (error) {
    console.error('Error initializing Groq API:', error);
}