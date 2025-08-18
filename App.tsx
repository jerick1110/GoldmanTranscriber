import React, { useState, useCallback } from 'react';
import { AppState, ViewType, DocumentStats } from './types';
import { MOCK_TRANSCRIPTION, MOCK_SOP, MOCK_SUMMARY, MOCK_ACTION_ITEMS, MOCK_KEY_INFO, SOP_PROMPT, SUMMARY_PROMPT, ACTION_ITEMS_PROMPT } from './constants';
import { fileToBase64 } from './utils';
import { transcribeMedia, generateContent, generateKeyInfo } from './services/geminiService';

import Header from './components/Header';
import FileUploader from './components/FileUploader';
import ProcessingView from './components/ProcessingView';
import ResultsView from './components/ResultsView';

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>({
        view: ViewType.UPLOAD,
        file: null,
        transcription: '',
        aiContent: {
            sop: '',
            summary: '',
            actionItems: '',
            keyInfo: null,
        },
        error: null,
        stats: null,
        isFocusMode: false,
    });
    const [processingMessage, setProcessingMessage] = useState<string>('');

    const resetState = useCallback(() => {
        setAppState({
            view: ViewType.UPLOAD,
            file: null,
            transcription: '',
            aiContent: { sop: '', summary: '', actionItems: '', keyInfo: null },
            error: null,
            stats: null,
            isFocusMode: false,
        });
        setProcessingMessage('');
    }, []);

    const calculateStats = (content: string): DocumentStats => {
        if (!content) return { words: 0, characters: 0, readingTimeMinutes: 0 };
        const words = content.trim().split(/\s+/).filter(Boolean).length;
        const characters = content.length;
        const readingTimeMinutes = Math.ceil(words / 200); // Average reading speed
        return { words, characters, readingTimeMinutes };
    };

    const handleFileSelect = useCallback(async (selectedFile: File) => {
        setAppState(prev => ({ 
            ...prev, 
            file: selectedFile, 
            view: ViewType.PROCESSING, 
            error: null,
        }));

        try {
            setProcessingMessage('Reading file...');
            const base64Data = await fileToBase64(selectedFile);

            setProcessingMessage('Transcribing media... This may take a moment.');
            const transcription = await transcribeMedia(base64Data, selectedFile.type);
            setAppState(prev => ({...prev, transcription}));

            setProcessingMessage('Generating documents...');
            const [sop, summary, actionItems, keyInfo] = await Promise.all([
                generateContent(SOP_PROMPT, transcription),
                generateContent(SUMMARY_PROMPT, transcription),
                generateContent(ACTION_ITEMS_PROMPT, transcription),
                generateKeyInfo(transcription)
            ]);

            const sopStats = calculateStats(sop);
            setAppState(prev => ({
                ...prev,
                aiContent: { sop, summary, actionItems, keyInfo },
                stats: sopStats,
                view: ViewType.RESULTS,
            }));

        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setAppState(prev => ({ 
                ...prev, 
                error: `Processing failed. ${errorMessage}`, 
                view: ViewType.UPLOAD 
            }));
        }
    }, []);

    const handleDemo = useCallback(() => {
        setProcessingMessage('Loading demo...');
        setAppState(prev => ({ ...prev, view: ViewType.PROCESSING, error: null }));

        const mockFile = new File([MOCK_TRANSCRIPTION], "sample-meeting-recording.mp3", {
          type: "audio/mpeg",
          lastModified: new Date().getTime(),
        });

        // Simulate processing time for a better UX
        setTimeout(() => {
            const sopStats = calculateStats(MOCK_SOP);
            setAppState({
                view: ViewType.RESULTS,
                file: mockFile,
                transcription: MOCK_TRANSCRIPTION,
                aiContent: {
                    sop: MOCK_SOP,
                    summary: MOCK_SUMMARY,
                    actionItems: MOCK_ACTION_ITEMS,
                    keyInfo: MOCK_KEY_INFO,
                },
                stats: sopStats,
                error: null,
                isFocusMode: false,
            });
        }, 2000);
    }, []);

    const handleTabChange = (content: string) => {
        setAppState(prev => ({
            ...prev,
            stats: calculateStats(content),
        }));
    };

    const toggleFocusMode = () => {
        setAppState(prev => ({ ...prev, isFocusMode: !prev.isFocusMode }));
    };

    const renderContent = () => {
        switch (appState.view) {
            case ViewType.PROCESSING:
                return <ProcessingView message={processingMessage} />;
            case ViewType.RESULTS:
                return (
                    <ResultsView 
                        transcription={appState.transcription} 
                        aiContent={appState.aiContent} 
                        onReset={resetState}
                        file={appState.file}
                        stats={appState.stats}
                        onTabChange={handleTabChange}
                        isFocusMode={appState.isFocusMode}
                        onToggleFocusMode={toggleFocusMode}
                    />
                );
            case ViewType.UPLOAD:
            default:
                return <FileUploader onFileSelect={handleFileSelect} onDemo={handleDemo} error={appState.error} />;
        }
    };

    return (
        <div className="min-h-screen bg-brand-charcoal text-brand-light-gray font-sans">
            {!appState.isFocusMode && <Header onReset={resetState} />}
            <main className={`max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 ${appState.isFocusMode ? 'py-0' : 'py-12'}`}>
                <div className="w-full">
                    {renderContent()}
                </div>
            </main>
             {!appState.isFocusMode && (
                <footer className="text-center py-4 text-slate-500 text-sm">
                    <p>Powered by Gemini API. Designed for excellence.</p>
                </footer>
            )}
        </div>
    );
};

export default App;
