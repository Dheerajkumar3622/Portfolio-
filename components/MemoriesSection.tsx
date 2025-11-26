import React, { useState, useEffect } from 'react';
import type { Memory } from '../types';

interface MemoriesSectionProps {
  memories: Memory[];
}

const MemoriesSection: React.FC<MemoriesSectionProps> = ({ memories }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!memories || memories.length <= 1) return;

    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % memories.length);
    }, 10000); // 10 seconds

    return () => clearInterval(intervalId);
  }, [memories]);

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? memories.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === memories.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };
  
  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  }

  if (!memories || memories.length === 0) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto relative group">
      <div className="relative h-96 w-full overflow-hidden rounded-lg shadow-2xl">
        {memories.map((memory, index) => (
             <div
                key={memory.id}
                className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
             >
                <img
                  src={memory.image}
                  alt={memory.caption || `Memory ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                 {memory.caption && (
                     <div className="absolute bottom-0 left-0 w-full p-4 bg-black/50 text-white text-center">
                        <p>{memory.caption}</p>
                    </div>
                 )}
            </div>
        ))}
      </div>
      
      {/* Left Arrow */}
      <button 
        onClick={goToPrevious}
        className="absolute top-1/2 -translate-y-1/2 left-5 text-2xl text-white cursor-pointer bg-black/30 rounded-full p-2 group-hover:opacity-100 opacity-0 transition-opacity"
        aria-label="Previous memory"
      >
        &#10094;
      </button>
      {/* Right Arrow */}
      <button 
        onClick={goToNext}
        className="absolute top-1/2 -translate-y-1/2 right-5 text-2xl text-white cursor-pointer bg-black/30 rounded-full p-2 group-hover:opacity-100 opacity-0 transition-opacity"
        aria-label="Next memory"
      >
        &#10095;
      </button>

       <div className="flex top-4 justify-center py-4 space-x-2">
            {memories.map((_, slideIndex) => (
                <button
                    key={slideIndex}
                    onClick={() => goToSlide(slideIndex)}
                    className={`w-3 h-3 rounded-full transition-colors ${currentIndex === slideIndex ? 'bg-accent' : 'bg-gray-500'}`}
                    aria-label={`Go to memory ${slideIndex + 1}`}
                ></button>
            ))}
        </div>
    </div>
  );
};

export default MemoriesSection;
