
import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { analyzeSentiment } from '../services/geminiService';
import { fetchChatHistory } from '../services/api';

const MESSAGE_MAX_LENGTH = 280;

interface ChatMessage {
    id: string;
    senderId: string;
    message: string;
    timestamp: number;
    type: string;
}

const ChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [typingUser, setTypingUser] = useState<string | null>(null);
    
    // Guest ID logic
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

    // Initialize Socket
    useEffect(() => {
        if (!isOpen) return;

        // Connect to server (relative path works because of Vite proxy)
        socketRef.current = io();

        socketRef.current.on('connect', () => {
            setIsConnected(true);
            socketRef.current?.emit('join_chat', activeUser);
        });

        socketRef.current.on('receive_message', (msg: ChatMessage) => {
            setMessages(prev => [...prev, msg]);
            scrollToBottom();
        });

        socketRef.current.on('user_typing', (userId: string) => {
            setTypingUser(userId);
            setTimeout(() => setTypingUser(null), 2000);
        });

        // Fetch history using robust service
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
    }, [isOpen, activeUser]);

    const scrollToBottom = () => {
        setTimeout(() => {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !socketRef.current) return;

        // AI Moderation check
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
    };

    const handleTyping = () => {
        socketRef.current?.emit('typing', { userId: activeUser });
    };

    return (
        <>
             <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="fixed bottom-6 left-6 w-16 h-16 bg-black border border-accent/50 text-accent rounded-full shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center justify-center text-2xl z-[100] hover:scale-110 transition-transform"
                aria-label="Toggle Global Chat"
            >
                {isOpen ? '✕' : '💬'}
            </button>

            {isOpen && (
                <div className="fixed bottom-24 left-6 w-[90vw] md:w-96 h-[500px] bg-black/90 backdrop-blur-xl border border-accent/30 rounded-2xl shadow-2xl flex flex-col z-[100] overflow-hidden font-mono animate-fade-in-up">
                    {/* Header */}
                    <div className="bg-accent/10 p-4 border-b border-accent/20 flex justify-between items-center">
                        <div>
                            <h3 className="text-accent font-bold text-lg tracking-widest">GLOBAL_NET</h3>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                {isConnected ? 'ONLINE' : 'CONNECTING...'}
                            </div>
                        </div>
                        <div className="text-xs text-gray-500">ID: {activeUser}</div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, idx) => {
                            const isMe = msg.senderId === activeUser;
                            const isAdmin = msg.senderId === 'Admin';
                            return (
                                <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-[85%] p-3 rounded-lg text-sm ${
                                        isMe 
                                        ? 'bg-accent/20 border border-accent/50 text-white rounded-br-none' 
                                        : isAdmin
                                            ? 'bg-purple-900/40 border border-purple-500 text-purple-200'
                                            : 'bg-gray-800 border border-gray-700 text-gray-300 rounded-bl-none'
                                    }`}>
                                        {!isMe && <div className="text-xs font-bold mb-1 opacity-70">{msg.senderId}</div>}
                                        {msg.message}
                                    </div>
                                    <span className="text-[10px] text-gray-600 mt-1">
                                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                            );
                        })}
                        {typingUser && <div className="text-xs text-accent animate-pulse">{typingUser} is typing...</div>}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-3 border-t border-accent/20 bg-black">
                        <div className="flex gap-2">
                            <input 
                                type="text"
                                value={input}
                                onChange={e => { setInput(e.target.value); handleTyping(); }}
                                className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:border-accent outline-none text-sm"
                                placeholder="Broadcast message..."
                                maxLength={MESSAGE_MAX_LENGTH}
                            />
                            <button type="submit" className="bg-accent text-white px-4 rounded font-bold hover:bg-accent/80">
                                SEND
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};

export default ChatWidget;
