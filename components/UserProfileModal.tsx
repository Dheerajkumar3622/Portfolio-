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
    const { currentUser, changePassword } = useAuth();

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

    return (
        <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-up"
            onClick={onClose}
        >
            <div 
                className="bg-gray-800/70 backdrop-blur-md border border-slate-500/50 rounded-lg shadow-xl w-full max-w-sm text-white" 
                onClick={(e) => e.stopPropagation()}
            >
                <header className="p-4 border-b border-slate-500/50 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">User Profile</h2>
                    <button onClick={onClose} className="text-slate-300 hover:text-white text-3xl font-bold" aria-label="Close profile">&times;</button>
                </header>
                
                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <h3 className="text-lg font-semibold text-center">Change Your Password</h3>
                        {message.text && <p className={`${message.type === 'error' ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'} p-3 rounded-md text-center text-sm`}>{message.text}</p>}
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Current Password</label>
                            <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required className="w-full bg-gray-700/80 border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-accent" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
                            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full bg-gray-700/80 border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-accent" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Confirm New Password</label>
                            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full bg-gray-700/80 border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-accent" />
                        </div>

                        <button type="submit" disabled={isLoading} className="w-full bg-accent text-white font-bold py-3 rounded-md hover:bg-highlight transition-colors disabled:bg-gray-500">
                            {isLoading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UserProfileModal;