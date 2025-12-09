
import React, { useState, useEffect } from 'react';
import type { Project } from '../types';
import { generateProjectInsight } from '../services/geminiService';

interface ProjectDetailModalProps {
    project: Project;
    onClose: () => void;
}

const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project, onClose }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [aiInsight, setAiInsight] = useState<string>('');
    const [loadingInsight, setLoadingInsight] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
            if(project.imageGallery && project.imageGallery.length > 1) {
                if (e.key === 'ArrowLeft') {
                    prevImage();
                } else if (e.key === 'ArrowRight') {
                    nextImage();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [project.imageGallery]);

    const nextImage = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === project.imageGallery.length - 1 ? 0 : prevIndex + 1
        );
    };

    const prevImage = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === 0 ? project.imageGallery.length - 1 : prevIndex - 1
        );
    };

    const handleGenerateInsight = async () => {
        setLoadingInsight(true);
        const insight = await generateProjectInsight(project);
        setAiInsight(insight);
        setLoadingInsight(false);
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[120] flex items-center justify-center p-6 animate-fade-in-up" 
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div 
                className="bg-white dark:bg-[#111] rounded-[2.5rem] shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-200 dark:border-white/10" 
                onClick={(e) => e.stopPropagation()}
            >
                <header className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                    <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white pl-2">{project.title}</h2>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors text-xl" aria-label="Close">
                        &times;
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Left Column: Media */}
                    <div className="space-y-6">
                        {project.imageGallery && project.imageGallery.length > 0 && (
                             <div className="relative rounded-3xl overflow-hidden shadow-lg group">
                                <img src={project.imageGallery[currentImageIndex]} alt={project.title} className="w-full h-auto object-cover aspect-video" />
                                {project.imageGallery.length > 1 && (
                                    <>
                                        <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-md text-white w-10 h-10 rounded-full hover:bg-white hover:text-black transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center">&#10094;</button>
                                        <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-md text-white w-10 h-10 rounded-full hover:bg-white hover:text-black transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center">&#10095;</button>
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                                            {project.imageGallery.map((_, index) => (
                                                <button key={index} onClick={() => setCurrentImageIndex(index)} className={`w-2 h-2 rounded-full transition-all ${index === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'}`}></button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                        
                        {project.videoUrl && (
                             <div className="aspect-w-16 aspect-h-9 rounded-3xl overflow-hidden shadow-lg">
                                <iframe
                                    src={project.videoUrl.replace("watch?v=", "embed/")}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="w-full h-full"
                                    title={`${project.title} Demo Video`}
                                ></iframe>
                            </div>
                        )}
                    </div>
                    
                    {/* Right Column: Details */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">Overview</h3>
                            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{project.longDescription}</p>
                        </div>
                        
                        {/* AI Insight Feature */}
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-3xl border border-indigo-100 dark:border-white/5">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-bold text-indigo-600 dark:text-indigo-300 flex items-center gap-2">
                                    <span>✨</span> AI Analysis
                                </h4>
                                {!aiInsight && (
                                    <button 
                                        onClick={handleGenerateInsight} 
                                        disabled={loadingInsight}
                                        className="text-xs bg-white dark:bg-white/10 text-indigo-600 dark:text-indigo-300 px-4 py-2 rounded-full font-bold shadow-sm hover:scale-105 transition-transform disabled:opacity-50"
                                    >
                                        {loadingInsight ? 'Thinking...' : 'Generate Insight'}
                                    </button>
                                )}
                            </div>
                            {aiInsight && (
                                <p className="text-sm text-indigo-900 dark:text-indigo-100 italic animate-fade-in-up">
                                    "{aiInsight}"
                                </p>
                            )}
                        </div>

                         {project.keyLearning && (
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">Key Takeaway</h3>
                                <p className="text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-white/5 p-4 rounded-2xl border-l-4 border-gold">{project.keyLearning}</p>
                            </div>
                        )}
                        <div>
                             <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">Tech Stack</h3>
                             <div className="flex flex-wrap gap-2">
                                {project.technologies.map((tech, index) => (
                                    <span key={index} className="inline-block bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 text-xs font-bold px-4 py-2 rounded-full border border-gray-200 dark:border-white/5">
                                        {tech}
                                    </span>
                                ))}
                             </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            {project.link && (
                                <a href={project.link} target="_blank" rel="noopener noreferrer" className="bg-black dark:bg-white text-white dark:text-black font-bold py-4 px-8 rounded-full hover:scale-105 transition-transform text-center flex-1 shadow-lg">View Live</a>
                            )}
                            {project.repoLink && (
                                <a href={project.repoLink} target="_blank" rel="noopener noreferrer" className="bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white font-bold py-4 px-8 rounded-full hover:bg-gray-300 dark:hover:bg-white/20 transition-colors text-center flex-1">Source Code</a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetailModal;
