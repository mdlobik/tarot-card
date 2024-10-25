import React, { useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';
import Modal from '../Modal/Modal';
import DeckAnimation from '../DeckAnimation/DeckAnimation';
import { tarotCards } from '../../data/tarotCards';
import '../DeckAnimation/DeckAnimation.css';
import '../../App.css';
import '../../Stars.css';

const POSITIONS = ['Past', 'Present', 'Future'];

const TarotCardFlip = () => {
    const [cards, setCards] = useState(Array(3).fill({ flipped: false, imageUrl: null, name: null }));
    const [modalVisible, setModalVisible] = useState(false);
    const [modalImage, setModalImage] = useState(null);
    const [aiReading, setAiReading] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasGeneratedReading, setHasGeneratedReading] = useState(false);
    const hoverTimeout = useRef(null);
    const [showDeckAnimation, setShowDeckAnimation] = useState(true);
    const [showCards, setShowCards] = useState(false);

    const getUniqueCardImage = useCallback((excludeIndices) => {
        let available = tarotCards.filter((_, index) => !excludeIndices.includes(index));
        const randomIndex = Math.floor(Math.random() * available.length);
        return available[randomIndex];
    }, []);

    const handleCardClick = useCallback((cardIndex) => {
        if (isLoading) return;

        setCards(currentCards => {
            if (currentCards[cardIndex].flipped) return currentCards;

            return currentCards.map((card, index) => {
                if (index === cardIndex) {
                    const usedIndices = currentCards
                        .map(card => tarotCards.findIndex(c => c.src === card.imageUrl))
                        .filter(index => index >= 0);
                    const newCard = getUniqueCardImage(usedIndices);
                    return {
                        ...card,
                        flipped: true,
                        imageUrl: newCard.src,
                        name: newCard.name,
                        description: newCard.description
                    };
                }
                return card;
            });
        });
    }, [getUniqueCardImage, isLoading]);

    // Generate reading only once when all cards are flipped
    useEffect(() => {
        const generateReading = async () => {
            const allFlipped = cards.every(card => card.flipped);
            if (allFlipped && !hasGeneratedReading) {
                setIsLoading(true);
                setError(null);

                try {
                    const selectedCards = cards.map((card, index) => ({
                        position: POSITIONS[index],
                        name: card.name,
                        description: card.description
                    }));

                    const response = await axios.post('/api/gemini-tarot', {
                        cards: selectedCards
                    }, {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.data.reading) {
                        setAiReading(response.data.reading);
                        setHasGeneratedReading(true);
                    } else {
                        throw new Error('No reading received from API');
                    }
                } catch (error) {
                    console.error("Error generating tarot reading:", error);
                    setError("The mystical forces are unclear at this moment. Please try again later.");
                    setAiReading(null);
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

        setCards(currentCards =>
            currentCards.map(card => ({ ...card, flipped: false }))
        );

        setTimeout(() => {
            setCards(currentCards =>
                currentCards.map(card => ({
                    ...card,
                    imageUrl: null,
                    name: null,
                    description: null
                }))
            );
        }, 600);
    }, []);

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
                                            <img
                                                src="/images/back-of-card.png"
                                                alt="Card back"
                                                loading="eager"
                                            />
                                        </div>
                                        <div className="card-back">
                                            {card.imageUrl && (
                                                <img
                                                    src={card.imageUrl}
                                                    alt={card.name}
                                                    loading="lazy"
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <span className="card-label">
                                        {POSITIONS[index]}
                                    </span>
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

                            {aiReading && !isLoading && !error && (
                                <div className="ai-reading">
                                    <h3>Your Mystical Reading</h3>
                                    <p>{aiReading}</p>
                                </div>
                            )}
                        </div>

                        <div className="button-container">
                            <button className="draw-new-cards-btn" onClick={resetCards}>Draw New Cards</button>
                        </div>

                        <Modal
                            show={modalVisible}
                            imageUrl={modalImage}
                            onClose={handleCloseModal}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TarotCardFlip;
