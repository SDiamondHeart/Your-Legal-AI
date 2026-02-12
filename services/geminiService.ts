
import { GoogleGenAI, Chat, GenerateContentResponse, Content } from "@google/genai";
import { SYSTEM_INSTRUCTION, MODES } from "../constants";
import { Attachment, ChatMode, Message, Sender } from "../types";

let chatSession: Chat | null = null;
let currentMode: ChatMode = 'standard';

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

const createChatConfig = (mode: ChatMode) => {
  let tools: any[] = [];
  let thinkingConfig: any = undefined;

  // Rule: googleSearch is permitted only as the sole tool.
  // Rule: googleMaps is only supported in Gemini 2.5 series models.
  if (mode === 'research') {
    tools = [{ googleSearch: {} }];
  } else if (mode === 'deep_think') {
    // Gemini 3 Pro supports thinking but not Maps grounding.
    thinkingConfig = { thinkingBudget: 32768 }; 
    tools = [];
  } else if (mode === 'standard' || mode === 'guided_learning') {
    // These modes use gemini-2.5-flash as defined in constants.ts
    tools = [{ googleMaps: {} }];
  }

  return {
    systemInstruction: SYSTEM_INSTRUCTION,
    temperature: mode === 'deep_think' ? 1.0 : 0.7,
    tools: tools,
    thinkingConfig: thinkingConfig,
  };
};

export const initializeChat = (mode: ChatMode = 'standard'): Chat => {
  const ai = getAiClient();
  currentMode = mode;
  
  chatSession = ai.chats.create({
    model: MODES[mode].model,
    config: createChatConfig(mode),
  });
  return chatSession;
};

export const resumeChatSession = (historyMessages: Message[], mode: ChatMode): Chat => {
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
    config: createChatConfig(mode),
    history: history
  });

  return chatSession;
};

export const getChatSession = (mode: ChatMode): Chat => {
  if (!chatSession || currentMode !== mode) {
    return initializeChat(mode);
  }
  return chatSession;
};

export const sendMessageStream = async (
  text: string,
  attachments: Attachment[],
  mode: ChatMode,
  onChunk: (text: string, groundingMetadata?: any) => void
): Promise<string> => {
  const chat = getChatSession(mode);
  
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

    // chat.sendMessageStream takes a message parameter which can be string or Part[]
    const resultStream = await chat.sendMessageStream({ message: messagePayload });
    
    let fullText = "";
    for await (const chunk of resultStream) {
      const responseChunk = chunk as GenerateContentResponse;
      // Use the .text property as per guidelines
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
