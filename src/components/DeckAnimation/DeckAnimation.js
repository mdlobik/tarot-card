import React, { useState, useEffect } from 'react';
import './DeckAnimation.css';

const DeckAnimation = ({ onAnimationComplete }) => {
    const [cards, setCards] = useState([]);
    const [showButton, setShowButton] = useState(false);
    const [fadeOut, setFadeOut] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        const totalCards = 20;
        const animationDuration = 750; // Increased for smoother animation

        setCards(Array.from({ length: totalCards }, (_, i) => i));

        setTimeout(() => {
            setShowButton(true);
        }, animationDuration + 750);
    }, []);

    const handleStartReading = () => {
        setFadeOut(true);
        setTimeout(onAnimationComplete, 500);
    };

    const handleImageLoad = () => {
        setImageLoaded(true);
    };

    return (
        <div className={`deck-animation-container ${fadeOut ? 'fade-out' : ''}`}>
            <div className="stars">
                <div className="twinkling">
                    <div className="deck">
                        {cards.map((card, index) => (
                            <div
                                key={card}
                                className={`deck-card ${imageLoaded ? 'loaded' : ''}`}
                                style={{
                                    zIndex: cards.length - index,
                                    animationName: index % 2 === 0 ? 'shuffleLeft' : 'shuffleRight',
                                    animationDelay: `${index * 75}ms`
                                }}
                            >
                                <img
                                    src="/images/back-of-card.png"
                                    alt="Back of card"
                                    onLoad={handleImageLoad}
                                />
                            </div>
                        ))}
                    </div>
                    {showButton && imageLoaded && (
                        <button
                            className="start-reading-btn"
                            onClick={handleStartReading}
                            aria-label="Start Tarot Reading"
                        >
                            <span>Start Reading</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DeckAnimation;