
import React, { useState, useEffect } from 'react';
import { VolumeHighIcon, VolumeMuteIcon, XIcon, SpeakerIcon } from './Icons';
import { stopSpeech, setTtsVolume, getTtsVolume } from '../services/geminiService';

interface AudioControllerProps {
  isActive: boolean;
  onClose: () => void;
}

const AudioController: React.FC<AudioControllerProps> = ({ isActive, onClose }) => {
  const [volume, setVolume] = useState(getTtsVolume());
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(getTtsVolume());

  useEffect(() => {
    setTtsVolume(isMuted ? 0 : volume);
  }, [volume, isMuted]);

  const handleMuteToggle = () => {
    if (isMuted) {
      setVolume(prevVolume || 0.5);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      setIsMuted(true);
      setVolume(0);
    }
  };

  const handleStop = () => {
    stopSpeech();
    onClose();
  };

  if (!isActive) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-legal-brown/20 dark:border-gray-700 shadow-2xl rounded-2xl px-4 py-3 flex items-center gap-4 min-w-[300px]">
        
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-legal-green rounded-lg flex items-center justify-center text-white shadow-sm relative overflow-hidden">
                <SpeakerIcon className="w-4 h-4 z-10" />
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-legal-green tracking-widest">Speaking</span>
                <div className="flex gap-0.5 h-2 items-end">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className={`w-1 bg-legal-green rounded-full animate-audio-bar delay-${i * 100}`}></div>
                    ))}
                </div>
            </div>
        </div>

        <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-700 mx-1"></div>

        <div className="flex items-center gap-3 flex-1">
            <button 
                onClick={handleMuteToggle}
                className="text-gray-500 dark:text-gray-400 hover:text-legal-green transition-colors"
            >
                {isMuted || volume === 0 ? <VolumeMuteIcon className="w-5 h-5" /> : <VolumeHighIcon className="w-5 h-5" />}
            </button>
            <input 
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => {
                    setVolume(parseFloat(e.target.value));
                    setIsMuted(false);
                }}
                className="w-24 accent-legal-green h-1.5 rounded-lg appearance-none bg-gray-200 dark:bg-gray-700 cursor-pointer"
            />
        </div>

        <button 
            onClick={handleStop}
            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-xl transition-colors"
            title="Stop Reading"
        >
            <XIcon className="w-5 h-5" />
        </button>
      </div>
      <style>{`
        @keyframes audio-bar {
          0%, 100% { height: 4px; }
          50% { height: 12px; }
        }
        .animate-audio-bar { animation: audio-bar 0.8s ease-in-out infinite; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
      `}</style>
    </div>
  );
};

export default AudioController;
