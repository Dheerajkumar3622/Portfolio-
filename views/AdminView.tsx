
import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import type { PortfolioData, Education, Skill, Project, Experience, GuestbookEntry, Lead, SocialLink, Memory, Note, Report, User } from '../types';
import TagInput from '../components/TagInput';
import { fetchGuestbook, removeGuestbook, fetchLeads, fetchReports, removeReport, fetchAllUsers, removeUser, postGuestbook, checkSystemHealth } from '../services/api';
import { GoogleGenAI } from "@google/genai";

const ADMIN_USERNAME = "Admin";

// --- Styled Components for Premium UI ---
const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
    <div className="mb-10 border-b border-gray-200 dark:border-gray-800 pb-4">
        <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-1 font-mono uppercase tracking-wider">{subtitle}</p>}
    </div>
);

const InputGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="mb-6">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{label}</label>
        {children}
    </div>
);

const StyledInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input 
        {...props} 
        className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white py-2 focus:outline-none focus:border-maroon-600 dark:focus:border-gold transition-colors text-lg placeholder-gray-400"
    />
);

const StyledTextArea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea 
        {...props} 
        className="w-full bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-gray-800 rounded-sm text-gray-900 dark:text-white p-4 focus:outline-none focus:border-maroon-600 dark:focus:border-gold transition-colors resize-y min-h-[100px]"
    />
);

const ActionButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'danger' | 'secondary' }> = ({ children, variant = 'primary', className, ...props }) => {
    const baseStyle = "px-6 py-2 text-sm font-bold uppercase tracking-wider transition-all duration-300 transform active:scale-95";
    const variants = {
        primary: "bg-maroon-700 text-white hover:bg-maroon-600 shadow-lg",
        danger: "bg-red-600/10 text-red-600 border border-red-600/20 hover:bg-red-600 hover:text-white",
        secondary: "bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
    };
    
    return (
        <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
};


const LoginForm: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSetupMode, setIsSetupMode] = useState(false);
    
    const { login, signup } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (username.toLowerCase() !== ADMIN_USERNAME.toLowerCase()) {
            setError('Access Denied. Admin privileges required.');
            setIsLoading(false);
            return;
        }

        const result = await login(username, password);
        if (result.success) {
            onLogin();
        } else {
            setError(result.message);
            if (result.message.includes("Invalid username") || result.message.includes("not found")) {
                setIsSetupMode(true);
            }
        }
        setIsLoading(false);
    };

    const handleSetup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (password.length < 6) {
             setError("Password must be at least 6 characters.");
             setIsLoading(false);
             return;
        }

        const result = await signup(ADMIN_USERNAME, password);
        if (result.success) {
            await login(ADMIN_USERNAME, password);
            onLogin();
        } else {
            setError(result.message);
        }
        setIsLoading(false);
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black transition-colors duration-500">
            <div className="w-full max-w-md p-12 bg-white dark:bg-zinc-900 shadow-2xl rounded-sm border-t-4 border-maroon-600">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-2">Studio Access</h1>
                    <div className="h-1 w-12 bg-gold mx-auto"></div>
                </div>
                
                {error && <div className="mb-6 text-center text-xs text-red-500 font-mono border border-red-500/20 p-2 bg-red-500/5">{error}</div>}
                
                {isSetupMode ? (
                     <form onSubmit={handleSetup} className="space-y-8">
                        <div className="text-center text-xs text-gold font-mono uppercase tracking-widest">Initial System Setup</div>
                        <InputGroup label="Admin Username">
                            <StyledInput type="text" value={ADMIN_USERNAME} disabled className="opacity-50 cursor-not-allowed" />
                        </InputGroup>
                        <InputGroup label="Set Master Password">
                            <StyledInput type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus placeholder="Enter strong password" />
                        </InputGroup>
                        <ActionButton type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? 'Initializing...' : 'Create Admin Account'}
                        </ActionButton>
                    </form>
                ) : (
                    <form onSubmit={handleLogin} className="space-y-8">
                        <InputGroup label="Username">
                            <StyledInput type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Identify yourself" />
                        </InputGroup>
                        <InputGroup label="Password">
                            <StyledInput type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter credentials" />
                        </InputGroup>
                        <ActionButton type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? 'Verifying...' : 'Enter Studio'}
                        </ActionButton>
                    </form>
                )}
            </div>
        </div>
    );
};

// --- COMPRESSION UTILITY ---
const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1000;
                let width = img.width;
                let height = img.height;

                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                resolve(dataUrl);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (error) => reject(error);
    });
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
    const [activeTab, setActiveTab] = useState('Profile');
    const [isDirty, setIsDirty] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [systemHealth, setSystemHealth] = useState<{status: string, database: string}>({ status: 'checking', database: 'unknown' });
    const { toggleTheme, isDarkMode } = useTheme();

    const [adminReply, setAdminReply] = useState('');
    const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
    const [generationStatus, setGenerationStatus] = useState('');

    useEffect(() => {
        setLocalData(portfolioData);
        setIsDirty(false);
    }, [portfolioData]);

    useEffect(() => {
        if(JSON.stringify(localData) !== JSON.stringify(portfolioData)) {
            setIsDirty(true);
        } else {
            setIsDirty(false);
        }
    }, [localData, portfolioData]);

    useEffect(() => {
        const check = async () => {
            const health = await checkSystemHealth();
            setSystemHealth(health);
        };
        check();
    }, []);

    const fetchGuestbookData = async () => { setGuestbookEntries(await fetchGuestbook({limit: 50})); };
    const fetchReportData = async () => { setReports(await fetchReports()); };
    const fetchUsersData = async () => { setUsers(await fetchAllUsers()); };

    useEffect(() => {
        const fetchData = async () => {
            if(activeTab === 'Public Chat') fetchGuestbookData();
            if(activeTab === 'Contact Leads') setLeads(await fetchLeads());
            if (activeTab === 'Moderation') fetchReportData();
            if (activeTab === 'User Management') fetchUsersData();
        };
        fetchData();
        
        let interval: any;
        if(activeTab === 'Public Chat') interval = setInterval(fetchGuestbookData, 3000);
        return () => { if(interval) clearInterval(interval); }
    }, [activeTab]);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setLocalData(prev => ({
            ...prev,
            profile: { ...prev.profile, [name]: value }
        }));
    };
    
    const handleCommunityChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setLocalData(prev => ({
            ...prev,
            community: { 
                ...prev.community, 
                [name]: name === 'memberCount' ? parseInt(value) || 0 : value 
            }
        }));
    };

    const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const base64 = await compressImage(e.target.files[0]);
            setLocalData(prev => ({ ...prev, profile: { ...prev.profile, profilePicture: base64 }}));
        }
    };

    const handleGenerateVideo = async () => {
        if (!process.env.API_KEY) {
            alert("API_KEY missing.");
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
        setGenerationStatus('AI Generating...');
    
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `Futuristic cinematic tech video. ${localData.profile.title}. Dark aesthetics, neon lights, circuit boards.`;
    
            let operation = await ai.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview',
                prompt: prompt,
                config: { numberOfVideos: 1, resolution: '1080p', aspectRatio: '16:9' }
            });
    
            while (!operation.done) {
                await new Promise(resolve => setTimeout(resolve, 5000));
                operation = await ai.operations.getVideosOperation({ operation: operation });
            }
    
            if (operation.response?.generatedVideos?.[0]?.video?.uri) {
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
                    alert('Video Generated!');
                };
            }
        } catch (error) {
            alert('Generation Failed');
            setIsGeneratingVideo(false);
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
                socialLinks: [...prev.profile.socialLinks, {id: `new-${Date.now()}`, platform: 'Platform', url: ''}]
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
            const base64Promises = files.map(file => compressImage(file));
            const base64Images = await Promise.all(base64Promises);
            const currentImages = localData.projects[index].imageGallery || [];
            handleItemChange<Project>('projects', index, 'imageGallery', [...currentImages, ...base64Images]);
        }
    };

    const handleAddItem = (section: 'education' | 'experience' | 'projects' | 'skills') => {
        const newItem = {
            id: `new-${Date.now()}`,
            ...(section === 'education' && { degree: '', institution: '', period: '', details: '' }),
            ...(section === 'experience' && { role: '', organization: '', startDate: '', endDate: '', description: '' }),
            ...(section === 'projects' && { title: 'New Project', description: '', longDescription: '', keyLearning: '', technologies: [], link: '', repoLink: '', imageGallery: [] }),
            ...(section === 'skills' && { name: '', level: 50 }),
        };

        setLocalData(prev => ({
            ...prev,
            [section]: [...(prev[section] as any[]), newItem]
        }));
    };

    const handleRemoveItem = (section: keyof Omit<PortfolioData, 'profile'>, id: string) => {
        setLocalData(prev => ({
            ...prev,
            [section]: (prev[section] as any[]).filter(item => item.id !== id)
        }));
    };

    const handleSave = async () => {
        setSaveStatus('saving');
        try {
            await saveData(localData);
            setPortfolioData(localData);
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch(e) {
            setSaveStatus('idle');
            alert("Save failed. Check console.");
        }
    };

    const handleReplyToGuestbook = async (entry: GuestbookEntry) => {
        if(!adminReply.trim()) return;
        await postGuestbook({ userId: 'Admin', message: `@${entry.userId} ${adminReply}` });
        setAdminReply('');
        fetchGuestbookData();
    };

    const handleDeleteGuestbook = async (id: string) => {
        if(window.confirm('Delete this message?')) {
            await removeGuestbook(id);
            fetchGuestbookData();
        }
    };

    const navItems = ['Profile', 'Network', 'Projects', 'Experience', 'Education', 'Public Chat', 'Contact Leads'];

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white font-sans overflow-hidden transition-colors duration-500">
            {/* Sidebar */}
            <aside className="w-64 bg-zinc-950 text-white flex flex-col border-r border-zinc-900 shadow-2xl relative z-20">
                <div className="p-8">
                    <h2 className="text-xl font-display font-bold text-gold tracking-widest">STUDIO<span className="text-white">OS</span></h2>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-500 font-mono uppercase">
                        <span className={`w-2 h-2 rounded-full ${systemHealth.status === 'ok' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        {systemHealth.database === 'connected' ? 'Systems Online' : 'Offline Mode'}
                    </div>
                </div>
                
                <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
                    {navItems.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`w-full text-left px-4 py-3 text-sm font-bold uppercase tracking-wider rounded-sm transition-all duration-300 ${
                                activeTab === tab 
                                ? 'bg-maroon-900 text-gold border-l-2 border-gold shadow-lg pl-5' 
                                : 'text-gray-500 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                    
                    <div className="mt-8 pt-8 border-t border-white/10">
                        {['Skills', 'Moderation', 'User Management'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`w-full text-left px-4 py-3 text-xs font-mono uppercase tracking-widest transition-colors ${activeTab === tab ? 'text-gold' : 'text-gray-600 hover:text-gray-400'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button onClick={toggleTheme} className="text-xs text-gray-500 hover:text-white mb-4 block w-full text-left uppercase tracking-widest">
                         {isDarkMode ? "☀ Light Mode" : "☾ Dark Mode"}
                    </button>
                    <button onClick={onLogout} className="text-xs text-red-500 hover:text-red-400 uppercase tracking-widest">
                        → Terminate Session
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                <header className="bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-8 py-5 flex justify-between items-center z-10 sticky top-0">
                    <h1 className="text-xl font-display font-bold text-gray-900 dark:text-white">{activeTab}</h1>
                    <div className="flex items-center gap-6">
                        {isDirty && <span className="text-maroon-600 dark:text-gold text-xs font-bold uppercase animate-pulse">Unsaved Changes</span>}
                        <ActionButton 
                            onClick={handleSave} 
                            disabled={saveStatus === 'saving'}
                            className={saveStatus === 'saved' ? 'bg-green-600' : ''}
                        >
                            {saveStatus === 'saved' ? 'Saved' : saveStatus === 'saving' ? 'Syncing...' : 'Save Changes'}
                        </ActionButton>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 lg:p-12 scrollbar-hide">
                    {activeTab === 'Profile' && (
                        <div className="max-w-4xl animate-fade-in-up">
                            <SectionHeader title="Identity" subtitle="Manage your digital persona" />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                                <div>
                                     <InputGroup label="Full Name">
                                        <StyledInput name="name" value={localData.profile.name} onChange={handleProfileChange} />
                                    </InputGroup>
                                    <InputGroup label="Professional Title">
                                        <StyledInput name="title" value={localData.profile.title} onChange={handleProfileChange} />
                                    </InputGroup>
                                    <InputGroup label="Biography">
                                        <StyledTextArea name="about" value={localData.profile.about} onChange={handleProfileChange} rows={6} />
                                    </InputGroup>
                                </div>
                                <div className="space-y-8">
                                    <InputGroup label="Profile Picture">
                                        <div className="flex items-center gap-6">
                                            <div className="w-32 h-32 rounded-full border-4 border-gray-200 dark:border-gray-800 overflow-hidden shadow-xl bg-gray-100">
                                                {localData.profile.profilePicture && <img src={localData.profile.profilePicture} className="w-full h-full object-cover" alt="Profile" />}
                                            </div>
                                            <input type="file" onChange={handleProfilePicChange} className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gray-100 dark:file:bg-gray-800 file:text-gray-700 dark:file:text-white hover:file:bg-gray-200 dark:hover:file:bg-gray-700"/>
                                        </div>
                                    </InputGroup>
                                    <InputGroup label="Social Presence">
                                        <div className="space-y-3">
                                            {localData.profile.socialLinks.map((link, idx) => (
                                                <div key={link.id} className="flex gap-2">
                                                    <StyledInput value={link.platform} onChange={(e) => handleSocialLinkChange(idx, 'platform', e.target.value)} className="w-1/3 text-sm" />
                                                    <StyledInput value={link.url} onChange={(e) => handleSocialLinkChange(idx, 'url', e.target.value)} className="flex-1 text-sm text-gray-500" />
                                                    <button onClick={() => handleRemoveSocialLink(link.id)} className="text-red-500 hover:text-red-700 px-2">&times;</button>
                                                </div>
                                            ))}
                                            <button onClick={handleAddSocialLink} className="text-xs font-bold text-maroon-600 dark:text-gold uppercase tracking-wider mt-2">+ Add Link</button>
                                        </div>
                                    </InputGroup>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'Network' && (
                        <div className="max-w-2xl animate-fade-in-up">
                            <SectionHeader title="Community" subtitle="Manage group statistics" />
                            <div className="bg-white dark:bg-zinc-900 p-8 rounded-sm shadow-lg border-t-4 border-gold">
                                <div className="grid grid-cols-2 gap-8">
                                    <InputGroup label="Member Count">
                                        <StyledInput type="number" name="memberCount" value={localData.community?.memberCount || 0} onChange={handleCommunityChange} className="text-4xl font-mono text-maroon-700 dark:text-gold" />
                                    </InputGroup>
                                    <div className="flex items-end pb-4">
                                        <span className="text-xs text-gray-400">Total registered members displayed on the frontend.</span>
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <InputGroup label="Community Description">
                                        <StyledTextArea name="description" value={localData.community?.description || ''} onChange={handleCommunityChange} rows={3} />
                                    </InputGroup>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Projects' && (
                        <div className="space-y-12 animate-fade-in-up">
                             <div className="flex justify-between items-end">
                                <SectionHeader title="Portfolio" subtitle="Showcase your work" />
                                <ActionButton onClick={() => handleAddItem('projects')}>+ Add Project</ActionButton>
                             </div>
                            
                            {localData.projects.map((project, index) => (
                                <div key={project.id} className="bg-white dark:bg-zinc-900 p-8 shadow-xl border-l-4 border-gray-200 dark:border-gray-800 hover:border-maroon-600 dark:hover:border-gold transition-colors duration-300">
                                    <div className="flex justify-between mb-8">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Case Study {index + 1}</h3>
                                        <ActionButton variant="danger" onClick={() => handleRemoveItem('projects', project.id)}>Remove</ActionButton>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                                        <InputGroup label="Title">
                                            <StyledInput value={project.title} onChange={(e) => handleItemChange('projects', index, 'title', e.target.value)} />
                                        </InputGroup>
                                        <InputGroup label="Tech Stack (Press Enter)">
                                            <TagInput tags={project.technologies} setTags={(newTags) => handleItemChange('projects', index, 'technologies', newTags)} className="bg-transparent border-b border-gray-300 dark:border-gray-700" />
                                        </InputGroup>
                                    </div>
                                    
                                    <InputGroup label="Short Description">
                                        <StyledTextArea value={project.description} onChange={(e) => handleItemChange('projects', index, 'description', e.target.value)} rows={2} />
                                    </InputGroup>
                                    
                                    <div className="mt-6">
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Visual Assets</label>
                                        <div className="flex flex-wrap gap-4 mb-4">
                                            {project.imageGallery.map((img, i) => (
                                                <div key={i} className="relative w-32 h-20 group">
                                                    <img src={img} className="w-full h-full object-cover rounded-sm shadow-md opacity-70 group-hover:opacity-100 transition-opacity" />
                                                    <button onClick={() => {
                                                        const updated = project.imageGallery.filter((_, idx) => idx !== i);
                                                        handleItemChange('projects', index, 'imageGallery', updated);
                                                    }} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                                                </div>
                                            ))}
                                            <label className="w-32 h-20 border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center cursor-pointer hover:border-maroon-600 dark:hover:border-gold transition-colors text-gray-400 hover:text-maroon-600 dark:hover:text-gold">
                                                <span className="text-2xl">+</span>
                                                <span className="text-[10px] uppercase font-bold">Add Image</span>
                                                <input type="file" multiple accept="image/*" onChange={(e) => handleProjectGalleryChange(e, index)} className="hidden" />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {activeTab === 'Experience' && (
                         <div className="max-w-4xl space-y-8 animate-fade-in-up">
                            <div className="flex justify-between items-end">
                                <SectionHeader title="Experience" subtitle="Career timeline" />
                                <ActionButton onClick={() => handleAddItem('experience')}>+ Add Role</ActionButton>
                            </div>
                            {localData.experience.map((exp, index) => (
                                <div key={exp.id} className="relative pl-8 border-l border-gray-300 dark:border-gray-700 py-2">
                                    <div className="absolute left-[-5px] top-4 w-2 h-2 bg-gold rounded-full"></div>
                                    <div className="bg-white dark:bg-zinc-900 p-6 shadow-md rounded-sm">
                                         <div className="grid grid-cols-2 gap-4 mb-4">
                                            <StyledInput value={exp.role} onChange={(e) => handleItemChange('experience', index, 'role', e.target.value)} placeholder="Role Title" className="font-bold" />
                                            <StyledInput value={exp.organization} onChange={(e) => handleItemChange('experience', index, 'organization', e.target.value)} placeholder="Company" />
                                        </div>
                                        <div className="flex gap-4 mb-4 text-sm">
                                            <StyledInput value={exp.startDate} onChange={(e) => handleItemChange('experience', index, 'startDate', e.target.value)} placeholder="Start Year" />
                                            <StyledInput value={exp.endDate} onChange={(e) => handleItemChange('experience', index, 'endDate', e.target.value)} placeholder="End Year" />
                                        </div>
                                        <StyledTextArea value={exp.description} onChange={(e) => handleItemChange('experience', index, 'description', e.target.value)} placeholder="Achievements..." rows={3} />
                                        <button onClick={() => handleRemoveItem('experience', exp.id)} className="text-xs text-red-500 mt-2 uppercase tracking-wider hover:underline">Remove Entry</button>
                                    </div>
                                </div>
                            ))}
                         </div>
                    )}
                    
                    {/* Reusing similar minimalist styles for other tabs... */}
                    
                    {activeTab === 'Public Chat' && (
                        <div className="max-w-3xl animate-fade-in-up">
                            <SectionHeader title="Global Chat" subtitle="Public Guestbook Moderation" />
                            <div className="space-y-4">
                                {guestbookEntries.map(entry => (
                                    <div key={entry.id} className="bg-white dark:bg-zinc-900 p-6 shadow-md border-l-4 border-gray-200 dark:border-gray-800">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-maroon-700 dark:text-gold">{entry.userId}</span>
                                                <span className="text-xs text-gray-400">{new Date(entry.timestamp).toLocaleString()}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                 <button onClick={() => handleDeleteGuestbook(entry.id)} className="text-xs text-red-500 hover:text-red-700 uppercase tracking-wider">Delete</button>
                                            </div>
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{entry.message}</p>
                                    </div>
                                ))}
                                {/* Admin Reply Box */}
                                <div className="sticky bottom-0 bg-white dark:bg-zinc-950 p-4 border-t border-gray-200 dark:border-gray-800 shadow-xl flex gap-4 mt-8">
                                    <input value={adminReply} onChange={(e) => setAdminReply(e.target.value)} placeholder="Broadcast reply as Admin..." className="flex-1 bg-gray-100 dark:bg-zinc-900 px-4 py-2 rounded-sm focus:outline-none" />
                                    <ActionButton onClick={() => handleReplyToGuestbook(guestbookEntries[0])}>Send</ActionButton>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
};

const AdminView: React.FC = () => {
    const { currentUser } = useAuth();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        if (currentUser && currentUser.id.toLowerCase() === ADMIN_USERNAME.toLowerCase()) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }
    }, [currentUser]);

    const handleLogout = () => {
        window.location.reload(); 
    };

    if (!isAuthenticated) {
        return <LoginForm onLogin={() => {}} />;
    }

    return <AdminDashboard onLogout={handleLogout} />;
};

export default AdminView;
