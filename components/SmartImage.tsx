
import React, { useState, useEffect } from 'react';

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackText?: string;
}

const SmartImage: React.FC<SmartImageProps> = ({ src, alt, fallbackText, className, ...props }) => {
  const [imgSrc, setImgSrc] = useState<string | undefined>(src);
  const [hasError, setHasError] = useState(false);
  const [isHealing, setIsHealing] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
    setIsHealing(false);
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      setIsHealing(true);
      // Simulate "healing" process delay for effect
      setTimeout(() => {
        setHasError(true);
        setIsHealing(false);
        // Fallback to a generative placeholder service
        const text = fallbackText || alt || 'Image Unavailable';
        setImgSrc(`https://placehold.co/800x600/1e293b/FFF?text=${encodeURIComponent(text)}`);
      }, 500);
    }
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        {...props}
        src={imgSrc}
        alt={alt}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-500 ${isHealing ? 'opacity-50 blur-sm' : 'opacity-100'}`}
      />
      {isHealing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="flex flex-col items-center">
             <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mb-2"></div>
             <span className="text-xs text-white font-mono">Auto-healing...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartImage;
