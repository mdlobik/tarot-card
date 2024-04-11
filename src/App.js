import React, { useState, useCallback } from 'react';
import './App.css';

const TarotCardFlip = () => {
  const tarotCards = Array.from({ length: 78 }, (_, index) =>
    `${process.env.PUBLIC_URL}/images/image-${String(index + 2).padStart(3, '0')}.jpg`
  );

  const [cards, setCards] = useState(Array(3).fill({ flipped: false, imageUrl: null }));

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
    // Immediately start flipping cards back
    setCards(currentCards =>
      currentCards.map(card => ({ ...card, flipped: false }))
    );

    // Delay clearing the images until after the flip-back animation completes
    setTimeout(() => {
      setCards(currentCards =>
        currentCards.map(card => ({ ...card, imageUrl: null }))
      );
    }, 600); // Match this duration to your CSS flip animation duration
  };

  return (
    <div className="cards-container">
      <div className="cards">
        {cards.map((card, index) => (
          <div key={index} className={`card-container ${card.flipped ? 'flipped' : ''}`} onClick={() => handleCardClick(index)}>
            <div className="card">
              <div className="card-front"></div>
              <div className="card-back" style={{ backgroundImage: card.imageUrl ? `url(${card.imageUrl})` : 'none' }}></div>
            </div>
            <span className="card-label">{['Past', 'Present', 'Future'][index]}</span>
          </div>
        ))}
      </div>
      <div className="button">
        <button onClick={resetCards}>Reset Cards</button>
      </div>
    </div>
  );
};

export default TarotCardFlip;
