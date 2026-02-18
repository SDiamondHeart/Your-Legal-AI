
import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Settings from './components/Settings';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import LegalDisclaimer from './components/LegalDisclaimer';
import AboutModal from './components/AboutModal';
import History from './components/History';
import AudioController from './components/AudioController';
import { Message, Sender, AppView, ChatMode, Attachment, ChatSession, UserProfile } from './types';
import { sendMessageStream, initializeChat, resetChat, resumeChatSession, stopSpeech } from './services/geminiService';
import { INITIAL_GREETING, MODES } from './constants';
import { WifiOffIcon, ChevronDownIcon } from './components/Icons';
import { saveSession, generateTitle, getProfile, saveProfile } from './utils/storage';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('hero');
  const [chatMode, setChatMode] = useState<ChatMode>('standard');
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isAudioActive, setIsAudioActive] = useState(false);
  
  const [userProfile, setUserProfile] = useState<UserProfile>(() => getProfile());
  
  // PWA Install Prompt State
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  // Initialize dark mode from system preference
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Listen for System Theme Changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    // PWA Install Prompt Handler
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      console.log('App successfully installed');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Listen for audio events
  useEffect(() => {
    const checkAudio = () => {
      const isSpeaking = !!(window as any).currentTtsSource || window.speechSynthesis.speaking;
      setIsAudioActive(isSpeaking);
    };
    const interval = setInterval(checkAudio, 500);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    saveProfile(newProfile);
  };

  const handleInstallClick = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          setInstallPrompt(null);
        }
      });
    }
  };

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsModeDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (sessionId && messages.length > 1) {
      const title = generateTitle(messages.find(m => m.sender === Sender.USER) || messages[0]);
      const session: ChatSession = {
        id: sessionId,
        title,
        messages,
        mode: chatMode,
        lastModified: Date.now()
      };
      saveSession(session);
    }
  }, [messages, sessionId, chatMode]);

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    let timeGreeting = "";

    if (hour >= 0 && hour < 5) timeGreeting = "Night Owl";
    else if (hour >= 5 && hour < 12) timeGreeting = "Good morning";
    else if (hour >= 12 && hour < 17) timeGreeting = "Good afternoon";
    else if (hour >= 17 && hour < 22) timeGreeting = "Good evening";
    else timeGreeting = "Good night";

    return `${timeGreeting}! ${INITIAL_GREETING}`;
  };

  const startNewChat = (mode: ChatMode = 'standard') => {
    resetChat();
    const newId = Date.now().toString();
    setSessionId(newId);
    setChatMode(mode);
    setMessages([
      {
        id: 'init-1',
        text: getTimeBasedGreeting(),
        sender: Sender.BOT,
        timestamp: new Date(),
      },
    ]);
    initializeChat(mode, userProfile);
    setView('chat');
  };

  const handleResumeChat = (session: ChatSession) => {
    setSessionId(session.id);
    setMessages(session.messages);
    setChatMode(session.mode);
    resumeChatSession(session.messages, session.mode, userProfile);
    setView('chat');
  };

  const handleClearHistory = () => {
    resetChat();
    setMessages([]);
    startNewChat(chatMode);
  };

  const handleFeedback = (id: string, type: 'like' | 'dislike') => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, feedback: type } : msg
    ));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (view === 'chat') scrollToBottom();
  }, [messages, view]);

  const handleSendMessage = async (text: string, attachments: Attachment[]) => {
    if (!isOnline) {
        alert("You are currently offline. Please connect to the internet to chat.");
        return;
    }

    const userMsgId = Date.now().toString();
    const userMessage: Message = {
      id: userMsgId,
      text: text,
      sender: Sender.USER,
      timestamp: new Date(),
      attachments: attachments
    };

    const botMsgId = (Date.now() + 1).toString();
    const botMessagePlaceholder: Message = {
      id: botMsgId,
      text: '',
      sender: Sender.BOT,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage, botMessagePlaceholder]);
    setIsLoading(true);

    try {
      await sendMessageStream(text, attachments, chatMode, userProfile, (streamedText, groundingMetadata) => {
        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === botMsgId 
              ? { 
                  ...msg, 
                  text: streamedText,
                  groundingMetadata: groundingMetadata || msg.groundingMetadata 
                } 
              : msg
          )
        );
      });
    } catch (error) {
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === botMsgId 
            ? { ...msg, text: "Abeg, network wahala or something go wrong. Try ask again.", isError: true } 
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-legal-paper dark:bg-legal-black transition-colors duration-200">
      <LegalDisclaimer />
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      
      <Header 
        currentView={view} 
        onChangeView={setView} 
        onNewChat={() => startNewChat('standard')}
        installPrompt={installPrompt}
        onInstall={handleInstallClick}
      />
      
      {!isOnline && (
        <div className="bg-legal-brown text-white text-xs py-1 px-4 text-center font-medium flex items-center justify-center gap-2">
            <WifiOffIcon className="w-4 h-4" />
            You are currently offline.
        </div>
      )}
      
      <main className="flex-1 overflow-y-auto scrollbar-hide relative">
        
        {view === 'hero' && (
          <Hero 
            onStartChat={startNewChat} 
            onInstall={handleInstallClick}
            showInstallButton={!!installPrompt}
          />
        )}

        {view === 'settings' && (
          <Settings 
            isDarkMode={isDarkMode}
            toggleTheme={toggleTheme}
            onClearHistory={handleClearHistory}
            onOpenAbout={() => setIsAboutOpen(true)}
            installPrompt={installPrompt}
            onInstall={handleInstallClick}
            userProfile={userProfile}
            onUpdateProfile={handleUpdateProfile}
          />
        )}

        {view === 'history' && (
          <History onResumeChat={handleResumeChat} />
        )}

        {view === 'chat' && (
          <div className="flex flex-col h-full relative">
            <div className="sticky top-0 z-30 bg-legal-paper/95 dark:bg-legal-black/95 backdrop-blur-sm border-b border-legal-brown/20 dark:border-gray-800 px-4 py-2 flex justify-center">
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsModeDropdownOpen(!isModeDropdownOpen)}
                  className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-legal-brown/30 dark:border-gray-700 rounded-full px-4 py-1.5 shadow-sm text-sm font-bold text-legal-green dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="uppercase tracking-wider text-[11px]">Mode:</span>
                  <span>{MODES[chatMode].label}</span>
                  <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isModeDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isModeDropdownOpen && (
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-72 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-legal-brown/20 dark:border-gray-700 overflow-hidden z-50 animate-fade-in-up">
                    <div className="py-2">
                      {(Object.keys(MODES) as ChatMode[]).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => {
                            if (chatMode !== mode) {
                              setChatMode(mode);
                              startNewChat(mode);
                            }
                            setIsModeDropdownOpen(false);
                          }}
                          className={`w-full text-left px-5 py-4 text-sm transition-colors flex flex-col gap-1 ${chatMode === mode ? 'bg-legal-green/10 dark:bg-legal-green/20 border-l-4 border-legal-green' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                        >
                          <span className={`font-bold ${chatMode === mode ? 'text-legal-green dark:text-white' : 'text-gray-900 dark:text-gray-200'}`}>
                            {MODES[mode].label}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 leading-snug">
                            {MODES[mode].description}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 max-w-3xl w-full mx-auto p-4 pb-4">
              {messages.map((msg) => (
                <ChatMessage 
                  key={msg.id} 
                  message={msg} 
                  onFeedback={handleFeedback}
                />
              ))}
              {isLoading && messages[messages.length - 1].text === '' && (
                <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-sm ml-12 mb-4 animate-fade-in">
                  <div className="w-2 h-2 bg-legal-green rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-legal-green rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-legal-green rounded-full animate-bounce delay-200"></div>
                  {chatMode === 'deep_think' && <span className="text-xs font-bold animate-pulse text-legal-brown ml-2">THINKING DEEP...</span>}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <AudioController isActive={isAudioActive} onClose={() => setIsAudioActive(false)} />

            <div className="sticky bottom-0 z-40 bg-gradient-to-t from-legal-paper via-legal-paper dark:from-legal-black dark:via-legal-black to-transparent pt-2">
               <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
