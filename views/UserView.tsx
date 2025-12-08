
import React, { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import ChatWidget from '../components/ChatWidget';
import SmartImage from '../components/SmartImage';
import VoiceControl from '../components/VoiceControl';
import SocialLinks from '../components/SocialLinks';
import ScrollPulley from '../components/ScrollPulley';
import TimelineItem from '../components/Timeline3D';
import ProjectDetailModal from '../components/ProjectDetailModal';
import BackToTopButton from '../components/BackToTopButton';
import ProTipWidget from '../components/ProTipWidget';
import MemoriesSection from '../components/MemoriesSection';
import SkillBar from '../components/SkillBar';
import NavBar from '../components/NavBar';
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
                <div className="w-full md:w-3/5 aspect-video overflow-hidden rounded-sm shadow-xl relative">
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500 z-10"></div>
                    <SmartImage 
                        src={project.imageGallery[0]} 
                        alt={project.title} 
                        className="w-full h-full object-cover transform transition-transform duration-1000 ease-out group-hover:scale-105"
                    />
                </div>

                {/* 2. Content Block */}
                <div className="w-full md:w-2/5 flex flex-col justify-center text-left">
                    <span className="text-gold font-mono text-xs uppercase tracking-widest mb-4">0{index + 1}</span>
                    <h3 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-4 group-hover:text-maroon-600 dark:group-hover:text-gold transition-colors">
                        {project.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 font-light leading-relaxed mb-6">
                        {project.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                         {project.technologies.slice(0, 3).map(tech => (
                             <span key={tech} className="text-[10px] font-bold text-gray-500 border border-gray-200 dark:border-gray-800 px-2 py-1 rounded-sm uppercase tracking-wide">
                                 {tech}
                             </span>
                         ))}
                    </div>
                </div>
            </div>
            {/* Minimal Separator */}
            <div className="absolute -bottom-12 left-0 w-full h-px bg-gray-100 dark:bg-gray-900"></div>
        </motion.div>
    );
};


const UserView: React.FC = () => {
  const { portfolioData, joinCommunity } = usePortfolio();
  const { profile, projects, skills, education, experience, community, memories } = portfolioData;
  const { isDarkMode } = useTheme(); // Hook needed for conditional classes if any
  
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [hasJoined, setHasJoined] = useState(false);

  const handleJoin = async () => {
      if(hasJoined) return;
      await joinCommunity();
      setHasJoined(true);
  };

  return (
      <div className="bg-white dark:bg-black text-gray-900 dark:text-white min-h-screen font-sans selection:bg-maroon-900 selection:text-white overflow-x-hidden transition-colors duration-500">
        
        <NavBar />
        <ScrollPulley />
        <BackToTopButton />

        {/* --- 1. HERO SECTION --- */}
        {/* Added pt-20 to account for fixed navbar */}
        <section className="min-h-screen flex items-center relative px-6 md:px-20 pt-32 pb-20 md:pt-20 md:pb-0">
            <div className="container mx-auto flex flex-col-reverse lg:flex-row items-center justify-between z-10 gap-16">
                
                {/* Text Content */}
                <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left max-w-3xl">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight text-gray-900 dark:text-white mb-6 leading-[0.9]">
                            {profile.name}
                        </h1>
                        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 font-light leading-relaxed mb-8 max-w-2xl">
                           {profile.title}. {profile.about}
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex gap-6 justify-center lg:justify-start"
                    >
                        <SocialLinks links={profile.socialLinks} />
                    </motion.div>
                </div>

                {/* Profile Picture */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    className="relative flex-shrink-0 lg:mr-16"
                >
                    <div className="w-56 h-56 md:w-80 md:h-80 lg:w-[30rem] lg:h-[30rem] rounded-full overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800">
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

        {/* --- 2. COMMUNITY (Simple Bar) --- */}
        <section className="py-12 border-y border-gray-100 dark:border-gray-900">
            <div className="container mx-auto px-6 md:px-20 flex flex-col md:flex-row items-center justify-between gap-6">
                <p className="text-gray-500 dark:text-gray-400 text-sm">{community?.description || "Join the network."}</p>
                <div className="flex items-center gap-6">
                     <span className="font-mono text-gray-900 dark:text-white font-bold">{community?.memberCount} Members</span>
                     <button 
                        onClick={handleJoin}
                        disabled={hasJoined}
                        className={`text-xs font-bold uppercase tracking-widest px-6 py-3 border transition-all ${
                            hasJoined 
                            ? 'border-green-600 text-green-600' 
                            : 'border-gray-900 dark:border-white text-gray-900 dark:text-white hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black'
                        }`}
                     >
                         {hasJoined ? "Joined" : "Join Group"}
                     </button>
                </div>
            </div>
        </section>

        {/* --- 3. SKILLS (Technical Arsenal) --- */}
        <section className="py-24 px-6 md:px-20 bg-gray-50 dark:bg-zinc-900/20 border-b border-gray-200 dark:border-gray-800" id="skills">
            <div className="container mx-auto max-w-6xl">
                <div className="mb-12 text-center lg:text-left">
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">Technical Arsenal</h2>
                    <div className="h-1 w-16 bg-maroon-600 dark:bg-gold lg:mx-0 mx-auto"></div>
                </div>

                {/* Compact Grid Layout: 3 Columns on Large screens */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-6">
                    {skills.map((skill) => (
                        <SkillBar key={skill.id} name={skill.name} level={skill.level} />
                    ))}
                </div>
            </div>
        </section>

        {/* --- 4. WORK --- */}
        <section className="py-32 px-6 md:px-20" id="projects">
             <div className="container mx-auto max-w-6xl">
                <div className="mb-24 text-center">
                    <h2 className="text-3xl font-display font-bold mb-4">Selected Works</h2>
                    <p className="text-gray-500 font-light">A collection of engineering challenges.</p>
                </div>
                {projects.map((project, i) => (
                    <ProjectCard key={project.id} project={project} index={i} onOpen={setSelectedProject} />
                ))}
             </div>
        </section>

        {/* --- 5. MEMORIES --- */}
        <section className="py-32 bg-gray-50 dark:bg-zinc-900/30">
             <div className="container mx-auto px-6">
                 <div className="text-center mb-16">
                     <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-4">Memories</h2>
                     <p className="text-gray-500 dark:text-gray-400">Captured moments from the journey.</p>
                 </div>
                 <MemoriesSection memories={memories} />
             </div>
        </section>

        {/* --- 6. TIMELINE --- */}
        <section className="py-32 px-6 md:px-20" id="experience">
            <div className="container mx-auto max-w-5xl">
                 <div className="mb-20 text-center">
                    <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Experience</h2>
                 </div>
                 
                 <div className="space-y-4">
                    {experience.map((exp, index) => (
                        <TimelineItem key={exp.id} index={index} title={exp.role} subtitle={exp.organization} date={`${exp.startDate} - ${exp.endDate}`} description={exp.description} />
                    ))}
                    
                    <div className="py-12 flex justify-center items-center">
                        <div className="h-px bg-gray-200 dark:bg-gray-800 w-full max-w-xs"></div>
                    </div>

                    {education.map((edu, index) => (
                        <TimelineItem key={edu.id} index={index + 10} title={edu.degree} subtitle={edu.institution} date={edu.period} description={edu.details} />
                    ))}
                 </div>
            </div>
        </section>

        {/* --- 7. FOOTER --- */}
        <footer className="bg-white dark:bg-black py-24 border-t border-gray-100 dark:border-gray-900 text-center transition-colors duration-500">
            <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-8">{profile.name}</h2>
            <div className="flex justify-center gap-8 mb-8">
                {profile.socialLinks.map(link => (
                    <a key={link.id} href={link.url} className="text-gray-400 hover:text-black dark:hover:text-white transition-colors text-xs uppercase tracking-widest">{link.platform}</a>
                ))}
            </div>
            <p className="text-gray-400 text-xs">
                &copy; {new Date().getFullYear()} <a href="#/admin" className="hover:text-gray-900 dark:hover:text-white">Admin Access</a>
            </p>
        </footer>

        {/* Floating Widgets */}
        <ChatWidget />
        <ProTipWidget />
        <VoiceControl onNavigate={() => {}} />
        
        {/* Modals */}
        {selectedProject && <ProjectDetailModal project={selectedProject} onClose={() => setSelectedProject(null)} />}

      </div>
  );
};

export default UserView;
