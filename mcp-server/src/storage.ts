/**
 * File-based storage adapter for MCP server
 * Server-side alternative to browser localStorage
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data directory - stores JSON files
const DATA_DIR = path.join(__dirname, '..', 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

const STORAGE_FILES = {
    SESSIONS: path.join(DATA_DIR, 'sessions.json'),
    STATS: path.join(DATA_DIR, 'stats.json'),
    KNOWLEDGE_GRAPH: path.join(DATA_DIR, 'knowledge-graph.json'),
    RELATIONSHIPS: path.join(DATA_DIR, 'relationships.json'),
};

// Types (mirrored from main app)
export interface SessionData {
    id: string;
    topic: string;
    persona: string;
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
    confusionLevel: number;
    jargonLevel: number;
    validationTag: "CORRECTION" | "PROBE" | "VERIFIED";
    resources?: string[];
    timestamp: number;
}

export interface KnowledgeNode {
    id: string;
    topic: string;
    mastery: number;
    sessions: number;
    lastPracticed: number;
    connections: string[];
    domain?: string;
    tags?: string[];
    difficulty?: 1 | 2 | 3 | 4 | 5;
}

export interface TopicRelationship {
    sourceId: string;
    targetId: string;
    type: 'prerequisite' | 'related' | 'partOf' | 'enables';
    strength: number;
    reason: string;
}

export interface UserStats {
    totalSessions: number;
    totalXP: number;
    currentLevel: number;
    currentStreak: number;
    longestStreak: number;
    lastSessionDate: string;
    commitmentGrid: Record<string, number>;
}

// Helper functions
function readJsonFile<T>(filePath: string, defaultValue: T): T {
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf-8');
            return JSON.parse(data) as T;
        }
    } catch (error) {
        console.error(`Failed to read ${filePath}:`, error);
    }
    return defaultValue;
}

function writeJsonFile<T>(filePath: string, data: T): boolean {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
        return true;
    } catch (error) {
        console.error(`Failed to write ${filePath}:`, error);
        return false;
    }
}

// Session Management
export function getSessions(): SessionData[] {
    return readJsonFile<SessionData[]>(STORAGE_FILES.SESSIONS, []);
}

export function getSessionById(id: string): SessionData | null {
    const sessions = getSessions();
    return sessions.find((s) => s.id === id) || null;
}

export function searchSessions(query: string): SessionData[] {
    const sessions = getSessions();
    const lowerQuery = query.toLowerCase();
    return sessions.filter(s =>
        s.topic.toLowerCase().includes(lowerQuery) ||
        s.conceptsCovered.some(c => c.toLowerCase().includes(lowerQuery))
    );
}

// User Stats
export function getUserStats(): UserStats {
    return readJsonFile<UserStats>(STORAGE_FILES.STATS, {
        totalSessions: 0,
        totalXP: 0,
        currentLevel: 1,
        currentStreak: 0,
        longestStreak: 0,
        lastSessionDate: "",
        commitmentGrid: {},
    });
}

// Knowledge Graph
export function getKnowledgeNodes(): KnowledgeNode[] {
    return readJsonFile<KnowledgeNode[]>(STORAGE_FILES.KNOWLEDGE_GRAPH, []);
}

export function getKnowledgeRelationships(): TopicRelationship[] {
    return readJsonFile<TopicRelationship[]>(STORAGE_FILES.RELATIONSHIPS, []);
}

// Full Knowledge Graph with relationships
export function getFullKnowledgeGraph(): {
    nodes: KnowledgeNode[];
    relationships: TopicRelationship[];
    summary: {
        totalTopics: number;
        totalConnections: number;
        domains: string[];
        averageMastery: number;
    };
} {
    const nodes = getKnowledgeNodes();
    const relationships = getKnowledgeRelationships();

    const domains = [...new Set(nodes.map(n => n.domain).filter(Boolean))] as string[];
    const avgMastery = nodes.length > 0
        ? nodes.reduce((sum, n) => sum + n.mastery, 0) / nodes.length
        : 0;

    return {
        nodes,
        relationships,
        summary: {
            totalTopics: nodes.length,
            totalConnections: relationships.length,
            domains,
            averageMastery: Math.round(avgMastery),
        }
    };
}

// Knowledge Summary for quick overview
export function getKnowledgeSummary(): {
    totalTopics: number;
    topicsByDomain: Record<string, string[]>;
    recentTopics: { topic: string; mastery: number; lastPracticed: string }[];
    strongestTopics: { topic: string; mastery: number }[];
    weakestTopics: { topic: string; mastery: number }[];
} {
    const nodes = getKnowledgeNodes();

    // Group by domain
    const topicsByDomain: Record<string, string[]> = {};
    nodes.forEach(n => {
        const domain = n.domain || 'general';
        if (!topicsByDomain[domain]) {
            topicsByDomain[domain] = [];
        }
        topicsByDomain[domain].push(n.topic);
    });

    // Sort by last practiced (most recent first)
    const sortedByRecent = [...nodes].sort((a, b) => b.lastPracticed - a.lastPracticed);
    const recentTopics = sortedByRecent.slice(0, 5).map(n => ({
        topic: n.topic,
        mastery: n.mastery,
        lastPracticed: new Date(n.lastPracticed).toLocaleDateString(),
    }));

    // Sort by mastery
    const sortedByMastery = [...nodes].sort((a, b) => b.mastery - a.mastery);
    const strongestTopics = sortedByMastery.slice(0, 5).map(n => ({
        topic: n.topic,
        mastery: n.mastery,
    }));
    const weakestTopics = sortedByMastery.slice(-5).reverse().map(n => ({
        topic: n.topic,
        mastery: n.mastery,
    }));

    return {
        totalTopics: nodes.length,
        topicsByDomain,
        recentTopics,
        strongestTopics,
        weakestTopics,
    };
}

// Export data directory path for external use
export function getDataDirectory(): string {
    return DATA_DIR;
}

// ============================================================================
// WRITE OPERATIONS - Session Management
// ============================================================================

export function saveSession(session: SessionData): boolean {
    const sessions = getSessions();
    sessions.push(session);
    return writeJsonFile(STORAGE_FILES.SESSIONS, sessions);
}

export function updateSession(sessionId: string, updates: Partial<SessionData>): boolean {
    const sessions = getSessions();
    const index = sessions.findIndex(s => s.id === sessionId);
    if (index === -1) return false;

    sessions[index] = { ...sessions[index], ...updates };
    return writeJsonFile(STORAGE_FILES.SESSIONS, sessions);
}

export function deleteSession(id: string): boolean {
    const sessions = getSessions();
    const filtered = sessions.filter(s => s.id !== id);
    return writeJsonFile(STORAGE_FILES.SESSIONS, filtered);
}

export function renameSession(id: string, newTopic: string): boolean {
    const sessions = getSessions();
    const session = sessions.find(s => s.id === id);
    if (!session) return false;

    session.topic = newTopic;
    return writeJsonFile(STORAGE_FILES.SESSIONS, sessions);
}

// ============================================================================
// WRITE OPERATIONS - Knowledge Graph Management
// ============================================================================

export function addKnowledgeNode(node: KnowledgeNode): boolean {
    const nodes = getKnowledgeNodes();
    nodes.push(node);
    return writeJsonFile(STORAGE_FILES.KNOWLEDGE_GRAPH, nodes);
}

export function updateKnowledgeNode(nodeId: string, updates: Partial<KnowledgeNode>): boolean {
    const nodes = getKnowledgeNodes();
    const index = nodes.findIndex(n => n.id === nodeId);
    if (index === -1) return false;

    nodes[index] = { ...nodes[index], ...updates };
    return writeJsonFile(STORAGE_FILES.KNOWLEDGE_GRAPH, nodes);
}

export function deleteKnowledgeNode(nodeId: string): boolean {
    const nodes = getKnowledgeNodes();
    const filtered = nodes.filter(n => n.id !== nodeId);
    return writeJsonFile(STORAGE_FILES.KNOWLEDGE_GRAPH, filtered);
}

export function saveKnowledgeRelationships(relationships: TopicRelationship[]): boolean {
    return writeJsonFile(STORAGE_FILES.RELATIONSHIPS, relationships);
}

// ============================================================================
// WRITE OPERATIONS - Stats Management
// ============================================================================

export function updateUserStats(updates: Partial<UserStats>): boolean {
    const stats = getUserStats();
    const updated = { ...stats, ...updates };
    return writeJsonFile(STORAGE_FILES.STATS, updated);
}

export function incrementSessionStats(xpGained: number): boolean {
    const stats = getUserStats();
    const today = new Date().toDateString();

    // Update streak
    let newStreak = stats.currentStreak;
    if (stats.lastSessionDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();

        if (stats.lastSessionDate === yesterdayStr) {
            newStreak += 1;
        } else {
            newStreak = 1;
        }
    }

    // Update commitment grid
    const commitmentGrid = { ...stats.commitmentGrid };
    commitmentGrid[today] = (commitmentGrid[today] || 0) + 1;

    return updateUserStats({
        totalSessions: stats.totalSessions + 1,
        totalXP: stats.totalXP + xpGained,
        currentStreak: newStreak,
        longestStreak: Math.max(stats.longestStreak, newStreak),
        lastSessionDate: today,
        commitmentGrid,
    });
}

// ============================================================================
// DATA IMPORT/EXPORT
// ============================================================================

export function exportAllData(): string {
    const data = {
        sessions: getSessions(),
        stats: getUserStats(),
        knowledgeGraph: getKnowledgeNodes(),
        relationships: getKnowledgeRelationships(),
        exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
}

export function importData(jsonData: string): boolean {
    try {
        const data = JSON.parse(jsonData);

        if (data.sessions) {
            writeJsonFile(STORAGE_FILES.SESSIONS, data.sessions);
        }
        if (data.stats) {
            writeJsonFile(STORAGE_FILES.STATS, data.stats);
        }
        if (data.knowledgeGraph) {
            writeJsonFile(STORAGE_FILES.KNOWLEDGE_GRAPH, data.knowledgeGraph);
        }
        if (data.relationships) {
            writeJsonFile(STORAGE_FILES.RELATIONSHIPS, data.relationships);
        }

        return true;
    } catch (error) {
        console.error("Failed to import data:", error);
        return false;
    }
}

export function deleteAllData(): boolean {
    try {
        writeJsonFile(STORAGE_FILES.SESSIONS, []);
        writeJsonFile(STORAGE_FILES.KNOWLEDGE_GRAPH, []);
        writeJsonFile(STORAGE_FILES.RELATIONSHIPS, []);
        writeJsonFile(STORAGE_FILES.STATS, {
            totalSessions: 0,
            totalXP: 0,
            currentLevel: 1,
            currentStreak: 0,
            longestStreak: 0,
            lastSessionDate: "",
            commitmentGrid: {},
        });
        return true;
    } catch (error) {
        console.error("Failed to delete all data:", error);
        return false;
    }
}
