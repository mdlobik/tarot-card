// Test script for Groq API initialization
const dotenv = require('dotenv');
const path = require('path');
const Groq = require('groq');

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env');
console.log('Loading environment variables from:', envPath);
dotenv.config({ path: envPath });
console.log('Environment variables loaded');

// Initialize Groq API
const groqApiKey = process.env.GROQ_API_KEY || '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';
console.log('groqApiKey value:', groqApiKey ? `${groqApiKey.substring(0, 5)}... (${groqApiKey.length} chars)` : 'undefined');

// Test Groq initialization
async function testGroqInitialization() {
    try {
        console.log('Attempting to initialize Groq API with key');
        const groqClient = new Groq({ apiKey: groqApiKey });
        console.log('Groq API initialized successfully:', !!groqClient);
        
        // Test a simple API call
        console.log('Testing simple API call...');
        const completion = await groqClient.chat.completions.create({
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: "Say hello!" }
            ],
            model: "llama3-70b-8192",
            temperature: 0.7,
            max_tokens: 100,
        });
        
        if (completion.choices && completion.choices.length > 0) {
            const text = completion.choices[0].message.content;
            console.log('API call successful! Response:', text);
            return true;
        } else {
            console.error('No content in Groq response');
            return false;
        }
    } catch (error) {
        console.error('Error initializing or using Groq API:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        return false;
    }
}

// Run the test
testGroqInitialization()
    .then(success => {
        console.log('Test completed. Success:', success);
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error('Unexpected error during test:', error);
        process.exit(1);
    });