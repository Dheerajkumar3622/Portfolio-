
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
  skills: Skill[];
  projects: Project[];
  experience: Experience[];
  memories: Memory[];
  notes: Note[];
  community: CommunityData;
}

// --- Messaging System Types ---

export interface ChatRoom {
  id: string; // 'dm-user1-user2' or 'group-uuid'
  name?: string; // For groups
  type: 'dm' | 'group' | 'global';
  participants: string[];
  lastMessage?: ChatMessage;
  unreadCount?: number;
  updatedAt: number;
  admins?: string[];
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  message: string;
  timestamp: number;
  type: 'text' | 'image' | 'file';
  mediaUrl?: string;
  replyTo?: ChatMessage; // For contextual replies
  reactions?: Record<string, string[]>; // emoji -> [userIds]
  status?: 'sent' | 'delivered' | 'read';
  readBy?: string[]; // Users who have read the message
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
