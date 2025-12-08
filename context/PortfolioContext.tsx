
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
    { 
        id: 'edu1', 
        degree: 'M.S. in Robotics & Autonomous Systems', 
        institution: 'Stanford University', 
        period: '2024 - 2026', 
        details: 'Focusing on SLAM, Computer Vision, and Haptic Feedback systems. Thesis on "Swarm Intelligence in Resource-Constrained Environments".' 
    },
    { 
        id: 'edu2', 
        degree: 'B.E. in Electronics and Communication', 
        institution: 'Government Engineering College, Aurangabad', 
        period: '2020 - 2024', 
        details: 'Graduated with Honors. Capstone project featured a custom-built FPGA accelerator for neural networks. Lead of the University Robotics Club.' 
    },
  ],
  experience: [
    { 
        id: 'exp1', 
        role: 'Senior AI Engineer', 
        organization: 'Neural Edge Corp', 
        startDate: '2024', 
        endDate: 'Present', 
        description: 'Leading a team of 5 engineers to deploy Vision Transformers on proprietary edge silicon. Improved inference speed by 400% using custom quantization kernels.' 
    },
    { 
        id: 'exp2', 
        role: 'Embedded Systems Intern', 
        organization: 'Tesla Autopilot Team', 
        startDate: '2023', 
        endDate: '2023', 
        description: 'Worked on the sensor fusion pipeline for FSD Beta. Optimized C++ driver code for radar modules, reducing latency by 12ms.' 
    },
    { 
        id: 'exp3', 
        role: 'Research Assistant', 
        organization: 'IoT & Smart Cities Lab', 
        startDate: '2022', 
        endDate: '2023', 
        description: 'Published paper on "Low-Power LoRaWAN Meshes" at IEEE IoT Conference. Designed prototype nodes for city-wide air quality monitoring.' 
    },
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
  memories: [
    { id: 'mem1', image: 'https://picsum.photos/seed/robot/1200/800', caption: 'First successful autonomous flight' },
  ],
  notes: [],
  community: {
      memberCount: 142,
      description: "Join the 'Neural Architects' group. A community of engineers pushing the boundaries of Edge AI."
  }
};

// --- Context Definition ---
interface PortfolioContextType {
  portfolioData: PortfolioData;
  setPortfolioData: React.Dispatch<React.SetStateAction<PortfolioData>>;
  saveData: (dataToSave: PortfolioData) => Promise<void>;
  joinCommunity: () => Promise<void>;
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
          // Ensure community object exists if loading from older data version
          if (!finalData.community) {
              finalData.community = defaultData.community;
          }
          setPortfolioData(finalData);
        } else {
           console.log("Database empty. Using default template.");
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
      setPortfolioData(dataToSave);
    } catch (error: any) {
      console.error('Error saving data via API:', error);
      alert(`CRITICAL ERROR: Failed to save to Database.\n\nReason: ${error.message}\n\nCheck your internet connection or try reducing image sizes.`);
      throw error; 
    }
  };

  const joinCommunity = async () => {
      const updatedData = {
          ...portfolioData,
          community: {
              ...portfolioData.community,
              memberCount: (portfolioData.community?.memberCount || 0) + 1
          }
      };
      // Optimistically update UI
      setPortfolioData(updatedData);
      // Try to save silently
      try {
          await savePortfolio(updatedData);
      } catch(e) {
          console.warn("Failed to persist community count join");
      }
  }

  return (
    <PortfolioContext.Provider value={{ portfolioData, setPortfolioData, saveData, joinCommunity }}>
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
