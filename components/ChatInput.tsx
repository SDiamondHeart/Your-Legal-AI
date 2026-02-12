
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
    
    const confirmed = window.confirm("Do you allow Your Legal AI to access your location to find nearby lawyers?");
    if (!confirmed) return;
    
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const locationMsg = `I am currently at Lat: ${latitude}, Long: ${longitude}. Please find a lawyer or legal aid near me.`;
        onSend(locationMsg, []);
        setIsLocating(false);
      },
      (error) => {
        console.error("Error getting location", error);
        alert("Unable to retrieve your location. Please type your city manually.");
        setIsLocating(false);
      }
    );
  };

  // File Handling
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const confirmed = window.confirm("You are about to upload a file. Do you consent to Your Legal AI analyzing this document/photo?");
    if (!confirmed) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

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

  // Audio Note Recording
  const startRecording = async () => {
    try {
      const confirmed = window.confirm("Your Legal AI wants to record audio. Do you consent?");
      if (!confirmed) return;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' }); 
        const base64 = await blobToBase64(audioBlob);
        setAttachments(prev => [...prev, {
          type: 'audio',
          mimeType: 'audio/mp3',
          data: base64,
          name: 'Voice Note'
        }]);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone", err);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Speech to Text (Dictation)
  const toggleDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Speech to text is not supported in this browser.");
      return;
    }

    if (isDictating) {
      recognitionRef.current?.stop();
      setIsDictating(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-NG'; // Prioritize Nigerian English

    recognition.onstart = () => setIsDictating(true);
    recognition.onend = () => setIsDictating(false);
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsDictating(false);
    };
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setText(prev => prev + (prev ? ' ' : '') + transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [text]);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4 pt-2">
      
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="flex gap-2 overflow-x-auto mb-2 pb-2">
          {attachments.map((att, idx) => (
            <div key={idx} className="relative shrink-0 w-20 h-20 bg-legal-paper dark:bg-gray-800 rounded-lg border border-legal-brown/20 dark:border-gray-700 overflow-hidden flex items-center justify-center">
              {att.type === 'image' ? (
                <img src={`data:${att.mimeType};base64,${att.data}`} alt="Preview" className="w-full h-full object-cover" />
              ) : att.type === 'audio' ? (
                <MicIcon className="w-8 h-8 text-gray-400" />
              ) : (
                <PaperclipIcon className="w-8 h-8 text-gray-400" />
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
        className="relative flex items-end gap-2 bg-white dark:bg-gray-800 rounded-2xl border border-legal-brown/20 dark:border-gray-700 shadow-lg focus-within:ring-2 focus-within:ring-legal-green dark:focus-within:ring-legal-green focus-within:border-transparent transition-all p-2"
      >
        {/* Hidden File Input */}
        <input 
          type="file" 
          multiple 
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,application/pdf,.doc,.docx,audio/*"
        />

        {/* File Attachment Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="p-2.5 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0 bg-legal-paper dark:bg-gray-700 text-legal-brown dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
          title="Attach File (Photo, Doc)"
        >
          <PaperclipIcon className="w-5 h-5" />
        </button>

        {/* Location Button */}
        <button
          type="button"
          onClick={handleLocationClick}
          disabled={isLoading || isLocating}
          className={`
            p-2.5 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0
            ${isLocating 
              ? 'bg-legal-paper dark:bg-gray-700 text-legal-green animate-pulse' 
              : 'bg-legal-paper dark:bg-gray-700 text-legal-brown dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}
          `}
          title="Share Location"
        >
          <MapPinIcon className="w-5 h-5" />
        </button>

        {/* Hold to Record Audio */}
        <button
          type="button"
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
          disabled={isLoading}
          className={`
            p-2.5 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0
            ${isRecording 
              ? 'bg-red-500 text-white animate-pulse' 
              : 'bg-legal-paper dark:bg-gray-700 text-legal-brown dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}
          `}
          title="Hold to Record Audio Note"
        >
          <MicIcon className="w-5 h-5" />
        </button>

        <div className="relative w-full">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isRecording ? "Recording..." : isDictating ? "Listening..." : "Type here..."}
              className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-base p-2 pr-8 resize-none focus:outline-none max-h-[150px] overflow-y-auto scrollbar-hide"
              rows={1}
              disabled={isLoading}
            />
             {/* Tap to Dictate (inside text area) */}
             <button
              type="button"
              onClick={toggleDictation}
              className={`absolute right-1 top-2 p-1 rounded-full ${isDictating ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-legal-green'}`}
              title="Tap to speak (Speech to text)"
             >
               <MicIcon className="w-4 h-4" />
             </button>
        </div>

        <button
          type="submit"
          disabled={(!text.trim() && attachments.length === 0) || isLoading}
          className={`
            p-2.5 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0
            ${(text.trim() || attachments.length > 0) && !isLoading 
              ? 'bg-legal-green text-white hover:bg-legal-black shadow-md' 
              : 'bg-legal-paper dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'}
          `}
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default ChatInput;