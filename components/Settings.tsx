
import React from 'react';
import { SunIcon, MoonIcon, TrashIcon, InfoIcon, DownloadIcon, UserIcon, MapPinIcon, AcademicCapIcon } from './Icons';
import { UserProfile } from '../types';
import { NIGERIAN_STATES } from '../constants';

interface SettingsProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  onClearHistory: () => void;
  onOpenAbout: () => void;
  installPrompt: any;
  onInstall: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  isDarkMode, 
  toggleTheme, 
  onClearHistory, 
  onOpenAbout, 
  installPrompt, 
  onInstall,
  userProfile,
  onUpdateProfile
}) => {
  return (
    <div className="max-w-2xl mx-auto p-6 w-full animate-fade-in pb-20 scrollbar-hide">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Settings</h2>

      <div className="space-y-6">
        
        {/* User Profile Section */}
        <div className="bg-white dark:bg-legal-black rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-legal-green/30">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-legal-green/10 dark:bg-legal-green/20 p-2.5 rounded-xl text-legal-green dark:text-white">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">User Profile</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tailor responses to your location and language</p>
            </div>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-white mb-2 ml-1">Preferred Language</label>
              <select 
                value={userProfile.language}
                onChange={(e) => onUpdateProfile({ ...userProfile, language: e.target.value as any })}
                className="w-full bg-gray-50 dark:bg-legal-black border border-gray-200 dark:border-white rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-legal-green outline-none transition-all dark:text-white"
              >
                <option value="English">English</option>
                <option value="Pidgin">Pidgin</option>
                <option value="Igbo">Igbo</option>
                <option value="Yoruba">Yoruba</option>
                <option value="Hausa">Hausa</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-white mb-2 ml-1">Legal English Variety (UK/US)</label>
              <div className="flex gap-2">
                {(['UK', 'US'] as const).map((dialect) => (
                  <button
                    key={dialect}
                    onClick={() => onUpdateProfile({ ...userProfile, dialect })}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                      userProfile.dialect === dialect 
                        ? 'bg-legal-green text-white border-legal-green' 
                        : 'bg-white dark:bg-legal-black text-gray-500 dark:text-white border-gray-200 dark:border-white'
                    }`}
                  >
                    {dialect === 'UK' ? 'British (UK)' : 'American (US)'}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-gray-400 dark:text-gray-400 italic">This affects spelling and legal terms (e.g., Solicitor vs Attorney).</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-white mb-2 ml-1">Your Location (State)</label>
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white" />
                <select 
                  value={userProfile.location}
                  onChange={(e) => onUpdateProfile({ ...userProfile, location: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-legal-black border border-gray-200 dark:border-white rounded-xl p-3.5 pl-10 text-sm focus:ring-2 focus:ring-legal-green outline-none transition-all dark:text-white appearance-none"
                >
                  {NIGERIAN_STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Theme Section */}
        <div className="bg-white dark:bg-legal-black rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-legal-green/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 dark:bg-legal-green/20 p-2.5 rounded-xl text-gray-600 dark:text-white">
              {isDarkMode ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Dark Mode</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Syncs with system settings by default</p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-legal-green focus:ring-offset-2 ${isDarkMode ? 'bg-legal-green' : 'bg-gray-200'}`}
          >
            <span
              className={`${
                isDarkMode ? 'translate-x-6 bg-white' : 'translate-x-1 bg-white'
              } inline-block h-4 w-4 transform rounded-full transition-transform duration-200`}
            />
          </button>
        </div>

        {/* Data & Memory Section */}
        <div className="bg-white dark:bg-legal-black rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-legal-green/30">
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-red-50 dark:bg-red-900/20 p-2.5 rounded-xl text-red-600 dark:text-red-400">
              <TrashIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Data Control</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Delete all local chat records</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (window.confirm("Oga, you sure say you wan delete all your chats?")) {
                onClearHistory();
              }
            }}
            className="w-full py-3 px-4 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl transition-colors text-sm font-bold border border-red-100 dark:border-red-900/30"
          >
            Clear All History
          </button>
        </div>

        {/* About Section */}
         <div className="bg-white dark:bg-legal-black rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-legal-green/30 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-legal-green/10 transition-colors" onClick={onOpenAbout}>
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 dark:bg-legal-green/20 p-2.5 rounded-xl text-blue-600 dark:text-white">
              <InfoIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Project Information</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Credits, Privacy, and Disclaimer</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
