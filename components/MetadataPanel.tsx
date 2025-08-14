import React, { useState } from 'react';
import { ExportFormat, DocumentStats, KeyInfo } from '../types';
import { CopyIcon } from './icons/CopyIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { FileIcon } from './icons/FileIcon';

interface MetadataPanelProps {
    file: File | null;
    stats: DocumentStats | null;
    keyInfo: KeyInfo | null;
    currentContent: string;
    onReset: () => void;
    onDownload: (format: ExportFormat) => void;
}

const MetadataPanel: React.FC<MetadataPanelProps> = ({ file, stats, keyInfo, currentContent, onReset, onDownload }) => {
    const [showDownloadMenu, setShowDownloadMenu] = useState(false);
    const [copyNotification, setCopyNotification] = useState('');

    const handleCopy = () => {
        navigator.clipboard.writeText(currentContent).then(() => {
            setCopyNotification('Copied!');
            setTimeout(() => setCopyNotification(''), 2000);
        });
    };

    const InfoCard: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
        <div className="bg-brand-slate/50 rounded-lg p-4 border border-brand-slate">
            <h3 className="text-sm font-bold text-brand-muted-gold mb-3 border-b border-brand-slate pb-2">{title}</h3>
            {children}
        </div>
    );
    
    const InfoTag: React.FC<{ children: React.ReactNode }> = ({ children }) => (
         <span className="inline-block bg-brand-charcoal text-brand-light-gray text-xs font-medium mr-2 mb-2 px-2.5 py-1 rounded-full border border-brand-slate">
            {children}
        </span>
    );

    return (
        <div className="space-y-6 sticky top-28">
             <div className="bg-brand-slate/50 rounded-lg p-4 border border-brand-slate">
                <button
                    onClick={onReset}
                    className="w-full px-4 py-2 bg-brand-slate text-brand-light-gray font-semibold rounded-lg hover:bg-opacity-80 transition-colors hover:bg-brand-muted-gold/20"
                >
                    Transcribe Another File
                </button>
                <div className="flex items-stretch mt-3 space-x-2">
                     <button onClick={handleCopy} className="flex-grow flex items-center justify-center p-2 rounded-md bg-brand-slate hover:bg-brand-charcoal text-slate-300 hover:text-white transition-colors" title="Copy to clipboard">
                        <CopyIcon className="w-5 h-5 mr-2" />
                        <span className="text-sm font-semibold">{copyNotification || 'Copy'}</span>
                    </button>
                    <div className="relative flex-grow">
                        <button onBlur={() => setTimeout(() => setShowDownloadMenu(false), 150)} onClick={() => setShowDownloadMenu(!showDownloadMenu)} className="w-full flex items-center justify-center p-2 rounded-md bg-brand-slate hover:bg-brand-charcoal text-slate-300 hover:text-white transition-colors" title="Download">
                            <DownloadIcon className="w-5 h-5 mr-2" />
                            <span className="text-sm font-semibold">Download</span>
                        </button>
                        {showDownloadMenu && (
                            <div className="absolute bottom-full mb-2 right-0 w-full bg-brand-charcoal rounded-md shadow-lg z-10 border border-brand-slate">
                                <a onClick={() => onDownload(ExportFormat.TXT)} className="cursor-pointer block px-4 py-2 text-sm text-brand-light-gray hover:bg-brand-slate">Text (.txt)</a>
                                <a onClick={() => onDownload(ExportFormat.DOCX)} className="cursor-pointer block px-4 py-2 text-sm text-brand-light-gray hover:bg-brand-slate">Word (.docx)</a>
                                <a onClick={() => onDownload(ExportFormat.PDF)} className="cursor-pointer block px-4 py-2 text-sm text-brand-light-gray hover:bg-brand-slate">PDF (.pdf)</a>
                            </div>
                        )}
                    </div>
                </div>
             </div>

            <InfoCard title="Document Intelligence">
                {keyInfo ? (
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-xs text-slate-400 mb-1 font-semibold">Task/Purpose</h4>
                            <InfoTag>{keyInfo.taskName}</InfoTag>
                        </div>
                        {keyInfo.keyPeople?.length > 0 && <div>
                            <h4 className="text-xs text-slate-400 mb-1 font-semibold">Key People</h4>
                            <div>{keyInfo.keyPeople.map(p => <InfoTag key={p}>{p}</InfoTag>)}</div>
                        </div>}
                         {keyInfo.mentionedApps?.length > 0 && <div>
                            <h4 className="text-xs text-slate-400 mb-1 font-semibold">Mentioned Apps</h4>
                            <div>{keyInfo.mentionedApps.map(app => <InfoTag key={app}>{app}</InfoTag>)}</div>
                        </div>}
                         {keyInfo.datesOrDeadlines?.length > 0 && <div>
                            <h4 className="text-xs text-slate-400 mb-1 font-semibold">Dates & Deadlines</h4>
                            <div>{keyInfo.datesOrDeadlines.map(d => <InfoTag key={d}>{d}</InfoTag>)}</div>
                        </div>}
                    </div>
                ) : <p className="text-sm text-slate-400">No key info extracted.</p>}
            </InfoCard>

            <InfoCard title="Document Stats">
                {stats ? (
                     <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                            <p className="text-xl font-bold text-brand-off-white">{stats.words}</p>
                            <p className="text-xs text-slate-400">Words</p>
                        </div>
                        <div>
                             <p className="text-xl font-bold text-brand-off-white">{stats.characters}</p>
                            <p className="text-xs text-slate-400">Characters</p>
                        </div>
                        <div>
                             <p className="text-xl font-bold text-brand-off-white">~{stats.readingTimeMinutes}</p>
                            <p className="text-xs text-slate-400">Min Read</p>
                        </div>
                    </div>
                ) : <p className="text-sm text-slate-400">No stats available.</p>}
            </InfoCard>

            <InfoCard title="File Information">
                {file && (
                    <div className="flex items-center space-x-3">
                        <FileIcon className="w-10 h-10 text-brand-muted-gold flex-shrink-0" />
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-brand-off-white truncate" title={file.name}>{file.name}</p>
                            <p className="text-xs text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB | {file.type}</p>
                        </div>
                    </div>
                )}
            </InfoCard>
        </div>
    );
};

export default MetadataPanel;
