"use client";

import { useMemo } from "react";
import GlassPanel from "../ui/GlassPanel";

interface CommitmentGridProps {
    commitmentData: Record<string, number>; // date -> session count
    className?: string;
}

export default function CommitmentGrid({ commitmentData, className = "" }: CommitmentGridProps) {
    const gridData = useMemo(() => {
        const weeks = 52;
        const daysPerWeek = 7;
        const totalDays = weeks * daysPerWeek;
        const grid: Array<{ date: string; count: number }> = [];

        const today = new Date();
        const startDate = new Date(today);
        // Subtract totalDays - 1 so the loop ending at totalDays-1 includes today
        startDate.setDate(today.getDate() - totalDays + 1);

        for (let i = 0; i < totalDays; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const dateStr = date.toDateString();
            const count = commitmentData[dateStr] || 0;
            grid.push({ date: dateStr, count });
        }

        return grid;
    }, [commitmentData]);

    const getColor = (count: number): string => {
        if (count === 0) return "bg-white/5 border border-white/10 hover:border-white/30";
        if (count === 1) return "bg-[#0e4429] border border-[#006d32] shadow-[0_0_5px_rgba(35,134,54,0.4)]";
        if (count === 2) return "bg-[#006d32] border border-[#26a641] shadow-[0_0_8px_rgba(57,211,83,0.5)]";
        if (count >= 3) return "bg-[#39d353] border border-[#39d353] shadow-[0_0_12px_rgba(57,211,83,0.8)] box-shadow-neon";
        return "bg-white/5";
    };

    const currentStreak = useMemo(() => {
        let streak = 0;
        const today = new Date().toDateString();
        let checkDate = new Date();

        while (true) {
            const dateStr = checkDate.toDateString();
            if (commitmentData[dateStr] && commitmentData[dateStr] > 0) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else if (dateStr === today) {
                // Today doesn't count against streak yet
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }

        return streak;
    }, [commitmentData]);

    return (
        <GlassPanel className={`${className} bg-space-900/30 border-white/10`}>
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-display font-bold text-white mb-1">Commitment Grid</h3>
                        <p className="text-xs text-white/40">Consistency is key to mastery</p>
                    </div>
                    <div className="text-right">
                        <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00FF94] to-[#39d353]">{currentStreak}</span>
                        <span className="text-emerald-400/60 ml-1 text-sm font-bold uppercase tracking-wider">day streak</span>
                    </div>
                </div>

                {/* Contribution Graph Container */}
                <div className="w-full overflow-x-auto pb-2 scrollbar-none">
                    <div className="min-w-fit flex justify-center md:justify-end">
                        <div className="grid grid-rows-7 grid-flow-col gap-[3px]">
                            {gridData.map((day, i) => (
                                <div
                                    key={i}
                                    className={`w-3 h-3 md:w-4 md:h-4 rounded-sm transition-all duration-200 cursor-help ${getColor(day.count)}`}
                                    title={`${day.date}: ${day.count} session${day.count !== 1 ? "s" : ""}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-6 text-xs text-white/30 font-display uppercase tracking-widest">
                    <span>Less</span>
                    <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-sm bg-white/10 border border-white/10" />
                        <div className="w-3 h-3 rounded-sm bg-[#0e4429] border border-[#006d32]" />
                        <div className="w-3 h-3 rounded-sm bg-[#006d32] border border-[#26a641]" />
                        <div className="w-3 h-3 rounded-sm bg-[#39d353] border border-[#39d353]" />
                    </div>
                    <span>More</span>
                </div>
            </div>
        </GlassPanel>
    );
}
