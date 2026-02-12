
import { ChatSession, Message, Sender } from '../types';

const STORAGE_KEY = 'lawbuddy_ng_chats';

export const getSessions = (): ChatSession[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const parsed = JSON.parse(data);
    // Revive dates in messages
    return parsed.map((session: any) => ({
      ...session,
      messages: session.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      })).sort((a: Message, b: Message) => a.timestamp.getTime() - b.timestamp.getTime())
    })).sort((a: ChatSession, b: ChatSession) => b.lastModified - a.lastModified);
  } catch (error) {
    console.error("Error loading sessions", error);
    return [];
  }
};

export const saveSession = (session: ChatSession) => {
  try {
    const sessions = getSessions();
    const index = sessions.findIndex(s => s.id === session.id);
    
    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.unshift(session);
    }
    
    // Basic Quota management: Limit to 20 chats to prevent LocalStorage overflow
    if (sessions.length > 20) {
        sessions.pop(); 
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error("Error saving session (likely quota exceeded)", error);
  }
};

export const deleteSession = (id: string) => {
  const sessions = getSessions().filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
};

export const clearAllSessions = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const generateTitle = (message: Message): string => {
  if (!message.text) return "New Chat";
  return message.text.slice(0, 40) + (message.text.length > 40 ? "..." : "");
};
