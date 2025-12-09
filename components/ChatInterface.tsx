
import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { getMyRooms, getRoomMessages, createDMRoom, createGroupRoom, fetchAllUsers } from '../services/api';
import type { ChatRoom, ChatMessage, User } from '../types';

interface ChatInterfaceProps {
    className?: string;
    isFullScreen?: boolean; // For Admin View
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ className, isFullScreen = false }) => {
    const { currentUser } = useAuth();
    const activeUser = currentUser ? currentUser.id : 'Guest';
    
    // State
    const [view, setView] = useState<'list' | 'room'>('list');
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [availableUsers, setAvailableUsers] = useState<User[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    
    // UI State
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    
    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 1. Initialize Socket & Load Data
    useEffect(() => {
        socketRef.current = io();
        
        socketRef.current.on('connect', () => {
            socketRef.current?.emit('join_app', activeUser);
        });

        socketRef.current.on('online_users', (users: string[]) => {
            setOnlineUsers(users);
        });

        socketRef.current.on('receive_message', (msg: ChatMessage) => {
            if (activeRoom && msg.roomId === activeRoom.id) {
                setMessages(prev => [...prev, msg]);
                socketRef.current?.emit('mark_read', { roomId: activeRoom.id, messageIds: [msg.id], userId: activeUser });
                scrollToBottom();
            }
            refreshRooms(); // Update last message in list
        });

        refreshRooms();
        fetchAllUsers().then(setAvailableUsers);

        return () => { socketRef.current?.disconnect(); };
    }, [activeUser, activeRoom]);

    // 2. Room Logic
    const refreshRooms = async () => {
        const myRooms = await getMyRooms(activeUser);
        setRooms(myRooms);
    };

    const enterRoom = async (room: ChatRoom) => {
        setActiveRoom(room);
        const msgs = await getRoomMessages(room.id);
        setMessages(msgs);
        setView('room');
        socketRef.current?.emit('join_room', room.id);
        setTimeout(scrollToBottom, 100);
    };

    const handleCreateDM = async (targetUser: string) => {
        const room = await createDMRoom([activeUser, targetUser]);
        setShowNewChatModal(false);
        refreshRooms();
        enterRoom(room);
    };

    // 3. Messaging Logic
    const sendMessage = async () => {
        if ((!input.trim() && !mediaPreview) || !activeRoom) return;

        const msgData = {
            roomId: activeRoom.id,
            senderId: activeUser,
            message: input,
            type: mediaPreview ? 'image' : 'text',
            mediaUrl: mediaPreview,
            replyTo: replyTo,
            timestamp: Date.now()
        };

        socketRef.current?.emit('send_message', msgData);
        
        setInput('');
        setMediaPreview(null);
        setReplyTo(null);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (ev) => setMediaPreview(ev.target?.result as string);
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Helper to get chat name
    const getRoomName = (room: ChatRoom) => {
        if (room.type === 'global') return 'Global Chat';
        if (room.type === 'group') return room.name || 'Group Chat';
        const other = room.participants.find(p => p !== activeUser) || 'Unknown';
        return other;
    };
    
    const isOnline = (room: ChatRoom) => {
        if (room.type !== 'dm') return false;
        const other = room.participants.find(p => p !== activeUser);
        return other && onlineUsers.includes(other);
    };

    // --- RENDER ---
    
    // View: Contact List
    if (view === 'list' && !isFullScreen) {
        return (
            <div className={`flex flex-col h-full bg-gray-50 dark:bg-black text-gray-900 dark:text-white overflow-hidden ${className}`}>
                {/* Header */}
                <div className="p-4 bg-maroon-900 text-white flex justify-between items-center shrink-0">
                    <h2 className="font-bold text-lg tracking-wide">Chats</h2>
                    <button onClick={() => setShowNewChatModal(true)} className="w-8 h-8 bg-gold rounded-full flex items-center justify-center text-black font-bold text-xl hover:bg-white transition-colors">+</button>
                </div>
                
                {/* Search */}
                <div className="p-3 border-b border-gray-200 dark:border-white/10 shrink-0">
                    <input 
                        type="text" 
                        placeholder="Search chats..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-200 dark:bg-white/10 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                </div>

                {/* Room List */}
                <div className="flex-1 overflow-y-auto">
                    {rooms.filter(r => getRoomName(r).toLowerCase().includes(searchTerm.toLowerCase())).map(room => (
                        <div key={room.id} onClick={() => enterRoom(room)} className="flex items-center gap-3 p-4 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer border-b border-gray-100 dark:border-white/5 transition-colors">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white font-bold text-lg">
                                    {getRoomName(room).charAt(0).toUpperCase()}
                                </div>
                                {isOnline(room) && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-black"></div>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h4 className="font-bold truncate">{getRoomName(room)}</h4>
                                    <span className="text-[10px] text-gray-400">{new Date(room.updatedAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                    {room.lastMessage ? (room.lastMessage.senderId === activeUser ? 'You: ' : '') + (room.lastMessage.type === 'image' ? '📷 Photo' : room.lastMessage.message) : 'Start chatting...'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* New Chat Modal Overlay */}
                {showNewChatModal && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 p-4 flex flex-col">
                        <div className="flex justify-between items-center mb-4 text-white">
                            <h3 className="font-bold text-lg">New Message</h3>
                            <button onClick={() => setShowNewChatModal(false)} className="text-gray-400">Cancel</button>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-2">
                             {availableUsers.filter(u => u.id !== activeUser).map(u => (
                                 <button key={u.id} onClick={() => handleCreateDM(u.id)} className="w-full text-left p-3 flex items-center gap-3 hover:bg-white/10 rounded-xl transition-colors text-white">
                                     <div className="w-10 h-10 rounded-full bg-maroon-700 flex items-center justify-center font-bold">{u.id.charAt(0)}</div>
                                     <span className="font-bold">{u.id}</span>
                                 </button>
                             ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // View: Active Room (Or Full Screen Split View)
    return (
        <div className={`flex h-full bg-gray-50 dark:bg-black overflow-hidden ${className}`}>
            {/* Sidebar (Only visible in fullscreen or if no active room in widget mode) */}
            {(isFullScreen || !activeRoom) && (
                <div className={`${isFullScreen ? 'w-80 border-r border-gray-200 dark:border-white/10' : 'w-full'} flex flex-col`}>
                   {/* Re-use List View Code logic here or componentize it. For brevity, assuming FullScreen mode has list on left */}
                   <div className="p-4 bg-maroon-900 text-white flex justify-between items-center shrink-0">
                        <h2 className="font-bold text-lg">Conversations</h2>
                   </div>
                   <div className="flex-1 overflow-y-auto">
                        {rooms.map(room => (
                            <div key={room.id} onClick={() => enterRoom(room)} className={`p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 border-b border-gray-200 dark:border-white/5 ${activeRoom?.id === room.id ? 'bg-gray-200 dark:bg-white/10' : ''}`}>
                                <h4 className="font-bold text-gray-900 dark:text-white">{getRoomName(room)}</h4>
                                <p className="text-xs text-gray-500 truncate">{room.lastMessage?.message || 'No messages'}</p>
                            </div>
                        ))}
                   </div>
                </div>
            )}

            {/* Chat Area */}
            {activeRoom ? (
                 <div className="flex-1 flex flex-col min-w-0 bg-[#e5ddd5] dark:bg-[#0b141a] relative">
                     {/* Room Header */}
                     <div className="p-3 bg-gray-100 dark:bg-gray-800 flex items-center gap-3 shadow-sm shrink-0 z-10">
                         {!isFullScreen && <button onClick={() => { setActiveRoom(null); setView('list'); }} className="md:hidden text-2xl mr-2 text-gray-600 dark:text-gray-300">←</button>}
                         <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold">{getRoomName(activeRoom).charAt(0)}</div>
                         <div>
                             <h3 className="font-bold text-gray-900 dark:text-white">{getRoomName(activeRoom)}</h3>
                             {isOnline(activeRoom) && <p className="text-xs text-green-600">Online</p>}
                         </div>
                     </div>

                     {/* Messages */}
                     <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] dark:bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-fixed opacity-95">
                         {messages.map(msg => {
                             const isMe = msg.senderId === activeUser;
                             return (
                                 <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                     <div className={`max-w-[70%] rounded-lg p-2 shadow-sm relative ${isMe ? 'bg-[#dcf8c6] dark:bg-[#005c4b] text-black dark:text-white rounded-tr-none' : 'bg-white dark:bg-[#202c33] text-black dark:text-white rounded-tl-none'}`}>
                                         {/* Quoted Reply */}
                                         {msg.replyTo && (
                                             <div className="mb-2 p-2 bg-black/10 dark:bg-white/10 rounded-md border-l-4 border-maroon-600 text-xs">
                                                 <span className="font-bold block text-maroon-700 dark:text-gold">{msg.replyTo.senderId}</span>
                                                 <span className="truncate block">{msg.replyTo.message}</span>
                                             </div>
                                         )}
                                         
                                         {/* Image Media */}
                                         {msg.type === 'image' && msg.mediaUrl && (
                                             <img src={msg.mediaUrl} alt="attachment" className="rounded-lg mb-2 max-h-60 object-cover cursor-pointer" onClick={() => window.open(msg.mediaUrl, '_blank')} />
                                         )}

                                         <p className="text-sm whitespace-pre-wrap leading-snug px-1">{msg.message}</p>
                                         
                                         {/* Footer: Time & Status */}
                                         <div className="flex justify-end items-center gap-1 mt-1">
                                             <span className="text-[10px] text-gray-500 dark:text-gray-400">{new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                             {isMe && (
                                                 <span className={`text-[10px] ${msg.readBy && msg.readBy.length > 1 ? 'text-blue-500' : 'text-gray-500'}`}>
                                                     {msg.readBy && msg.readBy.length > 1 ? '✓✓' : '✓'}
                                                 </span>
                                             )}
                                         </div>

                                         {/* Hover Actions */}
                                         <button onClick={() => setReplyTo(msg)} className="absolute top-0 right-full mr-2 text-gray-400 hover:text-white opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity p-1">↩</button>
                                     </div>
                                 </div>
                             );
                         })}
                         <div ref={messagesEndRef} />
                     </div>

                     {/* Composer */}
                     <div className="p-2 bg-gray-100 dark:bg-gray-800 shrink-0 flex items-end gap-2">
                         {/* Reply Preview */}
                         {replyTo && (
                             <div className="absolute bottom-full left-0 right-0 bg-gray-200 dark:bg-gray-700 p-2 flex justify-between items-center border-b border-gray-300 dark:border-gray-600">
                                 <div className="text-xs border-l-4 border-maroon-600 pl-2">
                                     <span className="font-bold text-maroon-700 dark:text-gold block">Replying to {replyTo.senderId}</span>
                                     <span className="truncate">{replyTo.message}</span>
                                 </div>
                                 <button onClick={() => setReplyTo(null)} className="text-xl">&times;</button>
                             </div>
                         )}

                         {/* Media Upload */}
                         <label className="p-3 text-gray-500 hover:text-gray-700 dark:hover:text-white cursor-pointer">
                             📎 <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                         </label>

                         {/* Input */}
                         <div className="flex-1 bg-white dark:bg-[#2a3942] rounded-2xl flex flex-col px-4 py-2">
                             {mediaPreview && (
                                 <div className="relative mb-2 w-20 h-20">
                                     <img src={mediaPreview} className="w-full h-full object-cover rounded-md" />
                                     <button onClick={() => setMediaPreview(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">&times;</button>
                                 </div>
                             )}
                             <input 
                                 type="text" 
                                 value={input}
                                 onChange={e => setInput(e.target.value)}
                                 onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                 placeholder="Type a message"
                                 className="bg-transparent border-none focus:ring-0 text-sm text-gray-900 dark:text-white w-full p-0"
                             />
                         </div>

                         {/* Send Button */}
                         <button onClick={sendMessage} className="p-3 bg-maroon-700 text-white rounded-full shadow-md hover:bg-maroon-600">
                             ➤
                         </button>
                     </div>
                 </div>
            ) : (
                // Empty State (only visible in fullscreen)
                isFullScreen && <div className="flex-1 flex items-center justify-center bg-[#f0f2f5] dark:bg-[#222e35] text-gray-400">Select a chat to start messaging</div>
            )}
        </div>
    );
};

export default ChatInterface;
