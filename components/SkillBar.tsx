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
        <div ref={ref} className="bg-primary p-5 rounded-lg border border-secondary shadow-sm">
            <div className="flex justify-between items-end mb-3">
                <h3 className="font-semibold text-text-primary">{name}</h3>
                <span className="text-xs font-bold text-accent">{level}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                <div 
                    className="bg-accent h-1.5 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: isVisible ? `${level}%` : '0%' }}
                ></div>
            </div>
        </div>
    );
};

export default SkillBar;