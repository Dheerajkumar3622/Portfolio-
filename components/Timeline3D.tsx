
import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface TimelineItemProps {
  title: string;
  subtitle: string;
  date: string;
  description: string;
  index: number;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ title, subtitle, date, description, index }) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [0.9, 1]);
  const y = useTransform(scrollYProgress, [0, 0.3], [50, 0]);

  const isEven = index % 2 === 0;

  return (
    <div className="w-full flex justify-center py-12 perspective-1000"> 
      <motion.div 
        ref={ref}
        style={{ opacity, scale, y }}
        className={`relative flex justify-between items-center w-full max-w-5xl ${isEven ? 'flex-row-reverse' : 'flex-row'}`}
      >
          {/* Empty Space */}
          <div className="hidden md:block w-5/12"></div>
          
          {/* Center Marker */}
          <div className="absolute left-1/2 -translate-x-1/2 h-full w-px bg-gold/20 -z-10 hidden md:block"></div>
          <div className="z-20 absolute left-1/2 -translate-x-1/2 flex items-center justify-center w-12 h-12 bg-black rounded-full border border-gold shadow-[0_0_10px_rgba(197,160,89,0.5)]">
               <span className="text-sm font-display font-bold text-gold">{index + 1}</span>
          </div>
          
          {/* Content Card */}
          <div className="w-full md:w-5/12 p-2">
              <div className="bg-black/40 backdrop-blur-md p-8 rounded-sm border-l-2 border-maroon-600 hover:border-gold transition-colors duration-500 shadow-lg group">
                <div className="mb-4">
                    <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-black bg-gold mb-3 rounded-sm">
                        {date}
                    </span>
                    <h3 className="text-2xl font-display font-bold text-white group-hover:text-gold transition-colors">{title}</h3>
                    <h4 className="text-sm font-serif italic text-maroon-400 mt-1">{subtitle}</h4>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed border-t border-white/10 pt-4 mt-4">
                    {description}
                </p>
              </div>
          </div>
      </motion.div>
    </div>
  );
};

export default TimelineItem;
