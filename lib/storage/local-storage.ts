import type { SessionData, UserStats, KnowledgeNode } from "@/types";

const STORAGE_KEYS = {
    SESSIONS: "explainr_sessions",
    STATS: "explainr_stats",
    KNOWLEDGE_GRAPH: "explainr_knowledge",
    COMMITMENT_GRID: "explainr_commitment",
    PREFERENCES: "explainr_preferences",
};

// Session Management
export function saveSession(session: SessionData): void {
    try {
        const sessions = getSessions();
        sessions.push(session);
        localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch (error) {
        console.error("Failed to save session:", error);
    }
}

export function getSessions(): SessionData[] {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

export function getSessionById(id: string): SessionData | null {
    const sessions = getSessions();
    return sessions.find((s) => s.id === id) || null;
}

export function deleteSession(id: string): boolean {
    try {
        const sessions = getSessions();
        const filtered = sessions.filter((s) => s.id !== id);
        localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(filtered));
        return true;
    } catch (error) {
        console.error("Failed to delete session:", error);
        return false;
    }
}

export function renameSession(id: string, newTopic: string): boolean {
    try {
        const sessions = getSessions();
        const session = sessions.find((s) => s.id === id);
        if (session) {
            session.topic = newTopic;
            localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
            return true;
        }
        return false;
    } catch (error) {
        console.error("Failed to rename session:", error);
        return false;
    }
}


// User Stats
export function getUserStats(): UserStats {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.STATS);
        if (data) {
            return JSON.parse(data);
        }
    } catch {
        // Fall through to default
    }

    return {
        totalSessions: 0,
        totalXP: 0,
        currentLevel: 1,
        currentStreak: 0,
        longestStreak: 0,
        lastSessionDate: "",
        commitmentGrid: {},
    };
}

export function updateUserStats(updates: Partial<UserStats>): void {
    try {
        const stats = getUserStats();
        const updated = { ...stats, ...updates };
        localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(updated));
    } catch (error) {
        console.error("Failed to update stats:", error);
    }
}

export function incrementSessionStats(xpGained: number): void {
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

    updateUserStats({
        totalSessions: stats.totalSessions + 1,
        totalXP: stats.totalXP + xpGained,
        currentStreak: newStreak,
        longestStreak: Math.max(stats.longestStreak, newStreak),
        lastSessionDate: today,
        commitmentGrid,
    });
}

// Knowledge Graph
export function getKnowledgeNodes(): KnowledgeNode[] {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.KNOWLEDGE_GRAPH);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

export function addKnowledgeNode(topic: string, score: number): void {
    try {
        const nodes = getKnowledgeNodes();
        const existing = nodes.find((n) => n.topic.toLowerCase() === topic.toLowerCase());

        if (existing) {
            // Update existing node
            existing.mastery = Math.min(100, existing.mastery + score / 10);
            existing.sessions += 1;
            existing.lastPracticed = Date.now();
        } else {
            // Create new node
            const newNodeId = `node_${Date.now()}`;

            const newNode: KnowledgeNode = {
                id: newNodeId,
                topic,
                mastery: score,
                sessions: 1,
                lastPracticed: Date.now(),
                connections: [],
            };

            nodes.push(newNode);

            // Trigger async relationship building (don't wait for it)
            rebuildKnowledgeGraphRelationships().catch(err =>
                console.error('Failed to rebuild relationships:', err)
            );
        }

        localStorage.setItem(STORAGE_KEYS.KNOWLEDGE_GRAPH, JSON.stringify(nodes));
    } catch (error) {
        console.error("Failed to add knowledge node:", error);
    }
}

/**
 * Rebuild all knowledge graph relationships using AI
 * This analyzes all topics and creates semantic connections
 */
export async function rebuildKnowledgeGraphRelationships(): Promise<void> {
    try {
        const nodes = getKnowledgeNodes();
        if (nodes.length < 2) return; // Need at least 2 nodes to connect

        // Dynamic import to avoid bundling issues
        const { buildSemanticKnowledgeGraph } = await import('@/lib/ai/knowledge-graph');

        const { analyses, relationships } = await buildSemanticKnowledgeGraph(
            nodes.map(n => ({ id: n.id, topic: n.topic }))
        );

        // Update nodes with semantic metadata
        nodes.forEach(node => {
            const analysis = analyses.get(node.id);
            if (analysis) {
                node.domain = analysis.domain;
                node.tags = analysis.tags;
                node.difficulty = analysis.difficulty;
            }

            // Clear old connections
            node.connections = [];
        });

        // Add new semantic connections
        relationships.forEach(rel => {
            const sourceNode = nodes.find(n => n.id === rel.sourceId);
            const targetNode = nodes.find(n => n.id === rel.targetId);

            if (sourceNode && targetNode) {
                // Add bidirectional connection
                if (!sourceNode.connections.includes(targetNode.id)) {
                    sourceNode.connections.push(targetNode.id);
                }
                if (!targetNode.connections.includes(sourceNode.id)) {
                    targetNode.connections.push(sourceNode.id);
                }
            }
        });

        // Save updated graph
        localStorage.setItem(STORAGE_KEYS.KNOWLEDGE_GRAPH, JSON.stringify(nodes));

        // Also save relationships separately for visualization
        localStorage.setItem(STORAGE_KEYS.KNOWLEDGE_GRAPH + '_relationships', JSON.stringify(relationships));

        console.log(`✅ Rebuilt knowledge graph: ${nodes.length} nodes, ${relationships.length} relationships`);
    } catch (error) {
        console.error("Failed to rebuild knowledge graph:", error);
    }
}

/**
 * Get semantic relationships for visualization
 */
export function getKnowledgeRelationships(): any[] {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.KNOWLEDGE_GRAPH + '_relationships');
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}


// Commitment Grid
export function getCommitmentGrid(): Record<string, number> {
    const stats = getUserStats();
    return stats.commitmentGrid;
}

// Data Export/Import
export function exportAllData(): string {
    const data = {
        sessions: getSessions(),
        stats: getUserStats(),
        knowledgeGraph: getKnowledgeNodes(),
        exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
}

export function importData(jsonData: string): boolean {
    try {
        const data = JSON.parse(jsonData);

        if (data.sessions) {
            localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(data.sessions));
        }
        if (data.stats) {
            localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(data.stats));
        }
        if (data.knowledgeGraph) {
            localStorage.setItem(STORAGE_KEYS.KNOWLEDGE_GRAPH, JSON.stringify(data.knowledgeGraph));
        }

        return true;
    } catch (error) {
        console.error("Failed to import data:", error);
        return false;
    }
}

// Data Deletion (Privacy)
export function deleteAllData(): void {
    Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
    });
}

// Preferences
export interface UserPreferences {
    defaultMode: "voice" | "text";
    voiceEnabled: boolean;
    soundEffects: boolean;
    theme: "dark" | "light";
}

export function getPreferences(): UserPreferences {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
        if (data) {
            return JSON.parse(data);
        }
    } catch {
        // Fall through to default
    }

    return {
        defaultMode: "voice",
        voiceEnabled: true,
        soundEffects: true,
        theme: "dark",
    };
}

export function updatePreferences(updates: Partial<UserPreferences>): void {
    try {
        const prefs = getPreferences();
        const updated = { ...prefs, ...updates };
        localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updated));
    } catch (error) {
        console.error("Failed to update preferences:", error);
    }
}
