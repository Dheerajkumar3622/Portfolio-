
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
            <div className="flex justify-between items-end mb-2">
                <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 tracking-wide">{name}</h3>
                <span className="text-xs font-mono font-bold text-maroon-700 dark:text-gold">{level}%</span>
            </div>
            {/* Track */}
            <div className="w-full bg-gray-300 dark:bg-gray-800 h-2 rounded-full overflow-hidden shadow-inner">
                {/* Progress */}
                <div 
                    className="h-full rounded-full transition-all duration-1000 ease-out bg-maroon-700 dark:bg-gold shadow-[0_0_8px_rgba(128,0,0,0.4)] dark:shadow-[0_0_8px_rgba(197,160,89,0.4)] relative" 
                    style={{ width: isVisible ? `${level}%` : '0%' }}
                >
                    {/* Shine effect */}
                    <div className="absolute top-0 left-0 bottom-0 right-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                </div>
            </div>
        </div>
    );
};

export default SkillBar;
