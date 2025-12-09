
import React, { ReactNode, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export const PerspectiveWrapper = ({ children }: { children?: ReactNode }) => {
  const { scrollY } = useScroll();
  
  // Track viewport height for center pivot
  const [viewportHeight, setViewportHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 800);

  useEffect(() => {
    const handleResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Water Wave Animation Math ---
  // We map the raw scroll pixel value to a sine wave.
  // The divisor (e.g., 500) controls the frequency of the wave.
  // The multiplier (e.g., 2 or 10) controls the amplitude/strength.
  
  // Sway left/right gently like a current
  const x = useTransform(scrollY, (y) => Math.sin(y / 400) * 15);
  
  // Tilt forward/back like a wave passing under
  const rotateX = useTransform(scrollY, (y) => Math.sin(y / 300) * 5);
  
  // Tilt sideways gently
  const rotateZ = useTransform(scrollY, (y) => Math.cos(y / 500) * 2);

  // Subtle skew to mimic liquid refraction
  const skewY = useTransform(scrollY, (y) => Math.sin(y / 600) * 1);

  // Dynamic pivot point to keep the user's view central
  const transformOriginY = useTransform(scrollY, (y) => y + (viewportHeight / 2));
  const transformOrigin = useTransform(transformOriginY, (y) => `50% ${y}px`);

  return (
    <div className="relative w-full min-h-screen bg-white dark:bg-black transition-colors duration-500 overflow-hidden" style={{ perspective: '1200px' }}>
      
      {/* Liquid background shimmer */}
      <motion.div 
        style={{ 
            opacity: useTransform(scrollY, (y) => 0.05 + Math.abs(Math.sin(y/500)) * 0.05) 
        }}
        className="fixed inset-0 pointer-events-none z-20 bg-gradient-to-b from-blue-500/0 via-blue-500/5 to-blue-500/0 dark:from-blue-900/0 dark:via-blue-900/10 dark:to-blue-900/0 mix-blend-overlay"
      />

      {/* Main Content Wrapper */}
      <motion.div 
        style={{ 
            x,
            rotateX,
            rotateZ,
            skewY,
            transformOrigin,
            transformStyle: 'preserve-3d'
        }}
        className="w-full relative z-10 will-change-transform"
      > 
        {children}
      </motion.div>
    </div>
  );
};
