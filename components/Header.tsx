import React from 'react';
import { DocumentIcon } from './icons/DocumentIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface HeaderProps {
    onReset: () => void;
}

const Header: React.FC<HeaderProps> = ({ onReset }) => {
    return (
        <header className="bg-brand-charcoal/80 backdrop-blur-lg sticky top-0 z-50 border-b border-brand-slate/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div 
                        className="flex items-center space-x-4 cursor-pointer group"
                        onClick={onReset}
                        title="Start new transcription"
                    >
                        <DocumentIcon className="h-8 w-8 text-brand-muted-gold" />
                        <h1 className="text-2xl font-bold text-brand-off-white tracking-wide font-serif">
                            Goldman Video/Audio Transcriber
                        </h1>
                        <SparklesIcon className="w-6 h-6 text-brand-muted-gold/70 group-hover:text-brand-muted-gold transition-colors" />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;