"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import PersonaSelector from "@/components/ui/PersonaSelector";
import type { PersonaType } from "@/types";
import { sanitizeTopicName } from "@/lib/utils/sanitize";
import { rateLimiter } from "@/lib/utils/rate-limiter";
import { Vortex } from "@/components/ui/vortex";
import { PERSONAS } from "@/lib/ai/prompts";
import GlassPanel from "@/components/ui/GlassPanel";
import VoiceButton from "@/components/ui/VoiceButton";
import { saveSession } from "@/lib/storage/local-storage";

// Separate component for search params logic to use in Suspense
function SetupContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [topic, setTopic] = useState("");
    const [persona, setPersona] = useState<PersonaType>("toddler");
    const [mode, setMode] = useState<"voice" | "text">("voice");
    const [error, setError] = useState("");
    const [isStarting, setIsStarting] = useState(false);

    // Pre-fill topic if provided in URL
    useEffect(() => {
        const urlTopic = searchParams.get("topic");
        if (urlTopic) {
            setTopic(urlTopic);
        }
    }, [searchParams]);

    const handleLaunch = async () => {
        setError("");
        setIsStarting(true);

        // Validate topic
        const sanitized = sanitizeTopicName(topic);
        if (!sanitized || sanitized.length < 3) {
            setError("Please enter a valid topic (at least 3 characters)");
            setIsStarting(false);
            return;
        }

        // Check rate limits
        const dailyLimit = rateLimiter.checkDailyLimit();
        if (!dailyLimit.allowed) {
            setError(dailyLimit.message || "Daily limit reached");
            setIsStarting(false);
            return;
        }

        const cooldown = rateLimiter.checkCooldown();
        if (!cooldown.allowed) {
            setError(cooldown.message || "Please wait before starting a new session");
            setIsStarting(false);
            return;
        }

        // Navigate to session with params
        const params = new URLSearchParams({
            topic: sanitized,
            persona,
            mode,
        });
        router.push(`/session?${params.toString()}`);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-space-950">
            {/* Vortex Background - Tuned for Galaxy Theme */}
            <Vortex
                backgroundColor="transparent"
                className="flex items-center flex-col justify-center px-4 md:px-10 py-4 w-full h-full"
                containerClassName="absolute inset-0 w-full h-full"
                particleCount={300}
                baseHue={260}
                baseSpeed={0.05}
                rangeSpeed={1.0} // Increased for interactivity
                baseRadius={1}
                rangeRadius={2}
            >
                {/* Deep Galaxy Atmosphere Overlays */}
                <div className="fixed inset-0 pointer-events-none -z-10">
                    <div className="absolute inset-0 bg-gradient-to-b from-space-950/80 via-space-900/60 to-space-950/80" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-4xl relative z-10 p-4 sm:p-6"
                >
                    {/* Header */}
                    <div className="text-center mb-10">
                        <Link href="/" className="inline-block mb-6 group">
                            <span className="text-emerald-400 group-hover:text-emerald-300 transition-colors uppercase tracking-widest text-xs font-bold flex items-center gap-2 justify-center">
                                <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                Return Home
                            </span>
                        </Link>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold mb-3 text-white tracking-tight drop-shadow-lg">
                            Configure <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">Session</span>
                        </h1>
                        <p className="text-lg text-emerald-100/60 font-light">Initialize your learning parameters</p>
                    </div>

                    {/* Main Config Panel */}
                    <AnimatePresence mode="wait">
                        <GlassPanel>
                            <div className="space-y-8 relative z-10">
                                {/* Topic Input */}
                                <div className="space-y-3">
                                    <label className="block font-display font-bold text-emerald-400 uppercase tracking-widest text-xs">
                                        Learning Topic
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value)}
                                            placeholder="e.g. Quantum Mechanics, React Hooks, French Revolution..."
                                            className="w-full px-5 py-4 rounded-xl bg-black/40 border border-white/10 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all text-white placeholder-white/20 text-lg font-light shadow-inner group-hover:border-white/20"
                                            maxLength={100}
                                            autoFocus
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 text-sm pointer-events-none">
                                            ↵
                                        </div>
                                    </div>
                                </div>

                                {/* Mode Selection */}
                                <div className="space-y-3">
                                    <label className="block font-display font-bold text-emerald-400 uppercase tracking-widest text-xs">
                                        Input Mode
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setMode("voice")}
                                            className={`py-4 px-6 rounded-xl font-display font-bold transition-all border flex items-center justify-center gap-3 ${mode === "voice"
                                                ? "bg-purple-600/20 border-purple-500/50 text-white shadow-[0_0_20px_rgba(147,51,234,0.2)]"
                                                : "bg-black/20 border-white/5 text-white/40 hover:bg-white/5 hover:border-white/10"
                                                }`}
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                                            Voice
                                        </button>
                                        <button
                                            onClick={() => setMode("text")}
                                            className={`py-4 px-6 rounded-xl font-display font-bold transition-all border flex items-center justify-center gap-3 ${mode === "text"
                                                ? "bg-purple-600/20 border-purple-500/50 text-white shadow-[0_0_20px_rgba(147,51,234,0.2)]"
                                                : "bg-black/20 border-white/5 text-white/40 hover:bg-white/5 hover:border-white/10"
                                                }`}
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            Text
                                        </button>
                                    </div>
                                </div>

                                {/* Persona Selection */}
                                <div className="space-y-3">
                                    <label className="block font-display font-bold text-emerald-400 uppercase tracking-widest text-xs">
                                        AI Controller
                                    </label>
                                    <PersonaSelector selected={persona} onSelect={setPersona} />
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3 text-red-200 text-sm"
                                    >
                                        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        {error}
                                    </motion.div>
                                )}

                                {/* Launch Button */}
                                <button
                                    onClick={handleLaunch}
                                    disabled={!topic.trim() || isStarting}
                                    className="w-full py-5 rounded-xl bg-[#00FF94] text-black font-display font-bold text-xl hover:shadow-[0_0_40px_rgba(0,255,148,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none flex items-center justify-center gap-2 group"
                                >
                                    {isStarting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                            <span>Initializing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Initialize Simulation</span>
                                            <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                        </>
                                    )}
                                </button>
                            </div>
                        </GlassPanel>
                    </AnimatePresence>
                </motion.div>
            </Vortex>
        </div>
    );
}

export default function SetupPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-space-950" />}>
            <SetupContent />
        </Suspense>
    );
}
