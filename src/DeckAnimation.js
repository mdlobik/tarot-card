import React, { useState, useEffect } from 'react';
import './DeckAnimation.css';

const DeckAnimation = ({ onAnimationComplete }) => {
    const [cards, setCards] = useState([]);
    const [showButton, setShowButton] = useState(false);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        const totalCards = 20; // Adjust total number of cards as needed
        const animationDuration = 500;

        for (let i = 0; i < totalCards; i++) {
            setCards(prev => [...prev, i]);
        }

        setTimeout(() => {
            setShowButton(true);
        }, animationDuration + 500);
    }, []);

    const handleStartReading = () => {
        setFadeOut(true);
        setTimeout(onAnimationComplete, 500); // Ensure the callback is called after the fade-out
    };

    return (
        <div className={`deck-animation-container ${fadeOut ? 'fade-out' : ''}`}>
            <div className="stars">
            <div className="twinkling">
            <div className="deck">
                {cards.map((card, index) => (
                    <div
                        key={card}
                        className="deck-card"
                        style={{
                            zIndex: cards.length - index,
                            animationName: index % 2 === 0 ? 'shuffleLeft' : 'shuffleRight',
                            animationDelay: `${index * 75}ms`
                        }}
                    >
                        <img src={`${process.env.PUBLIC_URL}/images/back-of-card.png`} alt="Back of card" />
                    </div>
                ))}
            </div>
            {showButton && (
                <button className="start-reading-btn" onClick={handleStartReading}>
                    <span>Start Reading</span>
                </button>
            )}
        </div>
        </div>
        </div>
    );
};

export default DeckAnimation;
