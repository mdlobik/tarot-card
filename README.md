# Tarot Card Reading Application

An interactive tarot card reading application that allows users to draw three cards representing past, present, and future. The application provides personalized readings based on the cards drawn.

## Features

- Interactive card selection for past, present, and future positions
- Responsive design for desktop, tablet, and mobile devices
- Animated card flipping and deck shuffling effects
- Personalized tarot readings generated using Google's Gemini AI (with local fallback)
- Hover effects to view larger card images
- Highlighted card names in the reading for easy reference
- Option to purchase the tarot deck

## Setup Instructions

### Prerequisites

- Node.js (v18.x recommended)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with your Gemini API key:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

### Getting a Gemini API Key

To use the Gemini AI for generating tarot readings:

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key and paste it in your `.env` file

Make sure your `.env` file is formatted exactly like this:
```
GEMINI_API_KEY=your_actual_api_key_here
```

Important notes:
- Do not include quotes around the API key
- Do not add any spaces before or after the equals sign
- The file should be named exactly `.env` (with the dot) and placed in the root directory of the project
- Make sure the API key is not the placeholder text "your_gemini_api_key_here"

### Running the Application

Start the development server:
```
npm run dev
```

This will start both the React frontend and the Express backend.

## How It Works

### Tarot Reading Generation

The application can generate tarot readings in two ways:

1. **Gemini AI (Preferred)**: If a valid Gemini API key is provided, the application will use Google's Gemini AI to generate personalized readings based on the cards drawn.

2. **Local Generation (Fallback)**: If the Gemini API is not available or encounters an error, the application will fall back to a local generation method that uses pre-written interpretations for each card.

### Card Selection

- **Desktop**: All three cards are displayed horizontally. Users can select them in any order.
- **Mobile/Tablet**: Cards are displayed one at a time (Past, Present, Future). Users must select them in sequence.

## Customization

You can customize the prompt sent to Gemini AI by modifying the `generateTarotReadingWithGemini` function in `api/server.js`.

## Gemini API Usage and Limitations

### API Usage

The application uses Google's Gemini AI to generate personalized tarot readings. Here's what you should know:

- **Model Used**: The application uses the `gemini-1.5-pro` model, which is designed for complex text generation tasks.
- **Prompt Structure**: The prompt includes the cards drawn, their positions, and instructions for generating a structured reading.
- **Response Format**: The API returns a text response that includes interpretations for each card, connections between cards, and advice.
- **Retry Mechanism**: The application includes a retry mechanism that will attempt to call the API up to 3 times if there are temporary issues.

### API Limitations

Be aware of these limitations when using the Gemini API:

- **Rate Limits**: Google imposes rate limits on API calls. Free tier users may experience limitations.
- **Token Limits**: There are limits on the number of tokens (words/characters) that can be sent and received.
- **Cost**: While there is a free tier, heavy usage may incur costs. Monitor your usage in the Google AI Studio dashboard.
- **Availability**: The API may occasionally be unavailable due to maintenance or other issues.

### Testing the API

The application includes a test endpoint to verify that your Gemini API key is working correctly:

1. Start the server with `npm run server` or `npm run dev`
2. Access `http://localhost:3001/api/test-gemini` in your browser
3. Check the response:
   - Success: You'll see a JSON response with `"success": true` and a test message
   - Failure: You'll see error details that can help diagnose the issue

If the test endpoint works but the tarot readings still use local generation, check the server logs for more detailed error information.

## Troubleshooting

### Gemini API Issues

If you're experiencing issues with the Gemini API integration:

1. **Verify your API key is working**:
   - Access the test endpoint at `http://localhost:3001/api/test-gemini` in your browser
   - If successful, you'll see a JSON response with `"success": true`
   - If unsuccessful, you'll see detailed error information to help diagnose the issue

2. **Common issues and solutions**:
   - **"Using local generation for tarot reading" in the console**:
     - Check that your Gemini API key is correctly set in the `.env` file
     - Ensure the `.env` file is in the root directory of the project
     - Make sure the API key format is correct (no quotes, no spaces)
     - Restart the server after making changes to the `.env` file
   
   - **"Gemini API not initialized" error**:
     - Verify that the `.env` file is being loaded correctly
     - Check that the API key is valid and not expired
     - Ensure you have the correct permissions for the Gemini API
   
   - **API rate limiting or quota issues**:
     - The application includes a retry mechanism for temporary API issues
     - If you consistently hit rate limits, you may need to upgrade your API plan
     - Check your usage quotas in the Google AI Studio dashboard

3. **Checking server logs**:
   - The server logs detailed information about API calls and errors
   - Look for messages about the Gemini API initialization and API calls
   - Error details will help identify specific issues with your setup

### General Application Issues

- If the application fails to start, ensure all dependencies are installed and that ports 3000 (frontend) and 3001 (backend) are available.
- If you see React-related errors, try clearing your browser cache or using incognito mode.
- For server-side issues, check the terminal where you're running the server for error messages.
