
import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import HamburgerMenu from './HamburgerMenu';
import { usePortfolio } from '../context/PortfolioContext';

const NavBar: React.FC = () => {
    const { isDarkMode, toggleTheme } = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { portfolioData } = usePortfolio();

    return (
        <>
            <nav className="fixed top-0 left-0 w-full z-[100] bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    
                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-maroon-900 text-gold flex items-center justify-center font-display font-bold text-lg rounded-sm">
                            {portfolioData.profile.name.charAt(0)}
                        </div>
                        <span className="font-display font-bold text-gray-900 dark:text-white tracking-widest text-sm hidden md:block">
                            {portfolioData.profile.name.toUpperCase()}
                        </span>
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center gap-6">
                        
                        {/* Theme Toggle */}
                        <button 
                            onClick={toggleTheme}
                            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-gray-900 dark:text-white"
                            aria-label="Toggle Theme"
                        >
                            {isDarkMode ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gold">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.75 9.75 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                                </svg>
                            )}
                        </button>

                        {/* Hamburger Trigger */}
                        <button 
                            onClick={() => setIsMenuOpen(true)}
                            className="flex flex-col gap-1.5 w-8 items-end group"
                            aria-label="Open Menu"
                        >
                            <span className="h-[2px] w-full bg-gray-900 dark:bg-white group-hover:bg-gold transition-colors"></span>
                            <span className="h-[2px] w-2/3 bg-gray-900 dark:bg-white group-hover:bg-gold transition-colors group-hover:w-full duration-300"></span>
                            <span className="h-[2px] w-full bg-gray-900 dark:bg-white group-hover:bg-gold transition-colors"></span>
                        </button>
                    </div>
                </div>
            </nav>

            <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        </>
    );
};

export default NavBar;
