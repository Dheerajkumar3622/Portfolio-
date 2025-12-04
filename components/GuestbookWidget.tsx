
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { fetchGuestbook, postGuestbook, updateGuestbook, fetchNewerGuestbook, postReport } from '../services/api';
import type { GuestbookEntry } from '../types';
import { useAuth } from '../context/AuthContext';

// --- Config ---
const MESSAGE_MAX_LENGTH = 280;
const POST_TIMESTAMPS_KEY = 'guestbookPostTimestamps';
const RATE_LIMIT_COUNT = 10;
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MESSAGES_PER_PAGE = 50;
const POLLING_INTERVAL = 2000; // Fast polling for "live" feel

const PROFANITY_BLOCKLIST = ['badword', 'profanity', 'offensive']; 

// --- Helper Functions ---

const filterProfanity = (text: string): string => {
    let cleanText = text;
    PROFANITY_BLOCKLIST.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        cleanText = cleanText.replace(regex, '****');
    });
    return cleanText;
};

const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getAvatarColor = (name: string) => {
    if (name === 'Admin') return 'bg-blue-600';
    const colors = ['bg-cyan-500', 'bg-lime-500', 'bg-violet-500', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-sky-500'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash % colors.length)];
};

const Avatar: React.FC<{ name: string; size?: string }> = ({ name, size = "w-8 h-8 text-sm" }) => (
    <div className={`${size} rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold shadow-sm ${getAvatarColor(name)}`}>
        {name === 'Admin' ? 'A' : name.charAt(0).toUpperCase()}
    </div>
);

// --- Chat Bubble Component ---
const ChatBubble: React.FC<{ 
    entry: GuestbookEntry, 
    isMe: boolean,
    onReport: (entry: GuestbookEntry) => void 
}> = ({ entry, isMe, onReport }) => {
    const [showOptions, setShowOptions] = useState(false);
    const isAdmin = entry.userId === 'Admin';

    return (
        <div 
            className={`flex w-full mb-4 ${isMe ? 'justify-end' : 'justify-start'}`}
            onMouseEnter={() => setShowOptions(true)}
            onMouseLeave={() => setShowOptions(false)}
        >
            <div className={`flex max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 ${isMe ? 'ml-2' : 'mr-2'} mt-auto`}>
                    <Avatar name={entry.userId} />
                </div>

                {/* Bubble */}
                <div className={`relative px-4 py-2 rounded-2xl shadow-sm text-sm ${
                    isMe 
                    ? 'bg-accent text-white rounded-br-none' 
                    : isAdmin 
                        ? 'bg-blue-50 border-2 border-blue-200 text-blue-900 rounded-bl-none'
                        : 'bg-base-100 text-text-primary border border-text-secondary/10 rounded-bl-none'
                }`}>
                    {/* User ID on received messages */}
                    {!isMe && (
                        <div className={`text-xs font-bold mb-1 flex items-center gap-1 ${isAdmin ? 'text-blue-600' : 'text-accent'}`}>
                            {entry.userId}
                            {isAdmin && (
                                <span className="bg-blue-600 text-white text-[10px] px-1.5 rounded-full uppercase tracking-wider">Admin</span>
                            )}
                        </div>
                    )}
                    
                    <p className="whitespace-pre-wrap break-words">{entry.message}</p>
                    
                    <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-white/70' : 'text-text-secondary/60'}`}>
                        {formatTime(entry.timestamp)}
                    </div>

                    {/* Options (Report) */}
                    {showOptions && !isMe && !isAdmin && (
                        <button 
                            onClick={() => onReport(entry)} 
                            className="absolute -top-6 right-0 bg-secondary text-xs px-2 py-1 rounded shadow text-red-400 hover:text-red-500 opacity-90 transition-opacity"
                        >
                            Report
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};


// --- Main Widget ---
const GuestbookWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [entries, setEntries] = useState<GuestbookEntry[]>([]);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isPosting, setIsPosting] = useState(false);
    const [error, setError] = useState('');

    const { currentUser } = useAuth();
    
    const chatEndRef = useRef<HTMLDivElement>(null);
    const messageInputRef = useRef<HTMLTextAreaElement>(null);
    const entriesRef = useRef(entries);

    // Keep ref in sync for poller
    useEffect(() => {
        entriesRef.current = entries;
    }, [entries]);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchEntries = useCallback(async () => {
        try {
            // Fetch initial batch
            const data = await fetchGuestbook({ limit: MESSAGES_PER_PAGE });
            // Sort oldest to newest for chat layout
            setEntries(data.sort((a, b) => a.timestamp - b.timestamp));
            setIsLoading(false);
            setTimeout(scrollToBottom, 100);
        } catch (e) {
            console.error("Failed to load chat:", e);
        }
    }, []);

    // Initial Open Logic
    useEffect(() => {
        if (isOpen) {
            if (currentUser) {
                setTimeout(() => messageInputRef.current?.focus(), 100);
            }
            fetchEntries();
        }
    }, [isOpen, currentUser, fetchEntries]);

    // Polling Logic
    useEffect(() => {
        if (!isOpen) return;

        const poll = async () => {
            const currentEntries = entriesRef.current;
            const lastEntry = currentEntries.length > 0 ? currentEntries[currentEntries.length - 1] : null;
            const latestTimestamp = lastEntry ? lastEntry.timestamp : 0;

            try {
                const newerEntries = await fetchNewerGuestbook(latestTimestamp);
                if (newerEntries.length > 0) {
                    // Sort newer entries oldest to newest to append correctly
                    const sortedNew = newerEntries.sort((a, b) => a.timestamp - b.timestamp);
                    
                    // Filter duplicates
                    const existingIds = new Set(currentEntries.map(e => e.id));
                    const uniqueNew = sortedNew.filter(e => !existingIds.has(e.id));

                    if (uniqueNew.length > 0) {
                        setEntries(prev => [...prev, ...uniqueNew]);
                        setTimeout(scrollToBottom, 100);
                    }
                }
            } catch (e) {
                // Silent fail on poll error
            }
        };

        const interval = setInterval(poll, POLLING_INTERVAL);
        return () => clearInterval(interval);
    }, [isOpen]);

    const handleToggle = () => setIsOpen(!isOpen);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!currentUser) return;

        const trimmed = message.trim();
        if (!trimmed || isPosting) return;

        // Rate Limit Check
        const now = Date.now();
        const timestamps = JSON.parse(localStorage.getItem(POST_TIMESTAMPS_KEY) || '[]');
        const recent = timestamps.filter((ts: number) => now - ts < RATE_LIMIT_WINDOW);
        if (recent.length >= RATE_LIMIT_COUNT) {
            setError("Slow down! You're messaging too fast.");
            return;
        }
        localStorage.setItem(POST_TIMESTAMPS_KEY, JSON.stringify([...recent, now]));

        setIsPosting(true);
        const tempId = `temp-${Date.now()}`;
        const tempEntry: GuestbookEntry = {
            id: tempId,
            userId: currentUser.id,
            message: filterProfanity(trimmed),
            timestamp: Date.now(),
            reactions: {}
        };

        // Optimistic UI Update
        setEntries(prev => [...prev, tempEntry]);
        setMessage('');
        setTimeout(scrollToBottom, 50);

        try {
            await postGuestbook({ userId: currentUser.id, message: tempEntry.message });
        } catch (e) {
            console.error("Post failed", e);
            setError("Failed to send message.");
            setEntries(prev => prev.filter(e => e.id !== tempId));
        } finally {
            setIsPosting(false);
            messageInputRef.current?.focus();
        }
    };

    const handleReport = async (entry: GuestbookEntry) => {
        if(window.confirm("Report this message to the admin?")) {
            try {
                await postReport(entry);
                alert("Report sent.");
            } catch (e) {
                alert("Failed to report.");
            }
        }
    };

    return (
        <>
            <button 
                onClick={handleToggle} 
                className="fixed bottom-8 right-8 bg-gradient-to-r from-accent to-highlight text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl z-50 transform hover:scale-110 transition-transform animate-bounce" 
                aria-label="Open Chat"
            >
                {isOpen ? '✕' : '💬'}
            </button>

            {isOpen && (
                <div className="fixed bottom-24 right-4 md:right-8 w-[90vw] md:w-96 h-[500px] bg-secondary/95 backdrop-blur-xl border border-text-secondary/20 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden animate-fade-in-up">
                    
                    {/* Header */}
                    <div className="bg-gradient-to-r from-accent to-highlight p-4 text-white font-bold flex justify-between items-center shadow-md z-10">
                        <div className="flex items-center space-x-2">
                            <span>Public Chat</span>
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        </div>
                        <button onClick={handleToggle} className="hover:bg-white/20 rounded-full p-1 text-sm">Close</button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-4 bg-primary/50 scroll-smooth">
                        {isLoading && <p className="text-center text-text-secondary text-sm mt-4">Loading conversation...</p>}
                        
                        {!isLoading && entries.length === 0 && (
                            <div className="text-center mt-8 opacity-70">
                                <p className="text-4xl mb-2">👋</p>
                                <p className="text-sm">No messages yet.<br/>Be the first to say hello!</p>
                            </div>
                        )}

                        {entries.map(entry => (
                            <ChatBubble 
                                key={entry.id} 
                                entry={entry} 
                                isMe={currentUser?.id === entry.userId} 
                                onReport={handleReport}
                            />
                        ))}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-secondary border-t border-text-secondary/10">
                         {error && <p className="text-red-500 text-xs text-center mb-2">{error}</p>}
                        
                        {currentUser ? (
                            <form onSubmit={handleSubmit} className="flex items-end gap-2">
                                <textarea 
                                    ref={messageInputRef}
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-base-100 border-none rounded-2xl py-2 px-4 focus:ring-2 focus:ring-accent resize-none h-10 max-h-24 min-h-[40px]"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSubmit(e);
                                        }
                                    }}
                                    maxLength={MESSAGE_MAX_LENGTH}
                                />
                                <button 
                                    type="submit" 
                                    disabled={!message.trim() || isPosting}
                                    className="bg-accent text-white p-2 rounded-full w-10 h-10 flex items-center justify-center hover:bg-highlight transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                                >
                                    ➤
                                </button>
                            </form>
                        ) : (
                            <div className="text-center py-2">
                                <p className="text-sm text-text-secondary mb-2">Join the conversation</p>
                                <button onClick={() => alert("Please click the 'Login / Sign Up' button in the top navigation bar to create an account.")} className="bg-accent text-white px-6 py-2 rounded-full text-sm font-bold shadow hover:bg-highlight transition-colors w-full">
                                    Login to Chat
                                </button>
                            </div>
                        )}
                        <div className="text-center mt-1">
                             {currentUser && <span className="text-[10px] text-text-secondary">Logged in as {currentUser.id}</span>}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default GuestbookWidget;
