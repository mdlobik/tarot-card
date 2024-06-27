import React, { useState, useCallback, useRef } from 'react';
import './App.css';
import './Stars.css';
import Modal from './Modal';
import DeckAnimation from './DeckAnimation';

const TarotCardFlip = () => {
    const tarotCards = Array.from({ length: 78 }, (_, index) =>
        `${process.env.PUBLIC_URL}/images/${index}.png`
    );

    const [cards, setCards] = useState(Array(3).fill({ flipped: false, imageUrl: null }));
    const [modalVisible, setModalVisible] = useState(false);
    const [modalImage, setModalImage] = useState(null);
    const hoverTimeout = useRef(null);
    const [showDeckAnimation, setShowDeckAnimation] = useState(true);
    const [showCards, setShowCards] = useState(false);

    const getUniqueCardImage = useCallback((excludeIndices) => {
        let available = tarotCards.filter((_, index) => !excludeIndices.includes(index));
        const randomIndex = Math.floor(Math.random() * available.length);
        return available[randomIndex];
    }, [tarotCards]);

    const handleCardClick = (cardIndex) => {
        setCards(currentCards =>
            currentCards.map((card, index) => {
                if (index === cardIndex && !card.flipped) {
                    const usedIndices = currentCards.map(card => tarotCards.indexOf(card.imageUrl)).filter(index => index >= 0);
                    return { ...card, flipped: true, imageUrl: getUniqueCardImage(usedIndices) };
                }
                return card;
            })
        );
    };

    const resetCards = () => {
        setCards(currentCards =>
            currentCards.map(card => ({ ...card, flipped: false }))
        );

        setTimeout(() => {
            setCards(currentCards =>
                currentCards.map(card => ({ ...card, imageUrl: null }))
            );
        }, 600);
    };

    const handleMouseEnter = (imageUrl) => {
        hoverTimeout.current = setTimeout(() => {
            setModalImage(imageUrl);
            setModalVisible(true);
        }, 500);
    };

    const handleMouseLeave = () => {
        clearTimeout(hoverTimeout.current);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
    };

    const handleAnimationComplete = () => {
        setShowDeckAnimation(false);
        setTimeout(() => setShowCards(true), 500);
    };

    if (showDeckAnimation) {
        return <DeckAnimation onAnimationComplete={handleAnimationComplete} />;
    }

    return (
        <>
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
                                            <img src={`${process.env.PUBLIC_URL}/images/back-of-card.png`} alt="Back of card" />
                                        </div>
                                        <div className="card-back">
                                            {card.imageUrl && <img src={card.imageUrl} alt={`Tarot card ${index}`} />}
                                        </div>
                                    </div>
                                    <span className="card-label">{['Past', 'Present', 'Future'][index]}</span>
                                </div>
                            ))}
                        </div>
                        <div className="button btn">
                            <a href="#" onClick={resetCards}><span>Reset Cards</span></a>
                        </div>
                        <Modal show={modalVisible} imageUrl={modalImage} onClose={handleCloseModal} />
                    </div>
                </div>
            </div>
        </>
    );
};

export default TarotCardFlip;
