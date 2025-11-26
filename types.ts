export interface Education {
  id: string;
  degree: string;
  institution: string;
  period: string;
  details: string;
}

export interface Skill {
  id:string;
  name: string;
  level: number; // A number from 1 to 100 for the progress bar
}

export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  keyLearning: string;
  technologies: string[];
  link?: string;
  repoLink?: string;
  imageGallery: string[]; // Array of Base64 strings or URLs
  videoUrl?: string; // URL for YouTube or other video embed
}

export interface Experience {
  id: string;
  role: string;
  organization: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface SocialLink {
  id: string;
  platform: 'GitHub' | 'LinkedIn' | 'Twitter' | string; // Allow common platforms + custom
  url: string;
}

export interface ProfileData {
  name: string;
  title: string;
  about: string;
  profilePicture: string; // Base64 string or URL
  promoVideo: string; // URL or Base64 data URL
  socialLinks: SocialLink[];
}

export interface Memory {
  id: string;
  image: string; // Base64 string
  caption?: string;
}

export interface Note {
  id: string;
  title: string;
  description: string;
  fileData: string; // Base64 encoded file
  fileName: string;
  fileType: string;
}

export interface PortfolioData {
  profile: ProfileData;
  education: Education[];
  skills: Skill[];
  projects: Project[];
  experience: Experience[];
  memories: Memory[];
  notes: Note[];
}

// FIX: Add missing ChatMessage interface
// For Chat Widget
export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

// For Guestbook Widget
export interface GuestbookEntry {
  id: string;
  timestamp: number;
  userId: string; // Changed from 'name' to 'userId'
  message: string;
  reactions?: { [key: string]: number }; // e.g., { '👍': 10, '❤️': 5 }
}

// For Contact Form
export interface Lead {
  id: string;
  timestamp: number;
  name: string;
  email: string;
  message: string;
}

// For Moderation
export interface Report {
  id: string;
  timestamp: number;
  messageId: string;
  messageContent: string;
  messageAuthor: string;
}

// For Authentication
export interface User {
  id: string; // This will be the unique username
  hashedPassword: string;
}