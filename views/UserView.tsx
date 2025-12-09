
import React, { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { useTheme } from '../context/ThemeContext';
import { motion, useScroll, useTransform } from 'framer-motion';
import ChatWidget from '../components/ChatWidget';
import SmartImage from '../components/SmartImage';
import SocialLinks from '../components/SocialLinks';
import ScrollPulley from '../components/ScrollPulley';
import TimelineItem from '../components/Timeline3D';
import ProjectDetailModal from '../components/ProjectDetailModal';
import BackToTopButton from '../components/BackToTopButton';
import MemoriesSection from '../components/MemoriesSection';
import SkillBar from '../components/SkillBar';
import NavBar from '../components/NavBar';
import { PerspectiveWrapper } from '../components/PerspectiveWrapper'; 
import type { Project } from '../types';

// --- Rounded Project Card ---
const ProjectCard: React.FC<{ project: Project; index: number; onOpen: (p:Project) => void }> = ({ project, index, onOpen }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 100, rotateX: 10 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: index * 0.1, type: "spring", bounce: 0.4 }}
            className="group relative w-full mb-24 cursor-pointer perspective-1000"
            onClick={() => onOpen(project)}
        >
            <div className="flex flex-col md:flex-row gap-12 items-center transform transition-transform duration-500 group-hover:scale-[1.02] group-hover:rotate-1">
                {/* 1. Visual Anchor (Image) - Rounded squircle shape */}
                {/* Changed bg to neutral so contained image looks good */}
                <div className="w-full md:w-3/5 aspect-video overflow-hidden rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] relative transition-all duration-500 group-hover:shadow-[0_30px_60px_-15px_rgba(197,160,89,0.3)] bg-gray-100 dark:bg-zinc-900/50">
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500 z-10 pointer-events-none"></div>
                    {/* Changed object-cover to object-contain */}
                    <SmartImage 
                        src={project.imageGallery[0]} 
                        alt={project.title} 
                        className="w-full h-full object-contain transform transition-transform duration-1000 ease-out group-hover:scale-105 p-2"
                    />
                </div>

                {/* 2. Content Block */}
                <div className="w-full md:w-2/5 flex flex-col justify-center text-left pl-4">
                    <span className="text-gold font-mono text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-8 h-[1px] bg-gold"></span>
                        0{index + 1}
                    </span>
                    <h3 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-4 group-hover:text-maroon-600 dark:group-hover:text-gold transition-colors">
                        {project.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 font-light leading-relaxed mb-6">
                        {project.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                         {project.technologies.slice(0, 3).map(tech => (
                             <span key={tech} className="text-[10px] font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/10 px-4 py-2 rounded-full uppercase tracking-wide">
                                 {tech}
                             </span>
                         ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};


const UserView: React.FC = () => {
  const { portfolioData, joinCommunity } = usePortfolio();
  const { profile, projects, skills, education, experience, community, memories } = portfolioData;
  
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [hasJoined, setHasJoined] = useState(false);

  // Parallax Setup
  const { scrollY } = useScroll();
  const blobY1 = useTransform(scrollY, [0, 2000], [0, 600]);
  const blobY2 = useTransform(scrollY, [0, 2000], [0, -400]);

  const handleJoin = async () => {
      if(hasJoined) return;
      await joinCommunity();
      setHasJoined(true);
  };

  return (
      <div className="bg-[#fcfcfc] dark:bg-[#050505] text-gray-900 dark:text-white min-h-screen font-sans selection:bg-maroon-900 selection:text-white overflow-x-hidden transition-colors duration-500 relative">
        
        {/* --- Ambient Background Blobs (Parallax) --- */}
        <motion.div style={{ y: blobY1 }} className="fixed top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-purple-900/10 dark:bg-purple-900/20 rounded-full blur-[150px] pointer-events-none z-0" />
        <motion.div style={{ y: blobY2 }} className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-gold/10 dark:bg-gold/10 rounded-full blur-[120px] pointer-events-none z-0" />

        {/* --- FIXED ELEMENTS --- */}
        <NavBar />
        <ScrollPulley />
        <BackToTopButton />
        <ChatWidget />

        {/* --- SCROLLABLE CONTENT WITH 3D ANIMATION --- */}
        <PerspectiveWrapper>
            {/* --- 1. HERO SECTION --- */}
            <section className="min-h-screen flex items-center relative px-6 md:px-20 pt-40 pb-20 md:pt-28 md:pb-0 z-10">
                <div className="container mx-auto flex flex-col-reverse lg:flex-row items-center justify-between gap-16">
                    
                    {/* Text Content */}
                    <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left max-w-3xl">
                        <motion.div 
                            initial={{ opacity: 0, x: -50, rotateY: 15 }}
                            animate={{ opacity: 1, x: 0, rotateY: 0 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            style={{ transformStyle: 'preserve-3d' }}
                        >
                            <span className="inline-block py-1 px-3 rounded-full bg-maroon-50 dark:bg-maroon-900/30 text-maroon-700 dark:text-maroon-200 text-xs font-bold tracking-widest mb-6 border border-maroon-100 dark:border-maroon-800">
                                PORTFOLIO 2024
                            </span>
                            <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-bold tracking-tight text-gray-900 dark:text-white mb-8 leading-[0.85] drop-shadow-2xl">
                                {profile.name}
                            </h1>
                            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 font-light leading-relaxed mb-10 max-w-2xl">
                                {profile.title}.<br/>
                                <span className="opacity-70 text-base">{profile.about}</span>
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, type: "spring" }}
                            className="flex gap-6 justify-center lg:justify-start"
                        >
                            <SocialLinks links={profile.socialLinks} />
                        </motion.div>
                    </div>

                    {/* Profile Picture - Organic Shape */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, rotate: -15 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ duration: 1.2, type: 'spring', bounce: 0.5 }}
                        className="relative flex-shrink-0 lg:mr-16"
                    >
                        {/* Decorative ring */}
                        <div className="absolute -inset-4 border border-gray-200 dark:border-gray-800 rounded-[3rem] rotate-6"></div>
                        
                        <div className="w-64 h-64 md:w-96 md:h-96 lg:w-[32rem] lg:h-[32rem] rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10 hover:scale-[1.02] transition-transform duration-500 bg-gray-200 dark:bg-zinc-800">
                            <SmartImage
                                src={profile.profilePicture}
                                alt={profile.name}
                                className="w-full h-full object-cover"
                                fallbackText={profile.name.charAt(0)}
                            />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* --- 2. COMMUNITY (Pill) --- */}
            <section className="py-12 z-10 relative">
                <div className="container mx-auto px-6 md:px-20">
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        className="bg-white/50 dark:bg-white/5 backdrop-blur-lg border border-gray-200 dark:border-white/10 rounded-full p-2 pl-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl"
                    >
                         <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">{community?.description || "Join the network."}</p>
                         <div className="flex items-center gap-6 pr-2">
                            <span className="font-mono text-gray-900 dark:text-white font-bold">{community?.memberCount} Members</span>
                            <button 
                                onClick={handleJoin}
                                disabled={hasJoined}
                                className={`text-xs font-bold uppercase tracking-widest px-8 py-4 rounded-full transition-all shadow-lg ${
                                    hasJoined 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-black text-white dark:bg-white dark:text-black hover:scale-110 active:scale-95'
                                }`}
                            >
                                {hasJoined ? "Joined" : "Join Group"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* --- 3. SKILLS --- */}
            <section className="py-32 px-6 md:px-20 z-10 relative" id="skills">
                <div className="container mx-auto max-w-6xl">
                    <div className="mb-16 text-center lg:text-left">
                        <h2 className="text-3xl md:text-5xl font-display font-bold text-gray-900 dark:text-white mb-4">Technical Arsenal</h2>
                        <div className="h-1.5 w-24 bg-gold rounded-full lg:mx-0 mx-auto"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-10">
                        {skills.map((skill) => (
                            <SkillBar key={skill.id} name={skill.name} level={skill.level} />
                        ))}
                    </div>
                </div>
            </section>

            {/* --- 4. WORK --- */}
            <section className="py-32 px-6 md:px-20 z-10 relative" id="projects">
                <div className="container mx-auto max-w-6xl">
                    <div className="mb-32 text-center">
                        <span className="text-gold font-mono text-sm uppercase tracking-widest mb-2 block">Case Studies</span>
                        <h2 className="text-5xl md:text-7xl font-display font-bold">Selected Works</h2>
                    </div>
                    {projects.map((project, i) => (
                        <ProjectCard key={project.id} project={project} index={i} onOpen={setSelectedProject} />
                    ))}
                </div>
            </section>

            {/* --- 5. MEMORIES --- */}
            <section className="py-32 relative z-10">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">Memories</h2>
                        <p className="text-gray-500 dark:text-gray-400">Captured moments from the journey.</p>
                    </div>
                    <MemoriesSection memories={memories} />
                </div>
            </section>

            {/* --- 6. TIMELINE --- */}
            <section className="py-32 px-6 md:px-20 relative z-10" id="experience">
                <div className="container mx-auto max-w-5xl">
                    <div className="mb-24 text-center">
                        <h2 className="text-5xl font-display font-bold text-gray-900 dark:text-white">Experience</h2>
                    </div>
                    
                    <div className="space-y-4">
                        {experience.map((exp, index) => (
                            <TimelineItem key={exp.id} index={index} title={exp.role} subtitle={exp.organization} date={`${exp.startDate} - ${exp.endDate}`} description={exp.description} />
                        ))}
                        
                        <div className="py-16 flex justify-center items-center opacity-30">
                            <div className="h-2 w-2 rounded-full bg-gray-500 mx-2"></div>
                            <div className="h-2 w-2 rounded-full bg-gray-500 mx-2"></div>
                            <div className="h-2 w-2 rounded-full bg-gray-500 mx-2"></div>
                        </div>

                        {education.map((edu, index) => (
                            <TimelineItem key={edu.id} index={index + 10} title={edu.degree} subtitle={edu.institution} date={edu.period} description={edu.details} />
                        ))}
                    </div>
                </div>
            </section>

            {/* --- 7. FOOTER --- */}
            <footer className="bg-gray-50 dark:bg-[#080808] py-32 text-center relative z-10 rounded-t-[3rem] mt-20">
                <h2 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-8">{profile.name}</h2>
                <div className="flex justify-center gap-8 mb-12">
                    {profile.socialLinks.map(link => (
                        <a key={link.id} href={link.url} className="text-gray-400 hover:text-black dark:hover:text-white transition-colors text-xs uppercase tracking-widest">{link.platform}</a>
                    ))}
                </div>
                <p className="text-gray-400 text-xs">
                    &copy; {new Date().getFullYear()} <a href="#/admin" className="hover:text-gray-900 dark:hover:text-white border-b border-transparent hover:border-gray-500 transition-colors">Admin Access</a>
                </p>
            </footer>
        </PerspectiveWrapper>
        
        {/* Modals */}
        {selectedProject && <ProjectDetailModal project={selectedProject} onClose={() => setSelectedProject(null)} />}

      </div>
  );
};

export default UserView;
