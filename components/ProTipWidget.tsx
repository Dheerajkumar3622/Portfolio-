import React, { useState, useEffect } from 'react';

const tips = [
  {
    title: "Pro-Tip: PCB Design",
    content: "A 'via' is a plated hole connecting different PCB layers. Using 'via-in-pad' technology can save significant board space but may increase manufacturing costs."
  },
  {
    title: "Did You Know? Signal Processing",
    content: "The Nyquist theorem is crucial for digital signals. It states you must sample a signal at over twice its highest frequency to avoid losing information (aliasing)."
  },
  {
    title: "Pro-Tip: IoT Communication",
    content: "The MQTT 'broker' is a central server for messages. Using the right Quality of Service (QoS) level is key for balancing reliability and latency in IoT systems."
  },
  {
    title: "Did You Know? Embedded Debugging",
    content: "A logic analyzer is invaluable for debugging embedded systems. It lets you visualize digital signals and decode protocols like I2C or SPI in real-time."
  }
];

const ProTipWidget: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);
    const [currentTipIndex, setCurrentTipIndex] = useState(0);

    // Show the widget after a delay on first load
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 3000); // Show after 3 seconds
        return () => clearTimeout(timer);
    }, []);

    // Cycle through tips
    useEffect(() => {
        if (!isVisible || isDismissed) return;
        const interval = setInterval(() => {
            setCurrentTipIndex(prev => (prev + 1) % tips.length);
        }, 15000); // Change tip every 15 seconds
        return () => clearInterval(interval);
    }, [isVisible, isDismissed]);

    const handleDismiss = () => {
        setIsVisible(false);
        setIsDismissed(true);
    };

    if (isDismissed) {
        return null;
    }
    
    const tip = tips[currentTipIndex];

    return (
        <div className={`fixed bottom-8 left-8 w-72 bg-secondary/80 backdrop-blur-md border border-white/30 rounded-lg shadow-2xl z-40 transition-all duration-500 transform ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <button onClick={handleDismiss} className="absolute top-1 right-1 text-text-secondary hover:text-text-primary text-xl" aria-label="Dismiss tip">&times;</button>
            <div className="p-4">
                <h4 className="font-bold text-accent mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    {tip.title}
                </h4>
                <p className="text-sm text-text-secondary">{tip.content}</p>
            </div>
            <div className="h-1 bg-gradient-to-r from-accent to-highlight animate-pulse rounded-b-lg"></div>
        </div>
    );
};

export default ProTipWidget;
