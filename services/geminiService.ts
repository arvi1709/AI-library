/// <reference types="vite/client" />
import { GoogleGenAI, Type } from "@google/genai";
import { MASTER_CATEGORIES } from "../constants";

// ✅ Explicitly assert the API key is a string
const apiKey = import.meta.env.VITE_API_KEY as string | undefined;

// Safety check
if (!apiKey) {
  throw new Error("❌ Missing VITE_API_KEY in your .env file. Please add it before running the app.");
}

// Initialize Gemini API client
const ai = new GoogleGenAI({ apiKey: apiKey! }); // '!' ensures it's a string now

// Helper to convert a File to a base64 string
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = (error) => reject(error);
  });
};

export const summarizeText = async (text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Please provide a concise, easy-to-read summary of the following text:\n\n---\n\n${text}`,
    });
    return response.text ?? "No response received from Gemini API.";
  } catch (error) {
    console.error("Error summarizing text:", error);
    return "Sorry, I couldn't generate a summary. Please try again later.";
  }
};

export const processTextContent = async (
  text: string
): Promise<{ content: string; tags: string[]; summary: string; categories: string[] }> => {
  try {
    const textPart = {
      text: `CRITICAL INSTRUCTION: The user has provided text. Use it as the source content. Then: 
      1. Generate a concise summary.
      2. Generate 5-7 relevant keywords/tags.
      3. Suggest 1-3 categories from the following master list: [${MASTER_CATEGORIES.join(', ')}].
      Return JSON with: 'content' (the original text), 'summary', 'tags', 'categories'.\n\n---\n\n${text}`,
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [textPart] },
      config: {
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            content: { type: Type.STRING },
            summary: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            categories: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
      },
    });

    const jsonText = response.text ?? "{}";
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error processing text:", error);
    return {
      content: text, // Return original text on error
      tags: [],
      summary: "Sorry, a summary could not be generated for this text.",
      categories: [],
    };
  }
};

export const processFileContent = async (
  file: File
): Promise<{ content: string; tags: string[]; summary: string; categories: string[] }> => {
  try {
    const fileData = await fileToBase64(file);
    const filePart = { inlineData: { data: fileData, mimeType: file.type } };
    const textPart = {
      text: `CRITICAL INSTRUCTION: First, extract the full text content from this file. If it's audio, transcribe it. Preserve all original formatting. 
      Then, perform the following tasks:
      1. Generate a concise summary of the extracted text.
      2. Generate 5-7 relevant keywords/tags.
      3. Suggest 1-3 categories from this master list: [${MASTER_CATEGORIES.join(', ')}].
      Return JSON with: 'content' (the extracted text), 'summary', 'tags', 'categories'.`,
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [filePart, textPart] },
      config: {
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            content: { type: Type.STRING },
            summary: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            categories: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
      },
    });

    const jsonText = response.text ?? "{}";
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error processing file:", error);
    return {
      content: "Sorry, I couldn't process the file. Please try again.",
      tags: [],
      summary: "Sorry, a summary could not be generated for this file.",
      categories: [],
    };
  }
};

export const getChatResponse = async (
  history: { role: string; parts: { text: string }[] }[],
  message: string
): Promise<string> => {
  try {
    const chat = ai.chats.create({ model: "gemini-2.5-flash", history });
    const response = await chat.sendMessage({ message });
    return response.text ?? "No response received from Gemini API.";
  } catch (error) {
    console.error("Error getting chat response:", error);
    return "I'm sorry, but I encountered an error. Please try again.";
  }
};
