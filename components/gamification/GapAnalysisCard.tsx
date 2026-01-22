"use client";

import { motion } from "framer-motion";
import GlassPanel from "../ui/GlassPanel";
import type { GapAnalysis } from "@/types";

interface GapAnalysisCardProps {
    analysis: GapAnalysis;
    onClose: () => void;
}

export default function GapAnalysisCard({ analysis, onClose }: GapAnalysisCardProps) {
    return (
        <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-50 p-6"
        >
            <GlassPanel className="max-w-4xl mx-auto p-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-display font-bold">Gap Analysis</h2>
                    <button
                        onClick={onClose}
                        className="text-text/60 hover:text-text transition-colors"
                        aria-label="Close"
                    >
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Score */}
                <div className="text-center mb-8">
                    <div className="text-6xl font-display font-bold mb-2">
                        <span
                            className={
                                analysis.score >= 80
                                    ? "text-success"
                                    : analysis.score >= 50
                                        ? "text-liquid"
                                        : "text-error"
                            }
                        >
                            {analysis.score}
                        </span>
                        <span className="text-text/40 text-3xl">/100</span>
                    </div>
                    <p className="text-text/60">Session Score</p>
                </div>

                {/* Comparison */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <h3 className="text-sm font-display font-bold text-text/60 mb-3">
                            You Said
                        </h3>
                        <div className="glass-panel p-4 bg-accent/10">
                            <p className="text-sm leading-relaxed">{analysis.userExplanation}</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-display font-bold text-text/60 mb-3">
                            Better Way
                        </h3>
                        <div className="glass-panel p-4 bg-success/10">
                            <p className="text-sm leading-relaxed">{analysis.betterExplanation}</p>
                        </div>
                    </div>
                </div>

                {/* Missed Concepts */}
                {analysis.missedConcepts.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-sm font-display font-bold text-text/60 mb-3">
                            Concepts to Review
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {analysis.missedConcepts.map((concept, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1 rounded-full bg-error/20 text-error text-sm"
                                >
                                    {concept}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-lg bg-gradient-to-r from-accent to-success font-display font-bold hover:scale-105 transition-transform"
                    >
                        Continue Learning
                    </button>
                </div>
            </GlassPanel>
        </motion.div>
    );
}
