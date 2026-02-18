
import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, MapPinIcon, PaperclipIcon, MicIcon, XIcon } from './Icons';
import { blobToBase64 } from '../utils/fileUtils';
import { Attachment } from '../types';

interface ChatInputProps {
  onSend: (text: string, attachments: Attachment[]) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, isLoading }) => {
  const [text, setText] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((text.trim() || attachments.length > 0) && !isLoading) {
      onSend(text, attachments);
      setText('');
      setAttachments([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleLocationClick = () => {
    if (isLoading || isLocating) return;
    
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const locationMsg = `I am currently at Lat: ${latitude}, Long: ${longitude}. Please find relevant legal information for this area.`;
        onSend(locationMsg, []);
        setIsLocating(false);
      },
      (error) => {
        alert("Unable to retrieve your location.");
        setIsLocating(false);
      }
    );
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: Attachment[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const base64 = await blobToBase64(file);
        newAttachments.push({
          type: file.type.startsWith('image') ? 'image' : 'document',
          mimeType: file.type,
          data: base64,
          name: file.name
        });
      } catch (err) {
        console.error("Error reading file", err);
      }
    }
    setAttachments(prev => [...prev, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [text]);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-6 pt-2">
      {attachments.length > 0 && (
        <div className="flex gap-2 overflow-x-auto mb-2 pb-2 scrollbar-hide">
          {attachments.map((att, idx) => (
            <div key={idx} className="relative shrink-0 w-20 h-20 bg-white dark:bg-legal-black rounded-lg border border-gray-200 dark:border-white overflow-hidden flex items-center justify-center">
              {att.type === 'image' ? (
                <img src={`data:${att.mimeType};base64,${att.data}`} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <PaperclipIcon className="w-8 h-8 text-gray-400 dark:text-white" />
              )}
              <button 
                onClick={() => removeAttachment(idx)}
                className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 shadow-md"
              >
                <XIcon className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <form 
        onSubmit={handleSubmit}
        className="relative flex items-end gap-2 bg-white dark:bg-legal-black rounded-2xl border border-gray-200 dark:border-white shadow-xl focus-within:ring-2 focus-within:ring-legal-green transition-all p-2"
      >
        <input 
          type="file" 
          multiple 
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,application/pdf"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="p-2.5 rounded-xl flex items-center justify-center transition-all shrink-0 bg-gray-50 dark:bg-legal-green/20 text-legal-green dark:text-white hover:bg-gray-100"
        >
          <PaperclipIcon className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={handleLocationClick}
          disabled={isLoading || isLocating}
          className={`p-2.5 rounded-xl flex items-center justify-center transition-all shrink-0 ${isLocating ? 'bg-legal-green text-white animate-pulse' : 'bg-gray-50 dark:bg-legal-green/20 text-legal-green dark:text-white'}`}
        >
          <MapPinIcon className="w-5 h-5" />
        </button>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask your legal question..."
          className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/50 text-base p-2 resize-none focus:outline-none max-h-[150px] overflow-y-auto scrollbar-hide"
          rows={1}
          disabled={isLoading}
        />

        <button
          type="submit"
          disabled={(!text.trim() && attachments.length === 0) || isLoading}
          className={`p-2.5 rounded-xl flex items-center justify-center transition-all shrink-0 ${ (text.trim() || attachments.length > 0) && !isLoading ? 'bg-legal-green text-white dark:bg-white dark:text-legal-black shadow-lg' : 'bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-white/20' }`}
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
