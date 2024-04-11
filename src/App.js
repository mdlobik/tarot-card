import React, { useState, useCallback } from 'react';
import './App.css';

const TarotCardFlip = () => {
  const tarotCards = Array.from({ length: 78 }, (_, index) =>
    `${process.env.PUBLIC_URL}/images/image-${String(index + 2).padStart(3, '0')}.jpg`
  );

  // Initialize the cards state with flipped false and null imageUrl
  const [cards, setCards] = useState(Array(3).fill({ flipped: false, imageUrl: null }));
  // State to control if cards can be flipped
  const [canFlip, setCanFlip] = useState(true);

  // Callback to get a unique card image that hasn't been used already
  const getUniqueCardImage = useCallback((excludeIndices) => {
    let available = tarotCards.filter((_, index) => !excludeIndices.includes(index));
    const randomIndex = Math.floor(Math.random() * available.length);
    return available[randomIndex];
  }, [tarotCards]);

  const handleCardClick = (cardIndex) => {
    if (canFlip) {
      setCards(currentCards =>
        currentCards.map((card, index) => {
          if (index === cardIndex && !card.flipped) {
            // Calculate used indices to avoid repeating images
            const usedIndices = currentCards.map(card => tarotCards.indexOf(card.imageUrl)).filter(index => index >= 0);
            return { ...card, flipped: true, imageUrl: getUniqueCardImage(usedIndices) };
          }
          return card;
        })
      );
    }
  };

  const resetCards = () => {
    setCanFlip(false); // Disable flipping immediately upon reset
    setCards(currentCards =>
      currentCards.map(card => ({ ...card, flipped: false }))
    );

    // Delay clearing the images and re-enable flipping after the animations
    setTimeout(() => {
      setCards(currentCards =>
        currentCards.map(() => ({ flipped: false, imageUrl: null }))
      );
      setCanFlip(true);
    }, 600); // This duration should match your CSS flip animation duration
  };

  return (
    <div className="cards-container">
      <div className="cards">
        {cards.map((card, index) => (
          <div key={index} className={`card-container ${card.flipped ? 'flipped' : ''}`} onClick={() => handleCardClick(index)}>
            <div className="card">
              <div className="card-front"></div>
              <div className="card-back" style={{ backgroundImage: `url(${card.imageUrl})` }}></div>
            </div>
            <span className="card-label">{['Past', 'Present', 'Future'][index]}</span>
          </div>
        ))}
      </div>
      <button className="reset-button" onClick={resetCards}>Reset Cards</button>
    </div>
  );
};

export default TarotCardFlip;
