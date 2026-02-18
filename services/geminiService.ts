
import { GoogleGenAI, Chat, GenerateContentResponse, Content, Modality } from "@google/genai";
import { GET_SYSTEM_INSTRUCTION, MODES } from "../constants";
import { Attachment, ChatMode, Message, Sender, UserProfile } from "../types";

let chatSession: Chat | null = null;
let currentMode: ChatMode = 'standard';
let audioContext: AudioContext | null = null;
let globalGainNode: GainNode | null = null;
let ttsVolume = 1.0;

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is required.");
  }
  return new GoogleGenAI({ apiKey });
};

export const resetChat = () => {
  chatSession = null;
};

const createChatConfig = (mode: ChatMode, profile?: UserProfile) => {
  let tools: any[] = [];
  let thinkingConfig: any = undefined;

  if (mode === 'research' || mode === 'standard') {
    tools = [{ googleSearch: {} }];
  } else if (mode === 'deep_think') {
    thinkingConfig = { thinkingBudget: 32768 }; 
    tools = [{ googleSearch: {} }];
  } else if (mode === 'guided_learning') {
    tools = [{ googleMaps: {} }];
  }

  return {
    systemInstruction: GET_SYSTEM_INSTRUCTION(mode, profile),
    temperature: mode === 'deep_think' ? 1.0 : 0.7,
    tools: tools,
    thinkingConfig: thinkingConfig,
  };
};

export const initializeChat = (mode: ChatMode = 'standard', profile?: UserProfile): Chat => {
  const ai = getAiClient();
  currentMode = mode;
  
  chatSession = ai.chats.create({
    model: MODES[mode].model,
    config: createChatConfig(mode, profile),
  });
  return chatSession;
};

export const resumeChatSession = (historyMessages: Message[], mode: ChatMode, profile?: UserProfile): Chat => {
  const ai = getAiClient();
  currentMode = mode;

  const history: Content[] = historyMessages
    .filter(msg => msg.text || (msg.attachments && msg.attachments.length > 0))
    .map(msg => {
      const parts: any[] = [];
      if (msg.attachments) {
        msg.attachments.forEach(att => {
          parts.push({
            inlineData: {
              mimeType: att.mimeType,
              data: att.data
            }
          });
        });
      }
      if (msg.text) parts.push({ text: msg.text });

      return {
        role: msg.sender === Sender.USER ? 'user' : 'model',
        parts: parts
      };
    });

  chatSession = ai.chats.create({
    model: MODES[mode].model,
    config: createChatConfig(mode, profile),
    history: history
  });

  return chatSession;
};

export const getChatSession = (mode: ChatMode, profile?: UserProfile): Chat => {
  if (!chatSession || currentMode !== mode) {
    return initializeChat(mode, profile);
  }
  return chatSession;
};

export const sendMessageStream = async (
  text: string,
  attachments: Attachment[],
  mode: ChatMode,
  profile: UserProfile,
  onChunk: (text: string, groundingMetadata?: any) => void
): Promise<string> => {
  const chat = getChatSession(mode, profile);
  
  try {
    let messagePayload: any;
    
    if (attachments.length > 0) {
      const parts = [];
      for (const att of attachments) {
        parts.push({
          inlineData: {
            mimeType: att.mimeType,
            data: att.data
          }
        });
      }
      if (text.trim()) parts.push({ text: text });
      messagePayload = parts;
    } else {
      messagePayload = text;
    }

    const resultStream = await chat.sendMessageStream({ message: messagePayload });
    
    let fullText = "";
    for await (const chunk of resultStream) {
      const responseChunk = chunk as GenerateContentResponse;
      const textChunk = responseChunk.text;
      const groundingMetadata = responseChunk.candidates?.[0]?.groundingMetadata;
      
      if (textChunk) {
        fullText += textChunk;
        onChunk(fullText, groundingMetadata);
      }
    }
    return fullText;
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw error;
  }
};

/**
 * TEXT-TO-SPEECH (TTS) IMPLEMENTATION
 */

function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const ensureAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    globalGainNode = audioContext.createGain();
    globalGainNode.gain.value = ttsVolume;
    globalGainNode.connect(audioContext.destination);
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return { ctx: audioContext, gain: globalGainNode! };
};

export const setTtsVolume = (value: number) => {
  ttsVolume = value;
  if (globalGainNode) {
    globalGainNode.gain.value = value;
  }
};

export const getTtsVolume = () => ttsVolume;

export const generateSpeech = async (text: string, voiceName: string = 'Kore'): Promise<void> => {
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Read this in a calm, helpful Nigerian tone: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data received from Gemini.");

    const { ctx, gain } = ensureAudioContext();
    const audioBytes = decodeBase64(base64Audio);
    const audioBuffer = await decodeAudioData(audioBytes, ctx, 24000, 1);
    
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(gain);
    source.start();

    (window as any).currentTtsSource = source;
  } catch (error) {
    console.error("Gemini TTS Error:", error);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = ttsVolume;
    window.speechSynthesis.speak(utterance);
  }
};

export const stopSpeech = () => {
  if ((window as any).currentTtsSource) {
    try {
      (window as any).currentTtsSource.stop();
    } catch (e) {}
  }
  window.speechSynthesis.cancel();
};
