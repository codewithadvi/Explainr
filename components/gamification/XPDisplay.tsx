"use client";

import { useMemo } from "react";
import { getXPProgress } from "@/lib/utils/scoring";

interface XPDisplayProps {
    totalXP: number;
    streak: number;
    className?: string;
}

export default function XPDisplay({ totalXP, streak, className = "" }: XPDisplayProps) {
    const { currentLevel, currentLevelXP, nextLevelXP, progress } = useMemo(
        () => getXPProgress(totalXP),
        [totalXP]
    );

    const streakMultiplier = streak > 1 ? Math.min(1 + (streak / 7) * 0.5, 2) : 1;

    return (
        <div className={`glass-panel p-4 ${className}`}>
            <div className="flex items-center justify-between mb-2">
                <div>
                    <div className="text-2xl font-display font-bold">
                        Level {currentLevel}
                    </div>
                    <div className="text-sm text-text/60">
                        {currentLevelXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP
                    </div>
                </div>
                {streak > 1 && (
                    <div className="text-right">
                        <div className="text-success font-bold">
                            {streakMultiplier.toFixed(1)}x
                        </div>
                        <div className="text-xs text-text/60">Streak Bonus</div>
                    </div>
                )}
            </div>

            {/* Progress bar */}
            <div className="relative h-3 bg-liquid/10 rounded-full overflow-hidden">
                <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent to-success rounded-full transition-all duration-500"
                    style={{ width: `${progress * 100}%` }}
                />
            </div>
        </div>
    );
}
