
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
  
  // Trigger animation as element comes into center view
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"]
  });

  // 3D Flip effect values
  // It starts rotated back and scaled down/transparent, then snaps into place
  const rotateX = useTransform(scrollYProgress, [0, 1], [45, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [100, 0]);
  const blur = useTransform(scrollYProgress, [0, 0.8], [10, 0]);

  return (
    <div className="w-full flex justify-center py-6 perspective-1000"> 
      <motion.div 
        ref={ref}
        style={{ 
            opacity, 
            y,
            rotateX,
            scale,
            filter: useTransform(blur, b => `blur(${b}px)`)
        }}
        className="w-full max-w-4xl transform-gpu"
      >
          <div className="bg-white dark:bg-white/5 backdrop-blur-sm p-8 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col md:flex-row gap-6 md:gap-10 items-start group">
              {/* Date Column */}
              <div className="w-full md:w-1/4 md:text-right pt-1">
                  <div className="inline-block md:block bg-gray-100 dark:bg-white/10 px-4 py-1.5 rounded-full mb-2 group-hover:bg-gold/20 transition-colors">
                    <span className="font-mono text-xs font-bold text-gray-600 dark:text-gray-300 group-hover:text-gold transition-colors">{date}</span>
                  </div>
                  <div className="text-xs font-bold text-maroon-600 dark:text-gold uppercase tracking-widest">{subtitle}</div>
              </div>
              
              {/* Content Column */}
              <div className="w-full md:w-3/4 border-l border-gray-200 dark:border-white/10 pl-6 md:pl-10 group-hover:border-gold/50 transition-colors">
                  <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-3 group-hover:translate-x-2 transition-transform">{title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-2xl">
                      {description}
                  </p>
              </div>
          </div>
      </motion.div>
    </div>
  );
};

export default TimelineItem;
