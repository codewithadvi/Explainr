"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import GapAnalysisCard from "@/components/gamification/GapAnalysisCard";
import type { SessionData, GapAnalysis } from "@/types";
import { getSessionById, incrementSessionStats, addKnowledgeNode, getUserStats } from "@/lib/storage/local-storage";
import { calculateXP } from "@/lib/utils/scoring";

function ResultsContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("sessionId");

    const [session, setSession] = useState<SessionData | null>(null);
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [xpGained, setXPGained] = useState(0);

    useEffect(() => {
        if (sessionId) {
            const sessionData = getSessionById(sessionId);
            if (sessionData) {
                setSession(sessionData);

                // Calculate XP
                const stats = getUserStats();
                const xp = calculateXP(
                    sessionData.score,
                    sessionData.conceptsCovered.length,
                    stats.currentStreak
                );
                setXPGained(xp);

                // Update stats
                incrementSessionStats(xp);

                // Add to knowledge graph
                addKnowledgeNode(sessionData.topic, sessionData.score);

                // Show analysis after animation
                setTimeout(() => setShowAnalysis(true), 1500);
            }
        }
    }, [sessionId]);

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-2xl font-display text-text/60">Session not found</div>
            </div>
        );
    }

    const gapAnalysis: GapAnalysis = {
        userExplanation: session.rounds.map((r) => r.userInput).join(" "),
        betterExplanation: `A comprehensive explanation would cover: ${session.conceptsCovered.join(", ")}. Focus on clarity and completeness.`,
        missedConcepts: session.rounds
            .filter((r) => r.validationTag === "CORRECTION")
            .map((r) => r.aiResponse.split(" ").slice(0, 5).join(" ") + "..."),
        score: session.score,
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6">
            {/* Blob Explosion Animation */}
            <motion.div
                initial={{ scale: 1, opacity: 1 }}
                animate={{ scale: 3, opacity: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
                <div className="w-64 h-64 rounded-full bg-gradient-to-r from-accent to-success blur-3xl" />
            </motion.div>

            {/* Results Card */}
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-panel p-6 sm:p-8 md:p-12 max-w-2xl w-full text-center relative z-10"
            >
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-4 sm:mb-6">Session Complete! 🎉</h1>

                {/* Score */}
                <div className="mb-6 sm:mb-8">
                    <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold mb-2">
                        <span
                            className={
                                session.score >= 80
                                    ? "text-success"
                                    : session.score >= 50
                                        ? "text-liquid"
                                        : "text-error"
                            }
                        >
                            {session.score}
                        </span>
                        <span className="text-text/40 text-2xl sm:text-3xl md:text-4xl">/100</span>
                    </div>
                    <p className="text-sm sm:text-base text-text/60">Final Score</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
                    <div>
                        <div className="text-2xl sm:text-3xl font-display font-bold text-success">
                            +{xpGained}
                        </div>
                        <div className="text-xs sm:text-sm text-text/60">XP Earned</div>
                    </div>
                    <div>
                        <div className="text-2xl sm:text-3xl font-display font-bold text-accent">
                            {session.rounds.length}
                        </div>
                        <div className="text-xs sm:text-sm text-text/60">Rounds</div>
                    </div>
                    <div>
                        <div className="text-2xl sm:text-3xl font-display font-bold text-liquid">
                            {session.conceptsCovered.length}
                        </div>
                        <div className="text-xs sm:text-sm text-text/60">Concepts</div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                    <Link href="/setup" className="w-full sm:w-auto">
                        <button className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 rounded-lg bg-gradient-to-r from-accent to-success font-display font-bold hover:scale-105 transition-transform text-sm sm:text-base">
                            New Session
                        </button>
                    </Link>
                    <Link href="/dashboard" className="w-full sm:w-auto">
                        <button className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 rounded-lg bg-liquid/10 hover:bg-liquid/20 font-display transition-colors text-sm sm:text-base">
                            View Dashboard
                        </button>
                    </Link>
                </div>
            </motion.div>

            {/* Gap Analysis */}
            {showAnalysis && (
                <GapAnalysisCard
                    analysis={gapAnalysis}
                    onClose={() => setShowAnalysis(false)}
                />
            )}
        </div>
    );
}

export default function ResultsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-2xl font-display animate-pulse">Loading results...</div>
            </div>
        }>
            <ResultsContent />
        </Suspense>
    );
}
