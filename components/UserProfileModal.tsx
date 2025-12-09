
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface UserProfileModalProps {
    onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ onClose }) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isLoading, setIsLoading] = useState(false);
    const { currentUser, changePassword, logout } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (!currentUser) {
            setMessage({ type: 'error', text: 'You are not logged in.' });
            return;
        }
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: "New passwords do not match." });
            return;
        }
        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: "New password must be at least 6 characters long." });
            return;
        }

        setIsLoading(true);
        const result = await changePassword(currentUser.id, oldPassword, newPassword);
        
        if (result.success) {
            setMessage({ type: 'success', text: result.message });
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } else {
            setMessage({ type: 'error', text: result.message });
        }
        setIsLoading(false);
    };

    const handleLogout = () => {
        logout();
        onClose();
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-fade-in-up"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-white/20" 
                onClick={(e) => e.stopPropagation()}
            >
                <header className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white pl-2">Profile Settings</h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 transition-colors flex items-center justify-center text-gray-500" aria-label="Close profile">&times;</button>
                </header>
                
                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-black rounded-full mx-auto flex items-center justify-center shadow-inner mb-3">
                                <span className="text-3xl font-bold text-gray-500 dark:text-gray-400">{currentUser?.id.charAt(0)}</span>
                            </div>
                            <span className="block text-xl font-display font-bold text-gray-900 dark:text-white">{currentUser?.id}</span>
                        </div>

                        {message.text && <p className={`${message.type === 'error' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'} p-3 rounded-2xl text-center text-xs font-bold`}>{message.text}</p>}
                        
                        <div className="space-y-4">
                            <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required placeholder="Current Password" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-gold outline-none transition-all placeholder-gray-400" />
                            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required placeholder="New Password" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-gold outline-none transition-all placeholder-gray-400" />
                            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required placeholder="Confirm New Password" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-gold outline-none transition-all placeholder-gray-400" />
                        </div>

                        <button type="submit" disabled={isLoading} className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-4 rounded-2xl hover:scale-[1.02] transition-transform disabled:opacity-50 shadow-lg">
                            {isLoading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5">
                        <button 
                            type="button" 
                            onClick={handleLogout} 
                            className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-colors"
                        >
                            Log Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfileModal;
