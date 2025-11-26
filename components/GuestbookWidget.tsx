
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { fetchGuestbook, postGuestbook, updateGuestbook, fetchNewerGuestbook, postReport } from '../services/api';
import type { GuestbookEntry } from '../types';
import { useAuth } from '../context/AuthContext';

// --- Config ---
const MESSAGE_MAX_LENGTH = 280;
const POST_TIMESTAMPS_KEY = 'guestbookPostTimestamps';
const RATE_LIMIT_COUNT = 5;
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MESSAGES_PER_PAGE = 50;
const POLLING_INTERVAL = 5000; // 5 seconds

const PROFANITY_BLOCKLIST = ['badword', 'profanity', 'offensive']; // Add more words as needed

// --- Helper Functions & Sub-components ---

const filterProfanity = (text: string): string => {
    let cleanText = text;
    PROFANITY_BLOCKLIST.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        cleanText = cleanText.replace(regex, '****');
    });
    return cleanText;
};

const formatTimestamp = (timestamp: number): string => {
    const now = new Date();
    const msgDate = new Date(timestamp);
    const diffMs = now.getTime() - msgDate.getTime();
    const diffMins = Math.round(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minutes ago`;

    const isToday = now.toDateString() === msgDate.toDateString();
    if (isToday) {
        return `Today at ${msgDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
    }

    return msgDate.toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit' });
};

const useRelativeTime = (timestamp: number) => {
    const [relativeTime, setRelativeTime] = useState(() => formatTimestamp(timestamp));
    useEffect(() => {
        const interval = setInterval(() => setRelativeTime(formatTimestamp(timestamp)), 60000);
        return () => clearInterval(interval);
    }, [timestamp]);
    return relativeTime;
};


const AVATAR_COLORS = ['bg-cyan-500', 'bg-lime-500', 'bg-violet-500', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-sky-500', 'bg-fuchsia-500'];
const getAvatarColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash % AVATAR_COLORS.length)];
};

const Avatar: React.FC<{ name: string }> = ({ name }) => (
    <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-xl ${getAvatarColor(name)}`}>
        {name.charAt(0).toUpperCase() || '?'}
    </div>
);

const REACTIONS = ['👍', '❤️', '🎉'];

const ChatMessage: React.FC<{ 
    entry: GuestbookEntry, 
    onReaction: (entryId: string, emoji: string) => void,
    onReport: (entry: GuestbookEntry) => void 
}> = ({ entry, onReaction, onReport }) => {
    const relativeTime = useRelativeTime(entry.timestamp);
    const [showReport, setShowReport] = useState(false);

    return (
        <div className="flex items-start space-x-3 group">
            <Avatar name={entry.userId} />
            <div className="flex-1">
                <div className="bg-base-100 p-3 rounded-lg rounded-tl-none relative border border-text-secondary/10">
                     <button onClick={() => setShowReport(!showReport)} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-text-secondary hover:text-text-primary p-1">
                        ...
                    </button>
                    {showReport && (
                        <div className="absolute top-8 right-1 bg-secondary shadow-lg rounded-md border border-text-secondary/20 text-sm z-10">
                            <button onClick={() => { onReport(entry); setShowReport(false); }} className="block w-full text-left px-4 py-2 hover:bg-base-100 text-text-primary">
                                Report Message
                            </button>
                        </div>
                    )}
                    <p className="font-semibold text-accent text-sm">{entry.userId} <span className="text-xs text-text-secondary font-normal ml-2">{relativeTime}</span></p>
                    <p className="text-text-primary mt-1 break-words">{entry.message}</p>
                </div>
                <div className="flex items-center space-x-2 mt-1 pl-1">
                    {REACTIONS.map(emoji => (
                        <button key={emoji} onClick={() => onReaction(entry.id, emoji)} className="flex items-center space-x-1 bg-base-100 hover:bg-secondary border border-transparent hover:border-text-secondary/20 transition-colors px-2 py-0.5 rounded-full text-xs" aria-label={`React with ${emoji}`}>
                            <span>{emoji}</span>
                            <span className="text-text-secondary font-medium">{entry.reactions?.[emoji] || 0}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};


// --- Main Component ---
const GuestbookWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [entries, setEntries] = useState<GuestbookEntry[]>([]);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isPosting, setIsPosting] = useState(false);
    const [error, setError] = useState('');

    const { currentUser } = useAuth();
    
    const chatBoxRef = useRef<HTMLDivElement>(null);
    const messageInputRef = useRef<HTMLTextAreaElement>(null);

    const entriesRef = useRef(entries);
    useEffect(() => {
        entriesRef.current = entries;
    }, [entries]);

    const fetchEntries = useCallback(async (currentOffset: number, isLoadMore: boolean) => {
        if (!isLoadMore) setIsLoading(true);
        try {
            const newEntries = await fetchGuestbook({ offset: currentOffset, limit: MESSAGES_PER_PAGE });
            
            if (isLoadMore) {
                setEntries(prev => [...prev, ...newEntries]);
            } else {
                setEntries(newEntries);
            }
            
            setHasMore(newEntries.length === MESSAGES_PER_PAGE);
        } catch (e) {
            console.error("Failed to fetch guestbook entries:", e);
            setError("Could not load messages.");
        } finally {
            if (!isLoadMore) setIsLoading(false);
        }
    }, []);

    // Initial load and setup when widget opens
    useEffect(() => {
        if (isOpen) {
            if (currentUser) {
                setTimeout(() => messageInputRef.current?.focus(), 100);
            }
            setOffset(0); // Reset offset on open
            fetchEntries(0, false);
        } else {
            // Cleanup on close
            setEntries([]);
            setOffset(0);
            setHasMore(true);
            setError('');
            setIsLoading(true);
        }
    }, [isOpen, fetchEntries, currentUser]);
    
    // Polling for new messages and updates
    useEffect(() => {
        if (!isOpen || isLoading) return;

        const poll = async () => {
            const currentEntries = entriesRef.current;
            
            try {
                // Poll for brand new messages since the last one we received
                const latestTimestamp = currentEntries.length > 0 ? currentEntries[0].timestamp : 0;
                const newerEntries = await fetchNewerGuestbook(latestTimestamp);
                
                // Separately, refresh all currently loaded data to get reaction updates and handle deletions.
                const totalLoadedCount = offset + MESSAGES_PER_PAGE;
                const refreshedEntries = await fetchGuestbook({offset: 0, limit: totalLoadedCount});
                
                setEntries(prev => {
                    const refreshedMap = new Map(refreshedEntries.map(e => [e.id, e]));
                    const existingIds = new Set(prev.map(e => e.id));

                    // Add new entries that are not already in the state
                    const trulyNew = newerEntries.filter(e => !existingIds.has(e.id));
                    
                    // 1. Filter out entries that were deleted on the server.
                    // 2. Keep any optimistic (temp) entries that haven't been replaced by a real one yet.
                    const liveEntries = prev.filter(e => refreshedMap.has(e.id) || e.id.startsWith('temp-'));
                    
                    // 3. Map over the remaining entries to update them with the latest data.
                    const updatedEntries = liveEntries.map(e => refreshedMap.get(e.id) || e);
                    
                    // Combine and remove duplicates, then sort
                    const combined = [...trulyNew, ...updatedEntries];
                    const uniqueCombined = Array.from(new Map(combined.map(e => [e.id, e])).values());

                    return uniqueCombined.sort((a, b) => b.timestamp - a.timestamp);
                });
            } catch (e) {
                console.error("Guestbook polling failed:", e);
            }
        };
        
        const intervalId = setInterval(poll, POLLING_INTERVAL);
        return () => clearInterval(intervalId);
    }, [isOpen, offset, isLoading]);


    const handleToggle = () => setIsOpen(!isOpen);

    const handleReaction = async (entryId: string, emoji: string) => {
        const entry = entries.find(e => e.id === entryId);
        if (!entry) return;
        const newReactions = { ...entry.reactions, [emoji]: (entry.reactions?.[emoji] || 0) + 1 };
        setEntries(prev => prev.map(e => e.id === entryId ? { ...e, reactions: newReactions } : e));
        try {
            await updateGuestbook(entryId, { reactions: newReactions });
        } catch (error) {
            console.error("Failed to save reaction:", error);
            // Revert on failure
            setEntries(prev => prev.map(e => e.id === entryId ? entry : e));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!currentUser) {
            setError('Please log in to post a message.');
            return;
        }

        const trimmedMessage = message.trim();
        if (!trimmedMessage || isPosting) return;

        // Rate Limiting
        const now = Date.now();
        const timestamps = JSON.parse(localStorage.getItem(POST_TIMESTAMPS_KEY) || '[]');
        const recentTimestamps = timestamps.filter((ts: number) => now - ts < RATE_LIMIT_WINDOW);
        if (recentTimestamps.length >= RATE_LIMIT_COUNT) {
            setError("You're posting too frequently. Please wait a moment.");
            return;
        }
        localStorage.setItem(POST_TIMESTAMPS_KEY, JSON.stringify([...recentTimestamps, now]));

        setIsPosting(true);
        const tempEntry: GuestbookEntry = { id: `temp-${Date.now()}`, userId: currentUser.id, message: filterProfanity(trimmedMessage), timestamp: Date.now(), reactions: {} };
        setEntries(prev => [tempEntry, ...prev]);
        setMessage('');
        
        try {
            await postGuestbook({ userId: currentUser.id, message: tempEntry.message });
            // The poller will replace the temp entry with the real one.
        } catch (e) {
            console.error("Failed to save entry:", e);
            setError("Failed to post message. Please try again.");
            // On failure, remove the specific optimistic entry we added.
            setEntries(prev => prev.filter(entry => entry.id !== tempEntry.id));
        } finally {
            setIsPosting(false);
            messageInputRef.current?.focus();
        }
    };

    const handleReport = async (entry: GuestbookEntry) => {
        try {
            await postReport(entry);
            alert("Message reported. A moderator will review it shortly. Thank you.");
        } catch (error) {
            console.error("Failed to report message:", error);
            alert("Could not report message. Please try again later.");
        }
    }

    const handleLoadMore = () => {
        const nextOffset = offset + MESSAGES_PER_PAGE;
        setOffset(nextOffset);
        fetchEntries(nextOffset, true);
    };

    return (
        <>
            <button onClick={handleToggle} className="fixed bottom-8 right-8 bg-gradient-to-r from-accent to-highlight text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-3xl z-50 transform hover:scale-110 transition-transform animate-attention-shake" aria-label={isOpen ? "Close chat" : "Open public chat"}>
                {isOpen ? '✕' : '💬'}
            </button>

            {isOpen && (
                <div className="fixed bottom-28 right-8 w-80 h-[450px] bg-secondary/90 backdrop-blur-lg border border-text-secondary/20 rounded-lg shadow-2xl flex flex-col z-50 animate-slide-in" role="dialog">
                    <header className="bg-base-100/90 p-4 rounded-t-lg text-text-primary border-b border-text-secondary/20 text-center font-bold">Public Chat</header>
                    <div ref={chatBoxRef} className="flex-1 p-4 overflow-y-auto space-y-4">
                        {hasMore && !isLoading && <button onClick={handleLoadMore} className="w-full text-center text-sm text-accent font-semibold hover:underline">Load Older Messages</button>}
                        {isLoading && entries.length === 0 && <p className="text-text-secondary text-center pt-8">Loading messages...</p>}
                        
                        {entries.length > 0 ? entries.map(entry => (
                           <ChatMessage key={entry.id} entry={entry} onReaction={handleReaction} onReport={handleReport}/>
                        )) : !isLoading && <p className="text-text-secondary text-center pt-8">Be the first to leave a message!</p>}
                    </div>
                    <form onSubmit={handleSubmit} className="p-2 border-t border-text-secondary/20 space-y-2">
                        {error && <p className="text-red-500 text-xs text-center">{error}</p>}
                        {currentUser ? (
                            <div className="px-3 py-2 bg-base-100 rounded-md">
                                <p className="text-sm text-text-secondary">Posting as: <strong className="text-text-primary">{currentUser.id}</strong></p>
                            </div>
                        ) : null}
                        <div className="relative">
                            <textarea 
                                ref={messageInputRef} 
                                value={message} 
                                onChange={e => setMessage(e.target.value)} 
                                placeholder={currentUser ? "Leave a message..." : "Please log in to join the chat."} 
                                rows={3} 
                                className="w-full bg-base-100 border-text-secondary/20 rounded-md p-2 pr-12 text-text-primary focus:ring-2 focus:ring-accent resize-none disabled:bg-primary disabled:opacity-50" 
                                disabled={isPosting || !currentUser} 
                                maxLength={MESSAGE_MAX_LENGTH + 10} 
                                required 
                            />
                            <span className={`absolute bottom-2 right-2 text-xs ${message.length > MESSAGE_MAX_LENGTH ? 'text-red-500' : 'text-text-secondary'}`}>{message.length}/{MESSAGE_MAX_LENGTH}</span>
                        </div>
                        <button type="submit" disabled={isPosting || !currentUser || !message.trim() || message.length > MESSAGE_MAX_LENGTH} className="w-full bg-accent text-white rounded-md p-2 disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-highlight transition-colors font-semibold">
                            {isPosting ? 'Posting...' : 'Post Message'}
                        </button>
                    </form>
                </div>
            )}
        </>
    );
};

export default GuestbookWidget;
