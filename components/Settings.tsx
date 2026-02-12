import React from 'react';
import { SunIcon, MoonIcon, TrashIcon, InfoIcon } from './Icons';

interface SettingsProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  onClearHistory: () => void;
  onOpenAbout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ isDarkMode, toggleTheme, onClearHistory, onOpenAbout }) => {
  return (
    <div className="max-w-2xl mx-auto p-6 w-full animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Settings</h2>

      <div className="space-y-4">
        
        {/* Theme Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg text-gray-600 dark:text-gray-300">
              {isDarkMode ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Appearance</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark mode</p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-ng-green focus:ring-offset-2"
          >
            <span
              className={`${
                isDarkMode ? 'translate-x-6 bg-ng-green' : 'translate-x-1 bg-white'
              } inline-block h-4 w-4 transform rounded-full transition-transform duration-200`}
            />
          </button>
        </div>

        {/* Data & Memory Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-100 dark:bg-red-900/20 p-2 rounded-lg text-red-600 dark:text-red-400">
              <TrashIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Clear Memory</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Remove current chat history and context.</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to clear the current chat? This cannot be undone.")) {
                onClearHistory();
              }
            }}
            className="w-full py-2.5 px-4 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium"
          >
            Clear Chat History
          </button>
        </div>

        {/* About Section */}
         <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors" onClick={onOpenAbout}>
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg text-blue-600 dark:text-blue-400">
              <InfoIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">About LawBuddy NG</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Read purpose and disclaimer</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;