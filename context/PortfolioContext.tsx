import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import type { PortfolioData } from '../types';
import { getPortfolio, savePortfolio } from '../services/api';

// --- Default Data ---
const defaultData: PortfolioData = {
  profile: {
    name: 'Your Name',
    title: 'Electronics & Communication Engineer',
    about: 'Innovative and detail-oriented Electronics and Communication Engineer with a passion for developing and implementing cutting-edge technological solutions. A recent graduate from Government Engineering College, Aurangabad, with hands-on experience in various projects and a proven ability to lead and coordinate. Seeking to leverage technical skills and leadership experience to contribute to a challenging engineering role.',
    profilePicture: 'https://picsum.photos/400/400',
    promoVideo: 'https://www.youtube.com/watch?v=QdBZY2fkU-0', // Placeholder video
    socialLinks: [
      { id: 'social1', platform: 'GitHub', url: '#' },
      { id: 'social2', platform: 'LinkedIn', url: '#' },
    ]
  },
  education: [
    { id: 'edu1', degree: 'B.E. in Electronics and Communication', institution: 'Government Engineering College, Aurangabad', period: '2020 - 2024', details: 'Graduated with a focus on embedded systems and wireless communication.' },
    { id: 'edu2', degree: 'Diploma in Electronics Engineering', institution: 'Local Polytechnic Institute', period: '2017 - 2020', details: 'Completed a comprehensive diploma program covering core electronics principles.' },
    { id: 'edu3', degree: 'Matriculation (SSC)', institution: 'City High School', period: '2017', details: 'Completed secondary school with a focus on science and mathematics.' },
  ],
  skills: [
    { id: 'skill1', name: 'Embedded Systems (C/C++)', level: 90 },
    { id: 'skill2', name: 'PCB Design (Eagle, KiCad)', level: 85 },
    { id: 'skill3', name: 'React & TypeScript', level: 75 },
    { id: 'skill4', name: 'Python for Data Analysis', level: 80 },
    { id: 'skill5', name: 'Wireless Communication Protocols', level: 88 },
  ],
  projects: [
    { 
      id: 'proj1', 
      title: 'IoT Based Smart Home Automation', 
      description: 'Developed a system to control home appliances remotely using a web interface and microcontroller.', 
      longDescription: 'This project is a comprehensive smart home solution that leverages the ESP32 microcontroller for hardware control and an MQTT broker for secure, real-time communication. The frontend, built with React, provides a user-friendly dashboard to monitor and control various home appliances like lights, fans, and security cameras. The Node.js backend manages user authentication, device state, and communication with the MQTT broker. A key challenge was ensuring low latency and robust security for the entire system.',
      keyLearning: 'The biggest challenge was ensuring low-latency communication between the web interface and the ESP32. Implementing MQTT with optimized Quality of Service (QoS) levels was the key to achieving a responsive user experience.',
      technologies: ['ESP32', 'MQTT', 'React', 'Node.js'], 
      link: '#',
      repoLink: '#',
      imageGallery: ['https://picsum.photos/seed/project1a/800/600', 'https://picsum.photos/seed/project1b/800/600', 'https://picsum.photos/seed/project1c/800/600'],
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    },
    { 
      id: 'proj2', 
      title: 'Automated Attendance System', 
      description: 'Created an RFID-based attendance system to automate the process of recording student attendance, reducing manual errors.', 
      longDescription: 'The Automated Attendance System utilizes an Arduino microcontroller paired with an RFID reader to streamline the attendance process. Each student is issued an RFID card, and upon scanning, their attendance is logged into a SQL database. This system eliminates the need for manual roll calls, significantly reducing administrative overhead and human error. The project involved hardware interfacing with C++, database design, and creating a simple interface for administrators to view and export attendance records.',
      keyLearning: 'A key takeaway was the importance of handling RFID card collisions and ensuring data integrity. I implemented a robust error-checking mechanism in the Arduino code to prevent duplicate or missed attendance logs.',
      technologies: ['Arduino', 'RFID', 'C++', 'SQL'], 
      link: '#',
      repoLink: '#',
      imageGallery: ['https://picsum.photos/seed/project2a/800/600', 'https://picsum.photos/seed/project2b/800/600'],
      videoUrl: ''
    },
  ],
  experience: [
    { id: 'exp1', role: 'Start-up Cell Coordinator', organization: 'District Innovation Council', startDate: '2023', endDate: 'Present', description: 'Coordinated with various institutions to foster a start-up ecosystem. Organized workshops, mentorship programs, and networking events for aspiring entrepreneurs in the district.' },
  ],
  memories: [
    { id: 'mem1', image: 'https://picsum.photos/seed/memory1/1200/800', caption: 'A memorable team outing.' },
    { id: 'mem2', image: 'https://picsum.photos/seed/memory2/1200/800', caption: 'Receiving an award for a project.' },
    { id: 'mem3', image: 'https://picsum.photos/seed/memory3/1200/800', caption: 'Workshop on modern technologies.' },
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
          
          // --- Permanent & Simplified Data-Safety Fix ---
          // The previous complex logic for merging the 'profile' section was the source of the data-loss bugs.
          // This new, simplified logic treats every section equally. If a section exists in the user's
          // saved data, it is used in its entirety. This is the safest approach and guarantees
          // that default data can never overwrite customized sections.
          const finalData = { ...defaultData }; // Start with a fresh copy of the defaults.
          
          for (const key of Object.keys(finalData) as Array<keyof PortfolioData>) {
              // If the user has data for this top-level key (e.g., 'profile', 'skills'),
              // use their data completely, overwriting the default for that section.
              if (savedData[key] !== undefined) {
                  finalData[key] = savedData[key] as any;
              }
          }
          setPortfolioData(finalData);

        } else {
           // If no data is saved, or it's empty, use the defaults.
           setPortfolioData(defaultData);
        }
      } catch (error) {
        console.error('Error loading data from API:', error);
        // Fallback to default data is handled by initial state
        setPortfolioData(defaultData);
      }
    };
    loadData();
  }, []);

  const saveData = async (dataToSave: PortfolioData) => {
    try {
      await savePortfolio(dataToSave);
      // No alert here, UI feedback will be handled in the AdminView
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

// --- Custom Hook ---
export const usePortfolio = (): PortfolioContextType => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
