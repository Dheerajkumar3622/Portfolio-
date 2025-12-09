
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
    <div className="w-full flex justify-center py-6"> 
      <motion.div 
        ref={ref}
        style={{ opacity, y }}
        className="w-full max-w-4xl"
      >
          <div className="bg-white dark:bg-white/5 backdrop-blur-sm p-8 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col md:flex-row gap-6 md:gap-10 items-start">
              {/* Date Column */}
              <div className="w-full md:w-1/4 md:text-right pt-1">
                  <div className="inline-block md:block bg-gray-100 dark:bg-white/10 px-4 py-1.5 rounded-full mb-2">
                    <span className="font-mono text-xs font-bold text-gray-600 dark:text-gray-300">{date}</span>
                  </div>
                  <div className="text-xs font-bold text-maroon-600 dark:text-gold uppercase tracking-widest">{subtitle}</div>
              </div>
              
              {/* Content Column */}
              <div className="w-full md:w-3/4 border-l border-gray-200 dark:border-white/10 pl-6 md:pl-10">
                  <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
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
