import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import type { PortfolioData } from '../types';
import { getPortfolio, savePortfolio } from '../services/api';

// --- Default Data ---
const defaultData: PortfolioData = {
  profile: {
    name: 'Your Name',
    title: 'Machine Learning & Electronics Engineer',
    about: 'Bridging the gap between hardware and artificial intelligence. I specialize in deploying robust Machine Learning models onto embedded systems. With a strong foundation in both electronics and data science, I create intelligent solutions that interact with the real world.',
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
    // --- 10 Major Machine Learning Algorithms ---
    { id: 'ml1', name: 'Linear Regression', level: 95 },
    { id: 'ml2', name: 'Logistic Regression', level: 92 },
    { id: 'ml3', name: 'Decision Trees', level: 88 },
    { id: 'ml4', name: 'Random Forest', level: 90 },
    { id: 'ml5', name: 'Support Vector Machines (SVM)', level: 85 },
    { id: 'ml6', name: 'K-Means Clustering', level: 88 },
    { id: 'ml7', name: 'k-Nearest Neighbors (k-NN)', level: 90 },
    { id: 'ml8', name: 'Naive Bayes', level: 85 },
    { id: 'ml9', name: 'PCA (Dimensionality Reduction)', level: 82 },
    { id: 'ml10', name: 'Gradient Boosting (XGBoost)', level: 88 },
    // --- Core Tech ---
    { id: 'tech1', name: 'Python (TensorFlow/PyTorch)', level: 90 },
    { id: 'tech2', name: 'Embedded C++', level: 85 },
  ],
  projects: [
    { 
      id: 'proj-ml-1', 
      title: 'Predictive Maintenance System', 
      description: 'Using Random Forest and SVM to predict machinery failure before it happens via IoT sensors.', 
      longDescription: 'This project demonstrates the application of supervised learning algorithms (Random Forest and SVM) to analyze vibration and temperature data streaming from industrial motors. By identifying anomalies in real-time using an ESP32 edge device, the system alerts maintenance teams before catastrophic failure occurs. The model was trained on a dataset of 50,000 sensor readings and achieved 94% accuracy.',
      keyLearning: 'Implementing heavy ML models on constrained edge devices required using TFLite Micro and aggressive dimensionality reduction (PCA).',
      technologies: ['Python', 'Scikit-Learn', 'IoT', 'Random Forest', 'SVM'], 
      link: '#',
      repoLink: '#',
      imageGallery: ['https://picsum.photos/seed/ml1/800/600'],
      videoUrl: ''
    },
    { 
      id: 'proj1', 
      title: 'IoT Smart Home', 
      description: 'A classic robust home automation system using MQTT and React.', 
      longDescription: 'A full-stack IoT solution controlling home appliances. Features a React dashboard and an Express/Node.js backend communicating via MQTT to ESP32 microcontrollers.',
      keyLearning: 'Mastered the pub/sub architecture and real-time state management.',
      technologies: ['ESP32', 'MQTT', 'React', 'Node.js'], 
      link: '#',
      repoLink: '#',
      imageGallery: ['https://picsum.photos/seed/project1a/800/600'],
      videoUrl: ''
    },
  ],
  experience: [
    { id: 'exp1', role: 'ML Intern', organization: 'Tech Innovations Labs', startDate: '2023', endDate: 'Present', description: 'Developing computer vision models for automated quality control.' },
  ],
  memories: [
    { id: 'mem1', image: 'https://picsum.photos/seed/memory1/1200/800', caption: 'Hackathon Win 2023' },
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
          const finalData = { ...defaultData };
          for (const key of Object.keys(finalData) as Array<keyof PortfolioData>) {
              if (savedData[key] !== undefined) {
                  finalData[key] = savedData[key] as any;
              }
          }
          setPortfolioData(finalData);
        } else {
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
    } catch (error) {
      console.error('Error saving data via API:', error);
      alert('Failed to save data.');
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