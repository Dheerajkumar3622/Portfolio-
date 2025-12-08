
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
import type { Project } from '../types';

// --- Parallax Card Component ---
const ProjectCard: React.FC<{ project: Project; index: number; total: number; onOpen: (p:Project) => void }> = ({ project, index, total, onOpen }) => {
    // Each card is sticky. We increase top offset per index to create stack effect.
    const topOffset = 120 + index * 50; 
    
    return (
        <motion.div 
            className="sticky mb-32 w-full max-w-5xl mx-auto rounded-xl overflow-hidden shadow-premium"
            style={{ 
                top: topOffset,
                zIndex: index,
            }}
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
        >
            <div className="relative h-[600px] flex flex-col md:flex-row group border border-maroon-900/30 dark:border-white/10 bg-luxury-black">
                {/* Image Section */}
                <div className="md:w-3/5 h-64 md:h-full relative overflow-hidden">
                    <SmartImage 
                        src={project.imageGallery[0]} 
                        alt={project.title} 
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 filter grayscale group-hover:grayscale-0"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-luxury-black via-transparent to-transparent opacity-80 md:opacity-100"></div>
                </div>
                
                {/* Content Section */}
                <div className="md:w-2/5 p-10 flex flex-col justify-center bg-white dark:bg-zinc-900 md:bg-luxury-black/95 backdrop-blur-md relative overflow-hidden">
                    {/* Decorative Maroon Line */}
                    <div className="absolute top-0 left-0 w-1 h-full bg-maroon-700"></div>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-maroon-700 to-transparent"></div>

                    <h2 className="text-4xl font-display font-bold text-maroon-900 dark:text-white mb-2 uppercase tracking-widest">{project.title}</h2>
                    <div className="w-16 h-0.5 bg-gold mb-6"></div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-8 font-light leading-relaxed font-sans">{project.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-8">
                        {project.technologies.slice(0,4).map((t: string) => (
                            <span key={t} className="px-3 py-1 border border-gold/30 text-gold text-xs font-serif uppercase tracking-wider rounded-sm">{t}</span>
                        ))}
                    </div>
                    
                    <div className="flex gap-4">
                         <button 
                            onClick={() => onOpen(project)}
                            className="group relative px-8 py-3 bg-transparent overflow-hidden border border-maroon-700 text-maroon-700 dark:text-white dark:border-white transition-all hover:border-gold"
                         >
                            <span className="absolute inset-0 w-0 bg-maroon-700 transition-all duration-[250ms] ease-out group-hover:w-full"></span>
                            <span className="relative text-sm font-bold uppercase tracking-widest group-hover:text-white">View Case Study</span>
                         </button>
                    </div>
                </div>
            </div>
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
      <div className="bg-base-100 text-text-primary min-h-screen font-sans selection:bg-gold selection:text-black overflow-x-hidden transition-colors duration-700">
        
        <ScrollPulley />

        {/* Theme Toggle - MOVED TO TOP LEFT */}
        <button 
            onClick={toggleTheme}
            className="fixed top-6 left-6 z-[110] bg-white/10 backdrop-blur-md p-3 rounded-full border border-white/20 hover:border-gold hover:text-gold transition-all duration-300 text-xl shadow-lg"
            aria-label="Toggle Theme"
        >
            {isDarkMode ? '☀️' : '🌙'}
        </button>

        {/* Hero Section */}
        <section className="h-screen flex items-center justify-center relative overflow-hidden bg-black text-white">
             {/* Dynamic Gradient Background - Maroon & Black */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(128,0,0,0.3)_0%,_rgba(0,0,0,1)_80%)] animate-pulse-slow"></div>
            
            {/* Grid Overlay */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

            <div className="z-10 text-center px-4 max-w-6xl relative">
                {/* Decorative Elements */}
                <motion.div 
                    initial={{ height: 0 }} animate={{ height: 100 }} 
                    className="absolute -top-32 left-1/2 w-px bg-gradient-to-b from-transparent to-gold"
                ></motion.div>

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "anticipate" }}
                    className="mb-8"
                >
                     {profile.profilePicture && (
                        <div className="w-48 h-48 mx-auto relative group">
                            <div className="absolute inset-0 bg-maroon-600 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
                            <img 
                                src={profile.profilePicture} 
                                alt={profile.name} 
                                className="w-full h-full object-cover rounded-full border-2 border-white/10 relative z-10 grayscale hover:grayscale-0 transition-all duration-700" 
                            />
                        </div>
                    )}
                </motion.div>

                <motion.h1 
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 1 }}
                    className="text-6xl md:text-9xl font-display font-bold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white via-gray-200 to-gray-600 drop-shadow-lg"
                >
                    {profile.name}
                </motion.h1>
                
                <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: "100px" }} 
                    transition={{ delay: 1, duration: 1 }}
                    className="h-1 bg-maroon-600 mx-auto mb-6"
                ></motion.div>

                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-xl md:text-2xl text-gold font-serif italic tracking-wide"
                >
                    {profile.title}
                </motion.p>
                
                 <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="mt-16"
                 >
                     <a href="#projects" className="text-xs font-bold tracking-[0.3em] uppercase text-white/50 hover:text-white border border-white/20 hover:border-white px-6 py-3 rounded-sm transition-all">
                         Discover Portfolio
                     </a>
                 </motion.div>
            </div>
        </section>

        {/* Community Section - Luxury Banner */}
        <section className="py-20 bg-gradient-to-r from-black via-maroon-900 to-black border-y border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
                <div className="md:w-2/3">
                    <h3 className="text-3xl font-display text-white mb-2">The <span className="text-gold">Network</span></h3>
                    <p className="text-gray-400 font-light text-lg">{community?.description || "Join our network of elite engineers."}</p>
                </div>
                <div className="md:w-1/3 flex items-center justify-end gap-6">
                    <div className="text-right">
                         <span className="block text-5xl font-display font-bold text-white">{community?.memberCount}</span>
                         <span className="text-xs uppercase tracking-widest text-maroon-500 font-bold">Members Active</span>
                    </div>
                     <button 
                        onClick={handleJoin}
                        disabled={hasJoined}
                        className={`h-16 w-16 rounded-full flex items-center justify-center border transition-all duration-500 ${hasJoined ? 'bg-green-900 border-green-700 text-white' : 'border-gold text-gold hover:bg-gold hover:text-black'}`}
                     >
                         {hasJoined ? "✓" : "+"}
                     </button>
                </div>
            </div>
        </section>

        {/* Project Gallery - Dark & Sleek */}
        <section className="py-32 px-4 bg-base-100 relative" id="projects">
             {/* Subtle background text */}
             <div className="absolute top-20 left-0 w-full text-center pointer-events-none opacity-[0.03] text-9xl font-display font-bold uppercase tracking-tighter">
                 Portfolio
             </div>

             <div className="container mx-auto mb-24 text-center">
                <h2 className="text-5xl font-display font-bold mb-4 text-primary">Selected Works</h2>
                <div className="w-24 h-1 bg-maroon-600 mx-auto"></div>
             </div>

             <div className="relative">
                {projects.map((project, i) => (
                    <ProjectCard key={project.id} project={project} index={i} total={projects.length} onOpen={setSelectedProject} />
                ))}
             </div>
        </section>

        {/* AI Gesture Slider */}
        <section className="py-32 bg-secondary relative">
             <div className="container mx-auto px-6">
                 <div className="text-center mb-16">
                     <h2 className="text-3xl font-display font-bold text-text-primary">Interactive Showcase</h2>
                     <p className="text-gold italic font-serif">Control with gestures</p>
                 </div>
                 <MLSlider 
                    items={projects} 
                    renderItem={(project) => (
                        <div className="flex flex-col items-center justify-center h-full text-center relative z-10 group">
                            <SmartImage src={project.imageGallery[0]} className="absolute inset-0 w-full h-full object-cover opacity-40 blur-sm group-hover:blur-0 transition-all duration-700" />
                            <div className="absolute inset-0 bg-maroon-900/40 mix-blend-multiply"></div>
                            <div className="relative z-20 border border-white/20 p-8 backdrop-blur-md bg-black/40 max-w-lg">
                                <h3 className="text-4xl font-display font-bold text-white mb-2">{project.title}</h3>
                                <div className="w-full h-px bg-gold/50 my-4"></div>
                                <p className="text-gray-200 font-light">{project.description}</p>
                            </div>
                        </div>
                    )}
                />
             </div>
        </section>

        {/* Professional Journey (3D Scrolling) */}
        <section className="py-32 bg-luxury-black relative text-white" id="experience">
            <div className="absolute inset-0 bg-gradient-to-b from-black via-maroon-900/10 to-black"></div>
            <div className="container mx-auto px-6 relative z-10">
                 <div className="text-center mb-24">
                    <h2 className="text-5xl font-display text-white mb-4">Timeline</h2>
                    <p className="text-gold font-serif italic text-xl">Legacy & Education</p>
                 </div>
                 
                 <div className="relative wrap overflow-hidden p-4 md:p-10 h-full">
                    {/* Vertical Line - Gold */}
                    <div className="absolute border-opacity-20 border-gold h-full border left-1/2 transform -translate-x-1/2 hidden md:block shadow-[0_0_15px_rgba(197,160,89,0.3)]"></div>
                    
                    {/* Experience Section */}
                    <div className="mb-20">
                        <div className="flex justify-center mb-12">
                             <h3 className="text-2xl font-display text-gold border-b-2 border-gold pb-2 px-8 uppercase tracking-widest">Experience</h3>
                        </div>
                        {experience.map((exp, index) => (
                            <TimelineItem 
                                key={exp.id}
                                index={index}
                                title={exp.role}
                                subtitle={exp.organization}
                                date={`${exp.startDate} - ${exp.endDate}`}
                                description={exp.description}
                            />
                        ))}
                    </div>

                    {/* Education Section */}
                    <div>
                         <div className="flex justify-center mb-12">
                             <h3 className="text-2xl font-display text-gold border-b-2 border-gold pb-2 px-8 uppercase tracking-widest">Education</h3>
                        </div>
                         {education.map((edu, index) => (
                            <TimelineItem 
                                key={edu.id}
                                index={experience.length + index} // Continue offset
                                title={edu.degree}
                                subtitle={edu.institution}
                                date={edu.period}
                                description={edu.details}
                            />
                        ))}
                    </div>
                 </div>
            </div>
        </section>

        {/* About / Skills */}
        <section className="py-32 bg-white dark:bg-black text-black dark:text-white relative z-20" id="about">
            <div className="container mx-auto px-6 grid md:grid-cols-2 gap-20">
                <div>
                    <h2 className="text-6xl font-display font-bold mb-10 text-maroon-800 dark:text-white leading-none">
                        About<br/>The<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-maroon-600 to-gold">Architect</span>
                    </h2>
                    <p className="text-xl leading-loose text-gray-700 dark:text-gray-300 font-serif border-l-4 border-gold pl-6 mb-8">
                        {profile.about}
                    </p>
                    <div className="mt-12">
                        <SocialLinks links={profile.socialLinks} />
                    </div>
                </div>
                <div>
                    <h2 className="text-4xl font-display font-bold mb-10 border-b border-gray-200 dark:border-gray-800 pb-4">Technical Arsenal</h2>
                    <div className="grid grid-cols-1 gap-6">
                        {skills.map(s => (
                            <div key={s.id} className="group relative">
                                <div className="flex justify-between items-end mb-2">
                                     <span className="font-bold text-lg font-display tracking-wide group-hover:text-maroon-600 transition-colors">{s.name}</span>
                                     <span className="text-sm text-gray-400 font-mono">{s.level}%</span>
                                </div>
                                <div className="w-full h-1 bg-gray-200 dark:bg-gray-800">
                                    <div className="h-full bg-maroon-600 group-hover:bg-gold transition-all duration-1000 ease-out" style={{ width: `${s.level}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>

        {/* Footer - Minimal Luxury */}
        <footer className="bg-black text-white py-20 text-center border-t border-white/10">
            <h2 className="text-3xl font-display font-bold mb-6">{profile.name}</h2>
            <div className="flex justify-center space-x-8 mb-8 text-gray-500">
                {profile.socialLinks.map(link => (
                    <a key={link.id} href={link.url} className="hover:text-gold transition-colors text-sm uppercase tracking-widest">{link.platform}</a>
                ))}
            </div>
            <p className="text-gray-600 text-xs font-mono">
                &copy; {new Date().getFullYear()} All Rights Reserved. <br/>
                <a href="#/admin" className="hover:text-white transition mt-4 inline-block opacity-50">Admin Access</a>
            </p>
        </footer>

        {/* Floating Widgets */}
        <ChatWidget />
        <VoiceControl onNavigate={() => {}} />
        
        {/* Modals */}
        {selectedProject && <ProjectDetailModal project={selectedProject} onClose={() => setSelectedProject(null)} />}

      </div>
  );
};

export default UserView;
