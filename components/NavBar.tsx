
import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import HamburgerMenu from './HamburgerMenu';
import { usePortfolio } from '../context/PortfolioContext';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import UserProfileModal from './UserProfileModal';

const NavBar: React.FC = () => {
    const { isDarkMode, toggleTheme } = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { portfolioData } = usePortfolio();
    
    // Auth State
    const { currentUser } = useAuth();
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    useEffect(() => {
        const handleOpenAuth = () => setIsAuthOpen(true);
        window.addEventListener('open-auth-modal', handleOpenAuth);
        return () => window.removeEventListener('open-auth-modal', handleOpenAuth);
    }, []);

    return (
        <>
            <nav className="fixed top-6 left-0 right-0 z-[100] flex justify-center px-4 pointer-events-none">
                <div className="w-full max-w-6xl pointer-events-auto bg-white/70 dark:bg-black/70 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-full px-6 py-3 flex items-center justify-between transition-all duration-300">
                    
                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-maroon-900 to-maroon-700 text-gold flex items-center justify-center font-display font-bold text-lg rounded-full shadow-lg">
                            {portfolioData.profile.name.charAt(0)}
                        </div>
                        <span className="font-display font-bold text-gray-900 dark:text-white tracking-widest text-sm hidden md:block">
                            {portfolioData.profile.name.toUpperCase()}
                        </span>
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center gap-4">
                        
                        {/* Auth Section */}
                        {currentUser ? (
                            <button 
                                onClick={() => setIsProfileOpen(true)}
                                className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white hover:text-maroon-600 dark:hover:text-gold transition-colors flex items-center gap-2 group bg-gray-100 dark:bg-white/5 px-4 py-2 rounded-full border border-transparent hover:border-gold/30"
                            >
                                <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] group-hover:animate-pulse"></span>
                                <span className="truncate max-w-[100px]">{currentUser.id}</span>
                            </button>
                        ) : (
                            <button 
                                onClick={() => setIsAuthOpen(true)}
                                className="text-xs font-bold uppercase tracking-wider text-white bg-black dark:bg-white dark:text-black hover:scale-105 transition-all px-5 py-2.5 rounded-full shadow-lg"
                            >
                                Login
                            </button>
                        )}

                        {/* Theme Toggle */}
                        <button 
                            onClick={toggleTheme}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-gray-900 dark:text-white"
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
                            className="flex flex-col gap-1.5 w-10 h-10 items-center justify-center rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 group transition-colors"
                            aria-label="Open Menu"
                        >
                            <span className="h-[2px] w-5 bg-gray-900 dark:bg-white group-hover:bg-gold transition-colors rounded-full"></span>
                            <span className="h-[2px] w-3 bg-gray-900 dark:bg-white group-hover:bg-gold transition-colors group-hover:w-5 duration-300 rounded-full"></span>
                        </button>
                    </div>
                </div>
            </nav>

            <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
            {isAuthOpen && <AuthModal onClose={() => setIsAuthOpen(false)} />}
            {isProfileOpen && <UserProfileModal onClose={() => setIsProfileOpen(false)} />}
        </>
    );
};

export default NavBar;
