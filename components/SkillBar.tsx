import React, { useRef } from 'react';
import { useOnScreen } from '../hooks/useOnScreen';

interface SkillBarProps {
    name: string;
    level: number;
}

const SkillBar: React.FC<SkillBarProps> = ({ name, level }) => {
    const ref = useRef<HTMLDivElement>(null);
    // Trigger animation when 50% of the item is visible
    const isVisible = useOnScreen(ref, { threshold: 0.5 });

    return (
        <div ref={ref} className="bg-secondary p-6 rounded-xl shadow-lg transition-transform hover:-translate-y-2">
            <h3 className="text-xl font-semibold mb-2 text-text-primary">{name}</h3>
            <div className="w-full bg-primary rounded-full h-2.5 overflow-hidden">
                <div 
                    className="bg-gradient-to-r from-accent to-highlight h-2.5 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: isVisible ? `${level}%` : '0%' }}
                    role="progressbar"
                    aria-valuenow={level}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${name} skill level`}
                ></div>
            </div>
        </div>
    );
};

export default SkillBar;
