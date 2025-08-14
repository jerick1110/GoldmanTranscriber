import React, { useState, useCallback, useEffect } from 'react';
import { AppState, ViewType, DocumentStats, JobStatus } from './types';
import { MOCK_TRANSCRIPTION, MOCK_SOP, MOCK_SUMMARY, MOCK_ACTION_ITEMS, MOCK_KEY_INFO } from './constants';

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
        jobId: null,
        jobStatus: null,
    });

    const resetState = useCallback(() => {
        setAppState({
            view: ViewType.UPLOAD,
            file: null,
            transcription: '',
            aiContent: { sop: '', summary: '', actionItems: '', keyInfo: null },
            error: null,
            stats: null,
            isFocusMode: false,
            jobId: null,
            jobStatus: null,
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
        setAppState(prev => ({ 
            ...prev, 
            file: selectedFile, 
            view: ViewType.PROCESSING, 
            error: null,
            jobStatus: { status: 'PENDING', message: 'Initiating processing job...' },
        }));

        try {
            // This simulates uploading to a cloud storage and getting a file handle/URL
            // In a real app, you'd use a signed URL to upload directly to GCS/S3.
            // Then you'd send the resulting URL to your backend.
            const response = await fetch('/api/start-processing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    fileName: selectedFile.name,
                    fileType: selectedFile.type,
                    fileSize: selectedFile.size,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to start processing job.');
            }
            
            const { jobId } = await response.json();
            setAppState(prev => ({ ...prev, jobId }));

        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setAppState(prev => ({ 
                ...prev, 
                error: `Failed to start processing. ${errorMessage}`, 
                view: ViewType.UPLOAD 
            }));
        }
    }, []);

    // Polling effect for job status
    useEffect(() => {
        if (appState.jobId && appState.view === ViewType.PROCESSING) {
            const interval = setInterval(async () => {
                try {
                    const res = await fetch(`/api/status?jobId=${appState.jobId}`);
                    if (!res.ok) {
                         // Stop polling on server error
                        throw new Error('Server error, stopping status checks.');
                    }
                    
                    const data: { status: JobStatus, results?: any } = await res.json();
                    
                    setAppState(prev => ({...prev, jobStatus: data.status }));

                    if (data.status.status === 'COMPLETED' || data.status.status === 'FAILED') {
                        clearInterval(interval);
                        if(data.status.status === 'COMPLETED' && data.results) {
                            const sopStats = calculateStats(data.results.sop);
                             setAppState(prev => ({
                                ...prev,
                                transcription: data.results.transcription,
                                aiContent: {
                                    sop: data.results.sop,
                                    summary: data.results.summary,
                                    actionItems: data.results.actionItems,
                                    keyInfo: data.results.keyInfo,
                                },
                                stats: sopStats,
                                view: ViewType.RESULTS,
                                jobId: null,
                                jobStatus: null,
                            }));
                        } else {
                             setAppState(prev => ({
                                ...prev,
                                error: data.status.message || 'Processing failed. Please try again.',
                                view: ViewType.UPLOAD,
                                jobId: null,
                                jobStatus: null,
                             }));
                        }
                    }
                } catch (error) {
                    console.error("Polling error:", error);
                    clearInterval(interval);
                    setAppState(prev => ({
                        ...prev,
                        error: 'Lost connection to server. Please try again.',
                        view: ViewType.UPLOAD,
                        jobId: null,
                        jobStatus: null,
                    }));
                }
            }, 3000);

            return () => clearInterval(interval);
        }
    }, [appState.jobId, appState.view]);


    const handleDemo = useCallback(() => {
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
                jobId: null,
                jobStatus: null,
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
                return <ProcessingView status={appState.jobStatus} />;
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
