
import React, { useState, useEffect } from 'react';
import type { Project } from '../types';

interface ProjectDetailModalProps {
    project: Project;
    onClose: () => void;
}

const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project, onClose }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Handle keyboard events for closing the modal (Escape key) and navigating gallery
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    return (
        <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-up" 
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-title"
        >
            <div 
                className="bg-secondary rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden" 
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
            >
                <header className="p-4 border-b border-text-secondary/20 flex justify-between items-center">
                    <h2 id="project-title" className="text-2xl font-bold text-accent">{project.title}</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary text-3xl font-bold" aria-label="Close project details">&times;</button>
                </header>

                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: Media */}
                    <div className="space-y-4">
                        {project.imageGallery && project.imageGallery.length > 0 && (
                             <div className="relative">
                                <img src={project.imageGallery[currentImageIndex]} alt={`${project.title} screenshot ${currentImageIndex + 1}`} className="w-full h-auto object-cover rounded-lg shadow-md aspect-video" />
                                {project.imageGallery.length > 1 && (
                                    <>
                                        <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/80 transition" aria-label="Previous image">&#10094;</button>
                                        <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/80 transition" aria-label="Next image">&#10095;</button>
                                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2">
                                            {project.imageGallery.map((_, index) => (
                                                <button key={index} onClick={() => setCurrentImageIndex(index)} className={`w-2 h-2 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}></button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                        
                        {project.videoUrl && (
                             <div className="aspect-w-16 aspect-h-9">
                                <iframe
                                    src={project.videoUrl.replace("watch?v=", "embed/")}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="rounded-lg shadow-md w-full h-full"
                                    title={`${project.title} Demo Video`}
                                ></iframe>
                            </div>
                        )}
                    </div>
                    
                    {/* Right Column: Details */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-xl font-semibold text-text-primary mb-2">About this project</h3>
                            <p className="text-text-secondary whitespace-pre-wrap">{project.longDescription}</p>
                        </div>
                         {project.keyLearning && (
                            <div>
                                <h3 className="text-xl font-semibold text-text-primary mb-2">Key Learning</h3>
                                <p className="text-text-secondary bg-base-100 p-3 rounded-lg border-l-4 border-highlight">{project.keyLearning}</p>
                            </div>
                        )}
                        <div>
                             <h3 className="text-xl font-semibold text-text-primary mb-2">Technologies Used</h3>
                             <div className="flex flex-wrap gap-2">
                                {project.technologies.map((tech, index) => (
                                    <span key={index} className="inline-block bg-accent/20 text-accent text-sm font-semibold px-3 py-1 rounded-full">
                                        {tech}
                                    </span>
                                ))}
                             </div>
                        </div>

                        <div className="flex space-x-4 pt-4">
                            {project.link && (
                                <a href={project.link} target="_blank" rel="noopener noreferrer" className="bg-accent text-white font-bold py-2 px-4 rounded-md hover:bg-highlight transition-colors flex-1 text-center">View Live Site</a>
                            )}
                            {project.repoLink && (
                                <a href={project.repoLink} target="_blank" rel="noopener noreferrer" className="bg-base-100 text-text-primary border border-text-secondary/20 font-bold py-2 px-4 rounded-md hover:bg-primary transition-colors flex-1 text-center">Source Code</a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetailModal;
