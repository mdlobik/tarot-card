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

## Troubleshooting

- If you see "Using local generation for tarot reading" in the console, check that your Gemini API key is correctly set in the `.env` file.
- If the application fails to start, ensure all dependencies are installed and that ports 3000 (frontend) and 3001 (backend) are available.
