
import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';

interface HamburgerMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ isOpen, onClose }) => {
    const { portfolioData } = usePortfolio();
    const { notes, memories, projects } = portfolioData;

    if (!isOpen) return null;

    const handleDownload = (data: string, filename: string) => {
        const link = document.createElement('a');
        link.href = data;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 z-[120] flex justify-end">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Drawer */}
            <div className="relative w-full max-w-md h-full bg-white dark:bg-black border-l border-gold shadow-2xl flex flex-col transform transition-transform duration-300 animate-fade-in-up">
                
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-maroon-900 text-white">
                    <h2 className="text-xl font-display font-bold tracking-widest text-gold">RESOURCES</h2>
                    <button onClick={onClose} className="text-gold hover:text-white text-2xl font-bold">&times;</button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-10">
                    
                    {/* 1. NOTES */}
                    <section>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4 border-b border-gray-200 dark:border-gray-800 pb-2">Engineering Notes</h3>
                        {notes.length === 0 && <p className="text-xs text-gray-400 italic">No notes available.</p>}
                        <div className="space-y-4">
                            {notes.map(note => (
                                <div key={note.id} className="bg-gray-50 dark:bg-zinc-900 p-4 rounded-sm border-l-2 border-gray-300 dark:border-gray-700">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-gray-900 dark:text-white">{note.title}</h4>
                                        <span className="text-[10px] bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded text-gray-600 dark:text-gray-300">{note.fileType}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{note.description}</p>
                                    
                                    {note.allowDownload ? (
                                        <button 
                                            onClick={() => handleDownload(note.fileData, note.fileName)}
                                            className="w-full bg-maroon-900 text-white text-xs font-bold py-2 hover:bg-maroon-700 transition-colors uppercase tracking-wider flex items-center justify-center gap-2"
                                        >
                                            <span>⬇</span> Download {note.fileType}
                                        </button>
                                    ) : (
                                        <div className="w-full bg-gray-200 dark:bg-gray-800 text-gray-400 text-xs font-bold py-2 text-center uppercase tracking-wider cursor-not-allowed flex items-center justify-center gap-2">
                                            <span>🔒</span> Access Restricted
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 2. MEDIA */}
                    <section>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4 border-b border-gray-200 dark:border-gray-800 pb-2">Gallery & Assets</h3>
                         {memories.filter(m => m.allowDownload).length === 0 && projects.filter(p => p.allowDownload).length === 0 && <p className="text-xs text-gray-400 italic">No downloadable assets.</p>}
                        
                        <div className="grid grid-cols-2 gap-4">
                            {memories.filter(m => m.allowDownload).map((mem, idx) => (
                                <div key={mem.id} className="relative group">
                                    <img src={mem.image} className="w-full h-24 object-cover rounded-sm grayscale group-hover:grayscale-0 transition-all" alt="Memory" />
                                    <button 
                                        onClick={() => handleDownload(mem.image, `memory_${idx}.jpg`)}
                                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <span className="text-white font-bold text-xs border border-white px-2 py-1">SAVE</span>
                                    </button>
                                </div>
                            ))}
                        </div>

                         <div className="mt-6 space-y-3">
                            {projects.filter(p => p.allowDownload).map(proj => (
                                <div key={proj.id} className="flex items-center justify-between bg-gray-50 dark:bg-zinc-900 p-3 rounded-sm">
                                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate max-w-[150px]">{proj.title} Assets</span>
                                    <button 
                                        onClick={() => handleDownload(proj.imageGallery[0], `${proj.title}_assets.jpg`)} // Simplified for demo
                                        className="text-xs text-gold hover:underline"
                                    >
                                        Download Pack
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-100 dark:bg-zinc-950 text-center border-t border-gray-200 dark:border-gray-900">
                    <p className="text-[10px] text-gray-500">
                        &copy; 2024. All materials are intellectual property.
                        <br/>Downloads monitored by Admin.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HamburgerMenu;
