
import React from 'react';
import { ScaleIcon, ShieldCheckIcon, SparklesIcon, AcademicCapIcon, InfoIcon } from './Icons';
import { MODES } from '../constants';
import { ChatMode } from '../types';

interface HeroProps {
  onStartChat: (mode: ChatMode) => void;
}

const Hero: React.FC<HeroProps> = ({ onStartChat }) => {
  return (
    <div className="min-h-full flex flex-col items-center justify-start p-6 text-center animate-fade-in py-12 md:py-16 overflow-y-auto">
      <div className="max-w-4xl w-full space-y-10">
        
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-legal-green border-4 border-legal-brown rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3">
            <ScaleIcon className="w-10 h-10" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-extrabold text-legal-black dark:text-white tracking-tight leading-tight">
            Your Rights <br />
            <span className="text-legal-brown">Made Easy.</span>
          </h1>
          <p className="max-w-xl mx-auto text-lg md:text-xl text-gray-700 dark:text-gray-300 font-medium">
            Understand Nigerian law without the big grammar. 
          </p>
        </div>

        {/* Mode Selector - "See it all in one place" */}
        <div className="space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-legal-brown/80 dark:text-legal-brown">Choose How I Should Help You:</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(Object.keys(MODES) as ChatMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => onStartChat(mode)}
                className="group relative bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-md border border-legal-brown/10 dark:border-gray-700 hover:border-legal-green dark:hover:border-legal-green hover:shadow-xl transition-all text-left flex flex-col h-full"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                  mode === 'deep_think' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30' : 
                  mode === 'research' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' :
                  mode === 'guided_learning' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30' :
                  'bg-legal-green/10 text-legal-green dark:bg-legal-green/20'
                }`}>
                  {mode === 'deep_think' && <SparklesIcon className="w-6 h-6" />}
                  {mode === 'research' && <InfoIcon className="w-6 h-6" />}
                  {mode === 'guided_learning' && <AcademicCapIcon className="w-6 h-6" />}
                  {mode === 'standard' && <ScaleIcon className="w-6 h-6" />}
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-legal-green transition-colors">{MODES[mode].label}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed flex-grow">{MODES[mode].description}</p>
                <div className="mt-4 flex items-center text-xs font-bold text-legal-brown opacity-0 group-hover:opacity-100 transition-opacity">
                  START NOW →
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-8 text-xs text-gray-500 dark:text-gray-400 border-t border-legal-brown/10 dark:border-gray-800">
           Your Legal AI uses Gemini models. I provide information, not professional legal advice.
        </div>
      </div>
    </div>
  );
};

export default Hero;
