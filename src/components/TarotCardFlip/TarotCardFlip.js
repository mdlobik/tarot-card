import React, { useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';
import Modal from '../Modal/Modal';
import DeckAnimation from '../DeckAnimation/DeckAnimation';
import tarotCards from '../../data/tarotCards';
import '../DeckAnimation/DeckAnimation.css';
import '../../App.css';
import '../../Stars.css';

const POSITIONS = ['Past', 'Present', 'Future'];

const TarotCardFlip = () => {
    const [cards, setCards] = useState(
        Array(3).fill({ flipped: false, imageUrl: null, name: null, description: null })
    );
    const [modalVisible, setModalVisible] = useState(false);
    const [modalImage, setModalImage] = useState(null);
    const [aiReading, setAiReading] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasGeneratedReading, setHasGeneratedReading] = useState(false);
    const hoverTimeout = useRef(null);
    const [showDeckAnimation, setShowDeckAnimation] = useState(true);
    const [showCards, setShowCards] = useState(false);
    const isSelectingCard = useRef(false);

    const getUniqueCardImage = useCallback((excludeIndices) => {
        const availableCards = tarotCards.filter((_, index) => !excludeIndices.includes(index));
        const randomIndex = Math.floor(Math.random() * availableCards.length);
        return availableCards[randomIndex];
    }, []);

    const handleCardClick = useCallback(
        (cardIndex) => {
            if (isLoading || cards[cardIndex].flipped || isSelectingCard.current) return;

            isSelectingCard.current = true;

            setCards((currentCards) => {
                const usedIndices = currentCards
                    .filter((card) => card.flipped)
                    .map((card) => tarotCards.findIndex((c) => c.src === card.imageUrl));
                const newCard = getUniqueCardImage(usedIndices);

                return currentCards.map((card, index) => {
                    if (index === cardIndex) {
                        console.log(`Card at position ${index} flipped. Card info:`, newCard);
                        return {
                            ...card,
                            flipped: true,
                            imageUrl: newCard.src,
                            name: newCard.name,
                            description: newCard.description,
                        };
                    }
                    return card;
                });
            });

            setTimeout(() => {
                isSelectingCard.current = false;
            }, 500);
        },
        [getUniqueCardImage, isLoading, cards]
    );

    useEffect(() => {
        const generateReading = async () => {
            const allFlipped = cards.every((card) => card.flipped);

            if (allFlipped && !hasGeneratedReading) {
                setIsLoading(true);
                setError(null);

                const selectedCards = cards.map((card, index) => ({
                    position: POSITIONS[index],
                    name: card.name,
                    description: card.description,
                }));

                console.log('Generated prompt for API:', selectedCards);

                try {
                    // Health-check the API
                    await axios.get(`/api/test`);

                    // Make the reading request to the API
                    const response = await axios.post(
                        `/api/tarot`,
                        { cards: selectedCards },
                        {
                            headers: { 'Content-Type': 'application/json' },
                            timeout: 30000, // Increased timeout to 30 seconds
                        }
                    );

                    console.log('API Response:', response.data);

                    if (response.data?.reading) {
                        setAiReading(response.data.reading);
                        setHasGeneratedReading(true);
                    } else {
                        // Fallback in case the response doesn't have a reading
                        const fallbackReading =
                            "The cards reveal a journey through time. Your past has shaped who you are, " +
                            "your present shows where you stand, and your future holds potential waiting to unfold. " +
                            "These three cards together tell a story of transformation and growth. " +
                            "Trust in your intuition as you navigate the path ahead.";

                        setAiReading(fallbackReading);
                        setHasGeneratedReading(true);
                    }
                } catch (error) {
                    console.error('Error generating tarot reading:', error);

                    // Provide a fallback reading even if the API call fails
                    const fallbackReading =
                        "The mystical connection reveals that your past experiences have prepared you for this moment. " +
                        "Your present situation contains both challenges and opportunities that are shaping your journey. " +
                        "The future card suggests that your path forward holds promise if you remain true to yourself. " +
                        "Together, these cards form a narrative of growth and self-discovery.";

                    setAiReading(fallbackReading);
                    setHasGeneratedReading(true);

                    // Still set an error message so the user knows something went wrong
                    let errorMessage =
                        "The mystical forces provided a reading, but the connection was briefly disturbed.";

                    if (error.message === 'Server is not accessible') {
                        errorMessage =
                            'Unable to connect to the mystical realm. Please ensure the server is running.';
                    } else if (error.response?.status === 404) {
                        errorMessage =
                            'The path to the mystical realm cannot be found. Please check the server configuration.';
                    } else if (error.code === 'ECONNABORTED') {
                        errorMessage = 'The connection timed out, but a reading has been divined for you.';
                    }

                    setError(errorMessage);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        generateReading();
    }, [cards, hasGeneratedReading]);

    const resetCards = useCallback(() => {
        setAiReading('');
        setError(null);
        setIsLoading(false);
        setHasGeneratedReading(false);
        setCards(
            cards.map((card) => ({ ...card, flipped: false, imageUrl: null, name: null, description: null }))
        );
    }, [cards]);

    const handleMouseEnter = useCallback((imageUrl) => {
        hoverTimeout.current = setTimeout(() => {
            setModalImage(imageUrl);
            setModalVisible(true);
        }, 500);
    }, []);

    const handleMouseLeave = useCallback(() => {
        clearTimeout(hoverTimeout.current);
    }, []);

    const handleCloseModal = useCallback(() => {
        setModalVisible(false);
    }, []);

    const handleAnimationComplete = useCallback(() => {
        setShowDeckAnimation(false);
        setTimeout(() => setShowCards(true), 500);
    }, []);

    if (showDeckAnimation) {
        return <DeckAnimation onAnimationComplete={handleAnimationComplete} />;
    }

    return (
        <div className="tarot-reading-container">
            <div className="stars">
                <div className="twinkling">
                    <div className={`cards-container ${showCards ? 'show-cards' : ''}`}>
                        <div className="cards">
                            {cards.map((card, index) => (
                                <div
                                    key={index}
                                    className={`card-container ${card.flipped ? 'flipped' : ''}`}
                                    onClick={() => handleCardClick(index)}
                                    onMouseEnter={() => card.flipped && handleMouseEnter(card.imageUrl)}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <div className="card">
                                        <div className="card-front">
                                            <img src="/images/back-of-card.png" alt="Card back" />
                                        </div>
                                        <div className="card-back">
                                            {card.imageUrl && <img src={card.imageUrl} alt={card.name} />}
                                        </div>
                                    </div>
                                    <span className="card-label">{POSITIONS[index]}</span>
                                </div>
                            ))}
                        </div>

                        <div className="reading-container">
                            {isLoading && (
                                <div className="ai-reading loading">
                                    <p>The spirits are contemplating your cards...</p>
                                </div>
                            )}
                            {error && !isLoading && (
                                <div className="ai-reading error">
                                    <p>{error}</p>
                                </div>
                            )}
                            {aiReading && !isLoading && (
                                <div className="ai-reading">
                                    <h3>Your Mystical Reading</h3>
                                    <p>{aiReading}</p>
                                </div>
                            )}
                        </div>

                        <div className="button-container">
                            <button className="draw-new-cards-btn" onClick={resetCards}>
                                Draw New Cards
                            </button>
                        </div>

                        <Modal show={modalVisible} imageUrl={modalImage} onClose={handleCloseModal} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TarotCardFlip;