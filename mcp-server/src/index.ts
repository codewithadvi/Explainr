#!/usr/bin/env node
/**
 * Feynman Mirror MCP Server
 * 
 * Exposes knowledge graph, learning sessions, and stats to AI clients
 * via the Model Context Protocol (MCP).
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import {
    getSessions,
    getSessionById,
    searchSessions,
    getUserStats,
    getKnowledgeNodes,
    getKnowledgeRelationships,
    getFullKnowledgeGraph,
    getKnowledgeSummary,
    saveSession,
    updateSession,
    deleteSession,
    renameSession,
    addKnowledgeNode,
    updateKnowledgeNode,
    deleteKnowledgeNode,
    saveKnowledgeRelationships,
    updateUserStats,
    incrementSessionStats,
    exportAllData,
    importData,
    deleteAllData,
    type SessionData,
    type KnowledgeNode,
    type Round,
} from "./storage.js";

// Create MCP Server
const server = new McpServer({
    name: "feynman-mirror",
    version: "1.0.0",
});

// ============================================================================
// RESOURCES - Read-only data endpoints
// ============================================================================

// Knowledge Graph Resource
server.resource(
    "knowledge-graph",
    "knowledge://graph",
    async (uri) => {
        const graph = getFullKnowledgeGraph();
        return {
            contents: [{
                uri: uri.href,
                mimeType: "application/json",
                text: JSON.stringify(graph, null, 2),
            }],
        };
    }
);

// Sessions List Resource
server.resource(
    "sessions-list",
    "sessions://list",
    async (uri) => {
        const sessions = getSessions();
        const sessionSummaries = sessions.map(s => ({
            id: s.id,
            topic: s.topic,
            persona: s.persona,
            score: s.score,
            roundCount: s.rounds.length,
            conceptsCovered: s.conceptsCovered,
            date: new Date(s.startTime).toLocaleDateString(),
        }));
        return {
            contents: [{
                uri: uri.href,
                mimeType: "application/json",
                text: JSON.stringify(sessionSummaries, null, 2),
            }],
        };
    }
);

// User Stats Resource
server.resource(
    "user-stats",
    "stats://user",
    async (uri) => {
        const stats = getUserStats();
        return {
            contents: [{
                uri: uri.href,
                mimeType: "application/json",
                text: JSON.stringify(stats, null, 2),
            }],
        };
    }
);

// ============================================================================
// TOOLS - Action endpoints
// ============================================================================

// Get Knowledge Summary Tool
server.tool(
    "get_knowledge_summary",
    "Get a summary of the user's knowledge state including topics by domain, strongest/weakest areas, and recent activity",
    {},
    async () => {
        const summary = getKnowledgeSummary();
        return {
            content: [{
                type: "text",
                text: JSON.stringify(summary, null, 2),
            }],
        };
    }
);

// Search Sessions Tool
server.tool(
    "search_sessions",
    "Search learning sessions by topic keyword",
    {
        query: z.string().describe("Search query to match against session topics"),
    },
    async ({ query }) => {
        const results = searchSessions(query);
        const summaries = results.map(s => ({
            id: s.id,
            topic: s.topic,
            persona: s.persona,
            score: s.score,
            conceptsCovered: s.conceptsCovered,
            date: new Date(s.startTime).toLocaleDateString(),
        }));
        return {
            content: [{
                type: "text",
                text: results.length > 0
                    ? JSON.stringify(summaries, null, 2)
                    : `No sessions found matching "${query}"`,
            }],
        };
    }
);

// Get Session Details Tool
server.tool(
    "get_session_details",
    "Get detailed information about a specific learning session including the full conversation",
    {
        sessionId: z.string().describe("The ID of the session to retrieve"),
    },
    async ({ sessionId }) => {
        const session = getSessionById(sessionId);
        if (!session) {
            return {
                content: [{
                    type: "text",
                    text: `Session with ID "${sessionId}" not found`,
                }],
                isError: true,
            };
        }
        return {
            content: [{
                type: "text",
                text: JSON.stringify(session, null, 2),
            }],
        };
    }
);

// Get Topic Connections Tool
server.tool(
    "get_topic_connections",
    "Get the connections and relationships for a specific topic in the knowledge graph",
    {
        topic: z.string().describe("The topic name to find connections for"),
    },
    async ({ topic }) => {
        const nodes = getKnowledgeNodes();
        const relationships = getKnowledgeRelationships();

        const targetNode = nodes.find(n =>
            n.topic.toLowerCase() === topic.toLowerCase()
        );

        if (!targetNode) {
            return {
                content: [{
                    type: "text",
                    text: `Topic "${topic}" not found in knowledge graph. Available topics: ${nodes.map(n => n.topic).join(", ")}`,
                }],
            };
        }

        // Find connected nodes
        const connectedNodeIds = new Set(targetNode.connections);
        const connectedNodes = nodes.filter(n => connectedNodeIds.has(n.id));

        // Find relationships involving this topic
        const topicRelationships = relationships.filter(r =>
            r.sourceId === targetNode.id || r.targetId === targetNode.id
        );

        const result = {
            topic: targetNode.topic,
            mastery: targetNode.mastery,
            domain: targetNode.domain,
            tags: targetNode.tags,
            difficulty: targetNode.difficulty,
            connectedTopics: connectedNodes.map(n => ({
                topic: n.topic,
                mastery: n.mastery,
                domain: n.domain,
            })),
            relationships: topicRelationships.map(r => {
                const otherNode = nodes.find(n =>
                    n.id === (r.sourceId === targetNode.id ? r.targetId : r.sourceId)
                );
                return {
                    relatedTopic: otherNode?.topic || 'Unknown',
                    type: r.type,
                    strength: r.strength,
                    reason: r.reason,
                };
            }),
        };

        return {
            content: [{
                type: "text",
                text: JSON.stringify(result, null, 2),
            }],
        };
    }
);

// Get Learning Progress Tool
server.tool(
    "get_learning_progress",
    "Get the user's learning progress including XP, level, streak, and commitment grid",
    {},
    async () => {
        const stats = getUserStats();
        const sessions = getSessions();

        // Calculate additional insights
        const totalTopics = new Set(sessions.map(s => s.topic)).size;
        const avgScore = sessions.length > 0
            ? Math.round(sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length)
            : 0;

        // Recent activity (last 7 days)
        const now = Date.now();
        const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
        const recentSessions = sessions.filter(s => s.startTime > weekAgo);

        const result = {
            xp: stats.totalXP,
            level: stats.currentLevel,
            currentStreak: stats.currentStreak,
            longestStreak: stats.longestStreak,
            totalSessions: stats.totalSessions,
            uniqueTopics: totalTopics,
            averageScore: avgScore,
            lastStudyDate: stats.lastSessionDate,
            sessionsThisWeek: recentSessions.length,
            commitmentGrid: stats.commitmentGrid,
        };

        return {
            content: [{
                type: "text",
                text: JSON.stringify(result, null, 2),
            }],
        };
    }
);

// List All Topics Tool
server.tool(
    "list_topics",
    "List all topics in the knowledge graph with their mastery levels",
    {},
    async () => {
        const nodes = getKnowledgeNodes();

        if (nodes.length === 0) {
            return {
                content: [{
                    type: "text",
                    text: "No topics in knowledge graph yet. Start learning sessions to build your knowledge!",
                }],
            };
        }

        // Group by domain
        const byDomain: Record<string, { topic: string; mastery: number }[]> = {};
        nodes.forEach(n => {
            const domain = n.domain || 'general';
            if (!byDomain[domain]) {
                byDomain[domain] = [];
            }
            byDomain[domain].push({
                topic: n.topic,
                mastery: n.mastery,
            });
        });

        // Sort each domain by mastery
        Object.values(byDomain).forEach(topics => {
            topics.sort((a, b) => b.mastery - a.mastery);
        });

        return {
            content: [{
                type: "text",
                text: JSON.stringify(byDomain, null, 2),
            }],
        };
    }
);

// ============================================================================
// WRITE TOOLS - Session Management
// ============================================================================

// Create New Session Tool
server.tool(
    "create_session",
    "Create a new learning session with a topic and persona",
    {
        topic: z.string().describe("The topic to learn about"),
        persona: z.enum(["toddler", "peer", "fratbro", "ceo", "professor"]).describe("The AI persona to use"),
        mode: z.enum(["voice", "text"]).describe("Session mode"),
    },
    async ({ topic, persona, mode }) => {
        const sessionId = `session_${Date.now()}`;
        const newSession: SessionData = {
            id: sessionId,
            topic,
            persona,
            mode,
            rounds: [],
            score: 0,
            conceptsCovered: [],
            startTime: Date.now(),
        };

        const success = saveSession(newSession);
        if (!success) {
            return {
                content: [{
                    type: "text",
                    text: "Failed to create session",
                }],
                isError: true,
            };
        }

        return {
            content: [{
                type: "text",
                text: JSON.stringify({
                    message: "Session created successfully!",
                    sessionId,
                    topic,
                    persona,
                    mode,
                }, null, 2),
            }],
        };
    }
);

// Add Round to Session Tool
server.tool(
    "add_session_round",
    "Add a conversation round to an active session",
    {
        sessionId: z.string().describe("The session ID"),
        userInput: z.string().describe("User's explanation"),
        aiResponse: z.string().describe("AI's response"),
        confusionLevel: z.number().min(0).max(100).describe("AI confusion level (0-100)"),
        jargonLevel: z.number().min(0).max(100).describe("Jargon level (0-100)"),
        validationTag: z.enum(["CORRECTION", "PROBE", "VERIFIED"]).describe("Validation status"),
    },
    async ({ sessionId, userInput, aiResponse, confusionLevel, jargonLevel, validationTag }) => {
        const session = getSessionById(sessionId);
        if (!session) {
            return {
                content: [{
                    type: "text",
                    text: `Session ${sessionId} not found`,
                }],
                isError: true,
            };
        }

        const round: Round = {
            id: `round_${session.rounds.length + 1}`,
            userInput,
            aiResponse,
            confusionLevel,
            jargonLevel,
            validationTag,
            timestamp: Date.now(),
        };

        session.rounds.push(round);
        const success = updateSession(sessionId, { rounds: session.rounds });

        return {
            content: [{
                type: "text",
                text: success
                    ? `Round added to session ${sessionId}`
                    : "Failed to add round",
            }],
            isError: !success,
        };
    }
);

// End Session Tool
server.tool(
    "end_session",
    "End a learning session and calculate final score",
    {
        sessionId: z.string().describe("The session ID"),
        conceptsCovered: z.array(z.string()).describe("List of concepts covered"),
    },
    async ({ sessionId, conceptsCovered }) => {
        const session = getSessionById(sessionId);
        if (!session) {
            return {
                content: [{
                    type: "text",
                    text: `Session ${sessionId} not found`,
                }],
                isError: true,
            };
        }

        // Calculate score based on rounds
        const avgConfusion = session.rounds.length > 0
            ? session.rounds.reduce((sum, r) => sum + r.confusionLevel, 0) / session.rounds.length
            : 50;
        const score = Math.round(100 - avgConfusion);

        const success = updateSession(sessionId, {
            endTime: Date.now(),
            score,
            conceptsCovered,
        });

        if (success) {
            // Update stats
            incrementSessionStats(score);
        }

        return {
            content: [{
                type: "text",
                text: JSON.stringify({
                    message: "Session ended successfully!",
                    sessionId,
                    score,
                    rounds: session.rounds.length,
                    conceptsCovered,
                }, null, 2),
            }],
        };
    }
);

// Delete Session Tool
server.tool(
    "delete_session",
    "Delete a learning session",
    {
        sessionId: z.string().describe("The session ID to delete"),
    },
    async ({ sessionId }) => {
        const success = deleteSession(sessionId);
        return {
            content: [{
                type: "text",
                text: success
                    ? `Session ${sessionId} deleted successfully`
                    : `Failed to delete session ${sessionId}`,
            }],
            isError: !success,
        };
    }
);

// Rename Session Tool
server.tool(
    "rename_session",
    "Rename a learning session's topic",
    {
        sessionId: z.string().describe("The session ID"),
        newTopic: z.string().describe("New topic name"),
    },
    async ({ sessionId, newTopic }) => {
        const success = renameSession(sessionId, newTopic);
        return {
            content: [{
                type: "text",
                text: success
                    ? `Session ${sessionId} renamed to "${newTopic}"`
                    : `Failed to rename session ${sessionId}`,
            }],
            isError: !success,
        };
    }
);

// ============================================================================
// WRITE TOOLS - Knowledge Graph Management
// ============================================================================

// Add Topic to Knowledge Graph
server.tool(
    "add_topic",
    "Add a new topic to the knowledge graph",
    {
        topic: z.string().describe("Topic name"),
        mastery: z.number().min(0).max(100).describe("Initial mastery level (0-100)"),
        domain: z.string().optional().describe("Domain (e.g., 'artificial-intelligence', 'programming')"),
        tags: z.array(z.string()).optional().describe("Tags for the topic"),
        difficulty: z.number().min(1).max(5).optional().describe("Difficulty level (1-5)"),
    },
    async ({ topic, mastery, domain, tags, difficulty }) => {
        const nodeId = `node_${Date.now()}`;
        const newNode: KnowledgeNode = {
            id: nodeId,
            topic,
            mastery,
            sessions: 1,
            lastPracticed: Date.now(),
            connections: [],
            domain,
            tags,
            difficulty: difficulty as 1 | 2 | 3 | 4 | 5 | undefined,
        };

        const success = addKnowledgeNode(newNode);
        return {
            content: [{
                type: "text",
                text: success
                    ? JSON.stringify({ message: "Topic added!", nodeId, topic }, null, 2)
                    : "Failed to add topic",
            }],
            isError: !success,
        };
    }
);

// Update Topic Mastery
server.tool(
    "update_topic_mastery",
    "Update the mastery level of a topic",
    {
        topic: z.string().describe("Topic name"),
        mastery: z.number().min(0).max(100).describe("New mastery level (0-100)"),
    },
    async ({ topic, mastery }) => {
        const nodes = getKnowledgeNodes();
        const node = nodes.find(n => n.topic.toLowerCase() === topic.toLowerCase());

        if (!node) {
            return {
                content: [{
                    type: "text",
                    text: `Topic "${topic}" not found`,
                }],
                isError: true,
            };
        }

        const success = updateKnowledgeNode(node.id, {
            mastery,
            lastPracticed: Date.now(),
            sessions: node.sessions + 1,
        });

        return {
            content: [{
                type: "text",
                text: success
                    ? `Updated "${topic}" mastery to ${mastery}%`
                    : "Failed to update mastery",
            }],
            isError: !success,
        };
    }
);

// Delete Topic
server.tool(
    "delete_topic",
    "Delete a topic from the knowledge graph",
    {
        topic: z.string().describe("Topic name to delete"),
    },
    async ({ topic }) => {
        const nodes = getKnowledgeNodes();
        const node = nodes.find(n => n.topic.toLowerCase() === topic.toLowerCase());

        if (!node) {
            return {
                content: [{
                    type: "text",
                    text: `Topic "${topic}" not found`,
                }],
                isError: true,
            };
        }

        const success = deleteKnowledgeNode(node.id);
        return {
            content: [{
                type: "text",
                text: success
                    ? `Topic "${topic}" deleted`
                    : "Failed to delete topic",
            }],
            isError: !success,
        };
    }
);

// ============================================================================
// DATA MANAGEMENT TOOLS
// ============================================================================

// Export All Data
server.tool(
    "export_data",
    "Export all learning data as JSON",
    {},
    async () => {
        const data = exportAllData();
        return {
            content: [{
                type: "text",
                text: data,
            }],
        };
    }
);

// Import Data
server.tool(
    "import_data",
    "Import learning data from JSON",
    {
        jsonData: z.string().describe("JSON data to import"),
    },
    async ({ jsonData }) => {
        const success = importData(jsonData);
        return {
            content: [{
                type: "text",
                text: success
                    ? "Data imported successfully!"
                    : "Failed to import data",
            }],
            isError: !success,
        };
    }
);

// Clear All Data
server.tool(
    "clear_all_data",
    "Delete all learning data (WARNING: This cannot be undone!)",
    {
        confirm: z.literal("DELETE_ALL").describe("Must be 'DELETE_ALL' to confirm"),
    },
    async ({ confirm }) => {
        if (confirm !== "DELETE_ALL") {
            return {
                content: [{
                    type: "text",
                    text: "Confirmation failed. Set confirm='DELETE_ALL' to proceed.",
                }],
                isError: true,
            };
        }

        const success = deleteAllData();
        return {
            content: [{
                type: "text",
                text: success
                    ? "All data cleared successfully"
                    : "Failed to clear data",
            }],
            isError: !success,
        };
    }
);

// ============================================================================
// START SERVER
// ============================================================================

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Feynman Mirror MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
