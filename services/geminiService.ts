import { GoogleGenAI, Type, Schema, Chat } from "@google/genai";
import { TripItinerary, ChatMessage, Coordinates } from '../types';
import { MODEL_FLASH, TRIP_GENERATION_PROMPT, CHAT_SYSTEM_INSTRUCTION } from '../constants';

// Initialize Gemini Client
// CRITICAL: process.env.API_KEY is assumed to be available
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schema for Trip Itinerary
const itinerarySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    tripTitle: { type: Type.STRING, description: "A catchy title for the trip" },
    destination: { type: Type.STRING, description: "The main city or country" },
    duration: { type: Type.STRING, description: "e.g., '3 Days'" },
    summary: { type: Type.STRING, description: "A brief exciting overview of the trip" },
    days: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          dayNumber: { type: Type.INTEGER },
          theme: { type: Type.STRING, description: "Main focus of the day" },
          activities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                time: { type: Type.STRING, description: "e.g., '09:00 AM'" },
                activity: { type: Type.STRING, description: "Name of the activity" },
                description: { type: Type.STRING, description: "Short description" },
                location: { type: Type.STRING, description: "Name of place/area" },
                type: { type: Type.STRING, description: "Must be: Food, Sightseeing, Nature, Relaxation, Culture, or Other" },
                costEstimate: { type: Type.INTEGER, description: "1 (Cheap) to 5 (Expensive)" }
              },
              required: ["time", "activity", "description", "location", "type", "costEstimate"]
            }
          }
        },
        required: ["dayNumber", "theme", "activities"]
      }
    },
    estimatedBudget: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          percentage: { type: Type.NUMBER, description: "Percentage of total budget" }
        }
      }
    }
  },
  required: ["tripTitle", "destination", "duration", "summary", "days", "estimatedBudget"]
};

export const generateTripItinerary = async (prompt: string): Promise<TripItinerary> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: prompt,
      config: {
        systemInstruction: TRIP_GENERATION_PROMPT,
        responseMimeType: "application/json",
        responseSchema: itinerarySchema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as TripItinerary;
  } catch (error) {
    console.error("Trip generation error:", error);
    throw error;
  }
};

let chatSession: Chat | null = null;

export const initializeChat = (location?: Coordinates) => {
  const toolConfig = location ? {
    retrievalConfig: {
      latLng: {
        latitude: location.latitude,
        longitude: location.longitude
      }
    }
  } : undefined;

  chatSession = ai.chats.create({
    model: MODEL_FLASH,
    config: {
      systemInstruction: CHAT_SYSTEM_INSTRUCTION,
      tools: [{ googleMaps: {} }],
      toolConfig: toolConfig
    }
  });
};

export const sendMessageToAssistant = async (message: string): Promise<ChatMessage> => {
  if (!chatSession) {
    initializeChat();
  }

  if (!chatSession) throw new Error("Chat session not initialized");

  const result = await chatSession.sendMessage({ message });
  const text = result.text || "I found some info but couldn't summarize it.";
  
  // Extract grounding metadata (Google Maps)
  const groundingChunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks;
  const groundingLinks: { title: string; uri: string; source: string }[] = [];

  if (groundingChunks) {
    groundingChunks.forEach((chunk: any) => {
      if (chunk.maps?.uri) {
        groundingLinks.push({
          title: chunk.maps.title || "Map Location",
          uri: chunk.maps.uri,
          source: 'Google Maps'
        });
      }
    });
  }

  return {
    id: Date.now().toString(),
    role: 'model',
    text,
    groundingLinks
  };
};
