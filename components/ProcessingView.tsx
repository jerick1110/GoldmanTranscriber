import React from 'react';

interface ProcessingViewProps {
    message: string;
}

const ProcessingView: React.FC<ProcessingViewProps> = ({ message }) => {
    return (
        <div className="flex flex-col items-center justify-center text-center p-8 min-h-[50vh]">
            <div className="w-20 h-20 border-4 border-brand-slate rounded-full border-t-brand-muted-gold animate-spin"></div>
            <h2 className="mt-8 text-3xl font-bold text-brand-off-white font-serif">Processing Your File</h2>
            <p className="mt-2 text-brand-light-gray w-full max-w-md h-12 transition-opacity duration-500">
                {message || "Initializing..."}
            </p>
        </div>
    );
};

export default ProcessingView;
