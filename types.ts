export enum ViewType {
    UPLOAD = 'UPLOAD',
    PROCESSING = 'PROCESSING',
    RESULTS = 'RESULTS',
}

export interface JobStatus {
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    message: string;
}

export interface KeyInfo {
    taskName: string;
    mentionedApps: string[];
    keyPeople: string[];
    datesOrDeadlines: string[];
}

export interface AIGeneratedContent {
    sop: string;
    summary: string;
    actionItems: string;
    keyInfo: KeyInfo | null;
}

export interface DocumentStats {
    words: number;
    characters: number;
    readingTimeMinutes: number;
}

export interface AppState {
    view: ViewType;
    file: File | null;
    transcription: string;
    aiContent: AIGeneratedContent;
    error: string | null;
    stats: DocumentStats | null;
    isFocusMode: boolean;
}

export enum ExportFormat {
    TXT = 'txt',
    PDF = 'pdf',
    DOCX = 'docx',
}

export enum ResultTab {
    SOP = 'SOP',
    TRANSCRIPT = 'Raw Transcript',
    SUMMARY = 'Summary',
    ACTION_ITEMS = 'Action Items',
}