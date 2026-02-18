
export enum Sender {
  USER = 'user',
  BOT = 'model',
}

export interface Attachment {
  type: 'image' | 'audio' | 'document';
  mimeType: string;
  data: string; // Base64 string
  name?: string;
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: Date;
  isError?: boolean;
  groundingMetadata?: any;
  attachments?: Attachment[];
  feedback?: 'like' | 'dislike';
}

export type ChatMode = 'standard' | 'deep_think' | 'research' | 'guided_learning';

export type AppView = 'hero' | 'chat' | 'settings' | 'history';

export interface UserProfile {
  language: 'English' | 'Pidgin' | 'Igbo' | 'Yoruba' | 'Hausa';
  location: string;
  dialect: 'UK' | 'US';
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  mode: ChatMode;
  lastModified: number;
}
