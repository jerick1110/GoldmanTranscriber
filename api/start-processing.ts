import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";
import { SOP_PROMPT, SUMMARY_PROMPT, ACTION_ITEMS_PROMPT, KEY_INFO_PROMPT_SCHEMA, MOCK_TRANSCRIPTION } from '../constants';
import { KeyInfo } from '../types';
import { jobStorage } from './_job-storage'; // In-memory store

const API_KEY = process.env.API_KEY;
const model = 'gemini-2.5-flash';

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

// --- Helper functions for AI generation ---
async function generateContent(promptTemplate: string, transcription: string): Promise<string> {
    const fullPrompt = promptTemplate.replace('{transcription_text}', transcription);
    const response = await ai.models.generateContent({
        model,
        contents: fullPrompt,
        config: { temperature: 0.2, topP: 0.9 }
    });
    const text = response.text;
    if (text === undefined) {
        throw new Error("Failed to generate content: received an undefined response from the AI model.");
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
        throw new Error("Failed to extract key info: received an empty or undefined response from the AI model.");
    }
    return JSON.parse(jsonText.trim()) as KeyInfo;
}
// --- Main async processing function ---
async function processFileInBackground(jobId: string) {
    try {
        // In a real application, you would download the file from cloud storage here.
        // For this simulation, we will use mock data as we cannot receive the large file.
        jobStorage.set(jobId, { status: { status: 'PROCESSING', message: 'Transcribing audio...' }, results: null });
        const transcription = MOCK_TRANSCRIPTION; // Simulating transcription result
        await new Promise(resolve => setTimeout(resolve, 5000)); // Simulate delay

        jobStorage.set(jobId, { status: { status: 'PROCESSING', message: 'Generating SOP...' }, results: null });

        // Generate all content in parallel
        const [sop, summary, actionItems, keyInfo] = await Promise.all([
            generateContent(SOP_PROMPT, transcription),
            generateContent(SUMMARY_PROMPT, transcription),
            generateContent(ACTION_ITEMS_PROMPT, transcription),
            generateKeyInfo(transcription)
        ]);

        const results = { transcription, sop, summary, actionItems, keyInfo };
        
        // Store final results and mark as complete
        jobStorage.set(jobId, { status: { status: 'COMPLETED', message: 'Processing complete.' }, results });

    } catch (error) {
        console.error(`Error processing job ${jobId}:`, error);
        jobStorage.set(jobId, { 
            status: { status: 'FAILED', message: error instanceof Error ? error.message : 'An unknown error occurred.' }, 
            results: null 
        });
    }
}


export default function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Immediately generate a job ID and respond to the client
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    jobStorage.set(jobId, { status: { status: 'PENDING', message: 'Job accepted and queued.' }, results: null });

    // Start the long-running process, but do not wait for it to finish
    processFileInBackground(jobId);

    // Return the Job ID so the client can poll for status
    res.status(202).json({ jobId });
}