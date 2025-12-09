
import React, { ReactNode, useState, useEffect } from 'react';
import { motion, useScroll, useSpring, useTransform, useVelocity } from 'framer-motion';

export const PerspectiveWrapper = ({ children }: { children?: ReactNode }) => {
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  
  // High stiffness/damping for a "heavy", premium mechanical feel
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 300 });

  // Track viewport height to ensure the pivot point is always exactly center-screen
  const [viewportHeight, setViewportHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 800);

  useEffect(() => {
    const handleResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Dynamic Transform Origin ---
  // The pivot moves with the scroll window.
  const transformOriginY = useTransform(scrollY, (y) => y + (viewportHeight / 2));
  const transformOrigin = useTransform(transformOriginY, (y) => `50% ${y}px`);

  // --- 3D Physics Transforms ---
  
  // 1. Tilt (RotateX): Stronger angle for more drama
  const rotateX = useTransform(smoothVelocity, [-3000, 0, 3000], [25, 0, -25]);
  
  // 2. Skew (Stretch): "Warp Speed" effect. The page stretches vertically when scrolling fast.
  const skewY = useTransform(smoothVelocity, [-3000, 0, 3000], [-10, 0, 10]);

  // 3. Scale (Breathing): Content shrinks slightly when moving fast to simulate depth.
  const scale = useTransform(smoothVelocity, [-3000, 0, 3000], [0.95, 1, 0.95]);
  
  // 4. Motion Blur: Blurs content based on speed.
  // We use a small blur to keep text readable but add "speed".
  const blurValue = useTransform(smoothVelocity, [-3000, 0, 3000], [4, 0, 4]);
  const filter = useTransform(blurValue, (v) => `blur(${v}px)`);

  return (
    <div className="relative w-full min-h-screen bg-white dark:bg-black transition-colors duration-500 overflow-hidden" style={{ perspective: '1200px' }}>
      
      {/* Dynamic Background Gradient overlay that reacts to scroll speed (Subtle flash) */}
      <motion.div 
        style={{ opacity: useTransform(smoothVelocity, [-3000, 0, 3000], [0.1, 0, 0.1]) }}
        className="fixed inset-0 pointer-events-none z-20 bg-white dark:bg-maroon-900 mix-blend-overlay"
      />

      {/* Main Content Wrapper */}
      <motion.div 
        style={{ 
            rotateX,
            skewY,
            scale, 
            filter,
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
