
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
    onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
    const [view, setView] = useState<'login' | 'signup'>('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, signup } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const result = await login(username, password);
        if (result.success) {
            onClose();
        } else {
            setError(result.message);
        }
        setIsLoading(false);
    };
    
    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }
        setError('');
        setIsLoading(true);
        const result = await signup(username, password);
         if (result.success) {
            onClose();
        } else {
            setError(result.message);
        }
        setIsLoading(false);
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
                <div className="flex p-2 bg-gray-100 dark:bg-white/5 m-2 rounded-[2rem]">
                    <button 
                        onClick={() => setView('login')} 
                        className={`flex-1 py-3 rounded-[1.5rem] text-sm font-bold transition-all ${view === 'login' ? 'bg-white dark:bg-gray-800 shadow-md text-maroon-700 dark:text-gold' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        Login
                    </button>
                    <button 
                        onClick={() => setView('signup')} 
                        className={`flex-1 py-3 rounded-[1.5rem] text-sm font-bold transition-all ${view === 'signup' ? 'bg-white dark:bg-gray-800 shadow-md text-maroon-700 dark:text-gold' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        Sign Up
                    </button>
                </div>
                
                <div className="p-8 pb-10">
                    {view === 'login' ? (
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h2>
                                <p className="text-gray-500 text-xs mt-1">Enter your ID to continue</p>
                            </div>
                            
                            {error && <p className="bg-red-50 text-red-500 border border-red-100 p-3 rounded-2xl text-center text-xs font-bold">{error}</p>}
                            
                            <div className="space-y-4">
                                <div>
                                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} required placeholder="Unique ID" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-gold outline-none transition-all placeholder-gray-400" />
                                </div>
                                <div>
                                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Password" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-gold outline-none transition-all placeholder-gray-400" />
                                </div>
                            </div>

                            <button type="submit" disabled={isLoading} className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-4 rounded-2xl hover:scale-[1.02] transition-transform disabled:opacity-50 shadow-lg">
                                {isLoading ? 'Verifying...' : 'Access Account'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleSignup} className="space-y-6">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">New ID</h2>
                                <p className="text-gray-500 text-xs mt-1">Create a unique identity</p>
                            </div>

                            {error && <p className="bg-red-50 text-red-500 border border-red-100 p-3 rounded-2xl text-center text-xs font-bold">{error}</p>}
                            
                             <div className="space-y-4">
                                <div>
                                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} required placeholder="Choose Unique ID" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-gold outline-none transition-all placeholder-gray-400" />
                                </div>
                                <div>
                                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Password (min 6 chars)" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-gold outline-none transition-all placeholder-gray-400" />
                                </div>
                                <div>
                                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required placeholder="Confirm Password" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-gold outline-none transition-all placeholder-gray-400" />
                                </div>
                            </div>
                            
                             <button type="submit" disabled={isLoading} className="w-full bg-maroon-700 text-white font-bold py-4 rounded-2xl hover:bg-maroon-600 transition-colors disabled:opacity-50 shadow-lg">
                                {isLoading ? 'Creating...' : 'Create Account'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
