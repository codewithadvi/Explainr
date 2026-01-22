// Persona Types
export type PersonaType = "toddler" | "peer" | "fratbro" | "ceo" | "professor";

export interface Persona {
    id: PersonaType;
    name: string;
    description: string;
    icon?: string;
    systemPrompt: string;
    failState: string;
    winState: string;
}

// Session Data
export interface SessionData {
    id: string;
    topic: string;
    persona: PersonaType;
    mode: "voice" | "text";
    rounds: Round[];
    score: number;
    conceptsCovered: string[];
    startTime: number;
    endTime?: number;
}

export interface Round {
    id: string;
    userInput: string;
    aiResponse: string;
    confusionLevel: number; // 0-100
    jargonLevel: number; // 0-100
    validationTag: "CORRECTION" | "PROBE" | "VERIFIED";
    resources?: string[];
    timestamp: number;
}

// Checklist Protocol
export interface ChecklistItem {
    concept: string;
    covered: boolean;
    importance: "critical" | "important" | "nice-to-have";
}

export interface TopicChecklist {
    topic: string;
    items: ChecklistItem[];
    generatedAt: number;
}

// Knowledge Galaxy
export interface KnowledgeNode {
    id: string;
    topic: string;
    mastery: number; // 0-100
    sessions: number;
    lastPracticed: number;
    connections: string[]; // IDs of related nodes
    x?: number;
    y?: number;
    // Semantic metadata
    domain?: string;
    tags?: string[];
    difficulty?: 1 | 2 | 3 | 4 | 5;
}

export interface KnowledgeEdge {
    source: string;
    target: string;
    strength: number; // 0-1
    type?: 'prerequisite' | 'related' | 'partOf' | 'enables';
    reason?: string;
}


// AI Response
export interface AIResponse {
    message: string;
    confusionLevel: number;
    jargonLevel: number;
    validationTag: "CORRECTION" | "PROBE" | "VERIFIED";
    conceptsIdentified: string[];
    resources?: string[];
}

// User Progress
export interface UserStats {
    totalSessions: number;
    totalXP: number;
    currentLevel: number;
    currentStreak: number;
    longestStreak: number;
    lastSessionDate: string;
    commitmentGrid: Record<string, number>; // date -> session count
}

// Gap Analysis
export interface GapAnalysis {
    userExplanation: string;
    betterExplanation: string;
    missedConcepts: string[];
    score: number;
}

// Voice Recognition
export interface VoiceConfig {
    language: string;
    continuous: boolean;
    interimResults: boolean;
}

// Audio Analysis
export interface AudioData {
    amplitude: number;
    frequency: number[];
    isActive: boolean;
}
