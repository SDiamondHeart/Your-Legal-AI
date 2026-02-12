
import React, { useState, useEffect } from 'react';
import { Message, Sender } from '../types';
import { UserIcon, ScaleIcon, MapPinIcon, MicIcon, PaperclipIcon, ThumbsUpIcon, ThumbsDownIcon, SpeakerIcon, AcademicCapIcon } from './Icons';

interface ChatMessageProps {
  message: Message;
  onFeedback?: (id: string, type: 'like' | 'dislike') => void;
}

interface Flashcard {
  front: string;
  back: string;
}

const FlashcardViewer: React.FC<{ cards: Flashcard[] }> = ({ cards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!cards || cards.length === 0) return null;
  const currentCard = cards[currentIndex];

  return (
    <div className="mt-4 max-w-sm w-full mx-auto">
      <div className="flex justify-between items-center mb-2 text-xs text-gray-500">
        <span className="font-bold flex items-center gap-1 uppercase tracking-tighter"><AcademicCapIcon className="w-3 h-3" /> Flashcards</span>
        <span>{currentIndex + 1} of {cards.length}</span>
      </div>
      
      <div className="relative h-48 w-full perspective-1000 cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
        <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
          <div className="absolute w-full h-full bg-white dark:bg-gray-800 border-2 border-legal-green rounded-xl p-6 flex flex-col items-center justify-center text-center backface-hidden shadow-md">
             <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2 font-bold">Front</p>
             <p className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{currentCard.front}</p>
          </div>
          <div className="absolute w-full h-full bg-legal-green text-white rounded-xl p-6 flex flex-col items-center justify-center text-center backface-hidden rotate-y-180 shadow-md">
             <p className="text-[10px] opacity-70 uppercase tracking-widest mb-2 font-bold">Back</p>
             <p className="text-lg font-medium leading-tight">{currentCard.back}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-4 mt-4">
        <button onClick={(e) => { e.stopPropagation(); setIsFlipped(false); setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length); }} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors">←</button>
        <button onClick={(e) => { e.stopPropagation(); setIsFlipped(false); setCurrentIndex((prev) => (prev + 1) % cards.length); }} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors">→</button>
      </div>
    </div>
  );
};

const renderInline = (text: string): React.ReactNode[] => {
  const boldRegex = /\*\*(.*?)\*\*/g;
  const italicRegex = /\*(.*?)\*/g;
  
  let parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-extrabold text-legal-black dark:text-white">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i} className="italic text-legal-brown dark:text-legal-brown">{part.slice(1, -1)}</em>;
    }
    return part;
  });
};

const FormatText: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;
  const lines = text.split('\n');
  const nodes: React.ReactNode[] = [];
  let listBuffer: string[] = [];

  const flushList = () => {
    if (listBuffer.length > 0) {
      nodes.push(
        <ul key={`list-${nodes.length}`} className="list-disc pl-5 mb-4 space-y-2">
          {listBuffer.map((item, idx) => <li key={idx} className="pl-1 text-gray-800 dark:text-gray-200">{renderInline(item)}</li>)}
        </ul>
      );
      listBuffer = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('### ')) {
      flushList();
      nodes.push(<h3 key={`h3-${index}`} className="text-lg font-bold mt-6 mb-2 text-legal-black dark:text-white border-b border-legal-brown/10 pb-1">{renderInline(trimmed.slice(4))}</h3>);
    } else if (trimmed.startsWith('## ')) {
      flushList();
      nodes.push(<h2 key={`h2-${index}`} className="text-xl font-bold mt-8 mb-3 text-legal-black dark:text-white">{renderInline(trimmed.slice(3))}</h2>);
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      listBuffer.push(trimmed.slice(2));
    } else if (/^\d+\.\s/.test(trimmed)) {
      listBuffer.push(trimmed.replace(/^\d+\.\s/, ''));
    } else if (trimmed === '') {
      flushList();
    } else {
      flushList();
      nodes.push(<p key={`p-${index}`} className="mb-3 leading-relaxed text-gray-800 dark:text-gray-200">{renderInline(line)}</p>);
    }
  });

  flushList();
  return <div className="text-[15px] md:text-base">{nodes}</div>;
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onFeedback }) => {
  const isUser = message.sender === Sender.USER;
  const [isReading, setIsReading] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[] | null>(null);
  const [displayText, setDisplayText] = useState(message.text);

  useEffect(() => {
    if (message.text) {
      const jsonRegex = /```json\s*(\{[\s\S]*?"type":\s*"flashcards"[\s\S]*?\})\s*```/i;
      const match = message.text.match(jsonRegex);
      if (match && match[1]) {
        try {
          const parsed = JSON.parse(match[1]);
          if (parsed.type === 'flashcards' && Array.isArray(parsed.cards)) {
            setFlashcards(parsed.cards);
            setDisplayText(message.text.replace(match[0], '').trim());
          }
        } catch (e) { setDisplayText(message.text); }
      } else { setDisplayText(message.text); }
    }
  }, [message.text]);

  const handleSpeak = () => {
    if (isReading) { window.speechSynthesis.cancel(); setIsReading(false); return; }
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(displayText);
      utterance.onend = () => setIsReading(false);
      setIsReading(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const renderGrounding = () => {
    if (!message.groundingMetadata?.groundingChunks) return null;
    const chunks = message.groundingMetadata.groundingChunks.filter((c: any) => c.web?.uri || c.maps?.uri);
    if (chunks.length === 0) return null;
    return (
      <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
        <span className="w-full text-[10px] font-bold uppercase text-gray-400 mb-1">Legal Sources & Context:</span>
        {chunks.map((chunk: any, index: number) => {
          const uri = chunk.web?.uri || chunk.maps?.uri;
          const title = chunk.web?.title || chunk.maps?.title || "Legal Resource";
          return (
            <a key={index} href={uri} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-legal-green/5 dark:bg-gray-700 text-legal-green dark:text-gray-200 px-3 py-2 rounded-lg hover:bg-legal-green/10 transition-colors border border-legal-green/10">
              {chunk.maps ? <MapPinIcon className="w-3 h-3" /> : <ScaleIcon className="w-3 h-3" />}
              {title}
            </a>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-8 animate-fade-in-up group`}>
      <div className={`flex max-w-[95%] md:max-w-[85%] gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center shadow-md border ${isUser ? 'bg-legal-black text-white border-legal-black' : 'bg-legal-green text-white border-legal-green'}`}>
          {isUser ? <UserIcon className="w-5 h-5" /> : <ScaleIcon className="w-5 h-5" />}
        </div>
        <div className="flex flex-col w-full">
           <div className={`px-5 py-4 rounded-2xl shadow-sm ${isUser ? 'bg-legal-paper dark:bg-gray-800 border-2 border-legal-black/10 dark:border-gray-700 rounded-tr-none' : 'bg-white dark:bg-gray-900 border border-legal-brown/10 dark:border-gray-800 rounded-tl-none'}`}>
            <FormatText text={displayText} />
            {flashcards && <FlashcardViewer cards={flashcards} />}
            {renderGrounding()}
            <div className={`text-[10px] mt-4 opacity-40 font-bold ${isUser ? 'text-right' : 'text-left'}`}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
             {!isUser && (
                <button onClick={handleSpeak} className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${isReading ? 'text-legal-green bg-legal-green/10' : 'text-gray-400'}`}><SpeakerIcon className="w-4 h-4" /></button>
             )}
             {!isUser && (
                <>
                  <button onClick={() => onFeedback?.(message.id, 'like')} className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${message.feedback === 'like' ? 'text-legal-green' : 'text-gray-400'}`}><ThumbsUpIcon className="w-4 h-4" /></button>
                  <button onClick={() => onFeedback?.(message.id, 'dislike')} className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${message.feedback === 'dislike' ? 'text-red-500' : 'text-gray-400'}`}><ThumbsDownIcon className="w-4 h-4" /></button>
                </>
             )}
          </div>
        </div>
      </div>
      <style>{`.perspective-1000{perspective:1000px}.transform-style-3d{transform-style:preserve-3d}.backface-hidden{backface-visibility:hidden}.rotate-y-180{transform:rotateY(180deg)}`}</style>
    </div>
  );
};

export default ChatMessage;
