import React, { useState, useCallback } from 'react';
import { AppState, ViewType, DocumentStats } from './types';
import { fileToBase64 } from './utils';

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
    });

    const resetState = useCallback(() => {
        setAppState({
            view: ViewType.UPLOAD,
            file: null,
            transcription: '',
            aiContent: { sop: '', summary: '', actionItems: '', keyInfo: null },
            error: null,
            stats: null,
        });
    }, []);

    const calculateStats = (content: string): DocumentStats => {
        if (!content) return { words: 0, characters: 0, readingTimeMinutes: 0 };
        const words = content.trim().split(/\s+/).filter(Boolean).length;
        const characters = content.length;
        const readingTimeMinutes = Math.ceil(words / 200); // Average reading speed
        return { words, characters, readingTimeMinutes };
    };

    const handleFileSelect = useCallback(async (selectedFile: File) => {
        setAppState(prev => ({ ...prev, file: selectedFile, view: ViewType.PROCESSING, error: null }));

        try {
            // 1. Convert file to base64
            const base64Data = await fileToBase64(selectedFile);

            // 2. Send to secure backend endpoint
            const response = await fetch('/api/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ base64Data, mimeType: selectedFile.type }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'An error occurred on the server.');
            }
            
            const results = await response.json();

            // 4. Update state with final results from backend
            const sopStats = calculateStats(results.sop);
            setAppState(prev => ({
                ...prev,
                transcription: results.transcription,
                aiContent: {
                    sop: results.sop,
                    summary: results.summary,
                    actionItems: results.actionItems,
                    keyInfo: results.keyInfo,
                },
                stats: sopStats,
                view: ViewType.RESULTS,
            }));
        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during processing.';
            setAppState(prev => ({ 
                ...prev, 
                error: `Failed to process your file. ${errorMessage}`, 
                view: ViewType.UPLOAD 
            }));
        }
    }, []);

    const handleTabChange = (content: string) => {
        setAppState(prev => ({
            ...prev,
            stats: calculateStats(content),
        }));
    };

    const renderContent = () => {
        switch (appState.view) {
            case ViewType.PROCESSING:
                return <ProcessingView />;
            case ViewType.RESULTS:
                return (
                    <ResultsView 
                        transcription={appState.transcription} 
                        aiContent={appState.aiContent} 
                        onReset={resetState}
                        file={appState.file}
                        stats={appState.stats}
                        onTabChange={handleTabChange}
                    />
                );
            case ViewType.UPLOAD:
            default:
                return <FileUploader onFileSelect={handleFileSelect} error={appState.error} />;
        }
    };

    return (
        <div className="min-h-screen bg-brand-charcoal text-brand-light-gray font-sans">
            <Header onReset={resetState} />
            <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="w-full">
                    {renderContent()}
                </div>
            </main>
             <footer className="text-center py-4 text-slate-500 text-sm">
                <p>Powered by Gemini API. Designed for excellence.</p>
            </footer>
        </div>
    );
};

export default App;