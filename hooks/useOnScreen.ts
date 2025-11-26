import { useState, useEffect, RefObject } from 'react';

export const useOnScreen = (ref: RefObject<HTMLElement>, options: IntersectionObserverInit): boolean => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            // We only want to set it to true, and never back to false
            if (entry.isIntersecting) {
                setIsVisible(true);
                // Stop observing once it's visible
                observer.unobserve(entry.target);
            }
        }, options);

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [ref, options]);

    return isVisible;
};
