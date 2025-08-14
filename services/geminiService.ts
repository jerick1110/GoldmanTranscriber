import { GoogleGenAI } from "@google/genai";
import { KEY_INFO_PROMPT_SCHEMA } from "../constants";
import { KeyInfo } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set. This is required for the application to function.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const model = 'gemini-2.5-flash';

export async function transcribeMedia(base64Data: string, mimeType: string): Promise<string> {
    const audioPart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Data,
      },
    };
    
    const textPart = {
      text: "Transcribe this audio/video file. Provide only the transcribed text, with no additional commentary or formatting."
    };

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: { parts: [textPart, audioPart] },
        });
        const text = response.text;
        if (text === undefined) {
            throw new Error("Failed to transcribe media file: received an undefined response from the AI model.");
        }
        return text;
    } catch (error) {
        console.error(`Error calling Gemini API for transcription:`, error);
        throw new Error("Failed to transcribe media file. The file might be unsupported, corrupted, or too large.");
    }
}

export async function generateContent(promptTemplate: string, transcription: string): Promise<string> {
    const fullPrompt = promptTemplate.replace('{transcription_text}', transcription);

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: fullPrompt,
            config: {
                temperature: 0.2,
                topP: 0.9,
            }
        });
        
        const text = response.text;
        if (text === undefined) {
            throw new Error("Failed to generate content: received an undefined response from the AI model.");
        }
        return text;
    } catch (error) {
        console.error(`Error calling Gemini API for content generation:`, error);
        throw new Error("Failed to generate document content from AI.");
    }
}

export async function generateKeyInfo(transcription: string): Promise<KeyInfo> {
    const contents = `From the following transcription, extract the key information based on the provided schema.\n\nTRANSCRIPTION:\n---\n${transcription}\n---`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: contents,
            config: {
                responseMimeType: "application/json",
                responseSchema: KEY_INFO_PROMPT_SCHEMA,
            },
        });
        
        const jsonText = response.text;
        if (!jsonText) {
             throw new Error("Failed to extract key info: received an empty or undefined response from the AI model.");
        }
        return JSON.parse(jsonText.trim()) as KeyInfo;

    } catch (error) {
        console.error(`Error calling Gemini API for key info extraction:`, error);
        throw new Error("Failed to extract key information from AI.");
    }
}