import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import type { PortfolioData, Project, Experience, Education, Skill, Memory, Note, SocialLink } from '../types';
import TagInput from '../components/TagInput';
import ChatInterface from '../components/ChatInterface'; 
import { fetchLeads, fetchReports, fetchAllUsers } from '../services/api';

const ADMIN_USERNAME = "Admin";

// --- Styled Components for Premium UI ---
const SectionHeader: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode }> = ({ title, subtitle, action }) => (
    <div className="mb-10 border-b border-gray-200 dark:border-gray-800 pb-4 flex justify-between items-end">
        <div>
            <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white">{title}</h2>
            {subtitle && <p className="text-sm text-gray-500 mt-1 font-mono uppercase tracking-wider">{subtitle}</p>}
        </div>
        {action}
    </div>
);

const InputGroup: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({ label, children, className }) => (
    <div className={`mb-6 ${className}`}>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{label}</label>
        {children}
    </div>
);

const StyledInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input 
        {...props} 
        className={`w-full bg-transparent border-b border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white py-2 focus:outline-none focus:border-maroon-600 dark:focus:border-gold transition-colors text-lg placeholder-gray-400 ${props.className}`}
    />
);

const StyledTextArea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea 
        {...props} 
        className="w-full bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-gray-800 rounded-sm text-gray-900 dark:text-white p-4 focus:outline-none focus:border-maroon-600 dark:focus:border-gold transition-colors resize-y min-h-[100px]"
    />
);

const ActionButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'danger' | 'secondary' | 'outline' }> = ({ children, variant = 'primary', className, ...props }) => {
    const baseStyle = "px-6 py-2 text-sm font-bold uppercase tracking-wider transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2";
    const variants = {
        primary: "bg-maroon-700 text-white hover:bg-maroon-600 shadow-lg rounded-sm",
        danger: "bg-red-600/10 text-red-600 border border-red-600/20 hover:bg-red-600 hover:text-white rounded-sm",
        secondary: "bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-sm",
        outline: "border border-gray-300 dark:border-gray-700 text-gray-500 hover:border-gold hover:text-gold rounded-sm"
    };
    return (
        <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
            {children}
        </button>
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
                const MAX_WIDTH = 1200;
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
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                resolve(dataUrl);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (error) => reject(error);
    });
};

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

// --- LOGIN FORM ---
const LoginForm: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

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
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black transition-colors duration-500">
            <div className="w-full max-w-md p-12 bg-white dark:bg-zinc-900 shadow-2xl rounded-sm border-t-4 border-maroon-600">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-2">Studio Access</h1>
                    <div className="h-1 w-12 bg-gold mx-auto"></div>
                </div>
                {error && <div className="mb-6 text-center text-xs text-red-500 font-mono border border-red-500/20 p-2 bg-red-500/5">{error}</div>}
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
            </div>
        </div>
    );
};

// --- MAIN ADMIN DASHBOARD ---
const AdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
    const { portfolioData, setPortfolioData, saveData } = usePortfolio();
    const [localData, setLocalData] = useState<PortfolioData>(portfolioData);
    const [activeTab, setActiveTab] = useState('General');
    const [isDirty, setIsDirty] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const { toggleTheme, isDarkMode } = useTheme();

    useEffect(() => { setLocalData(portfolioData); setIsDirty(false); }, [portfolioData]);
    useEffect(() => { 
        if(JSON.stringify(localData) !== JSON.stringify(portfolioData)) setIsDirty(true); 
        else setIsDirty(false); 
    }, [localData, portfolioData]);

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

    // --- Helper Functions for Nested State Updates ---
    
    // For updating simple fields in objects (e.g. profile.name)
    const updateProfile = (field: string, value: any) => {
        setLocalData(prev => ({ ...prev, profile: { ...prev.profile, [field]: value } }));
    };

    const updateCommunity = (field: string, value: any) => {
        setLocalData(prev => ({ ...prev, community: { ...prev.community, [field]: value } }));
    };

    // For Arrays (Skills, Projects, etc)
    const updateItem = (section: keyof PortfolioData, index: number, field: string, value: any) => {
        setLocalData(prev => {
            const list = [...(prev[section] as any[])];
            list[index] = { ...list[index], [field]: value };
            return { ...prev, [section]: list };
        });
    };
    
    // Special case for deep arrays (Project images)
    const updateProjectImage = (projIndex: number, imgIndex: number, newValue: string) => {
        setLocalData(prev => {
            const projects = [...prev.projects];
            const newGallery = [...projects[projIndex].imageGallery];
            newGallery[imgIndex] = newValue;
            projects[projIndex] = { ...projects[projIndex], imageGallery: newGallery };
            return { ...prev, projects };
        });
    }

    const addProjectImage = (projIndex: number, newValue: string) => {
        setLocalData(prev => {
            const projects = [...prev.projects];
            projects[projIndex] = { ...projects[projIndex], imageGallery: [...projects[projIndex].imageGallery, newValue] };
            return { ...prev, projects };
        });
    }

    const removeProjectImage = (projIndex: number, imgIndex: number) => {
        setLocalData(prev => {
            const projects = [...prev.projects];
            const newGallery = projects[projIndex].imageGallery.filter((_, i) => i !== imgIndex);
            projects[projIndex] = { ...projects[projIndex], imageGallery: newGallery };
            return { ...prev, projects };
        });
    }

    const deleteItem = (section: keyof PortfolioData, index: number) => {
        if(!window.confirm("Are you sure you want to delete this item?")) return;
        setLocalData(prev => {
            const list = [...(prev[section] as any[])];
            list.splice(index, 1);
            return { ...prev, [section]: list };
        });
    };

    const addItem = (section: keyof PortfolioData, initialItem: any) => {
        setLocalData(prev => ({
            ...prev,
            [section]: [...(prev[section] as any[]), { ...initialItem, id: crypto.randomUUID() }]
        }));
    };

    const moveItem = (section: keyof PortfolioData, index: number, direction: 'up' | 'down') => {
        setLocalData(prev => {
            const list = [...(prev[section] as any[])];
            if (direction === 'up' && index > 0) {
                [list[index], list[index - 1]] = [list[index - 1], list[index]];
            } else if (direction === 'down' && index < list.length - 1) {
                [list[index], list[index + 1]] = [list[index + 1], list[index]];
            }
            return { ...prev, [section]: list };
        });
    }

    const navItems = ['General', 'Live Chat', 'Certifications', 'Skills', 'Projects', 'Experience', 'Education', 'Gallery', 'Resources'];

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white font-sans overflow-hidden transition-colors duration-500">
            {/* Sidebar */}
            <aside className="w-64 bg-zinc-950 text-white flex flex-col border-r border-zinc-900 shadow-2xl relative z-20">
                <div className="p-8">
                    <h2 className="text-xl font-display font-bold text-gold tracking-widest">STUDIO<span className="text-white">OS</span></h2>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-500 font-mono uppercase">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Systems Online
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
                        <ActionButton onClick={handleSave} disabled={saveStatus === 'saving'} className={saveStatus === 'saved' ? 'bg-green-600' : ''}>
                            {saveStatus === 'saved' ? 'Saved' : saveStatus === 'saving' ? 'Syncing...' : 'Save Changes'}
                        </ActionButton>
                    </div>
                </header>

                <div className="flex-1 overflow-hidden relative">
                    {activeTab === 'Live Chat' ? (
                        <ChatInterface isFullScreen={true} className="h-full w-full" />
                    ) : (
                        <div className="h-full overflow-y-auto p-8 lg:p-12 scrollbar-hide pb-32">
                            
                            {/* --- GENERAL TAB --- */}
                            {activeTab === 'General' && (
                                <div className="max-w-4xl animate-fade-in-up space-y-12">
                                    {/* Profile Section */}
                                    <div>
                                        <SectionHeader title="Identity" subtitle="Personal Details & Branding" />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <div>
                                                <InputGroup label="Full Name"><StyledInput value={localData.profile.name} onChange={(e) => updateProfile('name', e.target.value)} /></InputGroup>
                                                <InputGroup label="Professional Title"><StyledInput value={localData.profile.title} onChange={(e) => updateProfile('title', e.target.value)} /></InputGroup>
                                                <InputGroup label="Biography"><StyledTextArea value={localData.profile.about} onChange={(e) => updateProfile('about', e.target.value)} rows={6} /></InputGroup>
                                            </div>
                                            <div className="space-y-8">
                                                <InputGroup label="Profile Picture">
                                                    <div className="flex flex-col gap-4">
                                                        <div className="w-40 h-40 rounded-full border-4 border-gray-200 dark:border-gray-800 overflow-hidden shadow-xl bg-gray-100 mx-auto md:mx-0">
                                                            {localData.profile.profilePicture && <img src={localData.profile.profilePicture} className="w-full h-full object-cover" alt="Profile" />}
                                                        </div>
                                                        <label className="cursor-pointer bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-center py-2 px-4 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors">
                                                            Upload Photo
                                                            <input type="file" className="hidden" accept="image/*" onChange={async (e) => { if (e.target.files?.[0]) { const base64 = await compressImage(e.target.files[0]); updateProfile('profilePicture', base64); }}} />
                                                        </label>
                                                    </div>
                                                </InputGroup>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Community Section */}
                                    <div>
                                        <SectionHeader title="Community" subtitle="Group Status & Description" />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                             <InputGroup label="Description">
                                                <StyledTextArea value={localData.community.description} onChange={(e) => updateCommunity('description', e.target.value)} />
                                            </InputGroup>
                                            <InputGroup label="Member Count">
                                                <StyledInput type="number" value={localData.community.memberCount} onChange={(e) => updateCommunity('memberCount', parseInt(e.target.value))} />
                                            </InputGroup>
                                        </div>
                                    </div>

                                    {/* Social Links */}
                                    <div>
                                        <SectionHeader 
                                            title="Social Connections" 
                                            subtitle="Manage your outgoing links"
                                            action={<ActionButton variant="secondary" onClick={() => {
                                                const newLink: SocialLink = { id: crypto.randomUUID(), platform: 'New Platform', url: 'https://' };
                                                updateProfile('socialLinks', [...localData.profile.socialLinks, newLink]);
                                            }}>+ Add Link</ActionButton>}
                                        />
                                        <div className="space-y-4">
                                            {localData.profile.socialLinks.map((link, idx) => (
                                                <div key={link.id} className="flex gap-4 items-center bg-gray-50 dark:bg-white/5 p-4 rounded-sm border border-transparent hover:border-gray-300 dark:hover:border-white/10 transition-colors">
                                                    <div className="w-1/3">
                                                        <StyledInput value={link.platform} onChange={(e) => {
                                                            const newLinks = [...localData.profile.socialLinks];
                                                            newLinks[idx].platform = e.target.value;
                                                            updateProfile('socialLinks', newLinks);
                                                        }} placeholder="Platform" className="text-sm font-bold"/>
                                                    </div>
                                                    <div className="flex-1">
                                                         <StyledInput value={link.url} onChange={(e) => {
                                                            const newLinks = [...localData.profile.socialLinks];
                                                            newLinks[idx].url = e.target.value;
                                                            updateProfile('socialLinks', newLinks);
                                                        }} placeholder="URL" className="text-sm font-mono"/>
                                                    </div>
                                                    <button onClick={() => {
                                                         const newLinks = localData.profile.socialLinks.filter((_, i) => i !== idx);
                                                         updateProfile('socialLinks', newLinks);
                                                    }} className="text-red-500 hover:text-red-700 font-bold px-2">×</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- CERTIFICATIONS TAB --- */}
                            {activeTab === 'Certifications' && (
                                <div className="max-w-4xl animate-fade-in-up">
                                    <SectionHeader 
                                        title="Certifications" 
                                        subtitle="Credentials & Badges"
                                        action={<ActionButton variant="secondary" onClick={() => addItem('certifications', { name: 'New Certification', issuer: 'Issuer', date: new Date().getFullYear().toString(), link: '', image: '' })}>+ Add Cert</ActionButton>}
                                    />
                                    <div className="space-y-6">
                                        {localData.certifications?.map((cert, idx) => (
                                            <div key={cert.id} className="bg-white dark:bg-zinc-900 p-6 rounded-sm border border-gray-200 dark:border-gray-800 flex flex-col md:flex-row gap-6">
                                                 {/* Image Upload */}
                                                <div className="w-full md:w-32 flex flex-col items-center gap-2">
                                                    <div className="w-24 h-24 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center overflow-hidden border border-gray-200 dark:border-white/10">
                                                        {cert.image ? (
                                                            <img src={cert.image} alt="Badge" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-xs text-gray-400">No Image</span>
                                                        )}
                                                    </div>
                                                    <label className="cursor-pointer text-xs font-bold uppercase text-maroon-600 dark:text-gold hover:underline">
                                                        Upload Badge
                                                        <input type="file" className="hidden" accept="image/*" onChange={async (e) => { if (e.target.files?.[0]) { const base64 = await compressImage(e.target.files[0]); updateItem('certifications', idx, 'image', base64); }}} />
                                                    </label>
                                                </div>
                                                
                                                <div className="flex-1 space-y-4">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <InputGroup label="Certification Name" className="mb-0">
                                                                <StyledInput value={cert.name} onChange={(e) => updateItem('certifications', idx, 'name', e.target.value)} />
                                                            </InputGroup>
                                                        </div>
                                                        <ActionButton variant="danger" onClick={() => deleteItem('certifications', idx)} className="ml-4 h-10 w-10 px-0">×</ActionButton>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <InputGroup label="Issuer" className="mb-0">
                                                            <StyledInput value={cert.issuer} onChange={(e) => updateItem('certifications', idx, 'issuer', e.target.value)} />
                                                        </InputGroup>
                                                        <InputGroup label="Date" className="mb-0">
                                                            <StyledInput value={cert.date} onChange={(e) => updateItem('certifications', idx, 'date', e.target.value)} />
                                                        </InputGroup>
                                                    </div>

                                                    <InputGroup label="Credential Link" className="mb-0">
                                                        <StyledInput value={cert.link || ''} onChange={(e) => updateItem('certifications', idx, 'link', e.target.value)} placeholder="https://" />
                                                    </InputGroup>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* --- SKILLS TAB --- */}
                            {activeTab === 'Skills' && (
                                <div className="max-w-4xl animate-fade-in-up">
                                    <SectionHeader 
                                        title="Technical Skills" 
                                        subtitle="Core Competencies & Levels"
                                        action={<ActionButton variant="secondary" onClick={() => addItem('skills', { name: 'New Skill', level: 50 })}>+ Add Skill</ActionButton>}
                                    />
                                    <div className="grid grid-cols-1 gap-4">
                                        {localData.skills.map((skill, idx) => (
                                            <div key={skill.id} className="flex items-center gap-6 bg-white dark:bg-zinc-900 p-6 rounded-sm shadow-sm border border-gray-100 dark:border-white/5">
                                                <div className="flex flex-col gap-1 w-8 text-center">
                                                    <button onClick={() => moveItem('skills', idx, 'up')} className="text-gray-400 hover:text-white">▲</button>
                                                    <button onClick={() => moveItem('skills', idx, 'down')} className="text-gray-400 hover:text-white">▼</button>
                                                </div>
                                                <div className="flex-1">
                                                    <InputGroup label="Skill Name" className="mb-0">
                                                        <StyledInput value={skill.name} onChange={(e) => updateItem('skills', idx, 'name', e.target.value)} />
                                                    </InputGroup>
                                                </div>
                                                <div className="w-24">
                                                    <InputGroup label="Level %" className="mb-0">
                                                        <StyledInput type="number" min="0" max="100" value={skill.level} onChange={(e) => updateItem('skills', idx, 'level', parseInt(e.target.value))} />
                                                    </InputGroup>
                                                </div>
                                                <button onClick={() => deleteItem('skills', idx)} className="text-red-500 hover:text-red-700 p-2">
                                                    <span className="sr-only">Delete</span>🗑
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* --- PROJECTS TAB --- */}
                            {activeTab === 'Projects' && (
                                <div className="max-w-5xl animate-fade-in-up">
                                    <SectionHeader 
                                        title="Projects" 
                                        subtitle="Case Studies & Work"
                                        action={<ActionButton variant="secondary" onClick={() => addItem('projects', { title: 'New Project', description: '', longDescription: '', technologies: [], imageGallery: [] })}>+ Add Project</ActionButton>}
                                    />
                                    <div className="space-y-12">
                                        {localData.projects.map((project, idx) => (
                                            <div key={project.id} className="bg-white dark:bg-zinc-900 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="flex items-center gap-4">
                                                        <span className="font-mono text-gold text-xl">0{idx + 1}</span>
                                                        <StyledInput value={project.title} onChange={(e) => updateItem('projects', idx, 'title', e.target.value)} className="text-2xl font-bold border-none p-0 focus:ring-0" placeholder="Project Title" />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => moveItem('projects', idx, 'up')} className="bg-gray-100 dark:bg-white/10 p-2 rounded hover:bg-gray-200">▲</button>
                                                        <button onClick={() => moveItem('projects', idx, 'down')} className="bg-gray-100 dark:bg-white/10 p-2 rounded hover:bg-gray-200">▼</button>
                                                        <ActionButton variant="danger" onClick={() => deleteItem('projects', idx)} className="px-3">🗑</ActionButton>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                    <div>
                                                        <InputGroup label="Short Description">
                                                            <StyledTextArea value={project.description} onChange={(e) => updateItem('projects', idx, 'description', e.target.value)} rows={3} />
                                                        </InputGroup>
                                                        <InputGroup label="Long Details">
                                                            <StyledTextArea value={project.longDescription} onChange={(e) => updateItem('projects', idx, 'longDescription', e.target.value)} rows={6} />
                                                        </InputGroup>
                                                        <InputGroup label="Key Learning">
                                                            <StyledInput value={project.keyLearning} onChange={(e) => updateItem('projects', idx, 'keyLearning', e.target.value)} />
                                                        </InputGroup>
                                                        <InputGroup label="Technologies">
                                                            <TagInput tags={project.technologies} setTags={(tags) => updateItem('projects', idx, 'technologies', tags)} className="bg-transparent border-b border-gray-300 dark:border-gray-700" />
                                                        </InputGroup>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <InputGroup label="Live Link">
                                                                <StyledInput value={project.link || ''} onChange={(e) => updateItem('projects', idx, 'link', e.target.value)} placeholder="https://" />
                                                            </InputGroup>
                                                            <InputGroup label="Repo Link">
                                                                <StyledInput value={project.repoLink || ''} onChange={(e) => updateItem('projects', idx, 'repoLink', e.target.value)} placeholder="https://" />
                                                            </InputGroup>
                                                        </div>
                                                         <div className="flex items-center gap-2 mt-4">
                                                            <input 
                                                                type="checkbox" 
                                                                checked={project.allowDownload || false} 
                                                                onChange={(e) => updateItem('projects', idx, 'allowDownload', e.target.checked)}
                                                                className="w-5 h-5 accent-maroon-700"
                                                            />
                                                            <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">Allow Asset Download</span>
                                                        </div>
                                                    </div>

                                                    {/* Image Gallery Editor */}
                                                    <div className="bg-gray-50 dark:bg-black/20 p-6 rounded-lg">
                                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Gallery Images</label>
                                                        <div className="space-y-4">
                                                            {project.imageGallery.map((img, imgIdx) => (
                                                                <div key={imgIdx} className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-white/10 aspect-video">
                                                                    <img src={img} className="w-full h-full object-cover" alt={`Project ${idx} img ${imgIdx}`} />
                                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                                                        <label className="cursor-pointer bg-white text-black px-3 py-1 rounded text-xs font-bold hover:scale-105 transition-transform">
                                                                            Change
                                                                            <input type="file" className="hidden" accept="image/*" onChange={async (e) => { if (e.target.files?.[0]) { const base64 = await compressImage(e.target.files[0]); updateProjectImage(idx, imgIdx, base64); }}} />
                                                                        </label>
                                                                        <button onClick={() => removeProjectImage(idx, imgIdx)} className="bg-red-500 text-white px-3 py-1 rounded text-xs font-bold hover:bg-red-600">Delete</button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            <label className="flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg aspect-video cursor-pointer hover:border-gold hover:bg-gold/5 transition-all">
                                                                <div className="text-center">
                                                                    <span className="block text-2xl mb-1">+</span>
                                                                    <span className="text-xs font-bold uppercase text-gray-500">Add Image</span>
                                                                </div>
                                                                <input type="file" className="hidden" accept="image/*" onChange={async (e) => { if (e.target.files?.[0]) { const base64 = await compressImage(e.target.files[0]); addProjectImage(idx, base64); }}} />
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* --- EXPERIENCE TAB --- */}
                            {activeTab === 'Experience' && (
                                <div className="max-w-4xl animate-fade-in-up">
                                     <SectionHeader 
                                        title="Work Experience" 
                                        subtitle="Professional History"
                                        action={<ActionButton variant="secondary" onClick={() => addItem('experience', { role: 'Role', organization: 'Company', startDate: '2023', endDate: 'Present', description: '' })}>+ Add Role</ActionButton>}
                                    />
                                    <div className="space-y-6">
                                        {localData.experience.map((exp, idx) => (
                                            <div key={exp.id} className="bg-white dark:bg-zinc-900 p-6 rounded-sm border border-gray-200 dark:border-gray-800">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex-1 grid grid-cols-2 gap-4">
                                                        <InputGroup label="Role" className="mb-0"><StyledInput value={exp.role} onChange={(e) => updateItem('experience', idx, 'role', e.target.value)} /></InputGroup>
                                                        <InputGroup label="Organization" className="mb-0"><StyledInput value={exp.organization} onChange={(e) => updateItem('experience', idx, 'organization', e.target.value)} /></InputGroup>
                                                    </div>
                                                    <ActionButton variant="danger" onClick={() => deleteItem('experience', idx)} className="ml-4 h-10 w-10 px-0">×</ActionButton>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                     <InputGroup label="Start Date" className="mb-0"><StyledInput value={exp.startDate} onChange={(e) => updateItem('experience', idx, 'startDate', e.target.value)} /></InputGroup>
                                                     <InputGroup label="End Date" className="mb-0"><StyledInput value={exp.endDate} onChange={(e) => updateItem('experience', idx, 'endDate', e.target.value)} /></InputGroup>
                                                </div>
                                                <InputGroup label="Description" className="mb-0"><StyledTextArea value={exp.description} onChange={(e) => updateItem('experience', idx, 'description', e.target.value)} rows={3} /></InputGroup>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                             {/* --- EDUCATION TAB --- */}
                             {activeTab === 'Education' && (
                                <div className="max-w-4xl animate-fade-in-up">
                                     <SectionHeader 
                                        title="Education" 
                                        subtitle="Academic Background"
                                        action={<ActionButton variant="secondary" onClick={() => addItem('education', { degree: 'Degree', institution: 'University', period: '2020-2024', details: '' })}>+ Add Education</ActionButton>}
                                    />
                                    <div className="space-y-6">
                                        {localData.education.map((edu, idx) => (
                                            <div key={edu.id} className="bg-white dark:bg-zinc-900 p-6 rounded-sm border border-gray-200 dark:border-gray-800">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex-1 grid grid-cols-2 gap-4">
                                                        <InputGroup label="Degree" className="mb-0"><StyledInput value={edu.degree} onChange={(e) => updateItem('education', idx, 'degree', e.target.value)} /></InputGroup>
                                                        <InputGroup label="Institution" className="mb-0"><StyledInput value={edu.institution} onChange={(e) => updateItem('education', idx, 'institution', e.target.value)} /></InputGroup>
                                                    </div>
                                                    <ActionButton variant="danger" onClick={() => deleteItem('education', idx)} className="ml-4 h-10 w-10 px-0">×</ActionButton>
                                                </div>
                                                <InputGroup label="Period" className="mb-0"><StyledInput value={edu.period} onChange={(e) => updateItem('education', idx, 'period', e.target.value)} /></InputGroup>
                                                <InputGroup label="Details" className="mb-0 mt-4"><StyledTextArea value={edu.details} onChange={(e) => updateItem('education', idx, 'details', e.target.value)} rows={2} /></InputGroup>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* --- GALLERY TAB (Memories) --- */}
                            {activeTab === 'Gallery' && (
                                <div className="max-w-6xl animate-fade-in-up">
                                    <SectionHeader 
                                        title="Memories" 
                                        subtitle="Photo Gallery"
                                        action={<label className="cursor-pointer bg-maroon-700 text-white px-6 py-2 text-sm font-bold uppercase tracking-wider rounded-sm shadow-lg hover:bg-maroon-600 transition-colors flex items-center gap-2">
                                            + Add Photo
                                            <input type="file" className="hidden" accept="image/*" onChange={async (e) => { if (e.target.files?.[0]) { const base64 = await compressImage(e.target.files[0]); addItem('memories', { image: base64, caption: '', allowDownload: true }); }}} />
                                        </label>}
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {localData.memories.map((mem, idx) => (
                                            <div key={mem.id} className="group relative aspect-square bg-gray-100 dark:bg-zinc-900 rounded-lg overflow-hidden shadow-md">
                                                <img src={mem.image} className="w-full h-full object-cover" alt="Memory" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                                                    <StyledInput 
                                                        value={mem.caption || ''} 
                                                        onChange={(e) => updateItem('memories', idx, 'caption', e.target.value)} 
                                                        placeholder="Add a caption..."
                                                        className="text-white text-sm mb-4 border-white/30 focus:border-white"
                                                    />
                                                     <div className="flex justify-between items-center">
                                                         <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                                                            <input 
                                                                type="checkbox" 
                                                                checked={mem.allowDownload || false} 
                                                                onChange={(e) => updateItem('memories', idx, 'allowDownload', e.target.checked)}
                                                            />
                                                            Allow DL
                                                         </label>
                                                         <button onClick={() => deleteItem('memories', idx)} className="text-red-400 hover:text-red-500 font-bold uppercase text-xs">Delete</button>
                                                     </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* --- RESOURCES TAB (Notes) --- */}
                            {activeTab === 'Resources' && (
                                <div className="max-w-4xl animate-fade-in-up">
                                     <SectionHeader 
                                        title="Engineering Notes" 
                                        subtitle="Downloadable Resources"
                                        action={<ActionButton variant="secondary" onClick={() => addItem('notes', { title: 'New Note', description: '', fileData: '#', fileName: 'file.txt', fileType: 'TXT', allowDownload: true })}>+ Add Note</ActionButton>}
                                    />
                                    <div className="space-y-4">
                                        {localData.notes.map((note, idx) => (
                                            <div key={note.id} className="bg-white dark:bg-zinc-900 p-6 rounded-sm border border-gray-200 dark:border-gray-800 flex flex-col gap-4">
                                                <div className="flex justify-between">
                                                    <InputGroup label="Title" className="mb-0 flex-1 mr-4"><StyledInput value={note.title} onChange={(e) => updateItem('notes', idx, 'title', e.target.value)} /></InputGroup>
                                                    <ActionButton variant="danger" onClick={() => deleteItem('notes', idx)} className="h-10 w-10 px-0">×</ActionButton>
                                                </div>
                                                <InputGroup label="Description" className="mb-0"><StyledInput value={note.description} onChange={(e) => updateItem('notes', idx, 'description', e.target.value)} /></InputGroup>
                                                
                                                <div className="grid grid-cols-2 gap-4">
                                                    <InputGroup label="File Type" className="mb-0"><StyledInput value={note.fileType} onChange={(e) => updateItem('notes', idx, 'fileType', e.target.value)} /></InputGroup>
                                                    <InputGroup label="File Name" className="mb-0"><StyledInput value={note.fileName} onChange={(e) => updateItem('notes', idx, 'fileName', e.target.value)} /></InputGroup>
                                                </div>

                                                <div className="flex justify-between items-end border-t border-gray-100 dark:border-white/5 pt-4">
                                                    <label className="flex items-center gap-2 cursor-pointer bg-gray-100 dark:bg-white/5 px-4 py-2 rounded-sm text-xs font-bold uppercase hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                                                        📄 Upload File
                                                        <input type="file" className="hidden" onChange={async (e) => { 
                                                            if (e.target.files?.[0]) { 
                                                                const file = e.target.files[0];
                                                                const base64 = await fileToBase64(file); 
                                                                updateItem('notes', idx, 'fileData', base64);
                                                                updateItem('notes', idx, 'fileName', file.name);
                                                                updateItem('notes', idx, 'fileType', file.name.split('.').pop()?.toUpperCase() || 'FILE');
                                                            }
                                                        }} />
                                                    </label>
                                                    
                                                     <div className="flex items-center gap-2">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={note.allowDownload || false} 
                                                            onChange={(e) => updateItem('notes', idx, 'allowDownload', e.target.checked)}
                                                            className="w-5 h-5 accent-maroon-700"
                                                        />
                                                        <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">Public Access</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

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
        if (currentUser && currentUser.id.toLowerCase() === ADMIN_USERNAME.toLowerCase()) setIsAuthenticated(true);
        else setIsAuthenticated(false);
    }, [currentUser]);

    if (!isAuthenticated) return <LoginForm onLogin={() => {}} />;
    return <AdminDashboard onLogout={() => window.location.reload()} />;
};

export default AdminView;