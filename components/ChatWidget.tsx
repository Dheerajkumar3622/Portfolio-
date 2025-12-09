
import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { analyzeSentiment } from '../services/geminiService';
import { fetchChatHistory } from '../services/api';

const MESSAGE_MAX_LENGTH = 500;

interface ChatMessage {
    id: string;
    senderId: string;
    message: string;
    timestamp: number;
    type: string;
}

const formatMessage = (text: string) => {
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|_[^_]+_)/g);
    return parts.map((part, index) => {
        if (part.startsWith('`') && part.endsWith('`')) {
            return <code key={index} className="bg-black/30 text-gold px-2 py-0.5 rounded-md font-mono text-xs">{part.slice(1, -1)}</code>;
        }
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index} className="font-bold text-white">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('_') && part.endsWith('_')) {
            return <em key={index} className="italic">{part.slice(1, -1)}</em>;
        }
        return part;
    });
};

const playNotificationSound = () => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5);
        osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
        console.error("Audio play failed", e);
    }
};

const ChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [typingUser, setTypingUser] = useState<string | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [soundEnabled, setSoundEnabled] = useState(true);
    
    const [guestId] = useState(() => {
        const stored = localStorage.getItem('guest_id');
        if (stored) return stored;
        const newId = `Guest-${Math.floor(Math.random() * 10000)}`;
        localStorage.setItem('guest_id', newId);
        return newId;
    });

    const { currentUser } = useAuth();
    const activeUser = currentUser ? currentUser.id : guestId;
    
    const socketRef = useRef<Socket | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        socketRef.current = io();

        socketRef.current.on('connect', () => {
            setIsConnected(true);
            socketRef.current?.emit('join_chat', activeUser);
        });

        socketRef.current.on('receive_message', (msg: ChatMessage) => {
            setMessages(prev => [...prev, msg]);
            if (!isOpen) {
                setUnreadCount(prev => prev + 1);
                if (soundEnabled) playNotificationSound();
            }
            scrollToBottom();
        });

        socketRef.current.on('user_typing', (userId: string) => {
            if (userId !== activeUser) {
                setTypingUser(userId);
                setTimeout(() => setTypingUser(null), 3000);
            }
        });

        fetchChatHistory()
            .then(data => {
                if(Array.isArray(data)) {
                    setMessages(data);
                    scrollToBottom();
                }
            })
            .catch(err => console.error("History fetch error", err));

        return () => {
            socketRef.current?.disconnect();
        };
    }, [activeUser, isOpen, soundEnabled]);

    useEffect(() => {
        if (isOpen) {
            setUnreadCount(0);
            setTimeout(scrollToBottom, 100);
            setTimeout(() => inputRef.current?.focus(), 200);
        }
    }, [isOpen]);

    const scrollToBottom = () => {
        setTimeout(() => {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim() || !socketRef.current) return;

        const sentiment = await analyzeSentiment(input);
        if (sentiment.label === 'TOXIC') {
            alert("Message blocked: Toxic content detected.");
            return;
        }

        const msgData = {
            senderId: activeUser,
            message: input.trim(),
            timestamp: Date.now()
        };

        socketRef.current.emit('send_message', msgData);
        setInput('');
        
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
        }
    };

    const handleTyping = () => {
        socketRef.current?.emit('typing', { userId: activeUser });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const insertEmoji = (emoji: string) => {
        setInput(prev => prev + emoji);
        inputRef.current?.focus();
    };

    const groupedMessages = messages.reduce((groups, msg) => {
        const date = new Date(msg.timestamp).toLocaleDateString();
        if (!groups[date]) groups[date] = [];
        groups[date].push(msg);
        return groups;
    }, {} as Record<string, ChatMessage[]>);

    return (
        <>
             <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="fixed bottom-8 left-8 w-16 h-16 bg-black border border-gold/50 text-gold rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center justify-center text-2xl z-[100] hover:scale-110 transition-transform group"
                aria-label="Toggle Global Chat"
            >
                {isOpen ? (
                    <span className="text-xl">✕</span>
                ) : (
                    <div className="relative">
                        <span>💬</span>
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-full animate-bounce shadow-md">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </div>
                )}
            </button>

            {isOpen && (
                <div className="fixed bottom-28 left-8 w-[90vw] md:w-[400px] h-[650px] max-h-[75vh] bg-black/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col z-[100] overflow-hidden font-sans animate-fade-in-up">
                    {/* 1. Header */}
                    <div className="bg-gradient-to-r from-gray-900 to-black p-5 border-b border-white/5 flex justify-between items-center">
                        <div>
                            <h3 className="text-white font-bold text-lg tracking-wide font-display">GLOBAL_NET</h3>
                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                                {isConnected ? 'Online' : 'Reconnecting...'}
                            </div>
                            {!currentUser && (
                                <button 
                                    onClick={() => window.dispatchEvent(new Event('open-auth-modal'))}
                                    className="text-[10px] text-gold underline mt-1 hover:text-white"
                                >
                                    Login to claim ID
                                </button>
                            )}
                        </div>
                        <button 
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className={`p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors ${soundEnabled ? 'text-gold' : 'text-gray-600'}`}
                            title={soundEnabled ? "Mute" : "Unmute"}
                        >
                            {soundEnabled ? '🔔' : '🔕'}
                        </button>
                    </div>

                    {/* 2. Chat Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
                        {Object.keys(groupedMessages).map((date) => {
                            const msgs = groupedMessages[date];
                            return (
                            <div key={date}>
                                <div className="flex justify-center mb-6">
                                    <span className="text-[10px] text-gray-400 bg-white/5 px-4 py-1.5 rounded-full backdrop-blur-sm">
                                        {date === new Date().toLocaleDateString() ? 'Today' : date}
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {msgs.map((msg, idx) => {
                                        const isMe = msg.senderId === activeUser;
                                        const isAdmin = msg.senderId === 'Admin';
                                        return (
                                            <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-fade-in-up`}>
                                                <div className={`max-w-[85%] p-4 rounded-3xl text-sm shadow-sm relative ${
                                                    isMe 
                                                    ? 'bg-gradient-to-br from-gold to-yellow-600 text-black rounded-tr-sm' 
                                                    : isAdmin
                                                        ? 'bg-maroon-900 border border-maroon-600 text-white rounded-tl-sm'
                                                        : 'bg-gray-800/80 border border-white/5 text-gray-200 rounded-tl-sm'
                                                }`}>
                                                    {!isMe && <div className={`text-[10px] font-bold mb-1 opacity-70 ${isAdmin ? 'text-gold' : 'text-gray-400'}`}>{msg.senderId}</div>}
                                                    <div className="break-words leading-relaxed">
                                                        {formatMessage(msg.message)}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 mt-1 px-2">
                                                    <span className="text-[10px] text-gray-600">
                                                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    </span>
                                                    {isMe && <span className="text-[10px] text-gold">✓</span>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            );
                        })}
                        
                        {typingUser && (
                            <div className="flex items-center gap-2 text-xs text-gray-500 ml-4 mb-2">
                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></span>
                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></span>
                                <span>{typingUser} is typing...</span>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* 3. Footer */}
                    <div className="p-4 border-t border-white/5 bg-gray-900/50 backdrop-blur-md">
                        {/* Emoji */}
                        <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
                            {['👍', '🔥', '👋', '❤️', '😂', '🎉', '💻', '🤖'].map(emoji => (
                                <button 
                                    key={emoji} 
                                    onClick={() => insertEmoji(emoji)}
                                    className="hover:bg-white/10 rounded-full p-2 text-lg transition-colors w-10 h-10 flex items-center justify-center"
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-end gap-2 bg-black/50 p-1.5 rounded-[2rem] border border-white/10 focus-within:border-gold/50 transition-colors">
                            <textarea 
                                ref={inputRef}
                                value={input}
                                onChange={e => { 
                                    setInput(e.target.value); 
                                    handleTyping();
                                    e.target.style.height = 'auto';
                                    e.target.style.height = e.target.scrollHeight + 'px';
                                }}
                                onKeyDown={handleKeyDown}
                                className="flex-1 bg-transparent border-none rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:ring-0 text-sm resize-none max-h-32 min-h-[44px]"
                                placeholder="Type a message..."
                                rows={1}
                                maxLength={MESSAGE_MAX_LENGTH}
                            />
                            <button 
                                onClick={() => handleSend()}
                                disabled={!input.trim()}
                                className="bg-gold text-black w-10 h-10 rounded-full font-bold hover:bg-white transition-colors flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mb-0.5 mr-0.5"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5">
                                    <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatWidget;
