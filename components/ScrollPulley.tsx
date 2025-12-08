
import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const ScrollPulley: React.FC = () => {
  const { scrollYProgress } = useScroll();
  
  // Rotation: 0 to 3 full turns (1080 deg) clockwise as you scroll down.
  // Reverses automatically when scrolling up.
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 1080]);
  
  // Weight Position: Moves from top (10%) to bottom (90%) as you scroll down.
  const weightTop = useTransform(scrollYProgress, [0, 1], ["10vh", "90vh"]);
  
  // Rope Height: Connects the wheel (fixed at top) to the moving weight.
  // As weight goes down, rope gets longer.
  const ropeHeight = useTransform(scrollYProgress, [0, 1], ["5vh", "85vh"]);

  return (
    <div className="fixed right-0 top-0 h-screen w-16 z-[90] pointer-events-none flex flex-col items-center">
      
      {/* --- Top Assembly (Fixed) --- */}
      <div className="absolute top-0 z-20 flex flex-col items-center w-full">
        {/* Mounting Bracket */}
        <div className="w-1 h-10 bg-gray-800 border-x border-gold/40 shadow-xl"></div>
        
        {/* The Wheel */}
        <motion.div 
            style={{ rotate }}
            className="w-14 h-14 -mt-1 rounded-full bg-black border-2 border-gold shadow-[0_5px_15px_rgba(0,0,0,0.5)] flex items-center justify-center relative z-20 overflow-hidden"
        >
             {/* Wheel Inner Texture */}
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(60,60,60,1),_rgba(0,0,0,1))]"></div>

             {/* Gold Spokes */}
             <div className="absolute w-full h-0.5 bg-gold/80"></div>
             <div className="absolute w-0.5 h-full bg-gold/80"></div>
             <div className="absolute w-full h-0.5 bg-gold/80 rotate-45"></div>
             <div className="absolute w-0.5 h-full bg-gold/80 rotate-45"></div>
             
             {/* Center Hub */}
             <div className="w-4 h-4 bg-maroon-800 rounded-full border border-gold z-30 flex items-center justify-center">
                 <div className="w-1 h-1 bg-gold rounded-full"></div>
             </div>
        </motion.div>
      </div>

      {/* --- The Multicolor Rope (Narrow) --- */}
      <div className="absolute top-8 w-full flex justify-center z-10">
          <motion.div 
            style={{ 
                height: ropeHeight,
                // Narrow diameter rope (4px / w-1)
                // Complex gradient for braided rope look
                background: "repeating-linear-gradient(45deg, #4a0404, #4a0404 4px, #FFD700 4px, #FFD700 6px, #FFFFFF 6px, #FFFFFF 7px, #000000 7px, #000000 9px)"
            }}
            className="w-1 shadow-md rounded-b-full opacity-90"
          />
      </div>

      {/* --- The Counterweight --- */}
      <motion.div 
        style={{ top: weightTop }}
        className="absolute z-30 w-full flex flex-col items-center"
      >
         {/* Knot/Ring */}
         <div className="w-3 h-3 rounded-full bg-gold border border-black z-20 -mb-1 shadow-sm"></div>
         
         {/* Weight Body */}
         <div className="w-8 h-12 bg-gradient-to-b from-gray-900 via-maroon-950 to-black rounded-md border border-gold/50 shadow-xl flex flex-col items-center justify-center relative">
             {/* Highlight */}
             <div className="absolute top-1 left-1 w-1 h-8 bg-white/10 rounded-full"></div>
             
             {/* Decorative grooves */}
             <div className="w-5 h-px bg-gold/30 mb-1"></div>
             <div className="w-5 h-px bg-gold/30 mb-1"></div>
             <div className="w-5 h-px bg-gold/30"></div>
         </div>
      </motion.div>

    </div>
  );
};

export default ScrollPulley;
