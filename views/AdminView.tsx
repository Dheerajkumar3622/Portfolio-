
import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import type { PortfolioData, Education, Skill, Project, Experience, GuestbookEntry, Lead, SocialLink, Memory, Note, Report, User } from '../types';
import TagInput from '../components/TagInput';
import { fetchGuestbook, removeGuestbook, fetchLeads, fetchReports, removeReport, fetchAllUsers, removeUser, postGuestbook, checkSystemHealth } from '../services/api';
import { GoogleGenAI } from "@google/genai";

const STORAGE_KEY_AUTH = 'adminAuth';
const STORAGE_KEY_CREDS = 'adminCredentials';

// Function to get credentials or set defaults
const getCredentials = () => {
    const storedCreds = localStorage.getItem(STORAGE_KEY_CREDS);
    if (storedCreds) {
        return JSON.parse(storedCreds);
    }
    const defaultCreds = { 
        username: 'dheerajkumar3622', 
        password: 'Dheeraj@123',
        securityQuestion: 'What is your favorite engineering subject?',
        securityAnswer: 'microprocessors' 
    };
    localStorage.setItem(STORAGE_KEY_CREDS, JSON.stringify(defaultCreds));
    return defaultCreds;
};


const LoginForm: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [view, setView] = useState<'login' | 'forgot'>('login');

    // State for password reset
    const [resetUsername, setResetUsername] = useState('');
    const [securityAnswer, setSecurityAnswer] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [resetMessage, setResetMessage] = useState({ type: '', text: '' });
    
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const creds = getCredentials();
        if (username === creds.username && password === creds.password) {
            localStorage.setItem(STORAGE_KEY_AUTH, 'true');
            onLogin();
            setError('');
        } else {
            setError('Invalid credentials. Please try again.');
        }
    };
    
    const handlePasswordReset = (e: React.FormEvent) => {
        e.preventDefault();
        setResetMessage({ type: '', text: '' });
        const creds = getCredentials();

        if (resetUsername !== creds.username) {
            setResetMessage({ type: 'error', text: 'Username not found.' });
            return;
        }
        if (securityAnswer.toLowerCase() !== creds.securityAnswer.toLowerCase()) {
            setResetMessage({ type: 'error', text: 'Security answer is incorrect.' });
            return;
        }
        if (newPassword.length < 8) {
            setResetMessage({ type: 'error', text: 'New password must be at least 8 characters long.' });
            return;
        }
        if (newPassword !== confirmNewPassword) {
            setResetMessage({ type: 'error', text: 'Passwords do not match.' });
            return;
        }

        const newCreds = { ...creds, password: newPassword };
        localStorage.setItem(STORAGE_KEY_CREDS, JSON.stringify(newCreds));
        setResetMessage({ type: 'success', text: 'Password has been reset successfully! You can now log in.' });
        
        // Clear fields and switch back to login view after a delay
        setTimeout(() => {
            setView('login');
            setResetMessage({ type: '', text: ''});
            setResetUsername('');
            setSecurityAnswer('');
            setNewPassword('');
            setConfirmNewPassword('');
        }, 3000);
    };

    if (view === 'forgot') {
        const creds = getCredentials();
        return (
             <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
                    <h1 className="text-3xl font-bold text-center mb-6 text-white">Reset Password</h1>
                    {resetMessage.text && <p className={`${resetMessage.type === 'error' ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'} p-3 rounded-md mb-4`}>{resetMessage.text}</p>}
                     <form onSubmit={handlePasswordReset} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Username</label>
                            <input type="text" value={resetUsername} onChange={(e) => setResetUsername(e.target.value)} className="w-full bg-gray-700 border-gray-600 rounded-md p-3 text-white mt-1" required/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">{creds.securityQuestion}</label>
                            <input type="text" value={securityAnswer} onChange={(e) => setSecurityAnswer(e.target.value)} className="w-full bg-gray-700 border-gray-600 rounded-md p-3 text-white mt-1" required/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-300">New Password</label>
                            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-gray-700 border-gray-600 rounded-md p-3 text-white mt-1" required/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Confirm New Password</label>
                            <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="w-full bg-gray-700 border-gray-600 rounded-md p-3 text-white mt-1" required/>
                        </div>
                        <button type="submit" className="w-full bg-gradient-to-r from-secondary to-accent text-white font-bold py-3 rounded-md hover:opacity-90 transition-opacity">Reset Password</button>
                        <button type="button" onClick={() => setView('login')} className="w-full text-center text-sm text-gray-400 hover:text-white mt-2">Back to Login</button>
                     </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
                <h1 className="text-3xl font-bold text-center mb-6 text-white">Admin Login</h1>
                {error && <p className="bg-red-500/20 text-red-300 p-3 rounded-md mb-4">{error}</p>}
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-gray-700 border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-accent mt-1"
                            autoComplete="username"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-700 border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-accent mt-1"
                            autoComplete="current-password"
                        />
                    </div>
                    <button type="submit" className="w-full bg-gradient-to-r from-secondary to-accent text-white font-bold py-3 rounded-md hover:opacity-90 transition-opacity">
                        Login
                    </button>
                </form>
                 <div className="text-center mt-4">
                    <button onClick={() => setView('forgot')} className="text-sm text-gray-400 hover:text-white">
                        Forgot Password?
                    </button>
                </div>
            </div>
        </div>
    );
};

const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });


const AdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
    const { portfolioData, setPortfolioData, saveData } = usePortfolio();
    const [localData, setLocalData] = useState<PortfolioData>(portfolioData);
    const [guestbookEntries, setGuestbookEntries] = useState<GuestbookEntry[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [reports, setReports] = useState<Report[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [errors, setErrors] = useState<any>({});
    const [activeTab, setActiveTab] = useState('Profile');
    const [isDirty, setIsDirty] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [systemHealth, setSystemHealth] = useState<{status: string, database: string}>({ status: 'checking', database: 'unknown' });

    // Chat reply state
    const [adminReply, setAdminReply] = useState('');

    // State for new note upload
    const [newNote, setNewNote] = useState<{ title: string; description: string; file: File | null }>({ title: '', description: '', file: null });
    const [uploadingNote, setUploadingNote] = useState(false);

    // State for video generation
    const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
    const [generationStatus, setGenerationStatus] = useState('');

    useEffect(() => {
        setLocalData(portfolioData);
        setIsDirty(false); // Reset dirty state when portfolioData from context changes
    }, [portfolioData]);

    useEffect(() => {
        if(JSON.stringify(localData) !== JSON.stringify(portfolioData)) {
            setIsDirty(true);
        } else {
            setIsDirty(false);
        }
    }, [localData, portfolioData]);

    // Check health on mount
    useEffect(() => {
        const check = async () => {
            const health = await checkSystemHealth();
            setSystemHealth(health);
        };
        check();
    }, []);

    const fetchGuestbookData = async () => {
        setGuestbookEntries(await fetchGuestbook({limit: 50})); // Load recent for chat view
    };

    const fetchReportData = async () => {
        setReports(await fetchReports());
    };

    const fetchUsersData = async () => {
        setUsers(await fetchAllUsers());
    };

    useEffect(() => {
        const fetchData = async () => {
            if(activeTab === 'Public Chat') {
                fetchGuestbookData();
            }
            if(activeTab === 'Contact Leads') {
                setLeads(await fetchLeads());
            }
            if (activeTab === 'Moderation') {
                fetchReportData();
            }
            if (activeTab === 'User Management') {
                fetchUsersData();
            }
        };
        fetchData();
        
        // Poll for chat if tab is active
        let interval: any;
        if(activeTab === 'Public Chat') {
             interval = setInterval(fetchGuestbookData, 3000);
        }
        return () => { if(interval) clearInterval(interval); }
    }, [activeTab]);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setLocalData(prev => ({
            ...prev,
            profile: { ...prev.profile, [name]: value }
        }));
    };

    const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const base64 = await fileToBase64(e.target.files[0]);
            setLocalData(prev => ({ ...prev, profile: { ...prev.profile, profilePicture: base64 }}));
        }
    };
    
    const handlePromoVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
             const base64 = await fileToBase64(e.target.files[0]);
             setLocalData(prev => ({ ...prev, profile: { ...prev.profile, promoVideo: base64 }}));
        }
    };

    const handleGenerateVideo = async () => {
        if (!process.env.API_KEY) {
            alert("API_KEY is not defined in the environment variables. Please add it to Render settings to use Veo.");
            return;
        }

        if (typeof window !== 'undefined' && (window as any).aistudio) {
            const aistudio = (window as any).aistudio;
            const hasKey = await aistudio.hasSelectedApiKey();
            if (!hasKey) {
                const success = await aistudio.openSelectKey();
                if (!success) return; 
            }
        }
    
        setIsGeneratingVideo(true);
        setGenerationStatus('Initializing AI video generation...');
    
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            
            const projectTitles = localData.projects.map(p => p.title).join(', ');
            const prompt = `A high-tech, cinematic promotional video for an Electronics & Communication Engineer portfolio. 
            Visuals of advanced circuit boards, soldering components, embedded systems code on screens, and futuristic IoT devices. 
            Professional lighting, 4k resolution, slow motion shots. 
            Themes based on: ${localData.profile.about.substring(0, 200)}. 
            Featuring concepts like: ${projectTitles}.`;
    
            setGenerationStatus('Submitting request to Veo (this may take a moment)...');
    
            let operation = await ai.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview',
                prompt: prompt,
                config: {
                    numberOfVideos: 1,
                    resolution: '1080p',
                    aspectRatio: '16:9'
                }
            });
    
            setGenerationStatus('Generating video... (This usually takes 1-2 minutes)');
    
            while (!operation.done) {
                await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10s
                setGenerationStatus('Still generating... Please wait.');
                operation = await ai.operations.getVideosOperation({ operation: operation });
            }
    
            if (operation.response?.generatedVideos?.[0]?.video?.uri) {
                setGenerationStatus('Download complete. Processing video...');
                const videoUri = operation.response.generatedVideos[0].video.uri;
                
                const response = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
                const blob = await response.blob();
                
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = () => {
                    const base64data = reader.result as string;
                    setLocalData(prev => ({
                        ...prev,
                        profile: { ...prev.profile, promoVideo: base64data }
                    }));
                    setIsGeneratingVideo(false);
                    setGenerationStatus('');
                    alert('Video generated successfully! Please click "Save All Changes" to persist it.');
                };
            } else {
                throw new Error('No video URI returned.');
            }
    
        } catch (error) {
            console.error('Video generation failed:', error);
            alert('Failed to generate video. Please try again or check your API key quota.');
            setIsGeneratingVideo(false);
            setGenerationStatus('');
        }
    };
    
    const handleItemChange = <T extends object>(section: keyof PortfolioData, index: number, field: keyof T, value: T[keyof T]) => {
        setLocalData(prev => {
            const newSection = [...(prev[section] as any[])];
            newSection[index] = { ...newSection[index], [field]: value };
            return { ...prev, [section]: newSection };
        });
    };
    
    const handleSocialLinkChange = (index: number, field: keyof SocialLink, value: string) => {
         setLocalData(prev => {
            const newSocialLinks = [...prev.profile.socialLinks];
            newSocialLinks[index] = { ...newSocialLinks[index], [field]: value };
            return { ...prev, profile: { ...prev.profile, socialLinks: newSocialLinks }};
        });
    }

    const handleAddSocialLink = () => {
        setLocalData(prev => ({
            ...prev,
            profile: {
                ...prev.profile,
                socialLinks: [...prev.profile.socialLinks, {id: `new-${Date.now()}`, platform: 'Website', url: ''}]
            }
        }));
    };
    
    const handleRemoveSocialLink = (id: string) => {
         setLocalData(prev => ({
            ...prev,
            profile: {
                ...prev.profile,
                socialLinks: prev.profile.socialLinks.filter(link => link.id !== id)
            }
        }));
    };


    const handleProjectGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        if (e.target.files) {
            const files: File[] = Array.from(e.target.files);
            const base64Promises = files.map(file => fileToBase64(file));
            const base64Images = await Promise.all(base64Promises);
            
            const currentImages = localData.projects[index].imageGallery || [];
            handleItemChange<Project>('projects', index, 'imageGallery', [...currentImages, ...base64Images]);
        }
    };

    const removeProjectGalleryImage = (projectIndex: number, imageIndex: number) => {
        const updatedImages = localData.projects[projectIndex].imageGallery.filter((_, i) => i !== imageIndex);
        handleItemChange<Project>('projects', projectIndex, 'imageGallery', updatedImages);
    };

    const handleAddItem = (section: 'education' | 'experience' | 'projects' | 'skills' | 'memories') => {
        const newItem = {
            id: `new-${Date.now()}`,
            ...(section === 'education' && { degree: '', institution: '', period: '', details: '' }),
            ...(section === 'experience' && { role: '', organization: '', startDate: '', endDate: '', description: '' }),
            ...(section === 'projects' && { title: '', description: '', longDescription: '', keyLearning: '', technologies: [], link: '', repoLink: '', imageGallery: [], videoUrl: '' }),
            ...(section === 'skills' && { name: '', level: 50 }),
            ...(section === 'memories' && { image: '', caption: '' }),
        };

        if(section === 'memories') return;

        setLocalData(prev => ({
            ...prev,
            [section]: [...(prev[section] as any[]), newItem]
        }));
    };
    
    const handleMemoryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files: File[] = Array.from(e.target.files);
            const base64Promises = files.map(file => fileToBase64(file));
            const base64Images = await Promise.all(base64Promises);
            
            const newMemories: Memory[] = base64Images.map(img => ({
                id: `new-${Date.now()}-${Math.random()}`,
                image: img,
                caption: ''
            }));
            
            setLocalData(prev => ({
                ...prev,
                memories: [...prev.memories, ...newMemories]
            }));
        }
    };


    const handleRemoveItem = (section: keyof Omit<PortfolioData, 'profile'>, id: string) => {
        setLocalData(prev => ({
            ...prev,
            [section]: (prev[section] as any[]).filter(item => item.id !== id)
        }));
    };

    const handleNoteFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setNewNote(prev => ({ ...prev, file: e.target.files![0] }));
        }
    }

    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.title || !newNote.description || !newNote.file) {
             alert('Please fill in all note fields and select a file.');
             return;
        }
        setUploadingNote(true);
        try {
            const base64 = await fileToBase64(newNote.file);
            const noteData: Note = {
                id: `note-${Date.now()}`,
                title: newNote.title,
                description: newNote.description,
                fileData: base64,
                fileName: newNote.file.name,
                fileType: newNote.file.type
            };
            setLocalData(prev => ({ ...prev, notes: [...prev.notes, noteData] }));
            setNewNote({ title: '', description: '', file: null });
            // Reset file input (simple way)
            const fileInput = document.getElementById('note-file-input') as HTMLInputElement;
            if(fileInput) fileInput.value = '';
        } catch (error) {
            console.error(error);
            alert('Error uploading file');
        } finally {
            setUploadingNote(false);
        }
    };

    const handleSave = async () => {
        setSaveStatus('saving');
        try {
            await saveData(localData);
            setPortfolioData(localData); // Update context
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch(e) {
            console.error(e);
            setSaveStatus('idle');
            alert('Error saving data');
        }
    };

    const handleReplyToGuestbook = async (entry: GuestbookEntry) => {
        if(!adminReply.trim()) return;
        try {
            // Replying as admin post
            await postGuestbook({ userId: 'Admin', message: `@${entry.userId} ${adminReply}` });
            setAdminReply('');
            fetchGuestbookData();
        } catch(e) {
            alert("Failed to reply");
        }
    };

    const handleDeleteGuestbook = async (id: string) => {
        if(window.confirm('Delete this message?')) {
            await removeGuestbook(id);
            fetchGuestbookData();
        }
    };
    
    const handleDeleteReport = async (id: string) => {
         await removeReport(id);
         fetchReportData();
    };

    const handleBanUser = async (id: string) => {
        if(window.confirm(`Are you sure you want to delete user ${id}? This cannot be undone.`)) {
            await removeUser(id);
            fetchUsersData();
        }
    };

    return (
        <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-800 flex flex-col border-r border-gray-700">
                <div className="p-6 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-accent">Admin Panel</h2>
                    <p className="text-xs text-gray-400 mt-1">Manage Portfolio & Data</p>
                    <div className="flex items-center gap-2 mt-4 text-xs">
                        <span className={`w-2 h-2 rounded-full ${systemHealth.status === 'ok' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span>DB: {systemHealth.database}</span>
                    </div>
                </div>
                <nav className="flex-1 overflow-y-auto py-4">
                    {['Profile', 'Skills', 'Projects', 'Experience', 'Education', 'Memories', 'Notes', 'Public Chat', 'Contact Leads', 'Moderation', 'User Management'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`w-full text-left px-6 py-3 transition-colors ${activeTab === tab ? 'bg-gray-700 text-accent border-r-4 border-accent' : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-gray-700">
                    <button onClick={onLogout} className="w-full bg-red-500/10 text-red-400 py-2 rounded-md hover:bg-red-500/20 transition-colors">Logout</button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
                    <h1 className="text-xl font-semibold">{activeTab}</h1>
                    <div className="flex items-center gap-4">
                        {isDirty && <span className="text-yellow-400 text-sm">Unsaved Changes</span>}
                        <button 
                            onClick={handleSave} 
                            disabled={saveStatus === 'saving'}
                            className={`px-6 py-2 rounded-md font-bold transition-all ${
                                saveStatus === 'saved' ? 'bg-green-500 text-white' : 
                                saveStatus === 'saving' ? 'bg-gray-600 text-gray-300' :
                                'bg-accent text-white hover:bg-highlight'
                            }`}
                        >
                            {saveStatus === 'saved' ? 'Saved!' : saveStatus === 'saving' ? 'Saving...' : 'Save All Changes'}
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8">
                    {activeTab === 'Profile' && (
                        <div className="space-y-6 max-w-3xl">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                                    <input type="text" name="name" value={localData.profile.name} onChange={handleProfileChange} className="w-full bg-gray-700 border-gray-600 rounded p-2 text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Professional Title</label>
                                    <input type="text" name="title" value={localData.profile.title} onChange={handleProfileChange} className="w-full bg-gray-700 border-gray-600 rounded p-2 text-white" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">About Me</label>
                                <textarea name="about" value={localData.profile.about} onChange={handleProfileChange} rows={5} className="w-full bg-gray-700 border-gray-600 rounded p-2 text-white" />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Profile Picture</label>
                                    <input type="file" accept="image/*" onChange={handleProfilePicChange} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-highlight"/>
                                    {localData.profile.profilePicture && <img src={localData.profile.profilePicture} alt="Profile" className="mt-4 h-32 w-32 rounded-full object-cover border-4 border-gray-600" />}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Promo Video</label>
                                    <div className="flex gap-2 mb-2">
                                        <input type="file" accept="video/*" onChange={handlePromoVideoChange} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-highlight"/>
                                        <button onClick={handleGenerateVideo} disabled={isGeneratingVideo} className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50">
                                            {isGeneratingVideo ? 'Generating...' : 'Generate with AI'}
                                        </button>
                                    </div>
                                    {generationStatus && <p className="text-xs text-purple-300 mb-2">{generationStatus}</p>}
                                    {localData.profile.promoVideo && (
                                        localData.profile.promoVideo.startsWith('data:video') ?
                                        <video src={localData.profile.promoVideo} controls className="mt-2 h-32 w-auto rounded border border-gray-600" /> :
                                        <div className="mt-2 text-sm text-gray-400">Video URL: {localData.profile.promoVideo}</div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Social Links</h3>
                                {localData.profile.socialLinks.map((link, idx) => (
                                    <div key={link.id} className="flex gap-4 mb-2">
                                        <input type="text" value={link.platform} onChange={(e) => handleSocialLinkChange(idx, 'platform', e.target.value)} className="bg-gray-700 border-gray-600 rounded p-2 text-white w-1/3" placeholder="Platform" />
                                        <input type="text" value={link.url} onChange={(e) => handleSocialLinkChange(idx, 'url', e.target.value)} className="bg-gray-700 border-gray-600 rounded p-2 text-white flex-1" placeholder="URL" />
                                        <button onClick={() => handleRemoveSocialLink(link.id)} className="text-red-400 hover:text-red-300 px-2">&times;</button>
                                    </div>
                                ))}
                                <button onClick={handleAddSocialLink} className="text-accent hover:text-white text-sm mt-2">+ Add Social Link</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Skills' && (
                        <div>
                            {localData.skills.map((skill, index) => (
                                <div key={skill.id} className="flex gap-4 mb-4 bg-gray-800 p-4 rounded items-center">
                                    <input type="text" value={skill.name} onChange={(e) => handleItemChange('skills', index, 'name', e.target.value)} className="bg-gray-700 border-gray-600 rounded p-2 text-white flex-1" />
                                    <input type="number" min="0" max="100" value={skill.level} onChange={(e) => handleItemChange('skills', index, 'level', parseInt(e.target.value))} className="bg-gray-700 border-gray-600 rounded p-2 text-white w-20" />
                                    <button onClick={() => handleRemoveItem('skills', skill.id)} className="bg-red-500/20 text-red-400 p-2 rounded hover:bg-red-500/30">Delete</button>
                                </div>
                            ))}
                            <button onClick={() => handleAddItem('skills')} className="bg-accent text-white px-4 py-2 rounded hover:bg-highlight">Add Skill</button>
                        </div>
                    )}

                    {activeTab === 'Projects' && (
                        <div className="space-y-8">
                            {localData.projects.map((project, index) => (
                                <div key={project.id} className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                                    <div className="flex justify-between mb-4">
                                        <h3 className="text-lg font-bold text-accent">Project {index + 1}</h3>
                                        <button onClick={() => handleRemoveItem('projects', project.id)} className="text-red-400 hover:text-red-300">Delete Project</button>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        <input type="text" value={project.title} onChange={(e) => handleItemChange('projects', index, 'title', e.target.value)} placeholder="Project Title" className="bg-gray-700 border-gray-600 rounded p-2 text-white" />
                                        <textarea value={project.description} onChange={(e) => handleItemChange('projects', index, 'description', e.target.value)} placeholder="Short Description" className="bg-gray-700 border-gray-600 rounded p-2 text-white" rows={2} />
                                        <textarea value={project.longDescription} onChange={(e) => handleItemChange('projects', index, 'longDescription', e.target.value)} placeholder="Detailed Description (Markdown supported)" className="bg-gray-700 border-gray-600 rounded p-2 text-white" rows={4} />
                                        <textarea value={project.keyLearning} onChange={(e) => handleItemChange('projects', index, 'keyLearning', e.target.value)} placeholder="Key Learning" className="bg-gray-700 border-gray-600 rounded p-2 text-white" rows={2} />
                                        
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Technologies</label>
                                            <TagInput tags={project.technologies} setTags={(newTags) => handleItemChange('projects', index, 'technologies', newTags)} />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <input type="text" value={project.link || ''} onChange={(e) => handleItemChange('projects', index, 'link', e.target.value)} placeholder="Live Link URL" className="bg-gray-700 border-gray-600 rounded p-2 text-white" />
                                            <input type="text" value={project.repoLink || ''} onChange={(e) => handleItemChange('projects', index, 'repoLink', e.target.value)} placeholder="Repository URL" className="bg-gray-700 border-gray-600 rounded p-2 text-white" />
                                        </div>
                                        <input type="text" value={project.videoUrl || ''} onChange={(e) => handleItemChange('projects', index, 'videoUrl', e.target.value)} placeholder="YouTube Video URL" className="bg-gray-700 border-gray-600 rounded p-2 text-white" />
                                        
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Image Gallery</label>
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {project.imageGallery.map((img, i) => (
                                                    <div key={i} className="relative w-24 h-24">
                                                        <img src={img} alt="" className="w-full h-full object-cover rounded" />
                                                        <button onClick={() => removeProjectGalleryImage(index, i)} className="absolute top-0 right-0 bg-red-600 text-white w-5 h-5 flex items-center justify-center rounded-full text-xs hover:bg-red-700">&times;</button>
                                                    </div>
                                                ))}
                                            </div>
                                            <input type="file" multiple accept="image/*" onChange={(e) => handleProjectGalleryChange(e, index)} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-highlight"/>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => handleAddItem('projects')} className="bg-accent text-white px-4 py-2 rounded hover:bg-highlight">Add New Project</button>
                        </div>
                    )}

                     {activeTab === 'Experience' && (
                        <div>
                             {localData.experience.map((exp, index) => (
                                <div key={exp.id} className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-4">
                                    <div className="grid grid-cols-2 gap-4 mb-2">
                                        <input type="text" value={exp.role} onChange={(e) => handleItemChange('experience', index, 'role', e.target.value)} placeholder="Role" className="bg-gray-700 border-gray-600 rounded p-2 text-white" />
                                        <input type="text" value={exp.organization} onChange={(e) => handleItemChange('experience', index, 'organization', e.target.value)} placeholder="Organization" className="bg-gray-700 border-gray-600 rounded p-2 text-white" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mb-2">
                                        <input type="text" value={exp.startDate} onChange={(e) => handleItemChange('experience', index, 'startDate', e.target.value)} placeholder="Start Date" className="bg-gray-700 border-gray-600 rounded p-2 text-white" />
                                        <input type="text" value={exp.endDate} onChange={(e) => handleItemChange('experience', index, 'endDate', e.target.value)} placeholder="End Date" className="bg-gray-700 border-gray-600 rounded p-2 text-white" />
                                    </div>
                                    <textarea value={exp.description} onChange={(e) => handleItemChange('experience', index, 'description', e.target.value)} placeholder="Description" className="w-full bg-gray-700 border-gray-600 rounded p-2 text-white mb-2" rows={3} />
                                    <button onClick={() => handleRemoveItem('experience', exp.id)} className="text-red-400 hover:text-red-300 text-sm">Remove Entry</button>
                                </div>
                            ))}
                            <button onClick={() => handleAddItem('experience')} className="bg-accent text-white px-4 py-2 rounded hover:bg-highlight">Add Experience</button>
                        </div>
                    )}

                    {activeTab === 'Education' && (
                        <div>
                             {localData.education.map((edu, index) => (
                                <div key={edu.id} className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-4">
                                    <div className="grid grid-cols-2 gap-4 mb-2">
                                        <input type="text" value={edu.degree} onChange={(e) => handleItemChange('education', index, 'degree', e.target.value)} placeholder="Degree" className="bg-gray-700 border-gray-600 rounded p-2 text-white" />
                                        <input type="text" value={edu.institution} onChange={(e) => handleItemChange('education', index, 'institution', e.target.value)} placeholder="Institution" className="bg-gray-700 border-gray-600 rounded p-2 text-white" />
                                    </div>
                                    <div className="mb-2">
                                        <input type="text" value={edu.period} onChange={(e) => handleItemChange('education', index, 'period', e.target.value)} placeholder="Period (e.g. 2020 - 2024)" className="w-full bg-gray-700 border-gray-600 rounded p-2 text-white" />
                                    </div>
                                    <textarea value={edu.details} onChange={(e) => handleItemChange('education', index, 'details', e.target.value)} placeholder="Details" className="w-full bg-gray-700 border-gray-600 rounded p-2 text-white mb-2" rows={2} />
                                    <button onClick={() => handleRemoveItem('education', edu.id)} className="text-red-400 hover:text-red-300 text-sm">Remove Entry</button>
                                </div>
                            ))}
                            <button onClick={() => handleAddItem('education')} className="bg-accent text-white px-4 py-2 rounded hover:bg-highlight">Add Education</button>
                        </div>
                    )}

                     {activeTab === 'Memories' && (
                        <div>
                             <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                                {localData.memories.map((mem, index) => (
                                    <div key={mem.id} className="relative group">
                                        <img src={mem.image} alt="Memory" className="w-full h-40 object-cover rounded-lg" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 rounded-lg">
                                            <button onClick={() => handleRemoveItem('memories', mem.id)} className="self-end text-red-400 font-bold">&times;</button>
                                            <input type="text" value={mem.caption || ''} onChange={(e) => handleItemChange('memories', index, 'caption', e.target.value)} placeholder="Caption" className="bg-transparent border-b border-gray-400 text-white text-sm focus:outline-none" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <label className="bg-accent text-white px-4 py-2 rounded cursor-pointer hover:bg-highlight">
                                Upload Photos
                                <input type="file" multiple accept="image/*" onChange={handleMemoryUpload} className="hidden" />
                            </label>
                        </div>
                    )}

                    {activeTab === 'Notes' && (
                         <div className="space-y-6">
                            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                                <h3 className="text-lg font-bold mb-4">Add New Resource</h3>
                                <form onSubmit={handleAddNote} className="space-y-4">
                                    <input type="text" placeholder="Title" value={newNote.title} onChange={e => setNewNote({...newNote, title: e.target.value})} className="w-full bg-gray-700 border-gray-600 rounded p-2 text-white" />
                                    <textarea placeholder="Description" value={newNote.description} onChange={e => setNewNote({...newNote, description: e.target.value})} className="w-full bg-gray-700 border-gray-600 rounded p-2 text-white" rows={2}></textarea>
                                    <input id="note-file-input" type="file" onChange={handleNoteFileChange} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-highlight"/>
                                    <button type="submit" disabled={uploadingNote} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50">
                                        {uploadingNote ? 'Uploading...' : 'Add Note'}
                                    </button>
                                </form>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {localData.notes.map((note) => (
                                    <div key={note.id} className="bg-gray-800 p-4 rounded border border-gray-700 flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-white">{note.title}</h4>
                                            <p className="text-sm text-gray-400 mb-1">{note.fileName}</p>
                                            <p className="text-xs text-gray-500">{note.description}</p>
                                        </div>
                                        <button onClick={() => handleRemoveItem('notes', note.id)} className="text-red-400 hover:text-red-300">&times;</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'Public Chat' && (
                         <div className="space-y-4">
                             {guestbookEntries.map(entry => (
                                 <div key={entry.id} className={`p-4 rounded-lg border ${entry.userId === 'Admin' ? 'bg-blue-900/20 border-blue-800' : 'bg-gray-800 border-gray-700'}`}>
                                     <div className="flex justify-between items-start mb-2">
                                         <span className={`font-bold ${entry.userId === 'Admin' ? 'text-blue-400' : 'text-accent'}`}>{entry.userId}</span>
                                         <span className="text-xs text-gray-500">{new Date(entry.timestamp).toLocaleString()}</span>
                                     </div>
                                     <p className="text-gray-300 whitespace-pre-wrap">{entry.message}</p>
                                     <div className="mt-3 flex gap-2">
                                         <button onClick={() => setAdminReply(`@${entry.userId} `)} className="text-xs text-gray-400 hover:text-white">Reply</button>
                                         <button onClick={() => handleDeleteGuestbook(entry.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                                     </div>
                                 </div>
                             ))}
                             
                             <div className="sticky bottom-0 bg-gray-800 p-4 border-t border-gray-700 mt-4 flex gap-2">
                                 <input type="text" value={adminReply} onChange={(e) => setAdminReply(e.target.value)} placeholder="Type a reply..." className="flex-1 bg-gray-700 border-gray-600 rounded p-2 text-white" />
                                 <button onClick={() => handleReplyToGuestbook(guestbookEntries[0])} className="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-700">Send</button>
                             </div>
                         </div>
                    )}

                    {activeTab === 'Contact Leads' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-800 text-gray-400 border-b border-gray-700">
                                        <th className="p-3">Date</th>
                                        <th className="p-3">Name</th>
                                        <th className="p-3">Email</th>
                                        <th className="p-3">Message</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leads.map(lead => (
                                        <tr key={lead.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                                            <td className="p-3 text-sm text-gray-400">{new Date(lead.timestamp).toLocaleDateString()}</td>
                                            <td className="p-3 text-white">{lead.name}</td>
                                            <td className="p-3 text-accent">{lead.email}</td>
                                            <td className="p-3 text-gray-300">{lead.message}</td>
                                        </tr>
                                    ))}
                                    {leads.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-gray-500">No leads yet.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    )}
                    
                    {activeTab === 'Moderation' && (
                         <div className="space-y-4">
                             {reports.length === 0 && <p className="text-gray-500 text-center">No reports filed.</p>}
                             {reports.map(report => (
                                 <div key={report.id} className="bg-red-900/10 border border-red-900/30 p-4 rounded-lg">
                                     <h4 className="text-red-400 font-bold mb-1">Reported Message</h4>
                                     <div className="bg-gray-900 p-3 rounded mb-3 text-sm">
                                         <p className="text-gray-400 mb-1">Author: <span className="text-white">{report.messageAuthor}</span></p>
                                         <p className="text-white italic">"{report.messageContent}"</p>
                                     </div>
                                     <div className="flex gap-3">
                                         <button onClick={() => handleDeleteGuestbook(report.messageId)} className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">Delete Message</button>
                                         <button onClick={() => handleDeleteReport(report.id)} className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700">Dismiss Report</button>
                                     </div>
                                 </div>
                             ))}
                         </div>
                    )}

                    {activeTab === 'User Management' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold mb-4">Registered Users</h3>
                            <div className="bg-gray-800 rounded-lg overflow-hidden">
                                {users.map(user => (
                                    <div key={user.id} className="p-4 border-b border-gray-700 flex justify-between items-center last:border-0">
                                        <span className="text-white font-mono">{user.id}</span>
                                        <button onClick={() => handleBanUser(user.id)} className="text-red-400 hover:text-red-300 text-sm border border-red-900/50 px-3 py-1 rounded hover:bg-red-900/20">Ban / Delete</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
};

const AdminView: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const auth = localStorage.getItem(STORAGE_KEY_AUTH);
        if (auth === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        localStorage.removeItem(STORAGE_KEY_AUTH);
        setIsAuthenticated(false);
    };

    if (!isAuthenticated) {
        return <LoginForm onLogin={handleLogin} />;
    }

    return <AdminDashboard onLogout={handleLogout} />;
};

export default AdminView;
