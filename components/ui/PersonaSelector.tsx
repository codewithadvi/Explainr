"use client";

import { PERSONAS } from "@/lib/ai/prompts";
import type { PersonaType } from "@/types";
import GlassPanel from "./GlassPanel";

interface PersonaSelectorProps {
    selected?: PersonaType;
    onSelect: (persona: PersonaType) => void;
}

export default function PersonaSelector({ selected, onSelect }: PersonaSelectorProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {Object.values(PERSONAS).map((persona) => {
                const isSelected = selected === persona.id;
                return (
                    <div
                        key={persona.id}
                        onClick={() => onSelect(persona.id)}
                        className={`relative cursor-pointer group rounded-xl p-5 border transition-all duration-300 ${isSelected
                                ? "bg-purple-600/20 border-purple-500/50 shadow-[0_0_30px_rgba(147,51,234,0.15)]"
                                : "bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/10"
                            }`}
                    >
                        {isSelected && (
                            <div className="absolute top-3 right-3 text-success">
                                <svg className="w-5 h-5 shadow-[0_0_10px_currentColor]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            </div>
                        )}

                        <div className="flex items-start gap-4">
                            <div className={`text-3xl sm:text-4xl p-2 rounded-lg ${isSelected ? "bg-purple-500/20" : "bg-white/5"}`}>
                                {persona.icon}
                            </div>
                            <div className="flex-1 min-w-0 pt-1">
                                <h3 className={`text-lg font-display font-bold mb-1 transition-colors ${isSelected ? "text-white" : "text-white/80 group-hover:text-white"}`}>
                                    {persona.name}
                                </h3>
                                <p className="text-sm text-gray-400 mb-3 leading-relaxed">
                                    {persona.description}
                                </p>
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="text-red-400 font-bold bg-red-400/10 px-1.5 py-0.5 rounded">FAIL</span>
                                        <span className="text-white/40 truncate">{persona.failState}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="text-emerald-400 font-bold bg-emerald-400/10 px-1.5 py-0.5 rounded">WIN</span>
                                        <span className="text-white/40 truncate">{persona.winState}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
