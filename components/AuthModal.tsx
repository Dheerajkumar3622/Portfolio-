
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
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-up"
            onClick={onClose}
        >
            <div 
                className="bg-gray-800/70 backdrop-blur-md border border-slate-500/50 rounded-lg shadow-xl w-full max-w-sm text-white" 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex border-b border-slate-500/50">
                    <button 
                        onClick={() => setView('login')} 
                        className={`flex-1 p-4 font-semibold transition-colors ${view === 'login' ? 'bg-accent text-white' : 'hover:bg-gray-700/50'}`}
                    >
                        Login
                    </button>
                    <button 
                        onClick={() => setView('signup')} 
                        className={`flex-1 p-4 font-semibold transition-colors ${view === 'signup' ? 'bg-accent text-white' : 'hover:bg-gray-700/50'}`}
                    >
                        Sign Up
                    </button>
                </div>
                
                <div className="p-8">
                    {view === 'login' ? (
                        <form onSubmit={handleLogin} className="space-y-6">
                            <h2 className="text-2xl font-bold text-center">Welcome Back</h2>
                            {error && <p className="bg-red-500/20 text-red-300 p-3 rounded-md text-center text-sm">{error}</p>}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Unique ID / Username</label>
                                <input type="text" value={username} onChange={e => setUsername(e.target.value)} required className="w-full bg-gray-700/80 border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-accent" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-gray-700/80 border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-accent" />
                            </div>
                            <button type="submit" disabled={isLoading} className="w-full bg-accent text-white font-bold py-3 rounded-md hover:bg-highlight transition-colors disabled:bg-gray-500">
                                {isLoading ? 'Logging in...' : 'Login'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleSignup} className="space-y-6">
                            <h2 className="text-2xl font-bold text-center">Create Your ID</h2>
                            {error && <p className="bg-red-500/20 text-red-300 p-3 rounded-md text-center text-sm">{error}</p>}
                             <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Unique ID / Username</label>
                                <input type="text" value={username} onChange={e => setUsername(e.target.value)} required className="w-full bg-gray-700/80 border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-accent" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-gray-700/80 border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-accent" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
                                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full bg-gray-700/80 border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-accent" />
                            </div>
                             <button type="submit" disabled={isLoading} className="w-full bg-accent text-white font-bold py-3 rounded-md hover:bg-highlight transition-colors disabled:bg-gray-500">
                                {isLoading ? 'Creating...' : 'Sign Up'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
