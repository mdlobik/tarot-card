import React, { useState, useCallback } from 'react';
import './App.css';

const TarotCardFlip = () => {
  const tarotCards = Array.from({ length: 78 }, (_, index) =>
    `${process.env.PUBLIC_URL}/images/image-${String(index + 2).padStart(3, '0')}.jpg`
  );

  const [cards, setCards] = useState(Array(3).fill({ flipped: false, imageUrl: null }));
  const [canFlip, setCanFlip] = useState(true); // Controls if cards can be flipped

  const getUniqueCardImage = useCallback((excludeIndices) => {
    let available = tarotCards.filter((_, index) => !excludeIndices.includes(index));
    const randomIndex = Math.floor(Math.random() * available.length);
    return available[randomIndex];
  }, [tarotCards]);

  const handleCardClick = (cardIndex) => {
    // Allow flipping only if `canFlip` is true
    if (canFlip) {
      setCards(currentCards =>
        currentCards.map((card, index) => {
          if (index === cardIndex && !card.flipped) {
            const usedIndices = currentCards.map(card => tarotCards.indexOf(card.imageUrl)).filter(index => index >= 0);
            return { ...card, flipped: true, imageUrl: getUniqueCardImage(usedIndices) };
          }
          return card;
        })
      );
    }
  };

  const resetCards = () => {
    // Disable flipping immediately upon reset
    setCanFlip(false);
    setCards(currentCards =>
      currentCards.map(card => ({ ...card, flipped: false, imageUrl: null }))
    );

    // Re-enable flipping after a 600ms timeout, allowing animations to complete
    setTimeout(() => {
      setCanFlip(true);
    }, 600);
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
