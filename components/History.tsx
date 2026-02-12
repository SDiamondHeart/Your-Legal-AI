import React, { useEffect, useState } from 'react';
import { ChatSession } from '../types';
import { getSessions, deleteSession } from '../utils/storage';
import { TrashIcon, HistoryIcon, ScaleIcon, SparklesIcon } from './Icons';
import { MODES } from '../constants';

interface HistoryProps {
  onResumeChat: (session: ChatSession) => void;
}

const History: React.FC<HistoryProps> = ({ onResumeChat }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  useEffect(() => {
    setSessions(getSessions());
  }, []);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this chat?")) {
      deleteSession(id);
      setSessions(prev => prev.filter(s => s.id !== id));
    }
  };

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center animate-fade-in">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 mb-4">
          <HistoryIcon className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Previous Chats</h2>
        <p className="text-gray-500 dark:text-gray-400">Conversations you have will appear here.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full p-4 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 px-2 flex items-center gap-2">
        <HistoryIcon className="w-6 h-6 text-legal-green" />
        Previous Chats
      </h2>

      <div className="space-y-3">
        {sessions.map((session) => (
          <div 
            key={session.id}
            onClick={() => onResumeChat(session)}
            className="group bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-legal-green dark:hover:border-legal-green shadow-sm transition-all cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-start gap-3 overflow-hidden">
              <div className={`mt-1 p-2 rounded-lg shrink-0 ${session.mode === 'deep_think' ? 'bg-purple-100 text-purple-600' : 'bg-legal-green/10 text-legal-green'}`}>
                 {session.mode === 'deep_think' ? <SparklesIcon className="w-4 h-4" /> : <ScaleIcon className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <h3 className="font-medium text-gray-900 dark:text-white truncate pr-2">
                  {session.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                  <span>{new Date(session.lastModified).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{MODES[session.mode]?.label || 'Chat'}</span>
                </p>
              </div>
            </div>

            <button 
              onClick={(e) => handleDelete(e, session.id)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
              title="Delete Chat"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;