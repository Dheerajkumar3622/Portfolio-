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
        { href: '#skills', label: 'Expertise', id: 'skills' },
        { href: '#projects', label: 'Work', id: 'projects' },
        { href: '#experience', label: 'Experience', id: 'experience' },
        { href: '#notes', label: 'Resources', id: 'notes' },
    ];

    const AuthControls: React.FC<{ isMobile?: boolean }> = ({ isMobile }) => {
        const baseClasses = "transition-all font-medium text-sm";
        
        if (currentUser) {
            return (
                <div className={`flex ${isMobile ? 'flex-col items-center space-y-4' : 'items-center space-x-4'}`}>
                    <span className="text-text-secondary text-xs uppercase tracking-wider">ID: {currentUser.id}</span>
                    <button onClick={onProfileClick} className="text-text-primary hover:text-accent">Profile</button>
                    <button onClick={logout} className="text-text-secondary hover:text-red-500">Logout</button>
                </div>
            );
        }
        return (
             <button onClick={onLoginClick} className={`${baseClasses} bg-highlight text-primary px-5 py-2 rounded-full hover:opacity-90 shadow-md`}>
                Sign In
            </button>
        );
    };

    return (
        <header className="sticky top-0 z-30 w-full bg-primary/80 backdrop-blur-md border-b border-secondary/50">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-highlight rounded-lg"></div>
                    <div>
                        <h1 className="text-lg font-bold text-highlight tracking-tight leading-none">
                          {name}
                        </h1>
                    </div>
                </div>
                
                {/* Desktop Nav */}
                <nav className="hidden md:flex space-x-8 text-sm font-medium text-text-secondary items-center">
                    {navLinks.map(link => (
                         <a key={link.href} href={link.href} className={`transition-colors hover:text-highlight ${activeSection === link.id ? 'text-highlight font-semibold' : ''}`}>
                            {link.label}
                         </a>
                    ))}
                    <a href="#contact" className="hover:text-highlight">Contact</a>
                    
                    <button 
                        onClick={toggleTheme} 
                        className="p-2 rounded-full hover:bg-secondary transition-colors text-text-primary"
                        aria-label="Toggle Dark Mode"
                    >
                        {isDarkMode ? (
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                        )}
                    </button>
                    <AuthControls />
                </nav>

                {/* Mobile Menu Button */}
                <div className="flex items-center gap-4 md:hidden">
                    <button onClick={toggleTheme} className="text-text-primary">
                         {isDarkMode ? '☀️' : '🌙'}
                    </button>
                    <button className="z-50" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
                        <div className="space-y-1.5">
                            <span className={`block w-6 h-0.5 bg-text-primary transition-all ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                            <span className={`block w-6 h-0.5 bg-text-primary transition-all ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                            <span className={`block w-6 h-0.5 bg-text-primary transition-all ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                        </div>
                    </button>
                </div>

                {/* Mobile Nav */}
                <div className={`fixed inset-0 bg-primary z-40 flex flex-col items-center justify-center space-y-8 transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} md:hidden`}>
                     {navLinks.map(link => (
                          <a key={link.href} href={link.href} className="text-2xl font-bold text-text-primary" onClick={() => setIsMenuOpen(false)}>{link.label}</a>
                     ))}
                     <AuthControls isMobile={true} />
                </div>
            </div>
        </header>
    );
};


const Hero: React.FC<{ profile: any }> = ({ profile }) => (
    <section id="about" className="container mx-auto px-6 py-24 md:py-32 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 text-center md:text-left animate-fade-in-up">
            <span className="inline-block py-1 px-3 rounded-full bg-secondary text-accent text-xs font-bold tracking-widest uppercase mb-6">
                Portfolio
            </span>
            <h2 className="text-5xl md:text-7xl font-bold mb-6 text-text-primary tracking-tight leading-tight">
                {profile.name}
            </h2>
            <h3 className="text-xl md:text-2xl text-text-secondary mb-8 font-light h-8">
                <Typewriter text={profile.title} speed={50} />
            </h3>
            <p className="text-text-secondary text-lg leading-relaxed max-w-xl mb-8 mx-auto md:mx-0">
                {profile.about}
            </p>
            <div className="flex justify-center md:justify-start gap-4">
                <a href="#projects" className="bg-highlight text-primary px-8 py-3 rounded-full font-medium hover:opacity-90 transition-opacity">View Work</a>
                <a href="#contact" className="border border-text-secondary/30 text-text-primary px-8 py-3 rounded-full font-medium hover:bg-secondary transition-colors">Contact</a>
            </div>
            <div className="mt-8 flex justify-center md:justify-start">
                <SocialLinks links={profile.socialLinks} />
            </div>
        </div>
        <div className="flex-1 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
             <div className="relative w-64 h-64 md:w-96 md:h-96 mx-auto">
                <div className="absolute inset-0 bg-gradient-to-tr from-accent to-highlight rounded-full opacity-10 blur-2xl"></div>
                <img 
                    src={profile.profilePicture || "https://picsum.photos/400/400"} 
                    alt={profile.name} 
                    className="relative w-full h-full object-cover rounded-2xl shadow-premium rotate-3 hover:rotate-0 transition-transform duration-500"
                />
             </div>
        </div>
    </section>
);

const SectionHeading: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
    <div className="text-center mb-16">
        {subtitle && <span className="text-accent text-xs font-bold tracking-widest uppercase mb-2 block">{subtitle}</span>}
        <h2 className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight">{title}</h2>
        <div className="w-12 h-1 bg-accent mx-auto mt-4 rounded-full"></div>
    </div>
);

const AnimatedSection: React.FC<{ id: string; title: string; subtitle?: string; className?: string; children: React.ReactNode }> = ({ id, title, subtitle, className, children }) => {
    const ref = useRef<HTMLDivElement>(null);
    const isVisible = useOnScreen(ref, { threshold: 0.1 });

    return (
        <section
            ref={ref}
            id={id}
            className={`py-24 px-6 ${className || ''} transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        >
            <div className="container mx-auto">
                <SectionHeading title={title} subtitle={subtitle} />
                {children}
            </div>
        </section>
    );
};

const ContactForm = () => {
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');
        try {
            await postLead(formData);
            setStatus('success');
            setFormData({ name: '', email: '', message: '' });
        } catch {
            setStatus('error');
        }
    };

    return (
        <div className="max-w-xl mx-auto bg-secondary p-8 rounded-2xl shadow-premium">
             {status === 'success' ? (
                <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
                    <h3 className="text-xl font-bold mb-2">Message Sent</h3>
                    <p className="text-text-secondary">I'll get back to you soon.</p>
                    <button onClick={() => setStatus('idle')} className="mt-4 text-accent font-medium">Send another</button>
                </div>
             ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-text-secondary">Name</label>
                            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-primary border border-secondary rounded-lg p-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-text-secondary">Email</label>
                            <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-primary border border-secondary rounded-lg p-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-text-secondary">Message</label>
                        <textarea required rows={4} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full bg-primary border border-secondary rounded-lg p-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"></textarea>
                    </div>
                    <button disabled={status === 'submitting'} type="submit" className="w-full bg-highlight text-primary font-bold py-3 rounded-lg hover:opacity-90 transition-opacity">
                        {status === 'submitting' ? 'Sending...' : 'Send Message'}
                    </button>
                    {status === 'error' && <p className="text-red-500 text-sm text-center">Failed to send. Please try again.</p>}
                </form>
             )}
        </div>
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

  // Derive unique categories for filter
  const allTechs = [...new Set(projects.flatMap(p => p.technologies))].slice(0, 6); // Limit to top 6

  const filteredProjects = selectedTech
    ? projects.filter(p => p.technologies.includes(selectedTech))
    : projects;

  useEffect(() => {
    document.body.style.overflow = (selectedProject || isProfileModalOpen || isAuthModalOpen) ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [selectedProject, isProfileModalOpen, isAuthModalOpen]);
  
  useEffect(() => {
    const handleScroll = () => {
        const sections = ['about', 'skills', 'projects', 'experience', 'notes', 'contact'];
        const scrollPosition = window.scrollY + 200;
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
    } catch {
        alert('Download failed.');
    }
  };

  return (
    <div className="bg-primary text-text-primary min-h-screen">
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
        
        {/* Skills Section - Clean Grid */}
        <AnimatedSection id="skills" title="Technical Expertise" subtitle="Capabilities" className="bg-secondary/30">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {skills.map(skill => (
                    <SkillBar key={skill.id} name={skill.name} level={skill.level} />
                ))}
            </div>
        </AnimatedSection>

        {/* Projects Section - Minimal Cards */}
        <AnimatedSection id="projects" title="Selected Works" subtitle="Portfolio">
            <div className="flex flex-wrap justify-center gap-2 mb-12">
                <button
                    onClick={() => setSelectedTech(null)}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${!selectedTech ? 'bg-highlight text-primary shadow-lg' : 'bg-secondary text-text-secondary hover:bg-secondary/80'}`}
                >
                    All
                </button>
                {allTechs.map(tech => (
                    <button
                        key={tech}
                        onClick={() => setSelectedTech(tech)}
                        className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${selectedTech === tech ? 'bg-highlight text-primary shadow-lg' : 'bg-secondary text-text-secondary hover:bg-secondary/80'}`}
                    >
                        {tech}
                    </button>
                ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredProjects.map((project) => (
                    <div 
                        key={project.id} 
                        onClick={() => setSelectedProject(project)}
                        className="group cursor-pointer bg-primary rounded-2xl overflow-hidden shadow-premium hover:shadow-premium-hover transition-all duration-300 hover:-translate-y-1 border border-secondary"
                    >
                         <div className="h-56 overflow-hidden">
                            <img src={project.imageGallery[0] || 'https://picsum.photos/800/600'} alt={project.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
                         </div>
                         <div className="p-8">
                            <h3 className="text-2xl font-bold text-text-primary mb-2 group-hover:text-accent transition-colors">{project.title}</h3>
                            <p className="text-text-secondary mb-6 line-clamp-2">{project.description}</p>
                            <div className="flex flex-wrap gap-2">
                                {project.technologies.slice(0, 3).map((tech, i) => (
                                    <span key={i} className="text-xs font-bold uppercase tracking-wider text-text-secondary bg-secondary px-2 py-1 rounded">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </AnimatedSection>
        
        {/* Experience & Education - Timeline Style */}
        <AnimatedSection id="experience" title="Journey" subtitle="Timeline" className="bg-secondary/30">
            <div className="max-w-4xl mx-auto space-y-12">
                <div className="space-y-8">
                    <h3 className="text-2xl font-bold text-text-primary mb-8 border-b border-text-secondary/20 pb-4">Experience</h3>
                    {experience.map((exp) => (
                        <div key={exp.id} className="flex flex-col md:flex-row gap-4 md:gap-8">
                             <div className="md:w-1/4">
                                <span className="text-sm font-bold text-accent">{exp.startDate} — {exp.endDate}</span>
                             </div>
                             <div className="md:w-3/4">
                                <h4 className="text-xl font-bold text-text-primary">{exp.role}</h4>
                                <p className="text-text-secondary mb-2">{exp.organization}</p>
                                <p className="text-text-secondary leading-relaxed">{exp.description}</p>
                             </div>
                        </div>
                    ))}
                </div>
                 <div className="space-y-8">
                    <h3 className="text-2xl font-bold text-text-primary mb-8 border-b border-text-secondary/20 pb-4">Education</h3>
                    {education.map((edu) => (
                        <div key={edu.id} className="flex flex-col md:flex-row gap-4 md:gap-8">
                             <div className="md:w-1/4">
                                <span className="text-sm font-bold text-accent">{edu.period}</span>
                             </div>
                             <div className="md:w-3/4">
                                <h4 className="text-xl font-bold text-text-primary">{edu.degree}</h4>
                                <p className="text-text-secondary mb-2">{edu.institution}</p>
                                <p className="text-text-secondary text-sm">{edu.details}</p>
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        </AnimatedSection>
        
        {/* Memories Gallery */}
        {memories && memories.length > 0 && (
             <AnimatedSection id="memories" title="Life & Moments" subtitle="Gallery">
                <MemoriesSection memories={memories} />
             </AnimatedSection>
        )}

        {/* Notes & Resources */}
        {notes && notes.length > 0 && (
             <AnimatedSection id="notes" title="Resources" subtitle="Downloads" className="bg-secondary/30">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {notes.map((note) => (
                        <div key={note.id} className="bg-primary p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-secondary">
                             <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 bg-accent/10 text-accent rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                </div>
                                <button onClick={() => handleDownload(note)} className="text-sm font-bold text-accent hover:underline">Download</button>
                             </div>
                             <h3 className="font-bold text-lg mb-1">{note.title}</h3>
                             <p className="text-sm text-text-secondary">{note.description}</p>
                        </div>
                    ))}
                </div>
             </AnimatedSection>
        )}

        {profile.promoVideo && (
            <AnimatedSection id="promo" title="Showreel">
                <div className="aspect-w-16 aspect-h-9 max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-2xl">
                    {profile.promoVideo.startsWith('data:video') ? (
                         <video controls src={profile.promoVideo} className="w-full h-full object-cover"></video>
                    ) : (
                        <iframe src={profile.promoVideo.replace("watch?v=", "embed/")} className="w-full h-full" title="Promo"></iframe>
                    )}
                </div>
            </AnimatedSection>
        )}

      </main>
      
      <GuestbookWidget />
      
      <footer id="contact" className="bg-primary py-16 border-t border-secondary">
            <div className="container mx-auto px-6">
                <div className="flex flex-col items-center">
                    <SectionHeading title="Let's Connect" subtitle="Contact" />
                    <ContactForm />
                    <div className="mt-12 mb-8">
                        <SocialLinks links={profile.socialLinks} center={true}/>
                    </div>
                    <p className="text-text-secondary text-sm">
                        &copy; {new Date().getFullYear()} {profile.name}. 
                        <span className="mx-2">•</span>
                        <Link to="/admin" className="hover:text-highlight transition-colors">Admin Login</Link>
                    </p>
                </div>
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