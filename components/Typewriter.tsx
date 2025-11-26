import React, { useState, useEffect } from 'react';

interface TypewriterProps {
    text: string;
    speed?: number;
    className?: string;
}

const Typewriter: React.FC<TypewriterProps> = ({ text, speed = 100, className }) => {
    const [displayText, setDisplayText] = useState('');

    useEffect(() => {
        setDisplayText('');
        let i = 0;
        const typingInterval = setInterval(() => {
            if (i < text.length) {
                setDisplayText(prev => prev + text.charAt(i));
                i++;
            } else {
                clearInterval(typingInterval);
            }
        }, speed);

        return () => clearInterval(typingInterval);
    }, [text, speed]);

    return (
        <span className={className}>
            {displayText}
            <span className="inline-block w-px h-full bg-current align-middle animate-cursor-blink" style={{ height: '1em' }}></span>
        </span>
    );
};

export default Typewriter;
