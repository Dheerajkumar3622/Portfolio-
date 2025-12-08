import React, { ReactNode } from 'react';
import { motion, useScroll, useSpring, useTransform, useVelocity } from 'framer-motion';

export const PerspectiveWrapper = ({ children }: { children?: ReactNode }) => {
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });

  // --- Scale Logic ---
  // Velocity range: -2000 (fast up) to 2000 (fast down)
  // Scroll Down (>0): Scale down (0.95) -> "Going into a point"
  // Scroll Up (<0): Scale up (1.05) -> "Coming from a point"
  const scale = useTransform(smoothVelocity, [-2000, 0, 2000], [1.05, 1, 0.95]);
  
  // --- Opacity Logic ---
  // Slight fade at high speeds to enhance the "warp" feel
  const contentOpacity = useTransform(smoothVelocity, [-2000, 0, 2000], [0.85, 1, 0.85]);

  // --- Sun Light / God Ray Effect ---
  // Only visible when scrolling UP (negative velocity), mimicking light coming from the center
  const lightOpacity = useTransform(smoothVelocity, [-2500, -500, 0], [0.4, 0.1, 0]);

  return (
    <div style={{ perspective: '1200px', overflow: 'hidden', minHeight: '100vh', width: '100%' }}>
      {/* The Light/Sun Effect Overlay */}
      <motion.div 
        style={{ opacity: lightOpacity }}
        className="fixed inset-0 pointer-events-none z-50 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.8)_0%,_transparent_70%)] mix-blend-overlay"
      />

      {/* The Content Container */}
      <motion.div 
        style={{ 
            scale, 
            opacity: contentOpacity,
            transformOrigin: 'center 40vh' // Pivot point slightly above center for better eye-level feel
        }}
        className="w-full"
      > 
        {children}
      </motion.div>
    </div>
  );
};
