import React, { useState } from 'react';
import PrevIcon from '../styles/icons/PrevIcon';
import NextIcon from '../styles/icons/NextIcon';

interface CarouselProps {
  items: React.ReactNode[];
}

const Carousel: React.FC<CarouselProps> = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    if (currentIndex < items.length - 3) {
      setCurrentIndex(currentIndex + 3);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 3);
    }
  };

  return (
    <div className="carousel">
      <div className="carousel-inner">
        {items?.slice(currentIndex, currentIndex + 3).map((item, index) => (
          <div className="carousel-item" key={index}>
            {item}
          </div>
        ))}
      </div>
      <button className="carousel-button prev" onClick={prevSlide} disabled={currentIndex === 0}>
        <PrevIcon />
      </button>
      <button className="carousel-button next" onClick={nextSlide} disabled={currentIndex >= items?.length - 3}>
        <NextIcon />
      </button>
    </div>
  );
};

export default Carousel;
