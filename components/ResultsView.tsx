import React, { useState, useRef, useEffect } from 'react';
import { AIGeneratedContent, ResultTab, ExportFormat, DocumentStats } from '../types';
import { exportContent } from '../services/exportService';
import MetadataPanel from './MetadataPanel';
import { ExpandIcon } from './icons/ExpandIcon';
import { CollapseIcon } from './icons/CollapseIcon';

interface ResultsViewProps {
    transcription: string;
    aiContent: AIGeneratedContent;
    onReset: () => void;
    file: File | null;
    stats: DocumentStats | null;
    onTabChange: (content: string) => void;
    isFocusMode: boolean;
    onToggleFocusMode: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ transcription, aiContent, onReset, file, stats, onTabChange, isFocusMode, onToggleFocusMode }) => {
    const [activeTab, setActiveTab] = useState<ResultTab>(ResultTab.SOP);
    const contentRef = useRef<HTMLDivElement>(null);

    const contentMap: { [key in ResultTab]: string } = {
        [ResultTab.SOP]: aiContent.sop,
        [ResultTab.SUMMARY]: aiContent.summary,
        [ResultTab.ACTION_ITEMS]: aiContent.actionItems,
        [ResultTab.TRANSCRIPT]: transcription,
    };
    
    const currentContent = contentMap[activeTab];

    useEffect(() => {
        onTabChange(currentContent);
    }, [activeTab, currentContent, onTabChange]);


    const handleDownload = (format: ExportFormat) => {
        exportContent(format, currentContent, activeTab, contentRef.current);
    };

    const parseMarkdown = (text: string) => {
        if (!text) return '';
        
        let html = text;

        // Process table blocks first
        html = html.replace(/^\|(.+)\|\s*\n\|([ -:]+)\|\s*\n((?:\|.*\|\s*\n?)+)/gm, (_match, header, _separator, body) => {
            const headerCells = header.split('|').slice(1, -1).map((h: string) => h.trim());
            const bodyRows = body.trim().split('\n').map((r: string) => r.split('|').slice(1, -1).map((c: string) => c.trim()));
            let table = '<table class="min-w-full my-6 text-left table-auto border-collapse">';
            table += `<thead><tr class="border-b-2 border-brand-muted-gold/50">`;
            table += headerCells.map((c: string) => `<th scope="col" class="px-4 py-3 text-sm font-semibold text-brand-muted-gold bg-brand-slate/30">${c}</th>`).join('');
            table += '</tr></thead>';
            table += '<tbody class="divide-y divide-brand-slate/50">';
            table += bodyRows.map((row: string[]) => `<tr>${row.map((cell: string) => `<td class="px-4 py-3 text-sm text-brand-light-gray">${cell}</td>`).join('')}</tr>`).join('');
            table += '</tbody></table>';
            return table;
        });
        
        // Process other markdown on lines that are not part of a table
        html = html.replace(/^(?!<table)(.*)$/gm, (line) =>
            line
            .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4 font-serif border-b-2 border-brand-slate pb-2">$1</h2>')
            .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-6 mb-2 font-serif text-brand-muted-gold">$1</h3>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/^\* (.*$)/gim, '<li class="list-disc ml-6 mb-2 leading-relaxed">$1</li>')
            .replace(/^\d+\. (.*$)/gim, '<li class="list-decimal ml-6 mb-2 leading-relaxed">$1</li>')
        )
        .replace(/\n\n/g, '<br/><br/>')
        .replace(/\n/g, '<br />')
        .replace(/<br \/>(<(h[2-3]|li|table))/g, '$1')
        .replace(/(<\/li>)<br \/>/g, '$1');

        return html;
    };


    const renderContent = () => {
        if (!currentContent) {
            return (
                <div className="flex items-center justify-center h-64">
                    <div className="w-12 h-12 border-4 border-brand-slate rounded-full border-t-brand-muted-gold animate-spin"></div>
                </div>
            )
        }
        
        const formattedContent = parseMarkdown(currentContent);

        return (
            <div
                ref={contentRef}
                className="prose prose-p:text-brand-light-gray prose-strong:text-brand-off-white prose-li:text-brand-light-gray max-w-none bg-brand-charcoal p-8"
                dangerouslySetInnerHTML={{ __html: formattedContent }}
            />
        );
    };

    return (
        <div className={`w-full grid grid-cols-1 ${isFocusMode ? '' : 'lg:grid-cols-3 xl:grid-cols-4'} gap-8`}>
            {/* Left Column: Main Content */}
            <div className={`${isFocusMode ? 'lg:col-span-3 xl:col-span-4' : 'lg:col-span-2 xl:col-span-3'}`}>
                 <div className="bg-brand-slate rounded-lg shadow-2xl border border-brand-slate/50">
                    <div className="flex items-center justify-between border-b border-brand-slate/50 p-2">
                        <div className="flex space-x-1">
                            {Object.values(ResultTab).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab ? 'bg-brand-muted-gold text-brand-charcoal' : 'text-slate-300 hover:bg-brand-charcoal/50'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                         <button
                            onClick={onToggleFocusMode}
                            className="p-2 rounded-md text-slate-300 hover:bg-brand-charcoal/50 hover:text-white"
                            title={isFocusMode ? 'Exit Focus Mode' : 'Enter Focus Mode'}
                         >
                            {isFocusMode ? <CollapseIcon className="w-5 h-5" /> : <ExpandIcon className="w-5 h-5" />}
                        </button>
                    </div>
                    <div className={`${isFocusMode ? 'h-auto' : 'h-[70vh]'} overflow-y-auto bg-brand-charcoal rounded-b-lg`}>
                        {renderContent()}
                    </div>
                </div>
            </div>

            {/* Right Column: Metadata and Actions */}
            {!isFocusMode && (
                 <div className="lg:col-span-1 xl:col-span-1">
                    <MetadataPanel
                        file={file}
                        stats={stats}
                        keyInfo={aiContent.keyInfo}
                        onReset={onReset}
                        onDownload={handleDownload}
                        currentContent={currentContent}
                    />
                </div>
            )}
        </div>
    );
};

export default ResultsView;