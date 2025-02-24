const express = require('express');
const cors = require('cors');

// Initialize express app
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Function to generate tarot readings locally
function generateTarotReading(pastCard, presentCard, futureCard) {
    // Template readings based on card positions
    const readings = {
        past: {
            "The Fool": "In the past, you embarked on a journey with innocence and openness. You were willing to take risks without fear of the outcome.",
            "The Magician": "Your past shows a time when you harnessed your talents and resources to manifest your desires.",
            "The High Priestess": "Your intuition guided you strongly in the past. There were secrets or hidden knowledge that influenced your path.",
            "The Empress": "Your past was marked by abundance, nurturing, and creativity. You may have been in a period of growth or fertility.",
            "The Emperor": "Structure and authority figured prominently in your past. You either wielded authority or were under its influence.",
            "The Hierophant": "Traditional values or spiritual teachings were significant in your past. You may have sought guidance from established institutions.",
            "The Lovers": "A significant relationship or important choice marked your past. Harmony and alignment of values were important themes.",
            "The Chariot": "You demonstrated determination and willpower in the past. You overcame obstacles through sheer force of will.",
            "Strength": "Inner courage and patience were your allies in the past. You faced challenges with composure and gentle strength.",
            "The Hermit": "A period of introspection or solitude marked your past. You sought wisdom within yourself.",
            "Wheel of Fortune": "Your past saw significant changes in fortune. Cycles of fate brought both ups and downs.",
            "Justice": "You faced consequences of past actions or made important decisions based on fairness and truth.",
            "The Hanged Man": "You surrendered to circumstances beyond your control in the past, gaining new perspectives through sacrifice.",
            "Death": "A significant transformation or ending occurred in your past, making way for renewal.",
            "Temperance": "Balance and moderation were key themes in your past. You may have been harmonizing different aspects of your life.",
            "The Devil": "Your past was influenced by attachments, dependencies, or illusions that limited your freedom.",
            "The Tower": "A sudden disruption or revelation changed your course in the past. Old structures fell away.",
            "The Star": "Hope and inspiration guided you in the past. You may have found healing after difficulty.",
            "The Moon": "Uncertainty and illusion characterized your past. Your intuition navigated you through confusing waters.",
            "The Sun": "Joy and vitality brightened your past. You experienced success and clarity.",
            "Judgment": "You experienced a reawakening or answered a calling in your past. A period of evaluation led to renewal.",
            "The World": "Your past saw the completion of an important cycle. You achieved a sense of wholeness or accomplishment."
        },
        present: {
            "The Fool": "Currently, you stand at the edge of something new. Trust your instincts and embrace this fresh beginning without fear.",
            "The Magician": "You currently possess all the tools you need to succeed. It's time to channel your energies with focused intent.",
            "The High Priestess": "Your intuition is especially strong now. Listen to your inner voice and pay attention to dreams and subtle messages.",
            "The Empress": "You're in a period of creativity and nurturing energy. Abundance surrounds you if you open to receive it.",
            "The Emperor": "Structure and organization are needed in your current situation. Take charge and establish order.",
            "The Hierophant": "Seek wisdom from traditional sources or mentors now. Conventional approaches may serve you best.",
            "The Lovers": "You're facing an important choice in your current situation. Alignment with your values will guide you correctly.",
            "The Chariot": "Determination is required now. Keep focused on your goal despite any opposing forces.",
            "Strength": "Your current challenges require patience and inner strength rather than force. Gentle persistence will prevail.",
            "The Hermit": "This is a time for reflection and solitude. The answers you seek are found within.",
            "Wheel of Fortune": "You're in a period of change. Be adaptable as circumstances shift around you.",
            "Justice": "Fairness and truth are highlighted in your present. Decisions now will have balanced consequences.",
            "The Hanged Man": "Your current situation calls for surrender and a new perspective. Let go of control to gain insight.",
            "Death": "You're in the midst of a profound transformation. Release what no longer serves you to make way for the new.",
            "Temperance": "Balance and moderation are needed now. Find the middle path between extremes.",
            "The Devil": "Be aware of limitations or attachments currently holding you back. Freedom comes through awareness.",
            "The Tower": "Unexpected change is occurring or imminent. Though disruptive, it creates space for something better.",
            "The Star": "Hope guides your present path. Trust that healing and renewal are available to you now.",
            "The Moon": "Your current situation involves uncertainty. Trust your intuition to navigate through confusion.",
            "The Sun": "Joy and clarity illuminate your present. Success and vitality are available to you now.",
            "Judgment": "You're experiencing a calling or awakening. Heed this call to renewal.",
            "The World": "You're reaching completion of an important cycle. Integration and fulfillment are at hand."
        },
        future: {
            "The Fool": "A new adventure awaits in your future. Approach it with openness and trust in the journey.",
            "The Magician": "Your future holds opportunities to manifest your desires. Your skills will align with your intentions.",
            "The High Priestess": "Deeper wisdom and intuitive understanding will be revealed to you. Pay attention to the unseen.",
            "The Empress": "Creativity and abundance will flourish in your future. A period of growth and nurturing lies ahead.",
            "The Emperor": "You will establish solid foundations and gain control in your future. Leadership may be your role.",
            "The Hierophant": "Traditional wisdom or established paths will provide guidance in your future. Consider seeking a mentor.",
            "The Lovers": "A significant relationship or important choice lies ahead. Harmony will come through alignment with your values.",
            "The Chariot": "Success through determination awaits you. Stay focused on your destination despite contradictory forces.",
            "Strength": "Your future challenges will require inner strength rather than force. Gentle persistence will bring victory.",
            "The Hermit": "A period of introspection lies ahead. Wisdom will come through solitude and inner searching.",
            "Wheel of Fortune": "Expect significant changes in your future. The wheel turns, bringing new circumstances.",
            "Justice": "The future holds balanced outcomes based on your actions. Truth and fairness will prevail.",
            "The Hanged Man": "A period of valuable surrender lies ahead. Gaining new perspectives will require letting go.",
            "Death": "A transformative ending makes way for new beginnings in your future. Embrace this powerful transition.",
            "Temperance": "Balance and harmony await you. The future brings integration of seemingly opposing elements.",
            "The Devil": "Be aware of potential restrictions in your future. Freedom will come through recognizing and releasing attachments.",
            "The Tower": "Unexpected disruption may occur in your future. Though challenging, it will clear the way for rebuilding.",
            "The Star": "Hope and renewal lie ahead. After difficulties, healing light will guide your way.",
            "The Moon": "Your path forward may not be clear immediately. Trust your intuition to navigate uncertainty.",
            "The Sun": "Joy and success await you. Your future holds clarity, vitality, and positive outcomes.",
            "Judgment": "A reawakening or calling lies ahead. Heed this future opportunity for renewal and rebirth.",
            "The World": "Completion and fulfillment await you. A significant cycle will reach its successful conclusion."
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

    // Combine into a cohesive reading
    return `
${pastReading} This influence from your past continues to resonate in your current circumstances.

${presentReading} The energies surrounding you now are dynamic and responsive to your awareness and choices.

${futureReading} As you move forward, carry the wisdom gained from past experiences while remaining open to the possibilities that await.

These three cards together reveal a journey of evolution and growth. The connection between your past, present, and future shows a meaningful progression that invites deeper understanding of your path. Trust the wisdom of the cards as you navigate the days ahead.
  `.trim();
}

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

        // Instead of calling the API, let's generate a reading directly
        // This avoids timeouts and API rate limiting issues
        const pastCard = cards.find(card => card.position === 'Past');
        const presentCard = cards.find(card => card.position === 'Present');
        const futureCard = cards.find(card => card.position === 'Future');

        const reading = generateTarotReading(pastCard, presentCard, futureCard);

        // Send the generated reading
        res.status(200).json({
            reading: reading
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