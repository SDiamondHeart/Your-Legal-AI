import React, { useState } from 'react';
import { ShieldCheckIcon } from './Icons';

const LegalDisclaimer: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden transition-colors duration-200 border border-legal-green/20">
        <div className="bg-legal-green p-6 flex flex-col items-center text-center border-b-4 border-legal-brown">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-4 shadow-inner">
            <ShieldCheckIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Important Notice</h2>
        </div>
        
        <div className="p-6">
          <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed mb-4">
            <strong>Your Legal AI</strong> provides general information to help you understand your rights in Nigeria. 
            However, this is <strong>not</strong> a substitute for professional legal advice.
          </p>
          
          <ul className="text-sm text-gray-600 dark:text-gray-400 mb-8 list-disc pl-5 space-y-2">
            <li>We do not provide formal legal representation.</li>
            <li>Laws can change, and individual cases vary.</li>
            <li>Always consult a qualified lawyer for serious legal matters.</li>
            <li>Responses may be limited when offline.</li>
          </ul>

          <button
            onClick={() => setIsVisible(false)}
            className="w-full bg-legal-green hover:bg-legal-black text-white font-bold py-3.5 px-4 rounded-xl transition-colors shadow-lg"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegalDisclaimer;