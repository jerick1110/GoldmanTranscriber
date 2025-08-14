import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";
import { SOP_PROMPT, SUMMARY_PROMPT, ACTION_ITEMS_PROMPT, KEY_INFO_PROMPT_SCHEMA } from '../constants';
import { KeyInfo } from '../types';

const API_KEY = process.env.API_KEY;
const model = 'gemini-2.5-flash';

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });


async function transcribeMedia(base64Data: string, mimeType: string): Promise<string> {
    const audioPart = { inlineData: { mimeType, data: base64Data } };
    const textPart = { text: "Transcribe this audio/video file. Provide only the transcribed text, with no additional commentary or formatting." };
    const response = await ai.models.generateContent({ model, contents: { parts: [textPart, audioPart] } });
    const text = response.text;
    if (text === undefined) {
        throw new Error("Transcription failed: received an undefined response from the AI model.");
    }
    return text;
}

async function generateContent(promptTemplate: string, transcription: string): Promise<string> {
    const fullPrompt = promptTemplate.replace('{transcription_text}', transcription);
    const response = await ai.models.generateContent({
        model,
        contents: fullPrompt,
        config: { temperature: 0.2, topP: 0.9 }
    });
    const text = response.text;
    if (text === undefined) {
        throw new Error("Content generation failed: received an undefined response from the AI model.");
    }
    return text;
}

async function generateKeyInfo(transcription: string): Promise<KeyInfo> {
    const contents = `From the following transcription, extract the key information based on the provided schema.\n\nTRANSCRIPTION:\n---\n${transcription}\n---`;
    const response = await ai.models.generateContent({
        model,
        contents,
        config: { responseMimeType: "application/json", responseSchema: KEY_INFO_PROMPT_SCHEMA }
    });
    const jsonText = response.text;
    if (!jsonText) {
        throw new Error("Key info extraction failed: received an empty or undefined response from the AI model.");
    }
    return JSON.parse(jsonText.trim()) as KeyInfo;
}


export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { base64Data, mimeType } = req.body;

        if (!base64Data || !mimeType) {
            return res.status(400).json({ error: 'Missing base64Data or mimeType in request body.' });
        }
        
        // 1. Transcribe
        const transcription = await transcribeMedia(base64Data, mimeType);
        if (!transcription) {
            return res.status(500).json({ error: "Transcription failed, the result was empty." });
        }

        // 2. Generate all content in parallel
        const [sop, summary, actionItems, keyInfo] = await Promise.all([
            generateContent(SOP_PROMPT, transcription),
            generateContent(SUMMARY_PROMPT, transcription),
            generateContent(ACTION_ITEMS_PROMPT, transcription),
            generateKeyInfo(transcription)
        ]);

        // 3. Send back all results
        return res.status(200).json({
            transcription,
            sop,
            summary,
            actionItems,
            keyInfo
        });

    } catch (error) {
        console.error('Error in /api/process:', error);
        const errorMessage = error instanceof Error ? error.message : "An unknown internal server error occurred.";
        return res.status(500).json({ error: errorMessage });
    }
}