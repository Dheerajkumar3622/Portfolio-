
import React, { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import ChatWidget from '../components/ChatWidget';
import MLSlider from '../components/MLSlider';
import SmartImage from '../components/SmartImage';
import VoiceControl from '../components/VoiceControl';
import SocialLinks from '../components/SocialLinks';
import ScrollPulley from '../components/ScrollPulley';
import TimelineItem from '../components/Timeline3D';
import ProjectDetailModal from '../components/ProjectDetailModal';
import BackToTopButton from '../components/BackToTopButton';
import ProTipWidget from '../components/ProTipWidget';
import type { Project } from '../types';

// --- Minimalist Project Card ---
const ProjectCard: React.FC<{ project: Project; index: number; onOpen: (p:Project) => void }> = ({ project, index, onOpen }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="group relative w-full mb-24 cursor-pointer"
            onClick={() => onOpen(project)}
        >
            <div className="flex flex-col md:flex-row gap-12 items-center">
                {/* 1. Visual Anchor (Image) */}
                <div className="w-full md:w-3/5 aspect-video overflow-hidden rounded-sm shadow-2xl relative">
                    <div className="absolute inset-0 bg-maroon-900/0 group-hover:bg-maroon-900/20 transition-colors duration-500 z-10 mix-blend-multiply"></div>
                    <SmartImage 
                        src={project.imageGallery[0]} 
                        alt={project.title} 
                        className="w-full h-full object-cover transform transition-transform duration-1000 ease-out group-hover:scale-105"
                    />
                </div>

                {/* 2. Content Block */}
                <div className="w-full md:w-2/5 flex flex-col justify-center">
                    <span className="text-gold font-mono text-xs uppercase tracking-widest mb-4">Case Study 0{index + 1}</span>
                    <h3 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-6 group-hover:text-maroon-600 dark:group-hover:text-maroon-500 transition-colors">
                        {project.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 font-light leading-relaxed mb-8 border-l-2 border-gray-300 dark:border-gray-800 pl-6 group-hover:border-gold transition-colors">
                        {project.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-3">
                         {project.technologies.slice(0, 3).map(tech => (
                             <span key={tech} className="text-xs font-bold text-gray-600 dark:text-gray-500 bg-gray-200 dark:bg-gray-900 px-3 py-1 rounded-sm uppercase tracking-wide">
                                 {tech}
                             </span>
                         ))}
                    </div>
                </div>
            </div>
            {/* Visual Separator */}
            <div className="absolute -bottom-12 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-800 to-transparent"></div>
        </motion.div>
    );
};


const UserView: React.FC = () => {
  const { portfolioData, joinCommunity } = usePortfolio();
  const { profile, projects, skills, education, experience, community } = portfolioData;
  const { toggleTheme, isDarkMode } = useTheme();
  
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [hasJoined, setHasJoined] = useState(false);

  const handleJoin = async () => {
      if(hasJoined) return;
      await joinCommunity();
      setHasJoined(true);
  };

  return (
      <div className="bg-gray-50 dark:bg-black text-gray-900 dark:text-white min-h-screen font-sans selection:bg-maroon-900 selection:text-white overflow-x-hidden transition-colors duration-500">
        
        <ScrollPulley />
        <BackToTopButton />

        {/* Theme Toggle - Iconic Button */}
        <button 
            onClick={toggleTheme}
            className="fixed top-6 left-6 z-[110] w-12 h-12 rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 shadow-xl flex items-center justify-center text-maroon-700 dark:text-gold hover:scale-110 transition-all duration-300"
            aria-label="Toggle Theme"
        >
            {isDarkMode ? (
                // Sun Icon
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                </svg>
            ) : (
                // Moon Icon
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.75 9.75 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                </svg>
            )}
        </button>

        {/* --- 1. HERO SECTION: Authority & Clarity --- */}
        <section className="min-h-screen flex items-center relative px-6 md:px-20 overflow-hidden pt-28 pb-20 md:pt-0 md:pb-0">
            {/* Added flex-col-reverse for Mobile Image Top, and lg:flex-row for Desktop Text Left / Image Right */}
            <div className="container mx-auto flex flex-col-reverse lg:flex-row items-center justify-between z-10 gap-12 lg:gap-20">
                
                {/* Text Content */}
                <div className="max-w-3xl flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <p className="text-gold font-mono text-sm tracking-[0.3em] uppercase mb-4">Portfolio of</p>
                        <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-bold tracking-tighter text-gray-900 dark:text-white mb-8 leading-none">
                            {profile.name.split(' ')[0]}<br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-gray-800 dark:from-gray-500 dark:to-gray-200">{profile.name.split(' ')[1]}</span>.
                        </h1>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="flex flex-col md:flex-row items-center lg:items-start gap-8 max-w-2xl"
                    >
                        <div className="w-12 h-1 bg-maroon-600 mt-3 md:mt-6 hidden md:block"></div>
                        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 font-light leading-relaxed">
                            {profile.title}. {profile.about}
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                        className="mt-12 flex gap-8 justify-center lg:justify-start"
                    >
                        <SocialLinks links={profile.socialLinks} />
                    </motion.div>
                </div>

                {/* Profile Picture */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    // Increased size boundaries and margin-right for desktop to clear Pulley
                    className="relative w-64 h-64 md:w-80 md:h-80 lg:w-[28rem] lg:h-[28rem] flex-shrink-0 lg:mr-16"
                >
                    <div className="absolute inset-0 rounded-full border border-gold/40 animate-pulse"></div>
                    <div className="absolute -inset-4 rounded-full border border-maroon-900/20 dark:border-maroon-500/20"></div>
                    <div className="absolute inset-0 rounded-full overflow-hidden shadow-2xl border-4 border-white dark:border-gray-900 bg-gray-200 dark:bg-gray-800">
                        <SmartImage
                            src={profile.profilePicture}
                            alt={profile.name}
                            className="w-full h-full object-cover"
                            fallbackText={profile.name.charAt(0)}
                        />
                    </div>
                </motion.div>
            </div>
            
            {/* Subtle Abstract Background Element - "The Void" */}
            <div className="absolute top-0 right-0 w-[50vw] h-full bg-gradient-to-l from-maroon-900/5 dark:from-maroon-900/10 to-transparent pointer-events-none"></div>
        </section>

        {/* --- 2. COMMUNITY: Social Proof (Psychology) --- */}
        <section className="py-24 border-y border-gray-200 dark:border-white/5 bg-gray-100 dark:bg-gray-900/30">
            <div className="container mx-auto px-6 md:px-20 flex flex-col md:flex-row items-center justify-between">
                <div>
                    <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-2">The Network</h3>
                    <p className="text-gray-500 max-w-md">{community?.description || "Join the elite circle of engineers."}</p>
                </div>
                <div className="mt-8 md:mt-0 flex items-center gap-8">
                     <div className="text-right">
                         <div className="text-5xl font-mono font-bold text-gray-900 dark:text-white">{community?.memberCount}</div>
                         <div className="text-xs uppercase tracking-widest text-maroon-600 dark:text-maroon-500">Active Members</div>
                    </div>
                     <button 
                        onClick={handleJoin}
                        disabled={hasJoined}
                        className={`px-8 py-3 text-sm font-bold uppercase tracking-widest border transition-all ${hasJoined ? 'border-green-600 text-green-600 cursor-default' : 'border-gold text-gold hover:bg-gold hover:text-black'}`}
                     >
                         {hasJoined ? "Member" : "Join"}
                     </button>
                </div>
            </div>
        </section>

        {/* --- 3. WORK: Focus & Quality --- */}
        <section className="py-32 px-6 md:px-20 bg-white dark:bg-black transition-colors duration-500" id="projects">
             <div className="mb-32">
                <h2 className="text-sm font-mono text-gray-400 uppercase tracking-[0.2em] mb-4">Selected Works</h2>
                <div className="h-px w-full bg-gray-200 dark:bg-gray-800"></div>
             </div>

             <div className="container mx-auto max-w-6xl">
                {projects.map((project, i) => (
                    <ProjectCard key={project.id} project={project} index={i} onOpen={setSelectedProject} />
                ))}
             </div>
        </section>

        {/* --- 4. INTERACTION: The Future --- */}
        <section className="py-32 bg-gray-100 dark:bg-zinc-900/20 relative overflow-hidden transition-colors duration-500">
             <div className="container mx-auto px-6 text-center">
                 <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-12">Interactive Gallery</h2>
                 <MLSlider 
                    items={projects} 
                    renderItem={(project) => (
                        <div className="relative w-full h-full flex items-center justify-center">
                            <SmartImage src={project.imageGallery[0]} className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm" />
                            <div className="relative z-10 p-8 border border-white/20 bg-white/80 dark:bg-black/80 backdrop-blur-sm max-w-md shadow-2xl">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{project.title}</h3>
                            </div>
                        </div>
                    )}
                />
             </div>
        </section>

        {/* --- 5. TIMELINE: Legacy --- */}
        <section className="py-32 px-6 md:px-20 bg-white dark:bg-black relative transition-colors duration-500" id="experience">
            <div className="container mx-auto max-w-5xl">
                 <div className="text-center mb-24">
                    <h2 className="text-4xl font-display text-gray-900 dark:text-white mb-2">Timeline</h2>
                    <div className="w-12 h-1 bg-maroon-600 dark:bg-maroon-800 mx-auto"></div>
                 </div>
                 
                 <div className="space-y-4">
                    <div className="text-center mb-12"><span className="text-gold font-mono text-sm uppercase">Professional Experience</span></div>
                    {experience.map((exp, index) => (
                        <TimelineItem key={exp.id} index={index} title={exp.role} subtitle={exp.organization} date={`${exp.startDate} - ${exp.endDate}`} description={exp.description} />
                    ))}
                    
                    <div className="text-center my-12 pt-12"><span className="text-gold font-mono text-sm uppercase">Academic Background</span></div>
                    {education.map((edu, index) => (
                        <TimelineItem key={edu.id} index={index + 10} title={edu.degree} subtitle={edu.institution} date={edu.period} description={edu.details} />
                    ))}
                 </div>
            </div>
        </section>

        {/* --- 6. FOOTER: Minimalist --- */}
        <footer className="bg-gray-100 dark:bg-zinc-950 py-24 border-t border-gray-200 dark:border-zinc-900 text-center transition-colors duration-500">
            <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-8">{profile.name}</h2>
            <div className="flex justify-center gap-8 mb-8">
                {profile.socialLinks.map(link => (
                    <a key={link.id} href={link.url} className="text-gray-500 hover:text-maroon-600 dark:hover:text-white transition-colors text-sm uppercase tracking-wider">{link.platform}</a>
                ))}
            </div>
            <p className="text-gray-600 dark:text-gray-700 text-xs font-mono">
                &copy; {new Date().getFullYear()} Designed by AI. <a href="#/admin" className="hover:text-gray-900 dark:hover:text-gray-500">Admin</a>
            </p>
        </footer>

        {/* Floating Widgets - Positioned Left to avoid Pulley */}
        <ChatWidget />
        <ProTipWidget />
        <VoiceControl onNavigate={() => {}} />
        
        {/* Modals */}
        {selectedProject && <ProjectDetailModal project={selectedProject} onClose={() => setSelectedProject(null)} />}

      </div>
  );
};

export default UserView;
