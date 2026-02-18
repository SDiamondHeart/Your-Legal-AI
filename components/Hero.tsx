
import React from 'react';
import { ScaleIcon, SparklesIcon, AcademicCapIcon, InfoIcon, DownloadIcon } from './Icons';
import { MODES } from '../constants';
import { ChatMode } from '../types';

interface HeroProps {
  onStartChat: (mode: ChatMode) => void;
  onInstall?: () => void;
  showInstallButton?: boolean;
}

const Hero: React.FC<HeroProps> = ({ onStartChat, onInstall, showInstallButton }) => {
  return (
    <div className="min-h-full flex flex-col items-center justify-start p-6 text-center animate-fade-in py-12 md:py-16 overflow-y-auto scrollbar-hide">
      <div className="max-w-4xl w-full space-y-12">
        
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-legal-green border-4 border-legal-brown rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3">
            <ScaleIcon className="w-10 h-10" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-extrabold text-legal-black dark:text-white tracking-tight leading-tight">
            Your Rights <br />
            <span className="text-legal-brown brightness-110">Made Easy.</span>
          </h1>
          <p className="max-w-xl mx-auto text-lg md:text-xl text-gray-700 dark:text-gray-200 font-medium">
            Understand Nigerian law without the big grammar. 
          </p>
        </div>

        {showInstallButton && (
          <div className="bg-legal-brown/10 dark:bg-legal-brown/20 rounded-3xl p-6 border border-legal-brown/20 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-left">
                <h3 className="text-lg font-bold text-legal-brown dark:text-white">Take me everywhere</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Download the app to your home screen for easy access.</p>
              </div>
              <button 
                onClick={onInstall}
                className="flex items-center gap-2 bg-legal-brown hover:bg-legal-brown/90 text-white px-6 py-3 rounded-2xl font-bold shadow-lg transition-all"
              >
                <DownloadIcon className="w-5 h-5" />
                Install App
              </button>
            </div>
          </div>
        )}

        <div className="space-y-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-legal-brown dark:text-gray-400">Choose How I Should Help You:</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(Object.keys(MODES) as ChatMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => onStartChat(mode)}
                className="group relative bg-white dark:bg-legal-black p-6 rounded-2xl shadow-md border border-legal-brown/10 dark:border-gray-800 hover:border-legal-green dark:hover:border-legal-brown hover:shadow-xl transition-all text-left flex flex-col h-full"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                  mode === 'deep_think' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300' : 
                  mode === 'research' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300' :
                  mode === 'guided_learning' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300' :
                  'bg-legal-green/10 text-legal-green dark:bg-legal-green/20 dark:text-white'
                }`}>
                  {mode === 'deep_think' && <SparklesIcon className="w-6 h-6" />}
                  {mode === 'research' && <InfoIcon className="w-6 h-6" />}
                  {mode === 'guided_learning' && <AcademicCapIcon className="w-6 h-6" />}
                  {mode === 'standard' && <ScaleIcon className="w-6 h-6" />}
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-legal-green dark:group-hover:text-legal-brown transition-colors">{MODES[mode].label}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-300 mt-2 leading-relaxed flex-grow">{MODES[mode].description}</p>
                <div className="mt-4 flex items-center text-xs font-bold text-legal-brown dark:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  START NOW →
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-10 text-[10px] text-gray-400 dark:text-gray-500 border-t border-legal-brown/10 dark:border-gray-800 uppercase tracking-widest">
           Your Legal AI uses Gemini models • Information only • Not legal advice
        </div>
      </div>
    </div>
  );
};

export default Hero;
