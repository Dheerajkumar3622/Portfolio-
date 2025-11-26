import React, { useState, useEffect } from 'react';

const BackToTopButton: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);

        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <>
            {isVisible && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-28 right-8 bg-highlight/80 backdrop-blur-sm text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-2xl z-40 transform hover:scale-110 hover:bg-highlight transition-all"
                    aria-label="Go to top"
                >
                    ↑
                </button>
            )}
        </>
    );
};

export default BackToTopButton;