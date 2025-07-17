const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Groq } = require('groq');

// Load environment variables
const path = require('path');
const envPath = path.resolve(process.cwd(), '.env');
console.log('Loading environment variables from:', envPath);
dotenv.config({ path: envPath });
console.log('Environment variables loaded');
console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
console.log('GEMINI_API_KEY length:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);
// Don't log the full API key for security reasons, just the first few characters
console.log('GEMINI_API_KEY prefix:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 5) + '...' : 'undefined');

// Initialize express app
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini API
const geminiApiKey = process.env.GEMINI_API_KEY;
console.log('geminiApiKey value:', geminiApiKey ? `${geminiApiKey.substring(0, 5)}... (${geminiApiKey.length} chars)` : 'undefined');
console.log('Is key valid format:', geminiApiKey && geminiApiKey !== 'your_gemini_api_key_here');

// Initialize Groq API
const groqApiKey = process.env.GROQ_API_KEY || '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';
console.log('groqApiKey value:', groqApiKey ? `${groqApiKey.substring(0, 5)}... (${groqApiKey.length} chars)` : 'undefined');

let genAI;
let groqClient;

// Initialize Gemini
try {
    if (geminiApiKey && geminiApiKey !== 'your_gemini_api_key_here') {
        console.log('Attempting to initialize Gemini API with key');
        genAI = new GoogleGenerativeAI(geminiApiKey);
        console.log('Gemini API initialized successfully:', !!genAI);
    } else {
        console.warn('Gemini API key not found or using placeholder. Will try Groq instead.');
    }
} catch (error) {
    console.error('Error initializing Gemini API:', error);
}

// Initialize Groq
try {
    if (groqApiKey) {
        console.log('Attempting to initialize Groq API with key');
        groqClient = new Groq({ apiKey: groqApiKey });
        console.log('Groq API initialized successfully:', !!groqClient);
    } else {
        console.warn('Groq API key not found. Falling back to local generation if Gemini also fails.');
    }
} catch (error) {
    console.error('Error initializing Groq API:', error);
}

// Function to generate tarot readings using Gemini API with retry mechanism
async function generateTarotReadingWithGemini(pastCard, presentCard, futureCard) {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // 1 second delay between retries
    
    // Helper function to delay execution
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    
    // Helper function for the actual API call with retry logic
    async function callGeminiWithRetry(attempt = 1) {
        try {
            console.log(`Starting generateTarotReadingWithGemini function (attempt ${attempt} of ${MAX_RETRIES})`);
            
            if (!genAI) {
                console.error('Gemini API not initialized, genAI is null or undefined');
                throw new Error('Gemini API not initialized');
            }
            
            console.log('Creating model instance with gemini-1.5-pro');
            
            // Create a model instance
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
            console.log('Model instance created successfully:', !!model);

            // Format the cards for the prompt
            const cardsInfo = `
Past Card: ${pastCard.name} - ${pastCard.description}
Present Card: ${presentCard.name} - ${presentCard.description}
Future Card: ${futureCard.name} - ${futureCard.description}
            `.trim();
            
            console.log('Cards info formatted for prompt');

            // Create the prompt for Gemini
            const prompt = `
You are an expert tarot reader with deep knowledge of tarot symbolism and interpretation. 
Please provide a detailed and personalized tarot reading based on the following three-card spread (Past, Present, Future):

${cardsInfo}

Your reading should include:
1. An interpretation of each card in its position (Past, Present, Future)
2. How the cards connect and influence each other
3. Patterns or themes across the spread (such as suits, elements, or archetypes)
4. Specific insights for any notable card combinations
5. Practical advice based on the overall reading

Format the reading as follows:
- Start with the Past card interpretation
- Then the Present card interpretation
- Then the Future card interpretation
- Follow with connections between the cards
- End with advice based on the spread

The reading should be personal, insightful, and around 300-400 words total.
            `.trim();
            
            console.log('Prompt created, length:', prompt.length);
            console.log(`Calling Gemini API to generate content (attempt ${attempt})...`);

            // Generate content
            const result = await model.generateContent(prompt);
            console.log('Content generated successfully, getting response');
            
            const response = await result.response;
            console.log('Response received, extracting text');
            
            const text = response.text();
            console.log('Text extracted, length:', text.length);
            
            return text;
            
        } catch (error) {
            console.error(`Error during API call to Gemini (attempt ${attempt}):`, error);
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            
            // If we haven't reached max retries, try again after a delay
            if (attempt < MAX_RETRIES) {
                console.log(`Retrying in ${RETRY_DELAY}ms... (${attempt} of ${MAX_RETRIES} attempts)`);
                await delay(RETRY_DELAY);
                return callGeminiWithRetry(attempt + 1);
            }
            
            // If we've reached max retries, throw the error
            console.error(`Max retries (${MAX_RETRIES}) reached. Giving up.`);
            throw error;
        }
    }
    
    // Start the retry process
    try {
        return await callGeminiWithRetry();
    } catch (error) {
        console.error('All attempts to generate reading with Gemini failed:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        throw error;
    }
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
            console.log(`Starting generateTarotReadingWithGroq function (attempt ${attempt} of ${MAX_RETRIES})`);
            
            if (!groqClient) {
                console.error('Groq API not initialized, groqClient is null or undefined');
                throw new Error('Groq API not initialized');
            }
            
            console.log('Creating chat completion with Groq using LLaMA-3-70b-flash');
            
            // Format the cards for the prompt
            const cardsInfo = `
Past Card: ${pastCard.name} - ${pastCard.description}
Present Card: ${presentCard.name} - ${presentCard.description}
Future Card: ${futureCard.name} - ${futureCard.description}
            `.trim();
            
            console.log('Cards info formatted for prompt');

            // Create the prompt for Groq
            const prompt = `
You are an expert tarot reader with deep knowledge of tarot symbolism and interpretation. 
Please provide a detailed and personalized tarot reading based on the following three-card spread (Past, Present, Future):

${cardsInfo}

Your reading should include:
1. An interpretation of each card in its position (Past, Present, Future)
2. How the cards connect and influence each other
3. Patterns or themes across the spread (such as suits, elements, or archetypes)
4. Specific insights for any notable card combinations
5. Practical advice based on the overall reading

Format the reading as follows:
- Start with the Past card interpretation
- Then the Present card interpretation
- Then the Future card interpretation
- Follow with connections between the cards
- End with advice based on the spread

The reading should be personal, insightful, and around 300-400 words total.
            `.trim();
            
            console.log('Prompt created for Groq, length:', prompt.length);
            console.log(`Calling Groq API to generate content (attempt ${attempt})...`);

            // Generate content using Groq
            const completion = await groqClient.chat.completions.create({
                messages: [
                    { role: "system", content: "You are an expert tarot reader with deep knowledge of tarot symbolism and interpretation." },
                    { role: "user", content: prompt }
                ],
                model: "llama3-70b-8192",  // Using LLaMA-3-70b model
                temperature: 0.7,
                max_tokens: 1024,
            });
            
            console.log('Content generated successfully with Groq');
            
            if (completion.choices && completion.choices.length > 0) {
                const text = completion.choices[0].message.content;
                console.log('Text extracted from Groq response, length:', text.length);
                return text;
            } else {
                throw new Error('No content in Groq response');
            }
            
        } catch (error) {
            console.error(`Error during API call to Groq (attempt ${attempt}):`, error);
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            
            // If we haven't reached max retries, try again after a delay
            if (attempt < MAX_RETRIES) {
                console.log(`Retrying in ${RETRY_DELAY}ms... (${attempt} of ${MAX_RETRIES} attempts)`);
                await delay(RETRY_DELAY);
                return callGroqWithRetry(attempt + 1);
            }
            
            // If we've reached max retries, throw the error
            console.error(`Max retries (${MAX_RETRIES}) reached. Giving up on Groq.`);
            throw error;
        }
    }
    
    // Start the retry process
    try {
        return await callGroqWithRetry();
    } catch (error) {
        console.error('All attempts to generate reading with Groq failed:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        throw error;
    }
}

// Function to generate a combined LLM reading that takes card order into account
async function generateCombinedLLMReading(pastCard, presentCard, futureCard) {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // 1 second delay between retries
    
    // Helper function to delay execution
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    
    // Helper function for the actual API call with retry logic
    async function callGeminiWithRetry(attempt = 1) {
        try {
            console.log(`Starting generateCombinedLLMReading function (attempt ${attempt} of ${MAX_RETRIES})`);
            
            if (!genAI) {
                console.error('Gemini API not initialized, genAI is null or undefined');
                throw new Error('Gemini API not initialized');
            }
            
            console.log('Creating model instance with gemini-1.5-pro');
            
            // Create a model instance
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
            console.log('Model instance created successfully:', !!model);

            // Format the cards for the prompt
            const cardsInfo = `
Past Card: ${pastCard.name} - ${pastCard.description}
Present Card: ${presentCard.name} - ${presentCard.description}
Future Card: ${futureCard.name} - ${futureCard.description}
            `.trim();
            
            console.log('Cards info formatted for prompt');

            // Create the prompt for Gemini
            const prompt = `
You are an expert tarot reader with deep knowledge of tarot symbolism and interpretation. 
I need you to create a holistic, integrated tarot reading that combines all three cards (Past, Present, Future) into a single cohesive narrative.

Here are the three cards that were drawn in order:

${cardsInfo}

Important: The order of the cards is significant. The first card represents the past, the second represents the present, and the third represents the future.

Create a single, flowing narrative that:
1. Weaves together all three cards into one cohesive story
2. Shows how each position (past, present, future) influences the others
3. Highlights the journey or progression from past through present to future
4. Identifies any significant patterns, themes, or connections between the cards
5. Provides meaningful insights based on the specific combination and order of these cards

Your response should be a single, integrated paragraph of about 150-200 words that tells the complete story of this reading.
            `.trim();
            
            console.log('Combined reading prompt created, length:', prompt.length);
            console.log(`Calling Gemini API to generate combined content (attempt ${attempt})...`);

            // Generate content
            const result = await model.generateContent(prompt);
            console.log('Combined content generated successfully, getting response');
            
            const response = await result.response;
            console.log('Combined response received, extracting text');
            
            const text = response.text();
            console.log('Combined text extracted, length:', text.length);
            
            return text;
            
        } catch (error) {
            console.error(`Error during API call to Gemini for combined reading (attempt ${attempt}):`, error);
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            
            // If we haven't reached max retries, try again after a delay
            if (attempt < MAX_RETRIES) {
                console.log(`Retrying in ${RETRY_DELAY}ms... (${attempt} of ${MAX_RETRIES} attempts)`);
                await delay(RETRY_DELAY);
                return callGeminiWithRetry(attempt + 1);
            }
            
            // If we've reached max retries, throw the error
            console.error(`Max retries (${MAX_RETRIES}) reached. Giving up.`);
            throw error;
        }
    }
    
    // Start the retry process
    try {
        return await callGeminiWithRetry();
    } catch (error) {
        console.error('All attempts to generate combined LLM reading failed:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        throw error;
    }
}

// Function to generate tarot readings locally
function generateTarotReading(pastCard, presentCard, futureCard) {
    // Template readings based on card positions
    const readings = {
        past: {
            // Major Arcana
            "The Fool": "In the past, you embarked on a journey with innocence and openness. You were willing to take risks without fear of the outcome, which has shaped your current path in profound ways.",
            "The Magician": "Your past shows a time when you harnessed your talents and resources to manifest your desires. This mastery of your skills continues to influence your capabilities today.",
            "The High Priestess": "Your intuition guided you strongly in the past. There were secrets or hidden knowledge that influenced your path, creating a foundation of inner wisdom you can now draw upon.",
            "The Empress": "Your past was marked by abundance, nurturing, and creativity. You may have been in a period of growth or fertility that has enriched your present circumstances.",
            "The Emperor": "Structure and authority figured prominently in your past. You either wielded authority or were under its influence, establishing patterns of order that remain relevant.",
            "Faith": "Traditional values or spiritual teachings were significant in your past. You may have sought guidance from established institutions, forming beliefs that continue to guide you.",
            "The Lovers": "A significant relationship or important choice marked your past. Harmony and alignment of values were important themes that have shaped your approach to connections.",
            "The Chariot": "You demonstrated determination and willpower in the past. You overcame obstacles through sheer force of will, developing resilience that serves you now.",
            "Justice": "You faced consequences of past actions or made important decisions based on fairness and truth. This commitment to balance has influenced your moral compass.",
            "The Hermit": "A period of introspection or solitude marked your past. You sought wisdom within yourself, developing self-knowledge that illuminates your current path.",
            "The Wheel": "Your past saw significant changes in fortune. Cycles of fate brought both ups and downs, teaching you about life's inevitable fluctuations.",
            "Strength": "Inner courage and patience were your allies in the past. You faced challenges with composure and gentle strength, building character that supports you now.",
            "The Hanged Man": "You surrendered to circumstances beyond your control in the past, gaining new perspectives through sacrifice. This shift in viewpoint continues to offer unique insights.",
            "Death": "A significant transformation or ending occurred in your past, making way for renewal. This profound change altered your course and created space for new growth.",
            "Temperance": "Balance and moderation were key themes in your past. You may have been harmonizing different aspects of your life, developing integration skills that remain valuable.",
            "The Devil": "Your past was influenced by attachments, dependencies, or illusions that limited your freedom. Working through these constraints has shaped your understanding of true liberty.",
            "The Tower": "A sudden disruption or revelation changed your course in the past. Old structures fell away, forcing rebuilding that has made you more adaptable to change.",
            "The Star": "Hope and inspiration guided you in the past. You may have found healing after difficulty, establishing a connection to optimism that still sustains you.",
            "The Moon": "Uncertainty and illusion characterized your past. Your intuition navigated you through confusing waters, developing your ability to trust your inner guidance.",
            "The Sun": "Joy and vitality brightened your past. You experienced success and clarity that created a foundation of confidence and positive energy.",
            "Judgment": "You experienced a reawakening or answered a calling in your past. A period of evaluation led to renewal, setting you on a path of greater authenticity.",
            "The World": "Your past saw the completion of an important cycle. You achieved a sense of wholeness or accomplishment that provides a foundation for new beginnings.",

            // Cups Suit (Emotions, Relationships)
            "Ace of Cups": "Your past featured a significant emotional beginning or spiritual awakening. This opening of the heart has influenced how you connect with others today.",
            "Two of Cups": "A meaningful partnership or deep connection in your past has shaped your understanding of relationships. This bond taught you about emotional exchange and balance.",
            "Three of Cups": "Community celebration and friendship were highlights of your past. These joyful connections established patterns of support that continue to nourish you.",
            "Four of Cups": "A period of emotional contemplation or dissatisfaction marked your past. This introspective time helped you recognize what truly fulfills you.",
            "Five of Cups": "You experienced significant loss or disappointment in the past. Working through this grief has developed your resilience and appreciation for what remains.",
            "Six of Cups": "Nostalgia, innocence, or childhood memories were important in your past. These sweet recollections continue to provide comfort and perspective.",
            "Seven of Cups": "You faced many choices or illusions in your past. Navigating these options developed your discernment between fantasy and reality.",
            "Eight of Cups": "You made the difficult choice to walk away from something emotionally significant. This courageous departure set you on a path of deeper fulfillment.",
            "Nine of Cups": "A period of emotional satisfaction and wish fulfillment blessed your past. This experience of abundance created a foundation of gratitude.",
            "Ten of Cups": "Harmonious relationships and emotional fulfillment characterized your past. This experience of deep connection established your vision of happiness.",
            "Page of Cups": "Creative inspiration or emotional messages appeared in your past. This sensitivity to feelings developed your intuitive and artistic nature.",
            "Knight of Cups": "Romantic pursuits or creative quests featured in your past. This passionate seeking shaped your ideals and emotional approach.",
            "Queen of Cups": "Emotional nurturing and intuitive understanding were your strengths or influences in the past. This compassionate energy developed your empathy.",
            "King of Cups": "Emotional mastery and balanced leadership marked your past. This control over feelings while remaining connected to them built your emotional intelligence.",

            // Coins/Pentacles Suit (Material World, Resources)
            "Ace of Coins": "A significant material opportunity or beginning manifested in your past. This seed of prosperity continues to influence your approach to resources.",
            "Two of Coins": "You navigated change and balanced multiple priorities in your past. This juggling act developed your adaptability and resource management skills.",
            "Three of Coins": "Collaboration and craftsmanship were important in your past. Working with others to create something of value established your professional approach.",
            "Four of Coins": "Security concerns or conservation of resources featured in your past. This careful stewardship shaped your relationship with stability and possessions.",
            "Five of Coins": "Material hardship or feeling excluded occurred in your past. These challenges developed your resilience and compassion for others in need.",
            "Six of Coins": "Giving or receiving help featured in your past. These exchanges taught you about generosity and the circulation of resources.",
            "Seven of Coins": "Patient development and assessment of progress marked your past. This long-term perspective shaped your approach to growth and investment.",
            "Eight of Coins": "Dedicated skill development or apprenticeship featured in your past. This focused craftsmanship built your expertise and work ethic.",
            "Nine of Coins": "Self-sufficiency and material comfort blessed your past. This independence created a foundation of confidence in your ability to provide for yourself.",
            "Nine of Pentacles": "Refined taste and self-discipline characterized your past. These cultivated qualities established your appreciation for quality and beauty.",
            "Ten of Coins": "Family wealth or long-term security featured in your past. This legacy established your understanding of lasting value and inheritance.",
            "Page of Coins": "Practical learning or a new material opportunity appeared in your past. This studious approach developed your practical intelligence.",
            "Knight of Coins": "Methodical progress and reliability were your approach in the past. This steady persistence built your reputation for dependability.",
            "Queen of Coins": "Nurturing abundance and practical care were your strengths or influences in the past. This grounded generosity shaped your approach to resources.",
            "King of Coins": "Material mastery and business acumen marked your past. This authority with resources established your approach to wealth and security.",

            // Wands Suit (Energy, Passion, Action)
            "Ace of Wands": "A spark of inspiration or new passionate beginning ignited in your past. This creative fire continues to fuel your current endeavors.",
            "Two of Wands": "Planning expansion or making important choices about your direction featured in your past. These decisions set your current course.",
            "Three of Wands": "Looking toward broader horizons and initial achievement marked your past. This vision established your expectations for growth.",
            "Four of Wands": "Celebration of stability and community connection blessed your past. These joyful foundations created a sense of belonging.",
            "Five of Wands": "Competition or conflict challenged you in the past. Navigating these tensions developed your ability to assert yourself constructively.",
            "Six of Wands": "Recognition and victory rewarded your efforts in the past. This success established confidence in your abilities.",
            "Seven of Wands": "Standing your ground against opposition featured in your past. This defensive stance developed your courage and conviction.",
            "Eight of Wands": "Swift developments and aligned energies propelled you forward in the past. This momentum established a pattern of progress.",
            "Nine of Wands": "Resilience through difficulty and maintaining boundaries were necessary in your past. This persistence built your inner strength.",
            "Ten of Wands": "Carrying heavy responsibilities or burdens weighed on you in the past. This overextension taught you about your limits and priorities.",
            "Page of Wands": "Enthusiastic exploration and discovery characterized your past. This adventurous spirit developed your openness to new experiences.",
            "Knight of Wands": "Bold action and passionate pursuit featured in your past. This energetic approach shaped your relationship with risk and adventure.",
            "Queen of Wands": "Confident self-expression and social leadership were your strengths or influences in the past. This charisma developed your authentic presence.",
            "King of Wands": "Visionary leadership and creative authority marked your past. This commanding energy established your approach to inspiration and direction.",

            // Swords Suit (Thought, Communication, Conflict)
            "Ace of Swords": "A moment of clarity or breakthrough thinking occurred in your past. This mental sharpness continues to cut through confusion.",
            "Two of Swords": "Difficult decisions or emotional stalemate featured in your past. This period of weighing options developed your analytical skills.",
            "Three of Swords": "Heartbreak or painful truth affected you deeply in the past. Working through this sorrow built your emotional resilience.",
            "Four of Swords": "A necessary period of rest and recovery marked your past. This pause allowed integration that still benefits your mental approach.",
            "Five of Swords": "Conflict or defeat taught you difficult lessons in the past. These experiences shaped your understanding of competition and fairness.",
            "Six of Swords": "Transition away from troubled waters featured in your past. This journey toward calmer circumstances established your path to healing.",
            "Seven of Swords": "Strategic thinking or dealing with deception occurred in your past. These experiences developed your discernment and tactical approach.",
            "Eight of Swords": "Feeling trapped by limiting beliefs or circumstances restricted you in the past. Working through these constraints taught you about mental freedom.",
            "Nine of Swords": "Anxiety or mental anguish troubled your past. Managing these worries developed your coping mechanisms and perspective.",
            "Ten of Swords": "A painful ending or rock bottom experience marked your past. This conclusion, though difficult, cleared the way for renewal.",
            "Page of Swords": "Intellectual curiosity and new ideas characterized your past. This mental alertness developed your analytical abilities.",
            "Knight of Swords": "Direct action and intellectual pursuit featured in your past. This determined approach shaped your relationship with truth and communication.",
            "Queen of Swords": "Clear boundaries and independent thinking were your strengths or influences in the past. This discernment developed your intellectual autonomy.",
            "King of Swords": "Intellectual authority and ethical leadership marked your past. This mental mastery established your approach to decisions and truth."
        },
        present: {
            // Major Arcana
            "The Fool": "Currently, you stand at the edge of something new. Trust your instincts and embrace this fresh beginning without fear. This moment of potential contains infinite possibilities if you take that first step.",
            "The Magician": "You currently possess all the tools you need to succeed. It's time to channel your energies with focused intent. Your ability to transform ideas into reality is particularly powerful right now.",
            "The High Priestess": "Your intuition is especially strong now. Listen to your inner voice and pay attention to dreams and subtle messages. The answers you seek lie beneath the surface of conscious thought.",
            "The Empress": "You're in a period of creativity and nurturing energy. Abundance surrounds you if you open to receive it. Your capacity to bring forth new ideas and care for yourself and others is heightened.",
            "The Emperor": "Structure and organization are needed in your current situation. Take charge and establish order. Your ability to create systems and boundaries will determine your success at this time.",
            "Faith": "Seek wisdom from traditional sources or mentors now. Conventional approaches may serve you best. Connecting with established wisdom can provide the guidance you currently need.",
            "The Lovers": "You're facing an important choice in your current situation. Alignment with your values will guide you correctly. This decision requires integration of seemingly opposing elements.",
            "The Chariot": "Determination is required now. Keep focused on your goal despite any opposing forces. Your willpower and ability to harness conflicting energies will determine your progress.",
            "Justice": "Fairness and truth are highlighted in your present. Decisions now will have balanced consequences. This is a time when cause and effect are particularly clear and immediate.",
            "The Hermit": "This is a time for reflection and solitude. The answers you seek are found within. Your inner light will illuminate the path forward if you take time for contemplation.",
            "The Wheel": "You're in a period of change. Be adaptable as circumstances shift around you. Understanding the cyclical nature of experience will help you navigate current transitions.",
            "Strength": "Your current challenges require patience and inner strength rather than force. Gentle persistence will prevail. Your capacity for compassionate firmness is being tested and developed.",
            "The Hanged Man": "Your current situation calls for surrender and a new perspective. Let go of control to gain insight. What seems like suspension of progress is actually a necessary pause for understanding.",
            "Death": "You're in the midst of a profound transformation. Release what no longer serves you to make way for the new. This ending is essential for your evolution and renewal.",
            "Temperance": "Balance and moderation are needed now. Find the middle path between extremes. Your ability to blend different elements of your life harmoniously is crucial at this time.",
            "The Devil": "Be aware of limitations or attachments currently holding you back. Freedom comes through awareness. Recognizing patterns of dependency is the first step toward liberation.",
            "The Tower": "Unexpected change is occurring or imminent. Though disruptive, it creates space for something better. This necessary breakdown of outdated structures will ultimately benefit you.",
            "The Star": "Hope guides your present path. Trust that healing and renewal are available to you now. After difficulties, this period offers gentle restoration and faith in possibilities.",
            "The Moon": "Your current situation involves uncertainty. Trust your intuition to navigate through confusion. Not everything is as it appears, but your inner knowing will guide you.",
            "The Sun": "Joy and clarity illuminate your present. Success and vitality are available to you now. This is a time of achievement and the realization of your authentic self.",
            "Judgment": "You're experiencing a calling or awakening. Heed this call to renewal. This is a time of reckoning that offers profound rebirth if you respond authentically.",
            "The World": "You're reaching completion of an important cycle. Integration and fulfillment are at hand. This moment offers a sense of wholeness before the next beginning.",

            // Cups Suit (Emotions, Relationships)
            "Ace of Cups": "A new emotional beginning or spiritual awakening is available to you now. Open your heart to receive this gift of love or intuitive connection that's being offered.",
            "Two of Cups": "Harmonious partnership and emotional exchange characterize your present. This balanced connection offers mutual understanding and respect that nurtures both parties.",
            "Three of Cups": "Community celebration and joyful connection surround you now. Embrace these supportive relationships and allow yourself to experience shared happiness.",
            "Four of Cups": "Emotional contemplation or reassessment is necessary in your present. Look beyond apparent limitations to recognize opportunities you may be overlooking.",
            "Five of Cups": "Current disappointment or loss requires acknowledging grief while also recognizing what remains valuable. This challenging time teaches the importance of perspective.",
            "Six of Cups": "Nostalgia or innocent joy colors your present experience. These gentle emotions offer healing through reconnection with simpler pleasures and past comforts.",
            "Seven of Cups": "Multiple options or illusions present themselves now. Careful discernment is needed to distinguish between fantasy and attainable reality in your choices.",
            "Eight of Cups": "Your present calls for emotional courage to walk away from what no longer serves your deeper needs. This necessary departure opens the path to greater fulfillment.",
            "Nine of Cups": "Emotional satisfaction and wish fulfillment characterize your present. This period of contentment allows you to recognize and appreciate the abundance in your life.",
            "Ten of Cups": "Harmonious relationships and emotional fulfillment bless your present. This experience of connection and joy represents the realization of emotional hopes.",
            "Page of Cups": "Creative inspiration or emotional messages appear in your present. Remain open to unexpected insights and the gentle stirrings of new feelings or artistic impulses.",
            "Knight of Cups": "Romantic opportunities or creative pursuits feature in your present. Follow these heartfelt quests with sincerity and emotional intelligence.",
            "Queen of Cups": "Compassionate understanding and intuitive wisdom are available to you now. Your emotional intelligence and nurturing capacity are particularly strong at this time.",
            "King of Cups": "Emotional mastery and balanced leadership are called for in your present. Your ability to remain connected to feelings while maintaining control is crucial now.",

            // Coins/Pentacles Suit (Material World, Resources)
            "Ace of Coins": "A new material opportunity or resource is manifesting in your present. This seed of prosperity requires practical action to develop its potential.",
            "Two of Coins": "Balancing multiple priorities and adapting to change characterize your present. Flexibility and resource management are essential skills for this juggling act.",
            "Three of Coins": "Collaboration and recognition of your skills feature in your present. Working with others to create something of value brings both learning and accomplishment.",
            "Four of Coins": "Security concerns or conservation of resources influence your present. Consider whether your desire for stability is providing protection or limiting growth.",
            "Five of Coins": "Material challenge or feeling excluded affects your present. Remember that help is available if you're willing to seek support rather than struggling alone.",
            "Six of Coins": "Giving or receiving help features in your present. These exchanges teach the importance of generosity and the healthy circulation of resources.",
            "Seven of Coins": "Assessment of progress and patience with development characterize your present. This period of evaluation helps determine whether adjustments are needed.",
            "Eight of Coins": "Focused skill development and attention to detail are important in your present. This dedicated craftsmanship builds expertise and reputation for quality.",
            "Nine of Coins": "Self-sufficiency and material comfort characterize your present. This independence allows appreciation of beauty and the fruits of your disciplined efforts.",
            "Nine of Pentacles": "Refined taste and self-discipline bring rewards in your present. These cultivated qualities allow you to create and enjoy abundance through careful management.",
            "Ten of Coins": "Established security and consideration of legacy feature in your present. This stable foundation supports both current comfort and future generations.",
            "Page of Coins": "Practical learning or a new material opportunity appears in your present. A studious approach to developing this potential will yield valuable results.",
            "Knight of Coins": "Methodical progress and reliability characterize your present approach. This steady persistence may seem slow but builds lasting results.",
            "Queen of Coins": "Nurturing abundance and practical care are your strengths in the present. Your grounded generosity creates security for yourself and those you support.",
            "King of Coins": "Material mastery and business acumen serve you in the present. Your authority with resources allows wise management of prosperity.",

            // Wands Suit (Energy, Passion, Action)
            "Ace of Wands": "A spark of inspiration or new passionate beginning ignites in your present. This creative fire offers potential that requires your action to develop.",
            "Two of Wands": "Planning expansion or making important choices about your direction feature in your present. These decisions establish the course for future growth.",
            "Three of Wands": "Initial achievement and looking toward broader horizons characterize your present. This vision of possibilities builds on current accomplishments.",
            "Four of Wands": "Celebration of stability and community connection bless your present. These joyful foundations provide a sense of belonging and accomplishment.",
            "Five of Wands": "Competition or conflict challenges you in the present. Navigating these tensions requires asserting yourself while respecting diverse energies.",
            "Six of Wands": "Recognition and victory reward your efforts in the present. This success builds confidence and establishes your position of positive influence.",
            "Seven of Wands": "Standing your ground against opposition features in your present. This defensive stance requires courage and conviction in your position.",
            "Eight of Wands": "Swift developments and aligned energies propel you forward in the present. This momentum creates progress when you move with decisive timing.",
            "Nine of Wands": "Resilience through difficulty and maintaining boundaries are necessary in your present. This persistence requires drawing on reserves of strength.",
            "Ten of Wands": "Heavy responsibilities or burdens weigh on you in the present. This overextension calls for reassessment of priorities and delegation where possible.",
            "Page of Wands": "Enthusiastic exploration and discovery characterize your present. This adventurous spirit opens you to new experiences and creative possibilities.",
            "Knight of Wands": "Bold action and passionate pursuit feature in your present. This energetic approach brings excitement but requires direction to be effective.",
            "Queen of Wands": "Confident self-expression and social leadership are your strengths in the present. This charisma allows you to inspire others through authentic presence.",
            "King of Wands": "Visionary leadership and creative authority mark your present. This commanding energy allows you to direct inspiration toward concrete achievement.",

            // Swords Suit (Thought, Communication, Conflict)
            "Ace of Swords": "Mental clarity or breakthrough thinking occurs in your present. This sharp insight cuts through confusion to reveal essential truth.",
            "Two of Swords": "Difficult decisions or emotional stalemate feature in your present. This period of weighing options requires honest assessment to move forward.",
            "Three of Swords": "Painful truth or heartbreak affects you in the present. This sorrow, though difficult, leads to necessary healing and greater authenticity.",
            "Four of Swords": "Rest and recovery are necessary in your present. This pause allows integration of experiences and restoration of mental energy.",
            "Five of Swords": "Conflict or strategic thinking features in your present. These challenging interactions require consideration of both winning and the cost of victory.",
            "Six of Swords": "Transition toward calmer circumstances characterizes your present. This journey away from troubled waters leads gradually to greater peace.",
            "Seven of Swords": "Strategic thinking or dealing with deception occurs in your present. These experiences require discernment and careful consideration of tactics.",
            "Eight of Swords": "Feeling trapped by limiting beliefs or circumstances restricts you in the present. Recognizing these constraints as partly self-imposed is the first step to freedom.",
            "Nine of Swords": "Anxiety or mental anguish troubles your present. Managing these worries requires distinguishing between productive concern and excessive rumination.",
            "Ten of Swords": "A difficult ending or moment of truth characterizes your present. This conclusion, though painful, clears the way for new beginnings.",
            "Page of Swords": "Intellectual curiosity and new ideas characterize your present. This mental alertness brings valuable information if you remain observant.",
            "Knight of Swords": "Direct action and intellectual pursuit feature in your present. This determined approach brings progress but requires tempering with consideration.",
            "Queen of Swords": "Clear boundaries and independent thinking are your strengths in the present. This discernment allows honest assessment and effective communication.",
            "King of Swords": "Intellectual authority and ethical leadership mark your present. This mental mastery allows fair decisions based on principle and truth."
        },
        future: {
            // Major Arcana
            "The Fool": "A new adventure awaits in your future. Approach it with openness and trust in the journey. This beginning will require courage but offers remarkable potential for growth.",
            "The Magician": "Your future holds opportunities to manifest your desires. Your skills will align with your intentions, allowing transformation of ideas into reality through focused will.",
            "The High Priestess": "Deeper wisdom and intuitive understanding will be revealed to you. Pay attention to the unseen. Your connection to subconscious knowledge will strengthen.",
            "The Empress": "Creativity and abundance will flourish in your future. A period of growth and nurturing lies ahead, bringing fertility to your projects and relationships.",
            "The Emperor": "You will establish solid foundations and gain control in your future. Leadership may be your role, requiring structure and organization to support long-term success.",
            "Faith": "Traditional wisdom or established paths will provide guidance in your future. Consider seeking a mentor whose experience can illuminate your way forward.",
            "The Lovers": "A significant relationship or important choice lies ahead. Harmony will come through alignment with your values and integration of seemingly opposing elements.",
            "The Chariot": "Success through determination awaits you. Stay focused on your destination despite contradictory forces. Your willpower will harness opposing energies productively.",
            "Justice": "The future holds balanced outcomes based on your actions. Truth and fairness will prevail, bringing consequences that reflect your choices with perfect equilibrium.",
            "The Hermit": "A period of introspection lies ahead. Wisdom will come through solitude and inner searching. Your own inner light will guide you toward deeper understanding.",
            "The Wheel": "Expect significant changes in your future. The wheel turns, bringing new circumstances that require adaptability and recognition of life's cyclical nature.",
            "Strength": "Your future challenges will require inner strength rather than force. Gentle persistence will bring victory through compassionate firmness rather than aggression.",
            "The Hanged Man": "A period of valuable surrender lies ahead. Gaining new perspectives will require letting go of control and accepting temporary suspension of normal progress.",
            "Death": "A transformative ending makes way for new beginnings in your future. Embrace this powerful transition as essential for evolution and renewal.",
            "Temperance": "Balance and harmony await you. The future brings integration of seemingly opposing elements through moderation and the middle path between extremes.",
            "The Devil": "Be aware of potential restrictions in your future. Freedom will come through recognizing and releasing attachments, dependencies, or illusions that limit you.",
            "The Tower": "Unexpected disruption may occur in your future. Though challenging, it will clear the way for rebuilding on more authentic foundations.",
            "The Star": "Hope and renewal lie ahead. After difficulties, healing light will guide your way toward gentle restoration and renewed faith in possibilities.",
            "The Moon": "Your path forward may not be clear immediately. Trust your intuition to navigate uncertainty and illusion. Not everything will be as it appears.",
            "The Sun": "Joy and success await you. Your future holds clarity, vitality, and positive outcomes that allow full expression of your authentic self.",
            "Judgment": "A reawakening or calling lies ahead. Heed this future opportunity for renewal and rebirth through honest self-evaluation and response to your true purpose.",
            "The World": "Completion and fulfillment await you. A significant cycle will reach its successful conclusion, bringing integration, wholeness, and preparation for new beginnings.",

            // Cups Suit (Emotions, Relationships)
            "Ace of Cups": "A new emotional beginning or spiritual awakening awaits you. This future gift of love or intuitive connection will open your heart to fresh possibilities.",
            "Two of Cups": "Harmonious partnership and emotional balance lie ahead. This future connection will offer mutual understanding and respect that nurtures both parties.",
            "Three of Cups": "Community celebration and joyful connection await you. These future relationships will provide support and shared happiness in your journey.",
            "Four of Cups": "A period of emotional contemplation or reassessment lies ahead. This future introspection will help you recognize opportunities beyond apparent limitations.",
            "Five of Cups": "A challenging emotional experience awaits, but it will teach the importance of acknowledging loss while recognizing what remains valuable.",
            "Six of Cups": "Nostalgia or innocent joy will color your future experiences. These gentle emotions will offer healing through reconnection with simpler pleasures.",
            "Seven of Cups": "Multiple emotional or creative options will present themselves. Your future will require careful discernment between fantasy and attainable reality.",
            "Eight of Cups": "Your future will call for emotional courage to walk away from what no longer serves your deeper needs, opening the path to greater fulfillment.",
            "Nine of Cups": "Emotional satisfaction and wish fulfillment await you. This future period of contentment will allow recognition and appreciation of abundance.",
            "Ten of Cups": "Harmonious relationships and emotional fulfillment lie ahead. This future experience of connection and joy represents the realization of emotional hopes.",
            "Page of Cups": "Creative inspiration or emotional messages will appear in your future. Remain open to unexpected insights and the gentle beginnings of new feelings.",
            "Knight of Cups": "Romantic opportunities or creative pursuits feature in your future. These heartfelt quests will require sincerity and emotional intelligence.",
            "Queen of Cups": "Compassionate understanding and intuitive wisdom will be available to you. Your future emotional intelligence and nurturing capacity will strengthen.",
            "King of Cups": "Emotional mastery and balanced leadership lie ahead. Your future ability to remain connected to feelings while maintaining control will be crucial.",

            // Coins/Pentacles Suit (Material World, Resources)
            "Ace of Coins": "A new material opportunity or resource will manifest in your future. This seed of prosperity will require practical action to develop its potential.",
            "Two of Coins": "Balancing multiple priorities and adapting to change will characterize your future. Flexibility and resource management will be essential skills.",
            "Three of Coins": "Collaboration and recognition of your skills await you. Working with others to create something of value will bring both learning and accomplishment.",
            "Four of Coins": "Security concerns or conservation of resources will influence your future. Consider whether your desire for stability provides protection or limits growth.",
            "Five of Coins": "A material challenge may lie ahead, but remember that help will be available if you're willing to seek support rather than struggling alone.",
            "Six of Coins": "Giving or receiving help will feature in your future. These exchanges will teach the importance of generosity and healthy circulation of resources.",
            "Seven of Coins": "Assessment of progress and patience with development will characterize your future. This period of evaluation will help determine needed adjustments.",
            "Eight of Coins": "Focused skill development and attention to detail will be important in your future. This dedicated craftsmanship will build expertise and quality.",
            "Nine of Coins": "Self-sufficiency and material comfort await you. This future independence will allow appreciation of beauty and the fruits of disciplined efforts.",
            "Nine of Pentacles": "Refined taste and self-discipline will bring rewards in your future. These cultivated qualities will create abundance through careful management.",
            "Ten of Coins": "Established security and consideration of legacy lie ahead. This stable foundation will support both comfort and future generations.",
            "Page of Coins": "Practical learning or a new material opportunity will appear in your future. A studious approach to developing this potential will yield value.",
            "Knight of Coins": "Methodical progress and reliability will characterize your future approach. This steady persistence may seem slow but will build lasting results.",
            "Queen of Coins": "Nurturing abundance and practical care will be your future strengths. Your grounded generosity will create security for yourself and those you support.",
            "King of Coins": "Material mastery and business acumen await you. Your future authority with resources will allow wise management of prosperity.",

            // Wands Suit (Energy, Passion, Action)
            "Ace of Wands": "A spark of inspiration or new passionate beginning will ignite in your future. This creative fire will offer potential that requires action to develop.",
            "Two of Wands": "Planning expansion or making important directional choices lies ahead. These future decisions will establish the course for significant growth.",
            "Three of Wands": "Initial achievement and broader horizons await you. This future vision of possibilities will build on accomplishments you've already established.",
            "Four of Wands": "Celebration of stability and community connection lies ahead. These joyful foundations will provide a sense of belonging and accomplishment.",
            "Five of Wands": "Competition or conflict will challenge you in the future. Navigating these tensions will require asserting yourself while respecting diverse energies.",
            "Six of Wands": "Recognition and victory will reward your future efforts. This success will build confidence and establish your position of positive influence.",
            "Seven of Wands": "Standing your ground against opposition will be necessary in your future. This defensive stance will require courage and conviction.",
            "Eight of Wands": "Swift developments and aligned energies will propel you forward. This future momentum will create progress when you move with decisive timing.",
            "Nine of Wands": "Resilience through difficulty and maintaining boundaries will be necessary in your future. This persistence will require reserves of strength.",
            "Ten of Wands": "Heavy responsibilities may temporarily weigh on you in the future. This period will call for reassessment of priorities and delegation.",
            "Page of Wands": "Enthusiastic exploration and discovery lie ahead. This adventurous spirit will open you to new experiences and creative possibilities.",
            "Knight of Wands": "Bold action and passionate pursuit feature in your future. This energetic approach will bring excitement but will require direction.",
            "Queen of Wands": "Confident self-expression and social leadership will be your future strengths. This charisma will allow you to inspire through authentic presence.",
            "King of Wands": "Visionary leadership and creative authority lie ahead. This commanding energy will allow you to direct inspiration toward concrete achievement.",

            // Swords Suit (Thought, Communication, Conflict)
            "Ace of Swords": "Mental clarity or breakthrough thinking awaits you. This future insight will cut through confusion to reveal essential truth.",
            "Two of Swords": "Difficult decisions or temporary stalemate lie ahead. This future period of weighing options will require honest assessment to move forward.",
            "Three of Swords": "A painful truth may emerge in your future, but this clarity, though difficult, will lead to necessary healing and greater authenticity.",
            "Four of Swords": "A period of rest and recovery lies ahead. This future pause will allow integration of experiences and restoration of mental energy.",
            "Five of Swords": "Conflict or strategic thinking will feature in your future. These challenging interactions will require consideration of both winning and its cost.",
            "Six of Swords": "Transition toward calmer circumstances lies ahead. This journey away from troubled waters will lead gradually to greater peace.",
            "Seven of Swords": "Strategic thinking or navigating complex situations will be necessary in your future. These experiences will require discernment and careful tactics.",
            "Eight of Swords": "Feeling temporarily restricted may occur in your future, but recognizing these constraints as partly self-imposed will be your first step to freedom.",
            "Nine of Swords": "A period of worry may lie ahead, but you'll learn to distinguish between productive concern and excessive rumination.",
            "Ten of Swords": "A difficult ending will eventually clear the way for new beginnings. This future conclusion, though challenging, will be necessary for renewal.",
            "Page of Swords": "Intellectual curiosity and new ideas lie ahead. This mental alertness will bring valuable information if you remain observant.",
            "Knight of Swords": "Direct action and intellectual pursuit feature in your future. This determined approach will bring progress but will require tempering with consideration.",
            "Queen of Swords": "Clear boundaries and independent thinking will be your future strengths. This discernment will allow honest assessment and effective communication.",
            "King of Swords": "Intellectual authority and ethical leadership lie ahead. This mental mastery will allow fair decisions based on principle and truth."
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

    // Helper function to determine card suit
    const getCardSuit = (cardName) => {
        if (cardName.includes('Cups')) return 'Cups';
        if (cardName.includes('Coins') || cardName.includes('Pentacles')) return 'Coins';
        if (cardName.includes('Wands')) return 'Wands';
        if (cardName.includes('Swords')) return 'Swords';
        return 'Major Arcana';
    };

    // Helper function to determine card element based on suit
    const getCardElement = (suit) => {
        switch(suit) {
            case 'Cups': return 'Water (emotions, relationships, intuition)';
            case 'Coins': return 'Earth (material matters, resources, stability)';
            case 'Wands': return 'Fire (energy, passion, creativity)';
            case 'Swords': return 'Air (thought, communication, conflict)';
            default: return 'Spirit (major life themes and archetypal energies)';
        }
    };

    // Determine suits and elements for each card
    const pastSuit = getCardSuit(pastCard.name);
    const presentSuit = getCardSuit(presentCard.name);
    const futureSuit = getCardSuit(futureCard.name);

    const pastElement = getCardElement(pastSuit);
    const presentElement = getCardElement(presentSuit);
    const futureElement = getCardElement(futureSuit);

    // Generate a unique connection based on the card combinations
    let cardConnection = '';

    // Check for patterns in the spread
    const allSameSuit = pastSuit === presentSuit && presentSuit === futureSuit;
    const allMajorArcana = pastSuit === 'Major Arcana' && presentSuit === 'Major Arcana' && futureSuit === 'Major Arcana';
    const hasMajorArcana = pastSuit === 'Major Arcana' || presentSuit === 'Major Arcana' || futureSuit === 'Major Arcana';
    const pastPresentSameSuit = pastSuit === presentSuit;
    const presentFutureSameSuit = presentSuit === futureSuit;
    const pastFutureSameSuit = pastSuit === futureSuit;

    // Generate connection text based on patterns
    if (allSameSuit && pastSuit !== 'Major Arcana') {
        cardConnection = `Your reading shows a strong ${pastElement} influence throughout your journey. This concentration of ${pastSuit} energy indicates that ${
            pastSuit === 'Cups' ? 'emotional matters and relationships' :
            pastSuit === 'Coins' ? 'material concerns and resources' :
            pastSuit === 'Wands' ? 'creative energy and passionate pursuits' :
            'intellectual challenges and communication'
        } are particularly significant in your life right now. The progression from ${pastCard.name} to ${presentCard.name} to ${futureCard.name} reveals how this energy is evolving and transforming through different expressions.`;
    } else if (allMajorArcana) {
        cardConnection = `Your reading features all Major Arcana cards, indicating that you're experiencing significant life events and powerful forces that will have long-lasting effects. The progression from ${pastCard.name} to ${presentCard.name} to ${futureCard.name} suggests you're in the midst of an important spiritual or personal development journey that touches the core of your life purpose.`;
    } else if (hasMajorArcana) {
        const majorCards = [];
        if (pastSuit === 'Major Arcana') majorCards.push(`${pastCard.name} in your past`);
        if (presentSuit === 'Major Arcana') majorCards.push(`${presentCard.name} in your present`);
        if (futureSuit === 'Major Arcana') majorCards.push(`${futureCard.name} in your future`);

        cardConnection = `The presence of ${majorCards.join(' and ')} indicates significant life events or themes that have special importance in your journey. These powerful archetypal energies interact with the more specific day-to-day energies represented by the minor arcana cards in your spread.`;
    } else if (pastPresentSameSuit && presentFutureSameSuit) {
        cardConnection = `Your reading shows a consistent ${presentElement} influence throughout your journey, suggesting that ${
            presentSuit === 'Cups' ? 'emotional matters and relationships' :
            presentSuit === 'Coins' ? 'material concerns and resources' :
            presentSuit === 'Wands' ? 'creative energy and passionate pursuits' :
            'intellectual challenges and communication'
        } are central to your experience right now. The progression from ${pastCard.name} through ${presentCard.name} to ${futureCard.name} reveals an evolution of this energy in your life.`;
    } else if (pastPresentSameSuit) {
        cardConnection = `The ${pastCard.name} and ${presentCard.name} share a ${pastElement} influence, showing continuity between your past and present. However, the ${futureCard.name} introduces a new ${futureElement} energy that will become more prominent in your future, suggesting a shift in focus or approach.`;
    } else if (presentFutureSameSuit) {
        cardConnection = `Your past with the ${pastCard.name} established a foundation with its ${pastElement} energy. Now your present and future show a consistent ${presentElement} influence with ${presentCard.name} and ${futureCard.name}, indicating a new direction that's currently developing and will continue to unfold.`;
    } else if (pastFutureSameSuit) {
        cardConnection = `Interestingly, your past and future share a ${pastElement} influence with ${pastCard.name} and ${futureCard.name}, while your present situation with ${presentCard.name} brings in a different ${presentElement} energy. This suggests a temporary shift or challenge that ultimately returns you to familiar themes but with new understanding.`;
    } else {
        // All different suits
        cardConnection = `Your reading shows a diverse range of energies: ${pastElement} from your past with ${pastCard.name}, ${presentElement} in your present with ${presentCard.name}, and ${futureElement} in your future with ${futureCard.name}. This variety suggests a complex and rich life experience where you're engaging with multiple aspects of life simultaneously.`;
    }

    // Add specific card combination insights
    let specificCombination = '';

    // Check for specific card combinations that might have special meaning
    if (pastCard.name.includes('Death') && presentCard.name.includes('Star')) {
        specificCombination = `The transition from Death to The Star in your past-to-present positions shows you've recently moved through a significant ending into a period of hope and renewal. This powerful transformation has created space for new possibilities.`;
    } else if (presentCard.name.includes('Lovers') && futureCard.name.includes('Two of Cups')) {
        specificCombination = `The combination of The Lovers in your present and the Two of Cups in your future suggests that important relationship choices now will lead to harmonious partnership ahead.`;
    } else if (pastCard.name.includes('Tower') && presentCard.name.includes('Emperor')) {
        specificCombination = `Moving from The Tower in your past to The Emperor in your present indicates that after a period of upheaval, you're now establishing new structures and taking control of your circumstances.`;
    } else if (pastCard.name.includes('Hermit') && futureCard.name.includes('World')) {
        specificCombination = `The progression from The Hermit to The World suggests that your current introspection and soul-searching will lead to a profound sense of completion and wholeness.`;
    } else if (pastCard.name.includes('Fool') && futureCard.name.includes('Judgment')) {
        specificCombination = `Beginning with The Fool and moving toward Judgment indicates a spiritual journey that will come full circle with a powerful awakening or calling.`;
    } else if (pastCard.name.includes('High Priestess') && presentCard.name.includes('Moon')) {
        specificCombination = `The High Priestess flowing into The Moon shows a deepening of intuitive abilities and subconscious awareness. Trust your inner knowing during this mysterious time.`;
    } else if (presentCard.name.includes('Justice') && futureCard.name.includes('Six of Swords')) {
        specificCombination = `Justice in your present leading to the Six of Swords suggests that fair decisions now will allow you to move toward calmer circumstances in the future.`;
    } else if (pastCard.name.includes('Nine of Coins') && presentCard.name.includes('Justice')) {
        specificCombination = `The Nine of Coins in your past flowing into Justice in your present suggests that the self-sufficiency and material comfort you've established is now allowing you to make balanced and fair decisions from a position of security.`;
    } else if (pastCard.name.includes('Knight of Coins') && presentCard.name.includes('Eight of Cups')) {
        specificCombination = `Moving from the Knight of Coins to the Eight of Cups indicates a shift from methodical, practical action to an emotional journey of walking away from what no longer serves you. This suggests you've built something solid but are now ready to seek deeper fulfillment.`;
    } else if (presentCard.name.includes('Eight of Cups') && futureCard.name.includes('Five of Cups')) {
        specificCombination = `The Eight of Cups in your present leading to the Five of Cups in your future suggests that your current journey away from emotional dissatisfaction may involve processing some grief or disappointment before you can fully move on. This temporary sadness is part of your healing process.`;
    }

    // Add the specific combination insight if one was generated
    if (specificCombination) {
        cardConnection = `${cardConnection}\n\n${specificCombination}`;
    }

    // Generate advice based on the spread
    let advice = '';

    // Base advice on the future card
    if (futureSuit === 'Cups') {
        advice = "As you move forward, pay special attention to your emotional needs and relationships. Creating space for authentic connection will be particularly important.";
    } else if (futureSuit === 'Coins') {
        advice = "In the coming period, focus on building practical foundations and managing your resources wisely. Attention to material security will support your overall wellbeing.";
    } else if (futureSuit === 'Wands') {
        advice = "The path ahead calls for creative action and passionate engagement. Trust your enthusiasm and channel your energy into projects that inspire you.";
    } else if (futureSuit === 'Swords') {
        advice = "Moving forward, clarity of thought and honest communication will be essential. Cut through confusion by seeking truth and expressing yourself with integrity.";
    } else {
        // Major Arcana
        if (futureCard.name.includes('Fool')) {
            advice = "Embrace new beginnings with openness and trust in the unfolding journey.";
        } else if (futureCard.name.includes('Magician')) {
            advice = "Recognize that you have all the tools you need to manifest your desires through focused intention.";
        } else if (futureCard.name.includes('High Priestess')) {
            advice = "Trust your intuition and pay attention to the wisdom that emerges from silence and reflection.";
        } else if (futureCard.name.includes('Empress')) {
            advice = "Nurture your creative projects and relationships with loving attention, allowing natural growth to occur.";
        } else if (futureCard.name.includes('Emperor')) {
            advice = "Establish clear structures and boundaries that support your long-term vision and goals.";
        } else if (futureCard.name.includes('Faith') || futureCard.name.includes('Hierophant')) {
            advice = "Consider traditional wisdom and seek guidance from established sources or mentors.";
        } else if (futureCard.name.includes('Lovers')) {
            advice = "Make choices aligned with your deepest values, especially in matters of relationship and partnership.";
        } else if (futureCard.name.includes('Chariot')) {
            advice = "Maintain focus and determination, harnessing opposing forces to move steadily toward your goals.";
        } else if (futureCard.name.includes('Justice')) {
            advice = "Seek balance and fairness in all your dealings, recognizing that your actions create corresponding consequences.";
        } else if (futureCard.name.includes('Hermit')) {
            advice = "Take time for solitude and inner reflection, allowing your own inner light to guide your path.";
        } else if (futureCard.name.includes('Wheel')) {
            advice = "Remain adaptable as circumstances change, recognizing the cyclical nature of life's experiences.";
        } else if (futureCard.name.includes('Strength')) {
            advice = "Approach challenges with gentle persistence rather than force, drawing on your inner courage and compassion.";
        } else if (futureCard.name.includes('Hanged Man')) {
            advice = "Be willing to surrender control and see situations from new perspectives, finding wisdom in apparent limitations.";
        } else if (futureCard.name.includes('Death')) {
            advice = "Embrace necessary endings as essential for renewal and transformation, letting go of what no longer serves you.";
        } else if (futureCard.name.includes('Temperance')) {
            advice = "Seek balance and moderation, finding the middle path that integrates seemingly opposing elements of your life.";
        } else if (futureCard.name.includes('Devil')) {
            advice = "Become aware of limiting attachments or patterns, recognizing that awareness is the first step toward freedom.";
        } else if (futureCard.name.includes('Tower')) {
            advice = "Prepare for potential disruption by remaining flexible and recognizing that breakdowns often lead to breakthroughs.";
        } else if (futureCard.name.includes('Star')) {
            advice = "Nurture hope and faith in possibilities, trusting in the gentle healing that follows difficult times.";
        } else if (futureCard.name.includes('Moon')) {
            advice = "Navigate uncertainty by trusting your intuition, recognizing that not everything is as it appears on the surface.";
        } else if (futureCard.name.includes('Sun')) {
            advice = "Embrace joy and authentic self-expression, allowing your true vitality and clarity to shine forth.";
        } else if (futureCard.name.includes('Judgment')) {
            advice = "Heed the call to awakening and renewal, honestly evaluating your life and responding to your deeper purpose.";
        } else if (futureCard.name.includes('World')) {
            advice = "Celebrate completion and integration, recognizing the wholeness that prepares you for new beginnings.";
        } else {
            advice = "Trust the wisdom revealed in this spread as you navigate the days ahead, remaining open to the lessons each experience offers.";
        }
    }

    // Combine into a cohesive reading that references the specific cards
    return `
The ${pastCard.name} in your past position indicates: ${pastReading} This influence from your past continues to resonate in your current circumstances.

The ${presentCard.name} in your present position shows: ${presentReading} The energies of this card are dynamic and responsive to your awareness and choices right now.

The ${futureCard.name} in your future position suggests: ${futureReading} As you move forward, this card's energy will be particularly significant in shaping your path.

${cardConnection}

${advice} The unique combination of ${pastCard.name}, ${presentCard.name}, and ${futureCard.name} in your reading offers specific guidance for your particular situation and journey.
  `.trim();
}

// Basic server test endpoint
app.get('/api/test', (req, res) => {
    res.status(200).json({ message: 'Server is accessible' });
});

// Gemini API test endpoint
app.get('/api/test-gemini', async (req, res) => {
    console.log('Received request to /api/test-gemini endpoint');
    try {
        // Check if Gemini API is initialized
        if (!genAI) {
            console.log('Gemini API not initialized for test');
            return res.status(500).json({
                success: false,
                message: 'Gemini API not initialized',
                details: {
                    apiKeyExists: !!geminiApiKey,
                    apiKeyLength: geminiApiKey ? geminiApiKey.length : 0,
                    apiKeyPrefix: geminiApiKey ? geminiApiKey.substring(0, 5) + '...' : 'undefined'
                }
            });
        }

        console.log('Gemini API initialized, testing with a simple prompt');
        
        // Create a model instance
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        
        // Simple test prompt
        const prompt = "Write a one-sentence test response to verify the API is working.";
        
        console.log('Sending test prompt to Gemini API');
        
        // Generate content
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log('Received response from Gemini API:', text);
        
        // Return success response
        return res.status(200).json({
            success: true,
            message: 'Gemini API is working correctly',
            response: text
        });
    } catch (error) {
        console.error('Error testing Gemini API:', error);
        
        // Return detailed error information
        return res.status(500).json({
            success: false,
            message: 'Error testing Gemini API',
            error: {
                name: error.name,
                message: error.message,
                details: error.toString()
            },
            apiDetails: {
                apiKeyExists: !!geminiApiKey,
                apiKeyLength: geminiApiKey ? geminiApiKey.length : 0,
                apiKeyPrefix: geminiApiKey ? geminiApiKey.substring(0, 5) + '...' : 'undefined'
            }
        });
    }
});

// Main tarot reading endpoint
app.post('/api/tarot', async (req, res) => {
    console.log('Received request to /api/tarot endpoint');
    try {
        const { cards } = req.body;
        console.log('Request body contains cards:', !!cards);

        if (!cards || !Array.isArray(cards) || cards.length !== 3) {
            console.log('Invalid request: cards not provided or not an array of 3 items');
            return res.status(400).json({
                error: 'Invalid request. Please provide exactly 3 cards with position, name, and description.'
            });
        }

        // Extract the cards by position
        const pastCard = cards.find(card => card.position === 'Past');
        const presentCard = cards.find(card => card.position === 'Present');
        const futureCard = cards.find(card => card.position === 'Future');
        
        console.log('Cards extracted by position:', {
            past: pastCard?.name,
            present: presentCard?.name,
            future: futureCard?.name
        });

        let reading = null;
        let localReading = null;
        let source = 'local';
        let isLLMGenerated = false;

        // Log the current state of the API variables
        console.log('API state check:');
        console.log('- Gemini API initialized:', !!genAI);
        console.log('- Gemini API key exists:', !!geminiApiKey);
        console.log('- Gemini API key is not placeholder:', geminiApiKey !== 'your_gemini_api_key_here');
        console.log('- Should use Gemini API:', !!(genAI && geminiApiKey && geminiApiKey !== 'your_gemini_api_key_here'));
        console.log('- Groq API initialized:', !!groqClient);
        console.log('- Groq API key exists:', !!groqApiKey);

        // First, generate the local reading to use as fallback
        localReading = generateTarotReading(pastCard, presentCard, futureCard);
        console.log('Generated local reading for fallback');

        // Try to generate reading with Gemini first
        if (genAI && geminiApiKey && geminiApiKey !== 'your_gemini_api_key_here') {
            try {
                console.log('Attempting to generate reading with Gemini API...');
                reading = await generateTarotReadingWithGemini(pastCard, presentCard, futureCard);
                source = 'gemini';
                isLLMGenerated = true;
                console.log('Successfully generated reading with Gemini API');
                console.log('Gemini reading length:', reading.length);
            } catch (geminiError) {
                console.error('Error with Gemini API:', geminiError);
                console.error('Error name:', geminiError.name);
                console.error('Error message:', geminiError.message);
                console.log('Gemini API failed, will try Groq API next');
                
                // Try Groq API if Gemini fails
                if (groqClient && groqApiKey) {
                    try {
                        console.log('Attempting to generate reading with Groq API...');
                        reading = await generateTarotReadingWithGroq(pastCard, presentCard, futureCard);
                        source = 'groq';
                        isLLMGenerated = true;
                        console.log('Successfully generated reading with Groq API');
                        console.log('Groq reading length:', reading.length);
                    } catch (groqError) {
                        console.error('Error with Groq API:', groqError);
                        console.error('Error name:', groqError.name);
                        console.error('Error message:', groqError.message);
                        console.log('Groq API failed, falling back to local generation');
                        
                        // Fall back to local reading
                        reading = localReading;
                        source = 'local';
                        isLLMGenerated = false;
                    }
                } else {
                    console.log('Groq API not initialized, falling back to local generation');
                    reading = localReading;
                    source = 'local';
                    isLLMGenerated = false;
                }
            }
        } else if (groqClient && groqApiKey) {
            // Try Groq if Gemini is not available
            try {
                console.log('Gemini API not available, trying Groq API...');
                reading = await generateTarotReadingWithGroq(pastCard, presentCard, futureCard);
                source = 'groq';
                isLLMGenerated = true;
                console.log('Successfully generated reading with Groq API');
                console.log('Groq reading length:', reading.length);
            } catch (groqError) {
                console.error('Error with Groq API:', groqError);
                console.error('Error name:', groqError.name);
                console.error('Error message:', groqError.message);
                console.log('Groq API failed, falling back to local generation');
                
                // Fall back to local reading
                reading = localReading;
                source = 'local';
                isLLMGenerated = false;
            }
        } else {
            console.log('No LLM APIs available, using local generation');
            reading = localReading;
            source = 'local';
            isLLMGenerated = false;
        }

        // Prepare the response
        const response = {
            reading: reading,
            source: source,
            isLLMGenerated: isLLMGenerated
        };
        
        console.log('Sending response with source:', response.source);
        console.log('Is LLM generated:', response.isLLMGenerated);
        
        // Send the generated reading
        res.status(200).json(response);

    } catch (error) {
        console.error('Error generating tarot reading:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        
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
