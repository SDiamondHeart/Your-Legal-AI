
import React from 'react';
import { ScaleIcon, HomeIcon, SettingsIcon, PlusIcon, HistoryIcon } from './Icons';
import { AppView } from '../types';

interface HeaderProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  onNewChat: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onChangeView, onNewChat }) => {
  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-legal-black border-b border-legal-brown/20 dark:border-gray-800 shadow-sm transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo Area - Click to go home */}
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => onChangeView('hero')}
        >
          <div className="w-8 h-8 bg-legal-green rounded-lg flex items-center justify-center text-white shadow-md border border-legal-brown">
            <ScaleIcon className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors hidden sm:block">
            Your Legal <span className="text-legal-brown">AI</span>
          </h1>
        </div>
        
        {/* Navigation */}
        <div className="flex items-center gap-1 sm:gap-2">
           {/* New Chat Button */}
          <button
            onClick={onNewChat}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-legal-green/10 text-legal-green hover:bg-legal-green/20 dark:bg-legal-green/20 dark:text-white dark:hover:bg-legal-green/30 transition-colors font-medium text-sm mr-1"
            aria-label="Start New Chat"
          >
            <PlusIcon className="w-4 h-4" />
            <span className="hidden xs:inline">New Chat</span>
          </button>

          <button
            onClick={() => onChangeView('hero')}
            className={`p-2 rounded-full transition-colors ${currentView === 'hero' ? 'text-legal-green bg-legal-paper dark:bg-gray-800' : 'text-gray-500 dark:text-gray-400 hover:bg-legal-paper dark:hover:bg-gray-800'}`}
            aria-label="Home"
          >
            <HomeIcon className="w-5 h-5" />
          </button>

          <button 
            onClick={() => onChangeView('history')}
            className={`p-2 rounded-full transition-colors ${currentView === 'history' ? 'text-legal-green bg-legal-paper dark:bg-gray-800' : 'text-gray-500 dark:text-gray-400 hover:bg-legal-paper dark:hover:bg-gray-800'}`}
            aria-label="History"
          >
            <HistoryIcon className="w-5 h-5" />
          </button>

          <button 
            onClick={() => onChangeView('settings')}
            className={`p-2 rounded-full transition-colors ${currentView === 'settings' ? 'text-legal-green bg-legal-paper dark:bg-gray-800' : 'text-gray-500 dark:text-gray-400 hover:bg-legal-paper dark:hover:bg-gray-800'}`}
            aria-label="Settings"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;