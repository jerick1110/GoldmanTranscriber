import React, { useState, useEffect } from 'react';

const loadingMessages = [
    "Uploading your file securely...",
    "Analyzing media content for transcription...",
    "Generating high-fidelity audio transcript...",
    "Structuring content based on SOP guidelines...",
    "Generating Standard Operating Procedure...",
    "Extracting key summaries and action items...",
    "Finalizing your intelligent document...",
];

const ProcessingView: React.FC = () => {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex(prevIndex => (prevIndex + 1) % loadingMessages.length);
        }, 2500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center text-center p-8 min-h-[50vh]">
            <div className="w-20 h-20 border-4 border-brand-slate rounded-full border-t-brand-muted-gold animate-spin"></div>
            <h2 className="mt-8 text-3xl font-bold text-brand-off-white font-serif">Processing Your File</h2>
            <p className="mt-2 text-brand-light-gray w-full max-w-md h-12 transition-opacity duration-500">
                {loadingMessages[messageIndex]}
            </p>
        </div>
    );
};

export default ProcessingView;