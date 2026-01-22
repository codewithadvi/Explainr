"use client";

import { useEffect, useRef } from "react";
import type { Round } from "@/types";
import GlassPanel from "./GlassPanel";

interface TranscriptDisplayProps {
    rounds: Round[];
}

export default function TranscriptDisplay({ rounds }: TranscriptDisplayProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Auto-scroll to bottom
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [rounds]);

    return (
        <div
            ref={scrollRef}
            className="h-full overflow-y-auto custom-scrollbar space-y-4 p-4"
        >
            {rounds.length === 0 ? (
                <div className="text-center text-text/40 mt-8">
                    <p>Start explaining to begin...</p>
                </div>
            ) : (
                rounds.map((round) => (
                    <div key={round.id} className="space-y-3">
                        {/* User message */}
                        <div className="flex justify-end">
                            <div className="transcript-user">
                                <p className="text-sm">{round.userInput}</p>
                            </div>
                        </div>

                        {/* AI response */}
                        <div className="flex justify-start">
                            <div className="transcript-ai">
                                <div className="flex items-start gap-2 mb-2">
                                    <span
                                        className={`text-xs px-2 py-1 rounded ${round.validationTag === "CORRECTION"
                                            ? "bg-error/20 text-error"
                                            : round.validationTag === "VERIFIED"
                                                ? "bg-success/20 text-success"
                                                : "bg-accent/20 text-accent"
                                            }`}
                                    >
                                        {round.validationTag}
                                    </span>
                                    <span className="text-xs text-text/40">
                                        Confusion: {round.confusionLevel}%
                                    </span>
                                    {round.jargonLevel !== undefined && (
                                        <span className="text-xs text-text/40">
                                            Jargon: {round.jargonLevel}%
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm whitespace-pre-wrap">{round.aiResponse}</p>

                                {/* Learning Resources */}
                                {round.resources && round.resources.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-white/10">
                                        <p className="text-xs font-bold text-accent mb-2 uppercase tracking-wide">📚 Recommended Resources:</p>
                                        <ul className="space-y-1">
                                            {round.resources.map((res, i) => (
                                                <li key={i} className="text-xs text-text/70 flex items-start gap-2">
                                                    <span>🔗</span>
                                                    <a
                                                        href={`https://www.google.com/search?q=${encodeURIComponent(res.replace(/^- /, ""))}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="hover:text-accent underline decoration-accent/50 hover:decoration-accent transition-colors"
                                                    >
                                                        {res.replace(/^- /, "")}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
