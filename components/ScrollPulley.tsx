
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
  
  // 2. Weight Position: 5% from top to 95% from top (Relative to container height)
  const weightTopPercent = useTransform(smoothProgress, [0, 1], [5, 95]);
  
  // 3. Rope Length
  const ropeHeight = useTransform(weightTopPercent, (v) => `${v}%`);

  return (
    <div className="fixed right-0 top-20 h-[calc(100vh-5rem)] w-12 z-[90] pointer-events-none flex flex-col items-center">
      
      {/* --- 1. The Fixed Wheel Assembly (Top) --- */}
      <div className="absolute top-0 z-20 flex flex-col items-center">
        {/* Support Bracket */}
        <div className="w-[2px] h-4 bg-gray-800"></div>
        
        {/* The Wheel */}
        <motion.div 
            style={{ rotate }}
            className="w-10 h-10 rounded-full border-2 border-maroon-900 bg-black flex items-center justify-center relative shadow-lg z-20"
        >
             {/* Spokes */}
             <div className="absolute w-full h-[2px] bg-gold"></div>
             <div className="absolute w-[2px] h-full bg-gold"></div>
             
             {/* Center Hub */}
             <div className="w-2 h-2 bg-gold rounded-full z-30 shadow-md"></div>
        </motion.div>
      </div>

      {/* --- 2. The Rope --- */}
      <svg className="absolute top-4 w-full h-full z-10 overflow-visible">
        <motion.line 
            x1="50%" 
            y1="20" // Start slightly inside the wheel
            x2="50%" 
            y2={ropeHeight} 
            stroke="#c5a059" // Gold color
            strokeWidth="1.5"
            strokeLinecap="round"
        />
      </svg>

      {/* --- 3. The Counterweight --- */}
      <motion.div 
        style={{ top: ropeHeight }}
        className="absolute z-30 w-full flex flex-col items-center"
      >
         {/* Attachment Ring */}
         <div className="w-1.5 h-1.5 rounded-full border border-gold bg-black -mb-1 z-10"></div>
         
         {/* Weight Body */}
         <div className="w-4 h-12 bg-maroon-900 rounded-full border border-gold shadow-md flex flex-col items-center justify-center gap-1">
             <div className="w-[2px] h-6 bg-black/30 rounded-full"></div>
         </div>
      </motion.div>

    </div>
  );
};

export default ScrollPulley;
