
import React, { useEffect, useRef } from 'react';
import { ReactLenis } from '@studio-freight/react-lenis';
import { usePortfolio } from '../context/PortfolioContext';
import { motion, useScroll, useTransform } from 'framer-motion';
import ChatWidget from '../components/ChatWidget';
import MLSlider from '../components/MLSlider';
import SmartImage from '../components/SmartImage';
import VoiceControl from '../components/VoiceControl';
import SocialLinks from '../components/SocialLinks';
import { Link } from 'react-router-dom';

// --- Parallax Card Component ---
const ProjectCard: React.FC<{ project: any; index: number; total: number }> = ({ project, index, total }) => {
    // Each card is sticky. We increase top offset per index to create stack effect.
    const topOffset = 100 + index * 40; 
    
    return (
        <motion.div 
            className="sticky mb-20 w-full max-w-4xl mx-auto rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#0a0a0a]"
            style={{ 
                top: topOffset,
                zIndex: index,
                // Scale down slightly as it goes up (optional visual flair)
            }}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="relative h-[500px] flex flex-col md:flex-row">
                <div className="md:w-1/2 h-64 md:h-full relative overflow-hidden">
                    <SmartImage 
                        src={project.imageGallery[0]} 
                        alt={project.title} 
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                </div>
                <div className="md:w-1/2 p-8 flex flex-col justify-center bg-gray-900/50 backdrop-blur-sm">
                    <h2 className="text-3xl font-bold text-white mb-4 font-mono">{project.title}</h2>
                    <p className="text-gray-400 mb-6">{project.description}</p>
                    <div className="flex flex-wrap gap-2 mb-6">
                        {project.technologies.slice(0,4).map((t: string) => (
                            <span key={t} className="px-3 py-1 border border-accent/30 text-accent rounded-full text-xs">{t}</span>
                        ))}
                    </div>
                    <div className="flex gap-4">
                         <button className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-gray-200 transition">View Case Study</button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};


const UserView: React.FC = () => {
  const { portfolioData } = usePortfolio();
  const { profile, projects, skills } = portfolioData;

  return (
    <ReactLenis root>
      <div className="bg-black text-white min-h-screen font-sans selection:bg-accent selection:text-white overflow-x-hidden">
        
        {/* Hero Section */}
        <section className="h-screen flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black"></div>
            <div className="z-10 text-center px-4">
                <motion.h1 
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="text-6xl md:text-9xl font-bold tracking-tighter mb-4"
                >
                    {profile.name}
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-xl md:text-2xl text-gray-400 font-light"
                >
                    {profile.title}
                </motion.p>
            </div>
        </section>

        {/* AI Gesture Gallery Section */}
        <section className="py-24 px-6 bg-zinc-900/50 border-y border-white/5">
            <div className="container mx-auto">
                <div className="mb-12 text-center">
                    <h2 className="text-4xl font-bold mb-4">Featured Work (AI Enabled)</h2>
                    <p className="text-gray-400">Enable camera to swipe projects with hand gestures.</p>
                </div>
                <MLSlider 
                    items={projects} 
                    renderItem={(project) => (
                        <div className="flex flex-col items-center justify-center h-full text-center relative z-10">
                            <SmartImage src={project.imageGallery[0]} className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm" />
                            <h3 className="text-4xl font-bold text-white relative z-20 drop-shadow-lg">{project.title}</h3>
                            <p className="mt-4 text-gray-200 max-w-lg relative z-20">{project.description}</p>
                        </div>
                    )}
                />
            </div>
        </section>

        {/* Parallax Stack Project List */}
        <section className="py-32 px-4" id="projects">
             <div className="container mx-auto mb-16">
                <h2 className="text-5xl font-bold text-center">Selected Works</h2>
             </div>
             <div className="relative">
                {projects.map((project, i) => (
                    <ProjectCard key={project.id} project={project} index={i} total={projects.length} />
                ))}
             </div>
        </section>

        {/* About / Skills */}
        <section className="py-24 bg-white text-black rounded-t-[3rem] mt-12 relative z-20">
            <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16">
                <div>
                    <h2 className="text-5xl font-bold mb-8">About</h2>
                    <p className="text-xl leading-relaxed text-gray-700">{profile.about}</p>
                    <div className="mt-8">
                        <SocialLinks links={profile.socialLinks} />
                    </div>
                </div>
                <div>
                    <h2 className="text-5xl font-bold mb-8">Expertise</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {skills.map(s => (
                            <div key={s.id} className="border-b border-black/10 py-4 flex justify-between items-center">
                                <span className="font-bold text-lg">{s.name}</span>
                                <span className="text-sm bg-black text-white px-2 py-1 rounded-full">{s.level}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>

        {/* Footer */}
        <footer className="bg-black text-white py-12 text-center">
            <p className="text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} {profile.name} <br/>
                <Link to="/admin" className="hover:text-white transition">Admin Access</Link>
            </p>
        </footer>

        {/* Floating Widgets */}
        <ChatWidget />
        <VoiceControl onNavigate={() => {}} />

      </div>
    </ReactLenis>
  );
};

export default UserView;
