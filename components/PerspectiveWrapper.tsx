
import React, { ReactNode, useState, useEffect } from 'react';
import { motion, useScroll, useSpring, useTransform, useVelocity } from 'framer-motion';

export const PerspectiveWrapper = ({ children }: { children?: ReactNode }) => {
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  
  // Smoother spring configuration for a 'heavy', precise mechanical feel
  const smoothVelocity = useSpring(scrollVelocity, { damping: 60, stiffness: 250 });

  // Track viewport height to ensure the pivot point is always exactly center-screen
  const [viewportHeight, setViewportHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 800);

  useEffect(() => {
    const handleResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Dynamic Transform Origin ---
  // This is the key to the "Centre Animation" effect.
  // As the user scrolls, the rotation pivot moves with them, staying in the center of the viewport.
  // Formula: currentScrollY + (viewportHeight / 2)
  const transformOriginY = useTransform(scrollY, (y) => y + (viewportHeight / 2));
  const transformOrigin = useTransform(transformOriginY, (y) => `50% ${y}px`);

  // --- 3D Physics Transforms ---
  
  // 1. Tilt (RotateX):
  // fast scroll down (positive velocity) -> tilts content back (positive deg)
  // fast scroll up (negative velocity) -> tilts content forward (negative deg)
  const rotateX = useTransform(smoothVelocity, [-3000, 0, 3000], [15, 0, -15]);
  
  // 2. Scale (Depth):
  // Pulls back (scales down) during fast movement to provide context and "warp" feel.
  const scale = useTransform(smoothVelocity, [-3000, 0, 3000], [0.92, 1, 0.92]);
  
  // 3. Opacity:
  // Slight fade during high velocity to mask motion blur and enhance focus on stop.
  const opacity = useTransform(smoothVelocity, [-4000, 0, 4000], [0.7, 1, 0.7]);

  return (
    <div className="relative w-full min-h-screen bg-white dark:bg-black transition-colors duration-500 overflow-hidden" style={{ perspective: '1200px' }}>
      
      {/* Dynamic Background Gradient overlay that reacts to scroll speed (Subtle effect) */}
      <motion.div 
        style={{ opacity: useTransform(smoothVelocity, [-3000, 0, 3000], [0.3, 0, 0.3]) }}
        className="fixed inset-0 pointer-events-none z-20 bg-gradient-to-b from-black/10 via-transparent to-black/10 mix-blend-overlay"
      />

      {/* Main Content Wrapper */}
      <motion.div 
        style={{ 
            rotateX,
            scale, 
            opacity,
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
