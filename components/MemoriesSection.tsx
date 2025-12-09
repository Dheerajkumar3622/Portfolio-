
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
    }, 10000); 

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
    <div className="max-w-5xl mx-auto relative group px-4">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[3rem] shadow-2xl border-4 border-white dark:border-white/10">
        {memories.map((memory, index) => (
             <div
                key={memory.id}
                className={`absolute top-0 left-0 w-full h-full transition-all duration-1000 ease-in-out transform ${index === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
             >
                <img
                  src={memory.image}
                  alt={memory.caption || `Memory ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                 {memory.caption && (
                     <div className="absolute bottom-6 left-6 right-6 bg-white/80 dark:bg-black/80 backdrop-blur-md text-gray-900 dark:text-white p-6 rounded-3xl text-center shadow-lg transform transition-all duration-500 delay-300">
                        <p className="font-display font-bold">{memory.caption}</p>
                    </div>
                 )}
            </div>
        ))}
      </div>
      
      {/* Navigation Buttons */}
      <div className="flex justify-center mt-8 gap-4">
        <button onClick={goToPrevious} className="w-12 h-12 rounded-full bg-white dark:bg-white/10 shadow-lg flex items-center justify-center hover:scale-110 transition-transform">←</button>
        <div className="flex items-center space-x-2 bg-white dark:bg-white/10 px-4 rounded-full shadow-sm">
            {memories.map((_, slideIndex) => (
                <button
                    key={slideIndex}
                    onClick={() => goToSlide(slideIndex)}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${currentIndex === slideIndex ? 'bg-maroon-600 dark:bg-gold' : 'bg-gray-300 dark:bg-gray-600'}`}
                    aria-label={`Go to memory ${slideIndex + 1}`}
                ></button>
            ))}
        </div>
        <button onClick={goToNext} className="w-12 h-12 rounded-full bg-white dark:bg-white/10 shadow-lg flex items-center justify-center hover:scale-110 transition-transform">→</button>
      </div>
    </div>
  );
};

export default MemoriesSection;
