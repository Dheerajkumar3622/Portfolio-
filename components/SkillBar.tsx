
import React, { useRef } from 'react';
import { useOnScreen } from '../hooks/useOnScreen';

interface SkillBarProps {
    name: string;
    level: number;
}

const SkillBar: React.FC<SkillBarProps> = ({ name, level }) => {
    const ref = useRef<HTMLDivElement>(null);
    const isVisible = useOnScreen(ref, { threshold: 0.5 });

    return (
        <div ref={ref} className="w-full">
            <div className="flex justify-between items-end mb-3">
                <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 tracking-wide uppercase">{name}</h3>
                <span className="text-xs font-mono font-bold text-gray-400">{level}%</span>
            </div>
            {/* Track */}
            <div className="w-full bg-gray-200 dark:bg-gray-800 h-4 rounded-full overflow-hidden shadow-inner">
                {/* Progress */}
                <div 
                    className="h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-maroon-800 to-maroon-600 dark:from-gold dark:to-yellow-300 relative" 
                    style={{ width: isVisible ? `${level}%` : '0%' }}
                >
                    {/* Shine effect */}
                    <div className="absolute top-0 left-0 bottom-0 right-0 bg-gradient-to-b from-white/30 to-transparent rounded-full"></div>
                </div>
            </div>
        </div>
    );
};

export default SkillBar;
