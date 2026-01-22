"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import {
    getUserStats,
    getSessions,
    getKnowledgeNodes,
    getCommitmentGrid,
    deleteSession,
    renameSession
} from "@/lib/storage/local-storage";
import CommitmentGrid from "@/components/gamification/CommitmentGrid";
import KnowledgeGalaxy from "@/components/gamification/KnowledgeGalaxy";
import GlassPanel from "@/components/ui/GlassPanel";
import type { SessionData, UserStats, KnowledgeNode } from "@/types";
import { PERSONAS } from "@/lib/ai/prompts";

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState<"overview" | "history">("overview");
    const [stats, setStats] = useState<UserStats | null>(null);
    const [sessions, setSessions] = useState<SessionData[]>([]);
    const [nodes, setNodes] = useState<KnowledgeNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
    const [editingSession, setEditingSession] = useState<string | null>(null);
    const [editingTopic, setEditingTopic] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();
    const historyTopic = searchParams.get("historyTopic");

    useEffect(() => {
        if (historyTopic) {
            console.log('History topic from URL:', historyTopic); // Debug
            setActiveTab("history");
        }
    }, [historyTopic]);

    // Filter sessions if a topic is selected
    const displayedSessions = historyTopic
        ? sessions.filter(s => {
            const match = s.topic.toLowerCase().trim() === historyTopic.toLowerCase().trim();
            console.log(`Comparing "${s.topic}" with "${historyTopic}": ${match}`); // Debug
            return match;
        })
        : sessions;

    useEffect(() => {
        // Load data on mount
        const loadData = () => {
            const userStats = getUserStats();
            const userSessions = getSessions().sort((a, b) => b.startTime - a.startTime); // Newest first
            const knowledgeNodes = getKnowledgeNodes();

            setStats(userStats);
            setSessions(userSessions);
            setNodes(knowledgeNodes);
            setLoading(false);
        };

        loadData();
    }, []);

    const toggleSession = (sessionId: string) => {
        setExpandedSessions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(sessionId)) {
                newSet.delete(sessionId);
            } else {
                newSet.add(sessionId);
            }
            return newSet;
        });
    };

    const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this session?")) {
            deleteSession(sessionId);
            setSessions(getSessions().sort((a, b) => b.startTime - a.startTime));
        }
    };

    const handleRenameSession = (sessionId: string, currentTopic: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingSession(sessionId);
        setEditingTopic(currentTopic);
    };

    const saveRename = (sessionId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (editingTopic.trim()) {
            renameSession(sessionId, editingTopic.trim());
            setSessions(getSessions().sort((a, b) => b.startTime - a.startTime));
        }
        setEditingSession(null);
        setEditingTopic("");
    };

    const cancelRename = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingSession(null);
        setEditingTopic("");
    };

    const [rebuildingGraph, setRebuildingGraph] = useState(false);

    const handleRebuildGraph = async () => {
        setRebuildingGraph(true);
        try {
            const { rebuildKnowledgeGraphRelationships } = await import('@/lib/storage/local-storage');
            await rebuildKnowledgeGraphRelationships();
            // Reload nodes to see updated relationships
            const { getKnowledgeNodes } = await import('@/lib/storage/local-storage');
            setNodes(getKnowledgeNodes());
            alert('✅ Knowledge graph rebuilt with AI-powered relationships!');
        } catch (error) {
            console.error('Failed to rebuild graph:', error);
            alert('❌ Failed to rebuild knowledge graph. Check console for details.');
        } finally {
            setRebuildingGraph(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-space-950 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-space-950 text-white relative overflow-hidden">
            {/* Background Atmosphere */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-space-950 via-space-900 to-space-950" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 sm:py-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <Link href="/" className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2 inline-block hover:text-emerald-300 transition-colors">
                            ← Return Home
                        </Link>
                        <h1 className="text-3xl md:text-5xl font-display font-bold">
                            Learning <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Dashboard</span>
                        </h1>
                    </div>

                    <Link href="/setup">
                        <button className="px-6 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 font-bold hover:bg-emerald-500/20 hover:scale-105 transition-all active:scale-95 flex items-center gap-2">
                            <span>New Session</span>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        </button>
                    </Link>
                </div>

                {/* Tabs */}
                <div className="flex bg-white/5 p-1 rounded-xl w-fit mb-8 border border-white/10 backdrop-blur-sm">
                    {(["overview", "history"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${activeTab === tab
                                ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                                : "text-white/40 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <AnimatePresence mode="wait">
                    {activeTab === "overview" ? (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-8"
                        >
                            {/* Stats Row */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <GlassPanel className="p-6 bg-purple-900/10 border-purple-500/20">
                                    <div className="text-purple-400 text-xs font-bold uppercase tracking-widest mb-1">Total XP</div>
                                    <div className="text-3xl font-display font-bold">{stats?.totalXP.toLocaleString()}</div>
                                </GlassPanel>
                                <GlassPanel className="p-6 bg-blue-900/10 border-blue-500/20">
                                    <div className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-1">Current Level</div>
                                    <div className="text-3xl font-display font-bold">Lvl {stats?.currentLevel}</div>
                                </GlassPanel>
                                <GlassPanel className="p-6 bg-emerald-900/10 border-emerald-500/20">
                                    <div className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">Streak</div>
                                    <div className="text-3xl font-display font-bold">{stats?.currentStreak} <span className="text-sm text-emerald-500/50 font-normal">days</span></div>
                                </GlassPanel>
                                <GlassPanel className="p-6 bg-pink-900/10 border-pink-500/20">
                                    <div className="text-pink-400 text-xs font-bold uppercase tracking-widest mb-1">Sessions</div>
                                    <div className="text-3xl font-display font-bold">{stats?.totalSessions}</div>
                                </GlassPanel>
                            </div>

                            {/* Main Grid: Galaxy + Commitment */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 h-[400px] sm:h-[500px] relative">
                                    {/* Rebuild Graph Button */}
                                    <button
                                        onClick={handleRebuildGraph}
                                        disabled={rebuildingGraph || nodes.length < 2}
                                        className="absolute top-4 right-4 z-20 px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/50 text-purple-300 text-xs font-bold hover:bg-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                        title="Use AI to analyze topics and create meaningful connections"
                                    >
                                        {rebuildingGraph ? (
                                            <>
                                                <div className="w-3 h-3 border-2 border-purple-300 border-t-transparent rounded-full animate-spin" />
                                                Analyzing...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                                Rebuild Graph (AI)
                                            </>
                                        )}
                                    </button>

                                    <KnowledgeGalaxy
                                        nodes={nodes}
                                        className="w-full h-full"
                                        onNodeClick={(node) => {
                                            console.log('Navigating to topic:', node.topic); // Debug
                                            setActiveTab("history");
                                            router.push(`/dashboard?historyTopic=${encodeURIComponent(node.topic)}`);
                                        }}
                                    />
                                </div>
                                <div className="lg:col-span-1">
                                    <CommitmentGrid commitmentData={stats?.commitmentGrid || {}} className="h-full" />
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="history"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="grid gap-4"
                        >
                            {displayedSessions.length === 0 ? (
                                <div className="text-center py-20 text-white/30">
                                    <div className="text-6xl mb-4">📜</div>
                                    <p>No study sessions yet{historyTopic ? ` for "${historyTopic}"` : ""}.</p>
                                    {historyTopic && (
                                        <button
                                            onClick={() => router.push('/dashboard')}
                                            className="mt-4 px-4 py-2 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-sm"
                                        >
                                            Clear Filter
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <>
                                    {historyTopic && (
                                        <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 rounded-xl mb-2">
                                            <span className="text-emerald-400 text-sm">Filtered by topic: <span className="font-bold text-white">{historyTopic}</span></span>
                                            <button
                                                onClick={() => router.push('/dashboard')}
                                                className="text-xs uppercase tracking-wider font-bold text-white/50 hover:text-white transition-colors"
                                            >
                                                Clear Filter
                                            </button>
                                        </div>
                                    )}
                                    {displayedSessions.map((session) => {
                                        const persona = PERSONAS[session.persona];
                                        const isExpanded = expandedSessions.has(session.id);
                                        return (
                                            <GlassPanel key={session.id} className="overflow-hidden hover:bg-white/5 transition-colors">
                                                <div
                                                    className="p-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center cursor-pointer"
                                                    onClick={() => toggleSession(session.id)}
                                                >
                                                    <div className="flex items-start gap-4 flex-1">
                                                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-2xl border border-white/10 group-hover:scale-110 transition-transform">
                                                            {persona?.icon || "🎓"}
                                                        </div>
                                                        <div className="flex-1">
                                                            {editingSession === session.id ? (
                                                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                                    <input
                                                                        type="text"
                                                                        value={editingTopic}
                                                                        onChange={(e) => setEditingTopic(e.target.value)}
                                                                        className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm flex-1"
                                                                        autoFocus
                                                                    />
                                                                    <button
                                                                        onClick={(e) => saveRename(session.id, e)}
                                                                        className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs hover:bg-emerald-500/30"
                                                                    >
                                                                        Save
                                                                    </button>
                                                                    <button
                                                                        onClick={cancelRename}
                                                                        className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">{session.topic}</h3>
                                                                    <div className="flex flex-wrap gap-3 text-xs mt-1 text-white/50">
                                                                        <span className="flex items-center gap-1">
                                                                            {new Date(session.startTime).toLocaleDateString()}
                                                                        </span>
                                                                        <span>•</span>
                                                                        <span className="flex items-center gap-1">
                                                                            {persona?.name || session.persona}
                                                                        </span>
                                                                        <span>•</span>
                                                                        <span className="flex items-center gap-1">
                                                                            {session.rounds.length} rounds
                                                                        </span>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={(e) => handleRenameSession(session.id, session.topic, e)}
                                                                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-blue-400"
                                                                title="Rename session"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                onClick={(e) => handleDeleteSession(session.id, e)}
                                                                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-red-400"
                                                                title="Delete session"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-6 w-full sm:w-auto mt-2 sm:mt-0">
                                                        <div className="text-right">
                                                            <div className="text-xs text-white/40 uppercase tracking-widest font-bold">Score</div>
                                                            <div className="text-2xl font-bold text-emerald-400">{session.score}</div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-xs text-white/40 uppercase tracking-widest font-bold">Validation</div>
                                                            <div className={`text-sm font-bold px-2 py-1 rounded inline-block mt-1 ${session.rounds.some(r => r.validationTag === "VERIFIED")
                                                                ? "bg-emerald-500/20 text-emerald-300"
                                                                : "bg-orange-500/20 text-orange-300"
                                                                }`}>
                                                                {session.rounds.some(r => r.validationTag === "VERIFIED") ? "Pass" : "Review"}
                                                            </div>
                                                        </div>
                                                        <div className="text-white/40">
                                                            <svg
                                                                className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Expanded Content - Conversation Rounds */}
                                                <AnimatePresence>
                                                    {isExpanded && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.3 }}
                                                            className="border-t border-white/10 bg-black/20"
                                                        >
                                                            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                                                                {session.rounds.map((round, idx) => (
                                                                    <div key={round.id} className="space-y-2">
                                                                        <div className="flex items-start gap-2">
                                                                            <div className="text-xs font-bold text-emerald-400 mt-1">You:</div>
                                                                            <div className="flex-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-sm">
                                                                                {round.userInput}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-start gap-2">
                                                                            <div className="text-xs font-bold text-purple-400 mt-1">AI:</div>
                                                                            <div className="flex-1 bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 text-sm">
                                                                                <div>{round.aiResponse}</div>
                                                                                <div className="flex gap-4 mt-2 text-xs text-white/40">
                                                                                    <span>Confusion: {round.confusionLevel}%</span>
                                                                                    <span>Jargon: {round.jargonLevel}%</span>
                                                                                    <span className={`font-bold ${round.validationTag === "VERIFIED" ? "text-emerald-400" :
                                                                                        round.validationTag === "CORRECTION" ? "text-red-400" :
                                                                                            "text-yellow-400"
                                                                                        }`}>
                                                                                        {round.validationTag}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        {idx < session.rounds.length - 1 && (
                                                                            <div className="border-b border-white/5 my-3" />
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </GlassPanel>
                                        );
                                    })}
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
