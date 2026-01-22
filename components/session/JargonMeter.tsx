"use client";

import { motion } from "framer-motion";

interface JargonMeterProps {
    level: number; // 0-100
    className?: string;
}

export default function JargonMeter({ level, className = "" }: JargonMeterProps) {
    // Determine color based on level
    // 0-30: Simple (Green)
    // 30-70: Moderate (Yellow/Orange)
    // 70-100: Complex/Jargon-heavy (Red)
    const getColor = (l: number) => {
        if (l < 40) return "#00FF94"; // Green
        if (l < 70) return "#FBBF24"; // Amber
        return "#A855F7"; // Purple (matching complexity/magic)
    };

    const color = getColor(level);

    return (
        <div className={`bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 ${className}`}>
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/60 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    Complexity Meter
                </h3>
                <span className="text-xs font-bold" style={{ color }}>{level}%</span>
            </div>

            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden relative">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${level}%`, backgroundColor: color }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    className="h-full rounded-full absolute left-0 top-0 shadow-[0_0_10px_currentColor]"
                />
            </div>

            <div className="flex justify-between mt-1 text-[10px] text-white/30 font-mono">
                <span>Simple</span>
                <span>Technical</span>
            </div>
        </div>
    );
}
