import React, { useState } from 'react';
import { UploadCloudIcon } from './icons/UploadCloudIcon';
import { FileIcon } from './icons/FileIcon';

interface FileUploaderProps {
    onFileSelect: (file: File) => void;
    onDemo: () => void;
    error: string | null;
}

// Client-side processing can be memory intensive. 50MB is a safer limit.
const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, onDemo, error }) => {
    const [dragging, setDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [localError, setLocalError] = useState<string | null>(null);

    const validateAndSetFile = (selectedFile: File | undefined) => {
        if (!selectedFile) return;

        if (!selectedFile.type.startsWith('audio/') && !selectedFile.type.startsWith('video/')) {
            setLocalError('Invalid file type. Please upload an audio or video file.');
            setFile(null);
            return;
        }

        if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
            setLocalError(`File size exceeds the ${MAX_FILE_SIZE_MB}MB limit.`);
            setFile(null);
            return;
        }

        setLocalError(null);
        setFile(selectedFile);
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const handleSubmit = () => {
        if (file) {
            onFileSelect(file);
        }
    };

    const displayError = error || localError;

    return (
        <div className="flex flex-col items-center justify-center w-full pt-10">
            <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`w-full max-w-3xl p-10 border-2 border-dashed rounded-xl transition-colors duration-300 ${dragging ? 'border-brand-muted-gold bg-brand-slate/50' : 'border-brand-slate hover:border-brand-muted-gold/70'}`}
            >
                <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept="audio/*,video/*"
                    onChange={handleFileChange}
                />
                {!file ? (
                    <label htmlFor="file-upload" className="flex flex-col items-center justify-center space-y-4 cursor-pointer">
                        <UploadCloudIcon className="w-16 h-16 text-slate-500" />
                        <div className="text-center">
                            <p className="text-xl font-semibold text-brand-light-gray">
                                Drag & drop your video or audio file here
                            </p>
                            <p className="text-base text-slate-400">or <span className="text-brand-muted-gold font-medium">click to browse local files</span></p>
                        </div>
                        <p className="text-sm text-slate-500 pt-4">Supports Audio & Video files up to {MAX_FILE_SIZE_MB}MB</p>
                    </label>
                ) : (
                    <div className="text-center">
                        <FileIcon className="w-20 h-20 text-brand-muted-gold mx-auto" />
                        <p className="mt-4 font-medium text-brand-off-white text-lg">{file.name}</p>

                        <p className="text-sm text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                        <button onClick={() => setFile(null)} className="mt-4 text-xs text-slate-400 hover:text-brand-off-white">
                            Choose a different file
                        </button>
                    </div>
                )}
            </div>

            {displayError && <p className="mt-4 text-red-400 bg-red-900/50 px-4 py-2 rounded-md">{displayError}</p>}

            <button
                onClick={handleSubmit}
                disabled={!file}
                className="mt-10 px-16 py-4 bg-brand-muted-gold text-brand-charcoal font-bold text-lg rounded-lg shadow-lg hover:bg-opacity-80 transition-all duration-300 disabled:bg-brand-slate disabled:text-slate-500 disabled:cursor-not-allowed transform hover:scale-105 disabled:scale-100"
            >
                Transcribe & Generate Document
            </button>

            <div className="relative flex py-8 items-center w-full max-w-sm">
                <div className="flex-grow border-t border-brand-slate"></div>
                <span className="flex-shrink mx-4 text-slate-400 font-semibold">OR</span>
                <div className="flex-grow border-t border-brand-slate"></div>
            </div>

            <div className="text-center">
                <p className="mb-4 text-slate-300">Not ready to upload? See how it works with a sample file.</p>
                <button
                    onClick={onDemo}
                    className="px-8 py-3 bg-brand-slate text-brand-light-gray font-semibold rounded-lg shadow-md hover:bg-brand-muted-gold/20 border border-brand-slate/50 hover:border-brand-muted-gold/50 transition-all duration-300"
                >
                    Try a Demo
                </button>
            </div>
        </div>
    );
};

export default FileUploader;
