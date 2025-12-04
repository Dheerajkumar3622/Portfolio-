
import React, { useState, useRef, useEffect } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import GuestbookWidget from '../components/GuestbookWidget';
import ProjectDetailModal from '../components/ProjectDetailModal';
import BackToTopButton from '../components/BackToTopButton';
import SkillBar from '../components/SkillBar';
import { Link } from 'react-router-dom';
import { postLead } from '../services/api';
import type { Project, SocialLink, Note } from '../types';
import { useOnScreen } from '../hooks/useOnScreen';
import SocialLinks from '../components/SocialLinks';
import MemoriesSection from '../components/MemoriesSection';
import Typewriter from '../components/Typewriter';
import ProTipWidget from '../components/ProTipWidget';
import AuthModal from '../components/AuthModal';
import UserProfileModal from '../components/UserProfileModal';


const Header: React.FC<{ name: string; title: string; activeSection: string; onProfileClick: () => void; onLoginClick: () => void; }> = ({ name, title, activeSection, onProfileClick, onLoginClick }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { currentUser, logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    
    const navLinks = [
        { href: '#about', label: 'About', id: 'about' },
        { href: '#memories', label: 'Memories', id: 'memories' },
        { href: '#skills', label: 'Skills', id: 'skills' },
        { href: '#projects', label: 'Projects', id: 'projects' },
        { href: '#experience', label: 'Experience', id: 'experience' },
        { href: '#notes', label: 'Notes', id: 'notes' },
    ];

    const AuthControls: React.FC<{ isMobile?: boolean }> = ({ isMobile }) => {
        const baseClasses = "transition-colors font-semibold";
        const mobileClasses = isMobile ? "text-2xl" : "text-sm";

        if (currentUser) {
            return (
                <div className={`flex ${isMobile ? 'flex-col items-center space-y-4' : 'items-center space-x-4'}`}>
                    <span className={`text-text-secondary ${mobileClasses}`}>ID: <span className="font-bold text-accent">{currentUser.id}</span></span>
                    <button onClick={onProfileClick} className={`${baseClasses} ${mobileClasses} text-text-secondary hover:text-accent`}>Profile</button>
                    <button onClick={logout} className={`${baseClasses} ${mobileClasses} bg-highlight text-white px-4 py-2 rounded-full hover:opacity-90 shadow-md`}>Logout</button>
                </div>
            );
        }
        return (
             <button onClick={onLoginClick} className={`${baseClasses} ${mobileClasses} bg-accent text-white px-4 py-2 rounded-full hover:opacity-90 shadow-md`}>
                Login / Sign Up
            </button>
        );
    };

    return (
        <header className="sticky top-0 z-30 w-full p-4 bg-primary/70 backdrop-blur-xl border-b border-text-secondary/10 shadow-sm">
            <div className="container mx-auto flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-highlight">
                      {name}
                    </h1>
                    <p className="text-sm text-text-secondary -mt-1">{title}</p>
                </div>
                
                {/* Desktop Nav */}
                <nav className="hidden md:flex space-x-6 text-text-primary font-medium items-center">
                    {navLinks.map(link => (
                         <a key={link.href} href={link.href} className={`transition-colors relative ${activeSection === link.id ? 'text-accent' : 'hover:text-accent'}`}>
                            {link.label}
                            {activeSection === link.id && <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-accent rounded-full"></span>}
                         </a>
                    ))}
                    <a href="#contact" className="hover:text-accent">Contact</a>
                    <button 
                        onClick={toggleTheme} 
                        className="p-2 rounded-full hover:bg-base-100 transition-colors text-text-primary"
                        aria-label="Toggle Dark Mode"
                    >
                        {isDarkMode ? (
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                        )}
                    </button>
                    <div className="w-px h-6 bg-text-secondary/30"></div>
                    <AuthControls />
                </nav>

                {/* Mobile Menu Button */}
                <div className="flex items-center gap-4 md:hidden">
                    <button 
                        onClick={toggleTheme} 
                        className="p-2 rounded-full hover:bg-base-100 transition-colors text-text-primary"
                         aria-label="Toggle Dark Mode"
                    >
                         {isDarkMode ? (
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                        )}
                    </button>
                    <button className="z-50" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
                        <div className="w-6 h-6 flex flex-col justify-around">
                            <span className={`block w-full h-0.5 bg-text-primary transition-transform duration-300 ${isMenuOpen ? 'rotate-45 translate-y-[5px]' : ''}`}></span>
                            <span className={`block w-full h-0.5 bg-text-primary transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                            <span className={`block w-full h-0.5 bg-text-primary transition-transform duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-[5px]' : ''}`}></span>
                        </div>
                    </button>
                </div>

                {/* Mobile Nav */}
                <div className={`fixed top-0 left-0 w-full h-full bg-primary/95 backdrop-blur-lg z-40 transform transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} md:hidden`}>
                     <nav className="flex flex-col items-center justify-center h-full space-y-8 text-2xl text-text-primary font-medium">
                        {navLinks.map(link => (
                             <a key={link.href} href={link.href} className="hover:text-accent transition-colors" onClick={() => setIsMenuOpen(false)}>{link.label}</a>
                        ))}
                        <a href="#contact" className="hover:text-accent transition-colors" onClick={() => setIsMenuOpen(false)}>Contact</a>
                        <div className="w-24 h-px bg-text-secondary/30 my-4"></div>
                        <AuthControls isMobile={true} />
                    </nav>
                </div>
            </div>
        </header>
    );
};


const Hero: React.FC<{ profile: any }> = ({ profile }) => (
    <section id="about" className="container mx-auto px-8 pt-24 pb-16">
        {/* Text section, now full width and centered */}
        <div className="w-full animate-fade-in-up text-center bg-secondary/50 backdrop-blur-md border border-secondary/30 rounded-lg py-12 md:py-16">
            <h2 className="text-4xl md:text-6xl font-extrabold mb-4 text-text-primary">
                Hi, I'm <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent to-highlight">{profile.name}</span>
            </h2>
            <h3 className="text-2xl md:text-3xl text-text-secondary mb-6 h-10">
                <Typewriter text={profile.title} speed={50} />
            </h3>
            <p className="text-text-secondary max-w-2xl mx-auto mb-8">{profile.about}</p>
            <SocialLinks links={profile.socialLinks} center={true} />
        </div>
    </section>
);

const SVGWave: React.FC<{ color: string }> = ({ color }) => (
    <div className="relative -mb-1 text-base-100">
        <svg className="w-full h-auto" viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg">
             {/* Use current text color (set by parent class) for the fill, allowing it to adapt */}
            <path d="M0 20C240 73.3333 480 90 720 70C960 50 1200 -10 1440 20V100H0V20Z" fill="currentColor"/>
        </svg>
    </div>
);


const AnimatedSection: React.FC<{ id: string; title: string; children: React.ReactNode }> = ({ id, title, children }) => {
    const ref = useRef<HTMLDivElement>(null);
    const isVisible = useOnScreen(ref, { threshold: 0.1 });

    return (
        <section
            ref={ref}
            id={id}
            className={`container mx-auto p-8 my-8 transform transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
            <h2 className="text-4xl font-bold text-center text-text-primary mb-12 relative inline-block left-1/2 -translate-x-1/2">
                {title}
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-accent to-highlight rounded-full"></span>
            </h2>
            {children}
        </section>
    );
};

const AnimatedItem: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({ children, delay = 0, className }) => {
    const ref = useRef<HTMLDivElement>(null);
    const isVisible = useOnScreen(ref, { threshold: 0.1 });

    return (
        <div
            ref={ref}
            className={`transform transition-all duration-700 ease-out ${className || ''} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
};

const ContactForm = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState({ type: '', text: '' });
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus({ type: '', text: '' });

        if (!name || !email || !message) {
            setStatus({ type: 'error', text: 'Please fill out all fields.' });
            return;
        }

        try {
            await postLead({ name, email, message });
            setStatus({ type: 'success', text: 'Thank you! Your message has been sent.' });
            setIsSubmitted(true);
            setName('');
            setEmail('');
            setMessage('');
        } catch (error) {
            console.error("Failed to save lead:", error);
            setStatus({ type: 'error', text: 'Something went wrong. Please try again later.' });
        }
    };

    if (isSubmitted) {
        return (
            <div className="text-center bg-secondary/60 backdrop-blur-md border border-secondary/30 p-12 rounded-lg shadow-md animate-fade-in-up">
                <svg className="w-16 h-16 mx-auto mb-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <h3 className="text-2xl font-bold text-text-primary mb-2">Thank You!</h3>
                <p className="text-text-secondary">Your message has been received. I'll get back to you shortly.</p>
                <button onClick={() => setIsSubmitted(false)} className="mt-6 bg-accent text-white font-bold py-2 px-4 rounded-md hover:bg-highlight transition-colors">Send Another Message</button>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-text-primary mb-4 text-center">Get In Touch</h2>
             <form onSubmit={handleSubmit} className="space-y-4 bg-secondary/60 backdrop-blur-md border border-secondary/30 p-8 rounded-lg shadow-md">
                {status.text && status.type === 'error' && <p className={`p-3 rounded-md text-center bg-red-100 text-red-700`}>{status.text}</p>}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-text-secondary">Name</label>
                    <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-primary/80 border border-text-secondary/20 text-text-primary rounded-md shadow-sm placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent" />
                </div>
                 <div>
                    <label htmlFor="email" className="block text-sm font-medium text-text-secondary">Email</label>
                    <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-primary/80 border border-text-secondary/20 text-text-primary rounded-md shadow-sm placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent" />
                </div>
                 <div>
                    <label htmlFor="message" className="block text-sm font-medium text-text-secondary">Message</label>
                    <textarea id="message" value={message} onChange={e => setMessage(e.target.value)} rows={4} className="mt-1 block w-full px-3 py-2 bg-primary/80 border border-text-secondary/20 text-text-primary rounded-md shadow-sm placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"></textarea>
                </div>
                <button type="submit" className="w-full bg-accent text-white font-bold py-3 px-4 rounded-md hover:bg-highlight transition-colors">Send Message</button>
             </form>
        </div>
    );
};

const FileIcon: React.FC<{ mimeType: string }> = ({ mimeType }) => {
    // Icon for Images
    if (mimeType.startsWith('image/')) {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        );
    }
    // Icon for PDFs
    if (mimeType === 'application/pdf') {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        );
    }
    // Default Icon for other documents (Word, etc.)
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    );
};

const UserView: React.FC = () => {
  const { portfolioData } = usePortfolio();
  const { profile, skills, projects, experience, education, memories, notes } = portfolioData;
  const [selectedTech, setSelectedTech] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeSection, setActiveSection] = useState('about');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const allTechs = [...new Set(projects.flatMap(p => p.technologies))].sort();

  const filteredProjects = selectedTech
    ? projects.filter(p => p.technologies.includes(selectedTech))
    : projects;

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = (selectedProject || isProfileModalOpen || isAuthModalOpen) ? 'hidden' : 'auto';
    return () => {
        document.body.style.overflow = 'auto';
    };
  }, [selectedProject, isProfileModalOpen, isAuthModalOpen]);
  
  useEffect(() => {
    const handleScroll = () => {
        const sections = ['about', 'skills', 'projects', 'memories', 'experience', 'education', 'notes', 'promo', 'contact'];
        const scrollPosition = window.scrollY + window.innerHeight / 2;

        for (const id of sections) {
            const element = document.getElementById(id);
            if (element && scrollPosition >= element.offsetTop && scrollPosition < element.offsetTop + element.offsetHeight) {
                setActiveSection(id);
                break;
            }
        }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const handleDownload = async (note: Note) => {
    try {
        const response = await fetch(note.fileData);
        const blob = await response.blob();
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', note.fileName);
        
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Download failed:', error);
        alert('Sorry, the file could not be downloaded.');
    }
  };

  const handleNavigate = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOpenProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
        setSelectedProject(project);
    } else {
        console.warn(`Project with ID "${projectId}" not found.`);
    }
  };


  return (
    <div className="relative bg-transparent text-text-primary overflow-x-hidden">
      {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}
      <Header 
        name={profile.name} 
        title={profile.title} 
        activeSection={activeSection} 
        onProfileClick={() => setIsProfileModalOpen(true)}
        onLoginClick={() => setIsAuthModalOpen(true)}
      />
      <main>
        <Hero profile={profile} />
        
        <SVGWave color="text-base-100" />
        <div className='bg-base-100'>
            {memories && memories.length > 0 && (
                <AnimatedSection id="memories" title="Memories">
                    <MemoriesSection memories={memories} />
                </AnimatedSection>
            )}
            <AnimatedSection id="skills" title="My Skills">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {skills.map(skill => (
                        <SkillBar key={skill.id} name={skill.name} level={skill.level} />
                    ))}
                </div>
            </AnimatedSection>
        </div>
        <div className="text-primary transform scale-y-[-1]">
            <SVGWave color="text-base-100" />
        </div>

        <AnimatedSection id="projects" title="Projects">
            <div className="flex flex-wrap justify-center gap-2 mb-12">
                <button
                    onClick={() => setSelectedTech(null)}
                    className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 shadow-sm ${
                        !selectedTech
                            ? 'bg-gradient-to-r from-accent to-highlight text-white scale-105'
                            : 'bg-secondary text-text-secondary hover:bg-base-100 shadow-sm border border-text-secondary/10'
                    }`}
                >
                    All Projects
                </button>
                {allTechs.map(tech => (
                    <button
                        key={tech}
                        onClick={() => setSelectedTech(tech)}
                        className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 shadow-sm ${
                            selectedTech === tech
                                ? 'bg-gradient-to-r from-accent to-highlight text-white scale-105'
                                : 'bg-secondary text-text-secondary hover:bg-base-100 shadow-sm border border-text-secondary/10'
                        }`}
                    >
                        {tech}
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredProjects.map((project, index) => (
                     <AnimatedItem key={project.id} delay={index * 150}>
                        <div className="bg-secondary/60 backdrop-blur-md border border-secondary/30 shadow-lg rounded-xl flex flex-col transition-all duration-300 hover:shadow-2xl hover:shadow-glow-highlight hover:border-accent/50 hover:-translate-y-2 hover:scale-105 hover:-rotate-1 group h-full">
                             <img src={project.imageGallery[0] || 'https://picsum.photos/800/600'} alt={project.title} className="rounded-t-xl object-cover h-48 w-full"/>
                             <div className="p-6 flex flex-col flex-grow">
                                <h3 className="text-2xl font-bold text-accent mb-2">{project.title}</h3>
                                <p className="text-text-secondary mb-4 flex-grow">{project.description}</p>
                                <div className="mb-4">
                                    {project.technologies.slice(0, 4).map((tech, index) => (
                                        <button key={index} 
                                            onClick={() => setSelectedTech(tech)}
                                            className="inline-block bg-accent/20 text-accent text-xs font-semibold mr-2 mb-2 px-3 py-1 rounded-full hover:bg-accent/30 transition-colors focus:outline-none focus:ring-2 focus:ring-accent">
                                            {tech}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={() => setSelectedProject(project)} className="mt-auto bg-highlight text-white font-bold py-2 px-4 rounded-md hover:opacity-90 transition-opacity self-start">Learn More</button>
                            </div>
                        </div>
                    </AnimatedItem>
                ))}
            </div>
        </AnimatedSection>
        
        <SVGWave color="text-base-100" />
        <div className='bg-base-100'>
            <AnimatedSection id="experience" title="Experience">
                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-accent/50 to-highlight/50">
                    {experience.map((exp, index) => (
                        <AnimatedItem key={exp.id} delay={index * 150}>
                            <div className="relative pl-10">
                                 <div className="absolute left-5 top-1 h-4 w-4 rounded-full bg-highlight border-4 border-base-100"></div>
                                <div className="bg-secondary/60 backdrop-blur-md border border-secondary/30 shadow-lg p-6 rounded-xl">
                                    <h3 className="text-2xl font-bold text-text-primary">{exp.role}</h3>
                                    <p className="text-lg text-accent mb-1">{exp.organization}</p>
                                    <p className="text-sm text-text-secondary mb-3">{exp.startDate} - {exp.endDate}</p>
                                    <p className="text-text-secondary">{exp.description}</p>
                                </div>
                            </div>
                        </AnimatedItem>
                    ))}
                </div>
            </AnimatedSection>
        </div>
        <div className="text-primary transform scale-y-[-1]">
            <SVGWave color="text-base-100" />
        </div>

        <AnimatedSection id="education" title="Education">
             <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-accent/50 to-highlight/50">
                {education.map((edu, index) => (
                    <AnimatedItem key={edu.id} delay={index * 150}>
                        <div className="relative pl-10">
                            <div className="absolute left-5 top-1 h-4 w-4 rounded-full bg-accent border-4 border-primary"></div>
                            <div className="bg-secondary/60 backdrop-blur-md border border-secondary/30 shadow-lg p-6 rounded-xl">
                                <h3 className="text-2xl font-bold text-text-primary">{edu.degree}</h3>
                                <p className="text-lg text-accent mb-1">{edu.institution}</p>
                                <p className="text-sm text-text-secondary mb-3">{edu.period}</p>
                                <p className="text-text-secondary">{edu.details}</p>
                            </div>
                        </div>
                    </AnimatedItem>
                ))}
            </div>
        </AnimatedSection>

        {notes && notes.length > 0 && (
            <>
                <SVGWave color="text-cork-board" />
                <div className='bg-cork-board'>
                    <AnimatedSection id="notes" title="Notes & Resources">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {notes.map((note, index) => (
                                <AnimatedItem key={note.id} delay={index * 150}>
                                    <div className="relative bg-secondary shadow-lg rounded-md p-6 flex flex-col h-full group transition-transform duration-300 ease-in-out hover:scale-105 hover:-rotate-3">
                                        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-400 rounded-full shadow-md border-2 border-white/70">
                                            <div className="absolute inset-0.5 bg-red-500 rounded-full"></div>
                                        </div>
                                        
                                        <div className="flex-grow pt-6">
                                            <div className="flex items-start space-x-4 mb-4">
                                                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                                                    <FileIcon mimeType={note.fileType} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                     <h3 className="text-xl font-bold text-text-primary mb-1 truncate" title={note.title}>{note.title}</h3>
                                                     <p className="text-text-secondary text-xs truncate" title={note.fileName}>{note.fileName}</p>
                                                </div>
                                            </div>
                                            <p className="text-text-secondary text-sm mb-4 leading-relaxed">{note.description}</p>
                                        </div>
                                        <div className="mt-auto text-right">
                                            <a 
                                                href="#" 
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleDownload(note);
                                                }}
                                                className="inline-flex items-center gap-2 bg-highlight text-white font-bold py-2 px-4 rounded-md hover:opacity-90 transition-all self-start group-hover:bg-accent group-hover:pl-3 group-hover:pr-5"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:translate-x-[-2px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                                <span>Download</span>
                                            </a>
                                        </div>
                                    </div>
                                </AnimatedItem>
                            ))}
                        </div>
                    </AnimatedSection>
                </div>
                <div className="text-primary transform scale-y-[-1]">
                    <SVGWave color="text-cork-board" />
                </div>
            </>
        )}

        {profile.promoVideo && (
            <AnimatedSection id="promo" title="Promotional Video">
                <div className="aspect-w-16 aspect-h-9 max-w-4xl mx-auto">
                    {profile.promoVideo.startsWith('data:video') ? (
                         <video controls src={profile.promoVideo} className="rounded-lg shadow-2xl w-full h-full object-cover"></video>
                    ) : (
                        <iframe
                            src={profile.promoVideo.replace("watch?v=", "embed/")}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="rounded-lg shadow-md w-full h-full"
                            title="Promotional Video"
                        ></iframe>
                    )}
                </div>
            </AnimatedSection>
        )}

      </main>
      <GuestbookWidget />
      <footer id="contact" className="p-8 bg-base-100/70 backdrop-blur-md border-t border-text-secondary/10">
            <div className="container mx-auto">
                <ContactForm />
                 <div className="my-8">
                    <SocialLinks links={profile.socialLinks} center={true}/>
                </div>
                <p className="text-text-secondary text-center text-sm">
                    &copy; {new Date().getFullYear()} {profile.name}. All Rights Reserved.
                    <br />
                    <Link to="/admin" className="hover:text-accent">Admin Panel</Link>
                </p>
            </div>
      </footer>
      {selectedProject && <ProjectDetailModal project={selectedProject} onClose={() => setSelectedProject(null)} />}
      {isProfileModalOpen && <UserProfileModal onClose={() => setIsProfileModalOpen(false)} />}
      <ProTipWidget />
      <BackToTopButton />
    </div>
  );
};

export default UserView;