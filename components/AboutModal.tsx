import React from 'react';
import { XIcon, ScaleIcon, ShieldCheckIcon } from './Icons';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div 
        className="relative bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up transition-colors duration-200 border border-legal-brown/20"
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-modal-title"
      >
        <div className="bg-legal-green p-5 flex items-center justify-between text-white shrink-0 border-b-4 border-legal-brown">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <ScaleIcon className="w-6 h-6" />
            </div>
            <h2 id="about-modal-title" className="text-xl font-bold tracking-tight">About Your Legal AI</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Close about modal"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <div className="space-y-6 text-sm text-gray-600 dark:text-gray-300">
            
            <section>
              <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-2">Our Purpose</h3>
              <p className="leading-relaxed text-base">
                Your Legal AI is built to bridge the gap between complex Nigerian laws and everyday citizens. We believe everyone deserves to understand their rights without confusion.
              </p>
            </section>

            <section className="bg-legal-green/5 dark:bg-legal-green/10 p-5 rounded-xl border border-legal-green/20">
              <h3 className="text-gray-900 dark:text-white font-bold text-base mb-3">What We Do</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2.5">
                  <span className="text-legal-green font-bold mt-0.5 text-lg">•</span>
                  <span>Translate legal jargon into simple, everyday English, Pidgin, Yoruba, Igbo, or Hausa.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-legal-green font-bold mt-0.5 text-lg">•</span>
                  <span>Explain your rights in common situations like police encounters, landlord disputes, or employment issues.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-legal-green font-bold mt-0.5 text-lg">•</span>
                  <span>Provide relevant legal sources for research (Law Pavilion, NWLR, etc.).</span>
                </li>
              </ul>
            </section>

            <section className="border-t border-gray-100 dark:border-gray-800 pt-4">
              <h3 className="text-gray-900 dark:text-white font-bold text-base mb-3 flex items-center gap-2">
                <ShieldCheckIcon className="w-5 h-5 text-legal-brown" />
                Important Limitations
              </h3>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 rounded-xl p-4">
                <p className="leading-relaxed text-red-800 dark:text-red-300 mb-2 font-medium">
                  Your Legal AI is an AI tool, not a lawyer.
                </p>
                <ul className="list-disc pl-5 space-y-1 text-red-700/80 dark:text-red-300/80">
                  <li>We cannot represent you in court.</li>
                  <li>We cannot provide official legal counsel for your specific case.</li>
                  <li>Laws can change, and the AI may occasionally make mistakes.</li>
                </ul>
              </div>
              <p className="mt-3 italic text-xs text-gray-500 dark:text-gray-400">
                Always consult a qualified legal professional for serious matters or before taking legal action.
              </p>
            </section>

          </div>
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-black shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-legal-black hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;