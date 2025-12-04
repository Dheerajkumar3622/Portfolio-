
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import type { PortfolioData } from '../types';
import { getPortfolio, savePortfolio } from '../services/api';

// --- Default Data ---
const defaultData: PortfolioData = {
  profile: {
    name: 'Your Name',
    title: 'AI Architect & Embedded Systems Engineer',
    about: 'I engineer the intersection of hardware and futuristic intelligence. Specializing in Edge AI and Neuromorphic Computing, I deploy massive Generative models onto constrained embedded systems. My work bridges the gap between theoretical Deep Learning and real-world physical application.',
    profilePicture: 'https://picsum.photos/400/400',
    promoVideo: '', 
    socialLinks: [
      { id: 'social1', platform: 'GitHub', url: '#' },
      { id: 'social2', platform: 'LinkedIn', url: '#' },
    ]
  },
  education: [
    { id: 'edu1', degree: 'B.E. in Electronics and Communication', institution: 'Government Engineering College, Aurangabad', period: '2020 - 2024', details: 'Specialized in Signal Processing and AI applications.' },
  ],
  skills: [
    // --- 10 Major Futuristic ML Technologies ---
    { id: 'tech1', name: 'Generative AI & LLMs (Transformers)', level: 92 },
    { id: 'tech2', name: 'Edge AI & TinyML', level: 98 },
    { id: 'tech3', name: 'Computer Vision (YOLO v8 / ViT)', level: 90 },
    { id: 'tech4', name: 'Deep Reinforcement Learning', level: 85 },
    { id: 'tech5', name: 'NVIDIA CUDA & TensorRT', level: 88 },
    { id: 'tech6', name: 'MLOps (Kubeflow/Docker)', level: 90 },
    { id: 'tech7', name: 'Neuromorphic Computing', level: 80 },
    { id: 'tech8', name: 'Federated Learning', level: 82 },
    { id: 'tech9', name: 'Graph Neural Networks (GNN)', level: 85 },
    { id: 'tech10', name: 'Explainable AI (XAI)', level: 88 },
    // --- Foundation ---
    { id: 'core1', name: 'PyTorch / TensorFlow 2.x', level: 95 },
    { id: 'core2', name: 'Embedded C++ / Rust', level: 90 },
  ],
  projects: [
    { 
      id: 'proj-futuristic-1', 
      title: 'Autonomous Drone Swarm (Edge AI)', 
      description: 'A fleet of drones using Reinforcement Learning and TinyML to navigate complex environments without GPS.', 
      longDescription: 'This project utilizes Deep Reinforcement Learning (PPO algorithm) running locally on NVIDIA Jetson Nano modules. The drones communicate via a mesh network to coordinate formation flight and obstacle avoidance in real-time, demonstrating decentralized intelligence.',
      keyLearning: 'Optimizing Transformer models to run with <15ms latency on edge hardware using TensorRT.',
      technologies: ['PyTorch', 'ROS2', 'Reinforcement Learning', 'NVIDIA Jetson', 'Python'], 
      link: '#',
      repoLink: '#',
      imageGallery: ['https://picsum.photos/seed/drone/800/600'],
      videoUrl: ''
    },
    { 
      id: 'proj-futuristic-2', 
      title: 'Generative Voice Assistant on ESP32', 
      description: 'A local, privacy-focused LLM voice assistant running on low-power silicon.', 
      longDescription: 'By quantizing a Llama-2 model effectively, this project brings conversational AI to a $5 microcontroller. It features wake-word detection, speech-to-text, and intent recognition all happening on-device.',
      keyLearning: 'Extreme model quantization (4-bit) and memory management in C++.',
      technologies: ['TinyML', 'C++', 'LLM', 'ESP32', 'Quantization'], 
      link: '#',
      repoLink: '#',
      imageGallery: ['https://picsum.photos/seed/voice/800/600'],
      videoUrl: ''
    },
  ],
  experience: [
    { id: 'exp1', role: 'AI Researcher', organization: 'NextGen Robotics', startDate: '2023', endDate: 'Present', description: 'Developing Vision Transformers for autonomous navigation systems.' },
  ],
  memories: [
    { id: 'mem1', image: 'https://picsum.photos/seed/robot/1200/800', caption: 'First successful autonomous flight' },
  ],
  notes: [],
};

// --- Context Definition ---
interface PortfolioContextType {
  portfolioData: PortfolioData;
  setPortfolioData: React.Dispatch<React.SetStateAction<PortfolioData>>;
  saveData: (dataToSave: PortfolioData) => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

// --- Provider Component ---
export const PortfolioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [portfolioData, setPortfolioData] = useState<PortfolioData>(defaultData);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedData = await getPortfolio();
        if (savedData && Object.keys(savedData).length > 0) {
          // Database has data, use it.
          const finalData = { ...defaultData };
          for (const key of Object.keys(finalData) as Array<keyof PortfolioData>) {
              if (savedData[key] !== undefined) {
                  finalData[key] = savedData[key] as any;
              }
          }
          setPortfolioData(finalData);
        } else {
           // Database is empty (first deployment). 
           // Initialize it with default data so all devices see the same starting point.
           console.log("Database empty. Seeding with default data...");
           await savePortfolio(defaultData);
           setPortfolioData(defaultData);
        }
      } catch (error) {
        console.error('Error loading data from API:', error);
        setPortfolioData(defaultData);
      }
    };
    loadData();
  }, []);

  const saveData = async (dataToSave: PortfolioData) => {
    try {
      await savePortfolio(dataToSave);
      // We also update local state immediately for UI responsiveness
      setPortfolioData(dataToSave);
    } catch (error) {
      console.error('Error saving data via API:', error);
      alert('Failed to save data. Please check your connection.');
    }
  };

  return (
    <PortfolioContext.Provider value={{ portfolioData, setPortfolioData, saveData }}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = (): PortfolioContextType => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
