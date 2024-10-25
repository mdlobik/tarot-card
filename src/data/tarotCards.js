// Card path validation function
const validateCardPaths = () => {
    const duplicateSources = tarotCards.reduce((acc, card, index) => {
        if (acc[card.src]) {
            console.error(`Duplicate src found: ${card.src} at index ${index}`);
            acc[card.src].push(index);
        } else {
            acc[card.src] = [index];
        }
        return acc;
    }, {});

    const duplicates = Object.entries(duplicateSources)
        .filter(([_, indices]) => indices.length > 1);

    if (duplicates.length > 0) {
        console.error('Found duplicate card sources:', duplicates);
    }

    // Validate path format
    tarotCards.forEach((card, index) => {
        if (!card.src.startsWith('/images/') || !card.src.endsWith('.png')) {
            console.error(`Invalid image path format at index ${index}:`, card.src);
        }
    });
};

// Tarot Cards Array
export const tarotCards = [
    // Major Arcana
    { src: '/images/0.png', name: "The Fool", description: "New beginnings, innocence, spontaneity, a free spirit." },
    { src: '/images/1.png', name: "The Magician", description: "Power, skill, concentration, action, resourcefulness." },
    { src: '/images/2.png', name: "The High Priestess", description: "Intuition, unconscious knowledge, mystery, spiritual wisdom." },
    { src: '/images/3.png', name: "The Empress", description: "Fertility, femininity, beauty, nature, abundance." },
    { src: '/images/4.png', name: "The Emperor", description: "Authority, structure, control, fatherhood, leadership." },
    { src: '/images/5.png', name: "The Hierophant", description: "Spiritual wisdom, religious beliefs, conformity, tradition." },
    { src: '/images/6.png', name: "The Lovers", description: "Love, harmony, relationships, values alignment, choices." },
    { src: '/images/7.png', name: "The Chariot", description: "Control, willpower, success, determination, action." },
    { src: '/images/8.png', name: "Strength", description: "Courage, strength, resilience, patience, compassion." },
    { src: '/images/9.png', name: "The Hermit", description: "Soul-searching, introspection, being alone, inner guidance." },
    { src: '/images/10.png', name: "Wheel of Fortune", description: "Good luck, karma, life cycles, destiny, a turning point." },
    { src: '/images/11.png', name: "Justice", description: "Justice, fairness, truth, law, cause and effect." },
    { src: '/images/12.png', name: "The Hanged Man", description: "Pause, surrender, letting go, new perspectives." },
    { src: '/images/13.png', name: "Death", description: "Endings, change, transformation, transition." },
    { src: '/images/14.png', name: "Temperance", description: "Balance, moderation, patience, purpose." },
    { src: '/images/15.png', name: "The Devil", description: "Shadow self, attachment, addiction, restriction." },
    { src: '/images/16.png', name: "The Tower", description: "Sudden upheaval, broken pride, disaster, revelation." },
    { src: '/images/17.png', name: "The Star", description: "Hope, faith, purpose, renewal, spirituality." },
    { src: '/images/18.png', name: "The Moon", description: "Illusion, fear, anxiety, subconscious, intuition." },
    { src: '/images/19.png', name: "The Sun", description: "Positivity, fun, warmth, success, vitality." },
    { src: '/images/20.png', name: "The World", description: "Completion, integration, accomplishment, travel." },

    // Wands Suit
    { src: '/images/21.png', name: "Ace of Wands", description: "Inspiration, new opportunities, growth, potential." },
    { src: '/images/22.png', name: "Two of Wands", description: "Future planning, progress, decisions, discovery." },
    { src: '/images/23.png', name: "Three of Wands", description: "Expansion, confidence, foresight, overseas opportunities." },
    { src: '/images/24.png', name: "Four of Wands", description: "Celebration, harmony, homecoming, community." },
    { src: '/images/25.png', name: "Five of Wands", description: "Conflict, competition, tension, diversity." },
    { src: '/images/26.png', name: "Six of Wands", description: "Victory, success, recognition, progress." },
    { src: '/images/27.png', name: "Seven of Wands", description: "Challenge, competition, perseverance, defense." },
    { src: '/images/28.png', name: "Eight of Wands", description: "Movement, fast-paced change, alignment, results." },
    { src: '/images/29.png', name: "Nine of Wands", description: "Resilience, courage, persistence, boundaries." },
    { src: '/images/30.png', name: "Ten of Wands", description: "Burden, extra responsibility, hard work, stress." },
    { src: '/images/31.png', name: "Page of Wands", description: "Inspiration, discovery, enthusiasm, free spirit." },
    { src: '/images/32.png', name: "Knight of Wands", description: "Energy, passion, inspired action, adventure." },
    { src: '/images/33.png', name: "Queen of Wands", description: "Courage, confidence, independence, determination." },
    { src: '/images/34.png', name: "King of Wands", description: "Natural-born leader, vision, long-term success." },

    // Cups Suit (starting at 35)
    { src: '/images/35.png', name: "Ace of Cups", description: "Love, new relationships, compassion, creativity." },
    { src: '/images/36.png', name: "Two of Cups", description: "Unified love, partnership, mutual attraction." },
    { src: '/images/37.png', name: "Three of Cups", description: "Celebration, friendship, creativity, community." },
    { src: '/images/38.png', name: "Four of Cups", description: "Meditation, contemplation, apathy, reevaluation." },
    { src: '/images/39.png', name: "Five of Cups", description: "Regret, failure, disappointment, pessimism." },
    { src: '/images/40.png', name: "Six of Cups", description: "Revisiting the past, childhood memories, innocence." },
    { src: '/images/41.png', name: "Seven of Cups", description: "Opportunities, choices, illusion, wishful thinking." },
    { src: '/images/42.png', name: "Eight of Cups", description: "Disappointment, abandonment, withdrawal, escapism." },
    { src: '/images/43.png', name: "Nine of Cups", description: "Contentment, satisfaction, gratitude, wish come true." },
    { src: '/images/44.png', name: "Ten of Cups", description: "Divine love, blissful relationships, harmony." },
    { src: '/images/45.png', name: "Page of Cups", description: "Creative opportunities, intuitive messages, curiosity." },
    { src: '/images/46.png', name: "Knight of Cups", description: "Romance, charm, imagination, beauty." },
    { src: '/images/47.png', name: "Queen of Cups", description: "Compassion, care, emotional stability, intuition." },
    { src: '/images/48.png', name: "King of Cups", description: "Emotional balance, control, generosity, leadership." },

    // Swords Suit (starting at 49)
    { src: '/images/49.png', name: "Ace of Swords", description: "Breakthroughs, new ideas, mental clarity, success." },
    { src: '/images/50.png', name: "Two of Swords", description: "Difficult decisions, weighing options, impasse, avoidance." },
    { src: '/images/51.png', name: "Three of Swords", description: "Heartbreak, emotional pain, sorrow, grief." },
    { src: '/images/52.png', name: "Four of Swords", description: "Rest, relaxation, contemplation, recovery." },
    { src: '/images/53.png', name: "Five of Swords", description: "Conflict, disagreements, competition, defeat." },
    { src: '/images/54.png', name: "Six of Swords", description: "Transition, change, rite of passage, releasing baggage." },
    { src: '/images/55.png', name: "Seven of Swords", description: "Deception, trickery, tactics, strategic planning." },
    { src: '/images/56.png', name: "Eight of Swords", description: "Imprisonment, entrapment, self-limiting beliefs." },
    { src: '/images/57.png', name: "Nine of Swords", description: "Anxiety, worry, fear, nightmares, depression." },
    { src: '/images/58.png', name: "Ten of Swords", description: "Painful endings, betrayal, loss, crisis." },
    { src: '/images/59.png', name: "Page of Swords", description: "New ideas, curiosity, thirst for knowledge, communication." },
    { src: '/images/60.png', name: "Knight of Swords", description: "Ambition, action, driven to succeed, fast thinking." },
    { src: '/images/61.png', name: "Queen of Swords", description: "Independence, perception, clear boundaries, direct communication." },
    { src: '/images/62.png', name: "King of Swords", description: "Mental clarity, authority, truth, intellectual power." },

    // Pentacles Suit (starting at 63)
    { src: '/images/63.png', name: "Ace of Pentacles", description: "Manifestation, new financial opportunities, prosperity." },
    { src: '/images/64.png', name: "Two of Pentacles", description: "Balance, multitasking, adaptability, time management." },
    { src: '/images/65.png', name: "Three of Pentacles", description: "Teamwork, collaboration, learning, implementation." },
    { src: '/images/66.png', name: "Four of Pentacles", description: "Control, stability, security, materialism." },
    { src: '/images/67.png', name: "Five of Pentacles", description: "Financial loss, poverty, lack mindset, isolation." },
    { src: '/images/68.png', name: "Six of Pentacles", description: "Giving, receiving, sharing wealth, generosity." },
    { src: '/images/69.png', name: "Seven of Pentacles", description: "Long-term view, sustainable results, perseverance." },
    { src: '/images/70.png', name: "Eight of Pentacles", description: "Apprenticeship, skill development, mastering a craft." },
    { src: '/images/71.png', name: "Nine of Pentacles", description: "Abundance, luxury, self-sufficiency, financial independence." },
    { src: '/images/72.png', name: "Ten of Pentacles", description: "Wealth, inheritance, long-term success, contribution." },
    { src: '/images/73.png', name: "Page of Pentacles", description: "Manifestation, financial opportunity, skill development." },
    { src: '/images/74.png', name: "Knight of Pentacles", description: "Hard work, productivity, routine, conservatism." },
    { src: '/images/75.png', name: "Queen of Pentacles", description: "Nurturing, practical, providing financially, working parent." },
    { src: '/images/76.png', name: "King of Pentacles", description: "Wealth, business, leadership, security, discipline." }
];

// Run validation on the card data
validateCardPaths();

export default tarotCards;