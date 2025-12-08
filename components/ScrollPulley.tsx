
import React from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

const ScrollPulley: React.FC = () => {
  const { scrollYProgress } = useScroll();
  
  // Smooth out the scroll value for a "heavy" mechanical feel
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // 1. Wheel Rotation: Rotates as you scroll.
  const rotate = useTransform(smoothProgress, [0, 1], [0, 720]);
  
  // 2. Weight Position: 10% from top to 90% from top (keeps it on screen).
  // We use percentages for responsive positioning.
  const weightTopPercent = useTransform(smoothProgress, [0, 1], [5, 90]);
  
  // 3. Rope Length: Calculates the height of the rope based on weight position.
  // We transform the percentage 5-90 into a vh string for the SVG line.
  const ropeHeight = useTransform(weightTopPercent, (v) => `${v}vh`);

  return (
    <div className="fixed right-4 top-0 h-screen w-12 z-[90] pointer-events-none flex flex-col items-center">
      
      {/* --- 1. The Fixed Wheel Assembly (Top) --- */}
      <div className="absolute top-0 z-20 flex flex-col items-center">
        {/* Support Bracket */}
        <div className="w-1 h-8 bg-gray-800"></div>
        
        {/* The Wheel */}
        <motion.div 
            style={{ rotate }}
            className="w-12 h-12 -mt-2 rounded-full border-4 border-maroon-900 bg-black flex items-center justify-center relative shadow-lg z-20"
        >
             {/* Spokes (Cross) */}
             <div className="absolute w-full h-1 bg-gold"></div>
             <div className="absolute w-1 h-full bg-gold"></div>
             
             {/* Center Hub */}
             <div className="w-3 h-3 bg-gold rounded-full z-30 shadow-md"></div>
        </motion.div>
      </div>

      {/* --- 2. The Rope (SVG for precision) --- */}
      <svg className="absolute top-8 w-full h-full z-10 overflow-visible">
        {/* The rope line drawn from center top to the weight */}
        <motion.line 
            x1="50%" 
            y1="0" 
            x2="50%" 
            y2={ropeHeight} 
            stroke="#c5a059" // Gold color
            strokeWidth="2"
            strokeLinecap="round"
        />
      </svg>

      {/* --- 3. The Counterweight (Scroll Thumb) --- */}
      <motion.div 
        style={{ top: ropeHeight }}
        className="absolute z-30 w-full flex flex-col items-center -ml-[1px]" // Slight offset to center on rope
      >
         {/* Attachment Ring */}
         <div className="w-2 h-2 rounded-full border-2 border-gold bg-black -mb-1 z-10"></div>
         
         {/* Weight Body - Minimalist & Premium */}
         <div className="w-6 h-16 bg-maroon-900 rounded-full border border-gold shadow-[0_4px_10px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center gap-1">
             <div className="w-1 h-8 bg-black/30 rounded-full"></div>
         </div>
      </motion.div>

    </div>
  );
};

export default ScrollPulley;
