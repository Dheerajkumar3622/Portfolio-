
import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import type { PortfolioData, Education, Skill, Project, Experience, GuestbookEntry, Lead, SocialLink, Memory, Note, Report, User } from '../types';
import TagInput from '../components/TagInput';
import { fetchGuestbook, removeGuestbook, fetchLeads, fetchReports, removeReport, fetchAllUsers, removeUser } from '../services/api';
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

    const fetchGuestbookData = async () => {
        setGuestbookEntries(await fetchGuestbook({limit: 1000})); // Load all for admin
    };

    const fetchReportData = async () => {
        setReports(await fetchReports());
    };

    const fetchUsersData = async () => {
        setUsers(await fetchAllUsers());
    };

    useEffect(() => {
        const fetchData = async () => {
            if(activeTab === 'Guestbook') {
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
    }, [activeTab]);

    // State for password change
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
    
    // State for security question
    const [securityQuestion, setSecurityQuestion] = useState('');
    const [securityAnswer, setSecurityAnswer] = useState('');
    const [securityMessage, setSecurityMessage] = useState({ type: '', text: '' });
    
    useEffect(() => {
        const creds = getCredentials();
        setSecurityQuestion(creds.securityQuestion);
        setSecurityAnswer(creds.securityAnswer);
    }, []);

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
            // Create new instance to pick up potentially newly selected key
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
                
                // Fetch with API key appended
                const response = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
                const blob = await response.blob();
                
                // Convert to Base64 to store in app state
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
            // FIX: Explicitly type `files` as `File[]` to resolve an issue where TypeScript
            // was inferring the array items as `unknown`.
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

        if(section === 'memories') return; // Memories are added via upload

        setLocalData(prev => ({
            ...prev,
            [section]: [...(prev[section] as any[]), newItem]
        }));
    };
    
    const handleMemoryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            // FIX: Explicitly type `files` as `File[]` to resolve an issue where TypeScript
            // was inferring the array items as `unknown`.
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
            alert("Please fill in all fields and select a file.");
            return;
        }

        setUploadingNote(true);
        try {
            const fileData = await fileToBase64(newNote.file);
            const noteToAdd: Note = {
                id: `note-${Date.now()}`,
                title: newNote.title,
                description: newNote.description,
                fileName: newNote.file.name,
                fileType: newNote.file.type,
                fileData: fileData
            };

            setLocalData(prev => ({
                ...prev,
                notes: [...prev.notes, noteToAdd]
            }));
            
            setNewNote({ title: '', description: '', file: null });
            (e.target as HTMLFormElement).reset();

        } catch (error) {
            console.error("Error uploading note:", error);
            alert("Failed to upload note.");
        } finally {
            setUploadingNote(false);
        }
    }


    const validateData = (data: PortfolioData) => {
        const newErrors: any = {
            profile: {},
            education: [],
            experience: [],
            projects: [],
            skills: []
        };
        let isValid = true;

        // Profile
        if (!data.profile.name.trim()) { newErrors.profile.name = 'Name is required.'; isValid = false; }
        if (!data.profile.title.trim()) { newErrors.profile.title = 'Title is required.'; isValid = false; }
        if (!data.profile.about.trim()) { newErrors.profile.about = 'About section is required.'; isValid = false; }

        // Education
        data.education.forEach((edu, index) => {
            const eduErrors: any = {};
            if (!edu.degree.trim()) { eduErrors.degree = 'Degree is required.'; isValid = false; }
            if (!edu.institution.trim()) { eduErrors.institution = 'Institution is required.'; isValid = false; }
            if (!edu.period.trim()) { eduErrors.period = 'Period is required.'; isValid = false; }
            if (!edu.details.trim()) { eduErrors.details = 'Details are required.'; isValid = false; }
            if (Object.keys(eduErrors).length > 0) { newErrors.education[index] = eduErrors; }
        });

        // Experience
        data.experience.forEach((exp, index) => {
            const expErrors: any = {};
            if (!exp.role.trim()) { expErrors.role = 'Role is required.'; isValid = false; }
            if (!exp.organization.trim()) { expErrors.organization = 'Organization is required.'; isValid = false; }
            if (!exp.startDate.trim()) { expErrors.startDate = 'Start Date is required.'; isValid = false; }
            if (!exp.endDate.trim()) { expErrors.endDate = 'End Date is required.'; isValid = false; }
            if (!exp.description.trim()) { expErrors.description = 'Description is required.'; isValid = false; }
            if (Object.keys(expErrors).length > 0) { newErrors.experience[index] = expErrors; }
        });

        // Projects
        data.projects.forEach((proj, index) => {
            const projErrors: any = {};
            if (!proj.title.trim()) { projErrors.title = 'Title is required.'; isValid = false; }
            if (!proj.description.trim()) { projErrors.description = 'Short description is required.'; isValid = false; }
            if (!proj.longDescription.trim()) { projErrors.longDescription = 'Detailed description is required.'; isValid = false; }
            if (!proj.keyLearning.trim()) { projErrors.keyLearning = 'Key learning is required.'; isValid = false; }
            if (proj.technologies.length === 0) {
                projErrors.technologies = 'At least one technology is required.'; isValid = false;
            }
            if (Object.keys(projErrors).length > 0) { newErrors.projects[index] = projErrors; }
        });

        // Skills
        data.skills.forEach((skill, index) => {
            const skillErrors: any = {};
            if (!skill.name.trim()) { skillErrors.name = 'Skill name is required.'; isValid = false; }
            if (Object.keys(skillErrors).length > 0) { newErrors.skills[index] = skillErrors; }
        });

        return { isValid, errors: newErrors };
    };

    const handleSaveChanges = async () => {
        const { isValid, errors: validationErrors } = validateData(localData);
        setErrors(validationErrors);

        if (!isValid) {
            alert('Please fix the validation errors before saving.');
            return;
        }

        setSaveStatus('saving');
        await saveData(localData);
        setPortfolioData(localData); // Update context
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
    };
    
    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMessage({ type: '', text: '' });
        const creds = getCredentials();

        if (oldPassword !== creds.password) {
            setPasswordMessage({ type: 'error', text: 'Old password does not match.' });
            return;
        }
        if (newPassword.length < 8) {
            setPasswordMessage({ type: 'error', text: 'New password must be at least 8 characters long.' });
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
            return;
        }

        const newCreds = { ...creds, password: newPassword };
        localStorage.setItem(STORAGE_KEY_CREDS, JSON.stringify(newCreds));
        setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
        
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    const handleSecurityUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!securityQuestion.trim() || !securityAnswer.trim()) {
            setSecurityMessage({ type: 'error', text: 'Question and answer cannot be empty.' });
            return;
        }
        const creds = getCredentials();
        const newCreds = { ...creds, securityQuestion, securityAnswer };
        localStorage.setItem(STORAGE_KEY_CREDS, JSON.stringify(newCreds));
        setSecurityMessage({ type: 'success', text: 'Security question updated successfully!' });
    };

    const renderSaveButtonContent = () => {
        switch (saveStatus) {
            case 'saving': return 'Saving...';
            case 'saved': return 'Saved!';
            default: return 'Save All Changes';
        }
    };
    
    const TABS = ['Profile', 'Skills', 'Projects', 'Memories', 'Education', 'Experience', 'Notes', 'Guestbook', 'Moderation', 'Contact Leads', 'User Management', 'Settings'];

    return (
        <div className="bg-gray-900 text-white min-h-screen">
            <div className="container mx-auto p-4 md:p-8">
                <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 pb-4 border-b border-gray-700">
                    <h1 className="text-4xl font-bold mb-4 sm:mb-0">Admin Dashboard</h1>
                    <div className="flex items-center space-x-4">
                        <button 
                            onClick={handleSaveChanges} 
                            disabled={!isDirty || saveStatus !== 'idle'}
                            className={`font-bold py-2 px-4 rounded-md transition-colors ${
                                !isDirty ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 
                                saveStatus === 'saved' ? 'bg-green-600' : 
                                'bg-blue-600 hover:bg-blue-700'
                            }`}
                        >
                            {renderSaveButtonContent()}
                        </button>
                        <button onClick={onLogout} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors">Logout</button>
                    </div>
                </header>
                
                <div className="flex flex-col md:flex-row gap-8">
                    <aside className="md:w-1/5">
                         <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible -mx-4 px-4 md:-mx-0 md:px-0">
                            {TABS.map(tab => (
                                 <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`w-full text-left p-3 rounded-md mb-2 transition-colors whitespace-nowrap ${activeTab === tab ? 'bg-accent text-white' : 'hover:bg-gray-700'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </nav>
                    </aside>

                    <main className="md:w-4/5">
                        <div className="bg-gray-800 p-6 rounded-lg">
                           {/* Profile Section */}
                           {activeTab === 'Profile' && (
                                <div>
                                    <h2 className="text-2xl font-semibold mb-4 border-b border-gray-700 pb-2">Profile</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block mb-1">Name</label>
                                            <input type="text" name="name" value={localData.profile.name} onChange={handleProfileChange} className={`w-full bg-gray-700 p-2 rounded-md border ${errors.profile?.name ? 'border-red-500' : 'border-transparent'}`}/>
                                            {errors.profile?.name && <p className="text-red-400 text-sm mt-1">{errors.profile.name}</p>}
                                        </div>
                                        <div>
                                            <label className="block mb-1">Title</label>
                                            <input type="text" name="title" value={localData.profile.title} onChange={handleProfileChange} className={`w-full bg-gray-700 p-2 rounded-md border ${errors.profile?.title ? 'border-red-500' : 'border-transparent'}`}/>
                                            {errors.profile?.title && <p className="text-red-400 text-sm mt-1">{errors.profile.title}</p>}
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block mb-1">About</label>
                                            <textarea name="about" value={localData.profile.about} onChange={handleProfileChange} rows={5} className={`w-full bg-gray-700 p-2 rounded-md border ${errors.profile?.about ? 'border-red-500' : 'border-transparent'}`}></textarea>
                                             {errors.profile?.about && <p className="text-red-400 text-sm mt-1">{errors.profile.about}</p>}
                                        </div>
                                         <div>
                                            <label className="block mb-1">Profile Picture (Upload)</label>
                                            <input type="file" accept="image/*" onChange={handleProfilePicChange} className="w-full bg-gray-700 p-2 rounded-md file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"/>
                                        </div>
                                        <div>
                                            <label className="block mb-1">Promo Video (YouTube URL, Upload, or Generate AI)</label>
                                            <div className="flex flex-col gap-2">
                                                <input type="text" name="promoVideo" placeholder="Enter YouTube URL" value={localData.profile.promoVideo.startsWith('data:video') ? '' : localData.profile.promoVideo} onChange={handleProfileChange} className="w-full bg-gray-700 p-2 rounded-md"/>
                                                <div className="flex gap-2">
                                                    <input type="file" accept="video/*" onChange={handlePromoVideoChange} className="w-full bg-gray-700 p-2 rounded-md file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"/>
                                                    <button 
                                                        onClick={handleGenerateVideo} 
                                                        disabled={isGeneratingVideo}
                                                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-1 px-3 rounded-md whitespace-nowrap disabled:opacity-50 transition-all"
                                                    >
                                                        {isGeneratingVideo ? 'Generating...' : 'Generate with AI (Veo)'}
                                                    </button>
                                                </div>
                                                {generationStatus && <p className="text-sm text-accent animate-pulse">{generationStatus}</p>}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Social Links */}
                                    <div className="mt-6 pt-4 border-t border-gray-700">
                                         <h3 className="text-xl font-semibold mb-4">Social Links</h3>
                                         {localData.profile.socialLinks.map((link, index) => (
                                             <div key={link.id} className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-2 items-center">
                                                <div className="md:col-span-2">
                                                     <input type="text" placeholder="Platform (e.g., GitHub)" value={link.platform} onChange={(e) => handleSocialLinkChange(index, 'platform', e.target.value)} className="w-full bg-gray-700 p-2 rounded-md"/>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <input type="text" placeholder="URL" value={link.url} onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)} className="w-full bg-gray-700 p-2 rounded-md"/>
                                                </div>
                                                <button onClick={() => handleRemoveSocialLink(link.id)} className="bg-red-500 text-white rounded-md h-10 w-10 flex items-center justify-center text-xs justify-self-end">X</button>
                                             </div>
                                         ))}
                                         <button onClick={handleAddSocialLink} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md mt-2">Add Social Link</button>
                                    </div>
                                </div>
                           )}
                           
                           {/* Skills Section */}
                           {activeTab === 'Skills' && (
                                <div>
                                    <h2 className="text-2xl font-semibold mb-4 border-b border-gray-700 pb-2">Skills</h2>
                                     {localData.skills.map((skill, index) => (
                                         <div key={skill.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 items-center">
                                            <div className="md:col-span-2">
                                                <input type="text" value={skill.name} onChange={e => handleItemChange<Skill>('skills', index, 'name', e.target.value)} className={`bg-gray-700 p-2 rounded-md w-full border ${errors.skills?.[index]?.name ? 'border-red-500' : 'border-transparent'}`}/>
                                                {errors.skills?.[index]?.name && <p className="text-red-400 text-sm mt-1">{errors.skills[index].name}</p>}
                                            </div>
                                            <input type="range" min="0" max="100" value={skill.level} onChange={e => handleItemChange<Skill>('skills', index, 'level', parseInt(e.target.value, 10))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"/>
                                            <div className='flex items-center justify-between'>
                                               <span className="text-center">{skill.level}%</span>
                                               <button onClick={() => handleRemoveItem('skills', skill.id)} className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">X</button>
                                            </div>
                                        </div>
                                     ))}
                                     <button onClick={() => handleAddItem('skills')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md mt-4">Add Skill</button>
                                </div>
                           )}

                           {/* Projects Section */}
                           {activeTab === 'Projects' && (
                                <div>
                                    <h2 className="text-2xl font-semibold mb-4 border-b border-gray-700 pb-2">Projects</h2>
                                     {localData.projects.map((project, index) => (
                                         <div key={project.id} className="mb-4 p-4 border border-gray-700 rounded-md relative space-y-4">
                                             <button onClick={() => handleRemoveItem('projects', project.id)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs z-10">X</button>
                                             
                                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                     <label className="block text-sm font-medium text-gray-300 mb-1">Project Title</label>
                                                     <input type="text" placeholder="Title" value={project.title} onChange={e => handleItemChange<Project>('projects', index, 'title', e.target.value)} className={`w-full bg-gray-700 p-2 rounded-md border ${errors.projects?.[index]?.title ? 'border-red-500' : 'border-transparent'}`}/>
                                                     {errors.projects?.[index]?.title && <p className="text-red-400 text-sm mt-1">{errors.projects[index].title}</p>}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-1">Live Site Link (optional)</label>
                                                    <input type="text" placeholder="https://..." value={project.link} onChange={e => handleItemChange<Project>('projects', index, 'link', e.target.value)} className="w-full bg-gray-700 p-2 rounded-md border border-transparent"/>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-1">Source Code Link (optional)</label>
                                                    <input type="text" placeholder="https://github.com/..." value={project.repoLink} onChange={e => handleItemChange<Project>('projects', index, 'repoLink', e.target.value)} className="w-full bg-gray-700 p-2 rounded-md border border-transparent"/>
                                                </div>
                                                 <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-1">Demo Video URL (optional)</label>
                                                    <input type="text" placeholder="https://youtube.com/..." value={project.videoUrl} onChange={e => handleItemChange<Project>('projects', index, 'videoUrl', e.target.value)} className="w-full bg-gray-700 p-2 rounded-md border border-transparent"/>
                                                </div>
                                             </div>
                
                                             <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-1">Short Description</label>
                                                <textarea placeholder="A brief summary for the project card." value={project.description} onChange={e => handleItemChange<Project>('projects', index, 'description', e.target.value)} rows={2} className={`w-full bg-gray-700 p-2 rounded-md border ${errors.projects?.[index]?.description ? 'border-red-500' : 'border-transparent'}`}/>
                                                {errors.projects?.[index]?.description && <p className="text-red-400 text-sm mt-1">{errors.projects[index].description}</p>}
                                             </div>
                
                                             <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-1">Detailed Description</label>
                                                <textarea placeholder="A full description for the project details view." value={project.longDescription} onChange={e => handleItemChange<Project>('projects', index, 'longDescription', e.target.value)} rows={5} className={`w-full bg-gray-700 p-2 rounded-md border ${errors.projects?.[index]?.longDescription ? 'border-red-500' : 'border-transparent'}`}/>
                                                {errors.projects?.[index]?.longDescription && <p className="text-red-400 text-sm mt-1">{errors.projects[index].longDescription}</p>}
                                             </div>

                                             <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-1">Key Learning / Challenge</label>
                                                <textarea placeholder="What was the biggest challenge or key learning from this project?" value={project.keyLearning} onChange={e => handleItemChange<Project>('projects', index, 'keyLearning', e.target.value)} rows={3} className={`w-full bg-gray-700 p-2 rounded-md border ${errors.projects?.[index]?.keyLearning ? 'border-red-500' : 'border-transparent'}`}/>
                                                {errors.projects?.[index]?.keyLearning && <p className="text-red-400 text-sm mt-1">{errors.projects[index].keyLearning}</p>}
                                             </div>
                                            
                                             <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-1">Technologies</label>
                                                <TagInput
                                                    tags={project.technologies}
                                                    setTags={(newTechs) => handleItemChange<Project>('projects', index, 'technologies', newTechs)}
                                                    placeholder="Add a technology and press Enter"
                                                    className={errors.projects?.[index]?.technologies ? 'border-red-500' : 'border-transparent'}
                                                />
                                                {errors.projects?.[index]?.technologies && <p className="text-red-400 text-sm mt-1">{errors.projects[index].technologies}</p>}
                                             </div>
                                             
                                             <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-1">Image Gallery</label>
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {project.imageGallery.map((img, imgIndex) => (
                                                        <div key={imgIndex} className="relative">
                                                            <img src={img} alt={`project gallery item ${imgIndex+1}`} className="w-24 h-24 object-cover rounded"/>
                                                            <button onClick={() => removeProjectGalleryImage(index, imgIndex)} className="absolute top-0 right-0 bg-red-600/80 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">&times;</button>
                                                        </div>
                                                    ))}
                                                </div>
                                                <input type="file" accept="image/*" multiple onChange={(e) => handleProjectGalleryChange(e, index)} className="w-full bg-gray-700 p-2 rounded-md file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"/>
                                             </div>
                
                                         </div>
                                     ))}
                                     <button onClick={() => handleAddItem('projects')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md mt-4">Add Project</button>
                                </div>
                           )}

                           {/* Memories Section */}
                           {activeTab === 'Memories' && (
                                <div>
                                    <h2 className="text-2xl font-semibold mb-4 border-b border-gray-700 pb-2">Memories Gallery</h2>
                                    <div className='mb-6'>
                                        <label className="block mb-2 text-lg">Upload New Photos</label>
                                        <input type="file" accept="image/*" multiple onChange={handleMemoryUpload} className="w-full bg-gray-700 p-2 rounded-md file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"/>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        {localData.memories.map((memory, index) => (
                                            <div key={memory.id} className="bg-gray-700 p-3 rounded-md relative group">
                                                <img src={memory.image} alt={memory.caption || `Memory ${index+1}`} className="w-full h-40 object-cover rounded-md mb-2" />
                                                <textarea
                                                    placeholder="Add a caption..."
                                                    value={memory.caption}
                                                    onChange={e => handleItemChange<Memory>('memories', index, 'caption', e.target.value)}
                                                    rows={2}
                                                    className="w-full bg-gray-600 p-2 rounded-md text-sm"
                                                />
                                                <button onClick={() => handleRemoveItem('memories', memory.id)} className="absolute top-1 right-1 bg-red-600/80 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                                            </div>
                                        ))}
                                    </div>
                                    {localData.memories.length === 0 && <p>No memories uploaded yet. Add some photos to get started!</p>}
                                </div>
                           )}

                           {/* Education Section */}
                           {activeTab === 'Education' && (
                                <div>
                                    <h2 className="text-2xl font-semibold mb-4 border-b border-gray-700 pb-2">Education</h2>
                                    {localData.education.map((edu, index) => (
                                        <div key={edu.id} className="mb-4 p-4 border border-gray-700 rounded-md relative">
                                            <button onClick={() => handleRemoveItem('education', edu.id)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">X</button>
                                            <input type="text" placeholder="Degree" value={edu.degree} onChange={e => handleItemChange<Education>('education', index, 'degree', e.target.value)} className={`w-full bg-gray-700 p-2 rounded-md mb-2 border ${errors.education?.[index]?.degree ? 'border-red-500' : 'border-transparent'}`} />
                                            {errors.education?.[index]?.degree && <p className="text-red-400 text-sm mb-1">{errors.education[index].degree}</p>}
                                            <input type="text" placeholder="Institution" value={edu.institution} onChange={e => handleItemChange<Education>('education', index, 'institution', e.target.value)} className={`w-full bg-gray-700 p-2 rounded-md mb-2 border ${errors.education?.[index]?.institution ? 'border-red-500' : 'border-transparent'}`} />
                                            {errors.education?.[index]?.institution && <p className="text-red-400 text-sm mb-1">{errors.education[index].institution}</p>}
                                            <input type="text" placeholder="Period (e.g., 2020 - 2024)" value={edu.period} onChange={e => handleItemChange<Education>('education', index, 'period', e.target.value)} className={`w-full bg-gray-700 p-2 rounded-md mb-2 border ${errors.education?.[index]?.period ? 'border-red-500' : 'border-transparent'}`} />
                                            {errors.education?.[index]?.period && <p className="text-red-400 text-sm mb-1">{errors.education[index].period}</p>}
                                            <textarea placeholder="Details" value={edu.details} onChange={e => handleItemChange<Education>('education', index, 'details', e.target.value)} className={`w-full bg-gray-700 p-2 rounded-md border ${errors.education?.[index]?.details ? 'border-red-500' : 'border-transparent'}`} />
                                            {errors.education?.[index]?.details && <p className="text-red-400 text-sm mt-1">{errors.education[index].details}</p>}
                                        </div>
                                    ))}
                                    <button onClick={() => handleAddItem('education')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md mt-4">Add Education</button>
                                </div>
                           )}

                           {/* Experience Section */}
                           {activeTab === 'Experience' && (
                                <div>
                                    <h2 className="text-2xl font-semibold mb-4 border-b border-gray-700 pb-2">Experience</h2>
                                    {localData.experience.map((exp, index) => (
                                         <div key={exp.id} className="mb-4 p-4 border border-gray-700 rounded-md relative">
                                            <button onClick={() => handleRemoveItem('experience', exp.id)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">X</button>
                                            <input type="text" placeholder="Role" value={exp.role} onChange={e => handleItemChange<Experience>('experience', index, 'role', e.target.value)} className={`w-full bg-gray-700 p-2 rounded-md mb-2 border ${errors.experience?.[index]?.role ? 'border-red-500' : 'border-transparent'}`} />
                                            {errors.experience?.[index]?.role && <p className="text-red-400 text-sm mb-1">{errors.experience[index].role}</p>}
                                            <input type="text" placeholder="Organization" value={exp.organization} onChange={e => handleItemChange<Experience>('experience', index, 'organization', e.target.value)} className={`w-full bg-gray-700 p-2 rounded-md mb-2 border ${errors.experience?.[index]?.organization ? 'border-red-500' : 'border-transparent'}`} />
                                            {errors.experience?.[index]?.organization && <p className="text-red-400 text-sm mb-1">{errors.experience[index].organization}</p>}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                                                <div>
                                                    <input type="text" placeholder="Start Date (e.g., Aug 2023)" value={exp.startDate} onChange={e => handleItemChange<Experience>('experience', index, 'startDate', e.target.value)} className={`w-full bg-gray-700 p-2 rounded-md border ${errors.experience?.[index]?.startDate ? 'border-red-500' : 'border-transparent'}`} />
                                                    {errors.experience?.[index]?.startDate && <p className="text-red-400 text-sm mt-1">{errors.experience[index].startDate}</p>}
                                                </div>
                                                <div>
                                                    <input type="text" placeholder="End Date (e.g., Present)" value={exp.endDate} onChange={e => handleItemChange<Experience>('experience', index, 'endDate', e.target.value)} className={`w-full bg-gray-700 p-2 rounded-md border ${errors.experience?.[index]?.endDate ? 'border-red-500' : 'border-transparent'}`} />
                                                    {errors.experience?.[index]?.endDate && <p className="text-red-400 text-sm mt-1">{errors.experience[index].endDate}</p>}
                                                </div>
                                            </div>
                                            <textarea placeholder="Description" value={exp.description} onChange={e => handleItemChange<Experience>('experience', index, 'description', e.target.value)} className={`w-full bg-gray-700 p-2 rounded-md border ${errors.experience?.[index]?.description ? 'border-red-500' : 'border-transparent'}`} />
                                            {errors.experience?.[index]?.description && <p className="text-red-400 text-sm mt-1">{errors.experience[index].description}</p>}
                                        </div>
                                    ))}
                                    <button onClick={() => handleAddItem('experience')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md mt-4">Add Experience</button>
                                </div>
                           )}

                           {/* Notes Section */}
                           {activeTab === 'Notes' && (
                                <div>
                                    <h2 className="text-2xl font-semibold mb-4 border-b border-gray-700 pb-2">Notes & Documents</h2>
                                    
                                    <div className="bg-gray-700/50 p-4 rounded-lg mb-6">
                                        <h3 className="text-xl font-semibold mb-4">Upload New Note</h3>
                                        <form onSubmit={handleAddNote} className="space-y-4">
                                            <div>
                                                <label className="block mb-1">Note Title</label>
                                                <input 
                                                    type="text" 
                                                    value={newNote.title} 
                                                    onChange={e => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                                                    className="w-full bg-gray-700 p-2 rounded-md"
                                                    placeholder="e.g., Microprocessor Architecture Cheatsheet"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block mb-1">Description</label>
                                                <textarea 
                                                    value={newNote.description} 
                                                    onChange={e => setNewNote(prev => ({ ...prev, description: e.target.value }))}
                                                    rows={3} 
                                                    className="w-full bg-gray-700 p-2 rounded-md"
                                                    placeholder="A brief description of the document."
                                                    required
                                                ></textarea>
                                            </div>
                                            <div>
                                                <label className="block mb-1">File</label>
                                                <input 
                                                    type="file" 
                                                    onChange={handleNoteFileChange}
                                                    className="w-full bg-gray-700 p-2 rounded-md file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                                                    required
                                                />
                                            </div>
                                            <button type="submit" disabled={uploadingNote} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-gray-500">
                                                {uploadingNote ? 'Uploading...' : 'Add Note'}
                                            </button>
                                        </form>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-semibold mb-4">Manage Notes</h3>
                                        <div className="space-y-3">
                                            {localData.notes && localData.notes.length > 0 ? localData.notes.map(note => (
                                                <div key={note.id} className="bg-gray-700 p-3 rounded-md flex justify-between items-center">
                                                    <div>
                                                        <p className="font-semibold text-accent">{note.title}</p>
                                                        <p className="text-sm text-gray-400 mt-1">{note.fileName} - {note.description}</p>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleRemoveItem('notes', note.id)}
                                                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2 rounded-md text-xs transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )) : (
                                                <p>No notes have been uploaded yet.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                           )}

                           {/* Guestbook Section */}
                           {activeTab === 'Guestbook' && (
                                <div>
                                    <h2 className="text-2xl font-semibold mb-4 border-b border-gray-700 pb-2">Guestbook Entries</h2>
                                    <div className="max-h-96 overflow-y-auto space-y-2">
                                        {guestbookEntries.length > 0 ? guestbookEntries.map(entry => (
                                            <div key={entry.id} className="bg-gray-700 p-3 rounded-md flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold text-accent">{entry.userId} <span className="text-xs text-gray-400 font-normal ml-2">{new Date(entry.timestamp).toLocaleString()}</span></p>
                                                    <p className="mt-1 text-gray-300">{entry.message}</p>
                                                </div>
                                                <button 
                                                    onClick={async () => {
                                                        if(window.confirm('Are you sure you want to delete this entry?')) {
                                                            await removeGuestbook(entry.id);
                                                            fetchGuestbookData(); // Refresh the list
                                                        }
                                                    }}
                                                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2 rounded-md text-xs transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )) : <p>No guestbook entries yet.</p>}
                                    </div>
                                </div>
                           )}

                           {/* Moderation Section */}
                           {activeTab === 'Moderation' && (
                                <div>
                                    <h2 className="text-2xl font-semibold mb-4 border-b border-gray-700 pb-2">Reported Messages</h2>
                                    <div className="max-h-96 overflow-y-auto space-y-2">
                                        {reports.length > 0 ? reports.map(report => (
                                            <div key={report.id} className="bg-gray-700 p-3 rounded-md">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-semibold text-accent">{report.messageAuthor} <span className="text-xs text-gray-400 font-normal ml-2">Reported at: {new Date(report.timestamp).toLocaleString()}</span></p>
                                                        <p className="mt-1 text-gray-300 bg-gray-900/50 p-2 rounded-md my-2">{report.messageContent}</p>
                                                    </div>
                                                    <div className="flex flex-col space-y-2">
                                                        <button 
                                                            onClick={async () => {
                                                                if(window.confirm('This will permanently delete the message. Are you sure?')) {
                                                                    await removeGuestbook(report.messageId);
                                                                    await removeReport(report.id);
                                                                    fetchReportData();
                                                                }
                                                            }}
                                                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2 rounded-md text-xs transition-colors"
                                                        >
                                                            Delete Msg
                                                        </button>
                                                        <button 
                                                            onClick={async () => {
                                                                await removeReport(report.id);
                                                                fetchReportData();
                                                            }}
                                                            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-2 rounded-md text-xs transition-colors"
                                                        >
                                                            Dismiss
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )) : <p>No reported messages.</p>}
                                    </div>
                                </div>
                           )}

                           {/* Contact Leads Section */}
                           {activeTab === 'Contact Leads' && (
                                <div>
                                    <h2 className="text-2xl font-semibold mb-4 border-b border-gray-700 pb-2">Contact Leads</h2>
                                    <div className="max-h-96 overflow-y-auto">
                                         {leads.length > 0 ? (
                                            <table className="w-full text-left">
                                                <thead className="bg-gray-700">
                                                    <tr>
                                                        <th className="p-2">Date</th>
                                                        <th className="p-2">Name</th>
                                                        <th className="p-2">Email</th>
                                                        <th className="p-2">Message</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {leads.map(lead => (
                                                        <tr key={lead.id} className="border-b border-gray-700">
                                                            <td className="p-2 text-sm">{new Date(lead.timestamp).toLocaleDateString()}</td>
                                                            <td className="p-2">{lead.name}</td>
                                                            <td className="p-2">{lead.email}</td>
                                                            <td className="p-2 text-sm">{lead.message}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                         ) : <p>No contact leads have been received.</p>}
                                    </div>
                                </div>
                           )}

                           {/* User Management Section */}
                            {activeTab === 'User Management' && (
                                <div>
                                    <h2 className="text-2xl font-semibold mb-4 border-b border-gray-700 pb-2">User Management</h2>
                                    <p className="text-sm text-gray-400 mb-4">
                                        This table lists all registered users. User data is stored locally in the browser's IndexedDB.
                                    </p>
                                    <div className="max-h-96 overflow-y-auto">
                                        {users.length > 0 ? (
                                            <table className="w-full text-left">
                                                <thead className="bg-gray-700">
                                                    <tr>
                                                        <th className="p-2">User ID</th>
                                                        <th className="p-2 text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {users.map(user => (
                                                        <tr key={user.id} className="border-b border-gray-700">
                                                            <td className="p-2 font-mono">{user.id}</td>
                                                            <td className="p-2 text-right">
                                                                <button 
                                                                    onClick={async () => {
                                                                        if(window.confirm(`Are you sure you want to delete user "${user.id}"? This action cannot be undone.`)) {
                                                                            await removeUser(user.id);
                                                                            fetchUsersData(); // Refresh the list
                                                                        }
                                                                    }}
                                                                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2 rounded-md text-xs transition-colors"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : <p>No users have signed up yet.</p>}
                                    </div>
                                </div>
                            )}

                           {/* Settings Section */}
                           {activeTab === 'Settings' && (
                                <div>
                                     <h2 className="text-2xl font-semibold mb-4 border-b border-gray-700 pb-2">Settings</h2>
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <h3 className="text-xl font-semibold mb-4">Change Password</h3>
                                            {passwordMessage.text && (
                                                <p className={`${passwordMessage.type === 'error' ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'} p-3 rounded-md mb-4`}>
                                                    {passwordMessage.text}
                                                </p>
                                            )}
                                            <form onSubmit={handleChangePassword} className="space-y-4">
                                                <div>
                                                    <label className="block mb-1">Old Password</label>
                                                    <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md" autoComplete="current-password"/>
                                                </div>
                                                <div>
                                                    <label className="block mb-1">New Password</label>
                                                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md" autoComplete="new-password"/>
                                                </div>
                                                <div>
                                                    <label className="block mb-1">Confirm New Password</label>
                                                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md" autoComplete="new-password"/>
                                                </div>
                                                <button type="submit" className="bg-secondary hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
                                                    Update Password
                                                </button>
                                            </form>
                                        </div>
                    
                                        <div>
                                            <h3 className="text-xl font-semibold mb-4">Security Question</h3>
                                            {securityMessage.text && (
                                                <p className={`${securityMessage.type === 'error' ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'} p-3 rounded-md mb-4`}>
                                                    {securityMessage.text}
                                                </p>
                                            )}
                                            <form onSubmit={handleSecurityUpdate} className="space-y-4">
                                                <div>
                                                    <label className="block mb-1">Question</label>
                                                    <input type="text" value={securityQuestion} onChange={e => setSecurityQuestion(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md"/>
                                                </div>
                                                <div>
                                                    <label className="block mb-1">Answer</label>
                                                    <input type="text" value={securityAnswer} onChange={e => setSecurityAnswer(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md"/>
                                                </div>
                                                <button type="submit" className="bg-secondary hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
                                                    Update Security Question
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                           )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};


const AdminView: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const authStatus = localStorage.getItem(STORAGE_KEY_AUTH);
        if (authStatus === 'true') {
            setIsLoggedIn(true);
        }
    }, []);

    const handleLogin = () => {
        setIsLoggedIn(true);
    };
    
    const handleLogout = () => {
        localStorage.removeItem(STORAGE_KEY_AUTH);
        setIsLoggedIn(false);
    }

    if (!isLoggedIn) {
        return <LoginForm onLogin={handleLogin} />;
    }

    return <AdminDashboard onLogout={handleLogout}/>;
};

export default AdminView;
