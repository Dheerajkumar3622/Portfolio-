
import React, { useState } from 'react';
import ChatInterface from './ChatInterface';
import { useAuth } from '../context/AuthContext';

const ChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { currentUser } = useAuth();
    
    // Auto-open prompt for guests occasionally? (Optional logic removed for cleaner code)

    return (
        <>
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="fixed bottom-8 left-8 w-16 h-16 bg-black border border-gold/50 text-gold rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center justify-center text-3xl z-[100] hover:scale-110 transition-transform group"
                aria-label="Toggle Global Chat"
            >
                {isOpen ? '✕' : '💬'}
            </button>

            {isOpen && (
                <div className="fixed bottom-28 left-4 md:left-8 w-[90vw] md:w-[400px] h-[600px] max-h-[80vh] bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-[2rem] shadow-2xl flex flex-col z-[100] overflow-hidden font-sans animate-fade-in-up">
                    {currentUser ? (
                         <ChatInterface className="h-full" />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50 dark:bg-zinc-900">
                            <div className="text-5xl mb-4">🔒</div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Login Required</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">Join the network to access private messaging, groups, and global chat.</p>
                            <button 
                                onClick={() => window.dispatchEvent(new Event('open-auth-modal'))}
                                className="bg-maroon-700 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 transition-transform"
                            >
                                Login / Sign Up
                            </button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default ChatWidget;
