
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

  const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 0.2], [50, 0]);

  return (
    <div className="w-full flex justify-center py-8"> 
      <motion.div 
        ref={ref}
        style={{ opacity, y }}
        className="w-full max-w-4xl"
      >
          <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-baseline border-b border-gray-300 dark:border-gray-900 pb-8 hover:border-maroon-600 dark:hover:border-maroon-900 transition-colors duration-500 group">
              {/* Date Column */}
              <div className="w-full md:w-1/4 text-right">
                  <span className="font-mono text-sm text-gray-500 block">{date}</span>
                  <span className="text-xs text-maroon-600 dark:text-maroon-500 uppercase tracking-widest group-hover:text-gold transition-colors">{subtitle}</span>
              </div>
              
              {/* Content Column */}
              <div className="w-full md:w-3/4">
                  <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
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
