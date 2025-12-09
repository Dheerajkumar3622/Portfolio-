
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

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  link?: string;
  image?: string; // Base64 badge or logo
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
  allowDownload?: boolean; // Admin permission
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
  allowDownload?: boolean; // Admin permission
}

export interface Note {
  id: string;
  title: string;
  description: string;
  fileData: string; // Base64 encoded file or URL
  fileName: string;
  fileType: string; // 'PDF', 'TXT', etc.
  allowDownload?: boolean; // Admin permission
}

export interface CommunityData {
    memberCount: number;
    description: string;
}

export interface PortfolioData {
  profile: ProfileData;
  education: Education[];
  certifications: Certification[];
  skills: Skill[];
  projects: Project[];
  experience: Experience[];
  memories: Memory[];
  notes: Note[];
  community: CommunityData;
}

// --- Messaging System Types ---

export interface User {
  id: string;
  hashedPassword?: string;
}

export interface ChatMessage {
    id: string;
    roomId: string;
    senderId: string;
    message: string;
    timestamp: number;
    type: 'text' | 'image' | 'file';
    mediaUrl?: string;
    replyTo?: ChatMessage | null;
    reactions?: Record<string, string[]>;
    readBy?: string[];
}

export interface ChatRoom {
  id: string; // 'dm-user1-user2' or 'group-uuid'
  name?: string; // For groups
  type: 'dm' | 'group' | 'global';
  participants: string[];
  admins?: string[];
  lastMessage?: ChatMessage;
  unreadCount?: number;
  updatedAt: number;
}

export interface GuestbookEntry {
  id: string;
  userId: string;
  message: string;
  timestamp: number;
  reactions?: Record<string, any>;
}

export interface Lead {
  id: string;
  timestamp: number;
  name: string;
  email: string;
  message: string;
}

export interface Report {
  id: string;
  timestamp: number;
  messageId: string;
  messageContent: string;
  messageAuthor: string;
}
