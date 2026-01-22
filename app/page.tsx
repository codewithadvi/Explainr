"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { Vortex } from "@/components/ui/vortex";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";

const MercuryBlob = dynamic(() => import("@/components/mercury-blob/MercuryBlob"), {
    ssr: false,
});

export default function HomePage() {
    const [blobVisible, setBlobVisible] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    useEffect(() => {
        setTimeout(() => setBlobVisible(true), 500);
    }, []);

    const blobY = useTransform(scrollYProgress, [0, 0.5], [0, -100]);
    const blobOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

    return (
        <div ref={containerRef} className="min-h-screen relative overflow-x-hidden">
            {/* Deep Galaxy Atmosphere - Multi-layered Background */}
            <div className="fixed inset-0 -z-10 bg-space-950">
                {/* Deep Void Gradient Base */}
                <div className="absolute inset-0 bg-gradient-to-b from-space-950 via-space-900 to-space-950 opacity-100" />

                {/* Nebula Clouds - Aquamarine Theme */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,255,200,0.15),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(0,200,255,0.12),transparent_40%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_80%,rgba(64,224,208,0.10),transparent_40%)]" />

                {/* Scintillating Stars Layer - Created via CSS/SVG for performance */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>

                {/* Dynamic Star Field Overlay - Subtle */}
                <div className="absolute inset-0 overflow-hidden">
                    {[...Array(50)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute rounded-full bg-white"
                            style={{
                                width: Math.random() < 0.1 ? 3 : Math.random() < 0.3 ? 2 : 1,
                                height: Math.random() < 0.1 ? 3 : Math.random() < 0.3 ? 2 : 1,
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                opacity: Math.random() * 0.5 + 0.1,
                                boxShadow: Math.random() < 0.1 ? `0 0 ${Math.random() * 10 + 5}px rgba(255,255,255,0.8)` : 'none'
                            }}
                            animate={{
                                opacity: [0.2, 0.8, 0.2],
                                scale: [1, 1.2, 1],
                            }}
                            transition={{
                                duration: Math.random() * 3 + 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: Math.random() * 2
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Navigation */}
            <div className="absolute top-6 right-6 z-50">
                <Link href="/dashboard">
                    <button className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-white text-sm font-bold uppercase tracking-wider hover:bg-white/10 hover:scale-105 transition-all backdrop-blur-md shadow-lg">
                        Dashboard
                    </button>
                </Link>
            </div>

            {/* Hero Section - Full Screen with Vortex */}
            <section className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
                <Vortex
                    backgroundColor="transparent"
                    className="flex items-center flex-col justify-center px-4 md:px-10 py-4 w-full h-full"
                    containerClassName="absolute inset-0 w-full h-full"
                    particleCount={200} // Significantly reduced for subtle effect
                    baseHue={180} // Aquamarine blue-green
                    baseSpeed={0.02} // Very slow drift
                    rangeSpeed={0.15}
                    baseRadius={1}
                    rangeRadius={2}
                >
                    {/* Content Container - z-10 for interactivity */}
                    <div className="relative z-10 flex flex-col items-center w-full max-w-7xl mx-auto">

                        {/* Title Section */}
                        <div className="text-center mb-10 w-full px-4 mt-20">
                            {/* Typewriter Effect for Title */}
                            <div className="flex justify-center mb-6">
                                <TypewriterEffectSmooth
                                    words={[
                                        { text: "Explainr", className: "text-6xl sm:text-7xl md:text-9xl lg:text-[10rem] font-display font-black text-white mix-blend-screen drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]" },
                                    ]}
                                    className="justify-center"
                                    cursorClassName="bg-success h-16 sm:h-24 md:h-32 lg:h-40 w-[6px]" // Green cursor
                                />
                            </div>

                            {/* Tagline Typewriter */}
                            <div className="h-20 sm:h-24 flex items-center justify-center">
                                <TypewriterEffectSmooth
                                    words={[
                                        { text: "Master" },
                                        { text: "concepts" },
                                        { text: "with" },
                                        { text: "voice-first", className: "text-cyan-400" },
                                        { text: "active", className: "text-teal-400" },
                                        { text: "recall.", className: "text-aqua-400" },
                                    ]}
                                    className="justify-center"
                                    cursorClassName="bg-success"
                                />
                            </div>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.8, duration: 0.8 }}
                                className="text-base sm:text-lg md:text-xl text-emerald-100/60 font-light max-w-2xl mx-auto mt-6 font-display tracking-wide"
                            >
                                "If you can't explain it simply, you don't understand it well enough."
                                <span className="block mt-2 text-sm text-emerald-400/40 uppercase tracking-widest font-bold">— Richard Feynman</span>
                            </motion.p>
                        </div>

                        {/* CTA Button - Preserving Core Style with Glow */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 2.2, type: "spring" }}
                            className="relative z-20 group"
                        >
                            <Link href="/setup">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="relative px-10 sm:px-14 py-5 rounded-2xl bg-[#00FF94] text-black font-display font-bold text-xl sm:text-2xl shadow-[0_0_50px_rgba(0,255,148,0.4)] hover:shadow-[0_0_80px_rgba(0,255,148,0.6)] transition-all duration-300 overflow-hidden"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        Start Learning
                                        <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </span>
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                </motion.button>
                            </Link>
                        </motion.div>
                    </div>

                    {/* Scroll Indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 3, duration: 1 }}
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30"
                    >
                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
                                <path d="M12 5v14M19 12l-7 7-7-7" />
                            </svg>
                        </motion.div>
                    </motion.div>
                </Vortex>
            </section>

            {/* Features Section - Redesigned with Spotlight Cards */}
            <section className="min-h-screen py-32 px-4 relative z-10">
                <div className="max-w-7xl mx-auto w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-24"
                    >
                        <h2 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold mb-8 text-white tracking-tight">
                            Why <span className="text-transparent bg-clip-text bg-gradient-to-r from-success via-emerald-400 to-teal-400">Explainr?</span>
                        </h2>
                        <p className="text-xl sm:text-2xl text-emerald-100/60 max-w-3xl mx-auto font-light leading-relaxed">
                            Transform your understanding with technologies that actually listen.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Voice-First Learning",
                                desc: "Speak naturally. AI analyzes your explanation in real-time.",
                                icon: (
                                    <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                                )
                            },
                            {
                                title: "4 AI Personas",
                                desc: "Explain to a toddler, peer, or professor. Adapt your language.",
                                icon: (
                                    <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                )
                            },
                            {
                                title: "Knowledge Galaxy",
                                desc: "Visualize your mastery as an expanding constellation of concepts.",
                                icon: (
                                    <svg className="w-8 h-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                )
                            },
                            {
                                title: "Gamification",
                                desc: "Build streaks and earn XP. Learning becomes your favorite game.",
                                icon: (
                                    <svg className="w-8 h-8 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                )
                            },
                            {
                                title: "Gap Analysis",
                                desc: "Identify exactly what you missed. Targeted feedback loops.",
                                icon: (
                                    <svg className="w-8 h-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                                )
                            },
                            {
                                title: "Privacy First",
                                desc: "Local-only processing available. Your voice, your data.",
                                icon: (
                                    <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                )
                            },
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                className="group relative p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 backdrop-blur-sm overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="relative z-10">
                                    <div className="mb-6 p-4 rounded-2xl bg-white/5 w-fit border border-white/10 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-2xl font-display font-medium text-white mb-3 group-hover:text-success transition-colors">{feature.title}</h3>
                                    <p className="text-base text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed">
                                        {feature.desc}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section - Celestial Path */}
            <section className="min-h-screen py-32 px-4 relative z-10 overflow-hidden">
                <div className="max-w-6xl mx-auto w-full relative">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-32"
                    >
                        <h2 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold mb-8 text-white tracking-tight">
                            How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-400">Works</span>
                        </h2>
                    </motion.div>

                    {/* Connecting Constellation Line */}
                    <div className="absolute left-8 md:left-1/2 top-40 bottom-20 w-px bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent hidden md:block" />

                    <div className="space-y-24 relative">
                        {[
                            { step: "01", title: "Choose Your Topic", desc: "Pick any concept you want to master - from React Hooks to Photosynthesis.", icon: "🎯" },
                            { step: "02", title: "Select a Persona", desc: "Explain to a toddler, peer, or professor. Each challenges you differently.", icon: "👥" },
                            { step: "03", title: "Explain Out Loud", desc: "Speak naturally. Our AI analyzes your pace, clarity, and confidence.", icon: "🎙️" },
                            { step: "04", title: "Get Feedback", desc: "Receive immediate, actionable coaching on gaps in your understanding.", icon: "⚡" },
                            { step: "05", title: "Track Progress", desc: "Watch your knowledge galaxy expand as you master more concepts.", icon: "🌌" },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ delay: i * 0.1, duration: 0.6 }}
                                className={`flex flex-col md:flex-row items-center gap-12 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
                            >
                                {/* Content Card */}
                                <div className={`flex-1 w-full ${i % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                                    <h3 className="text-3xl font-display font-medium text-white mb-4">
                                        <span className="text-cyan-400 opacity-60 mr-4 md:hidden">#{item.step}</span>
                                        {item.title}
                                    </h3>
                                    <p className="text-lg text-gray-400 leading-relaxed font-light">
                                        {item.desc}
                                    </p>
                                </div>

                                {/* Center Node (Constellation Star) */}
                                <div className="relative z-10 flex-shrink-0">
                                    <div className="w-16 h-16 rounded-full bg-[#050014] border border-cyan-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(0,255,200,0.3)] group hover:scale-110 transition-transform duration-300">
                                        <span className="text-2xl">{item.icon}</span>
                                        {/* Orbiting Ring */}
                                        <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-spin-slow" style={{ animationDuration: '4s' }} />
                                    </div>
                                </div>

                                {/* Visual Side (Placeholder or Number) */}
                                <div className={`flex-1 w-full hidden md:flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                                    <span className="text-8xl font-display font-bold text-white/5 select-none scale-150 transform">
                                        {item.step}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="min-h-screen flex items-center justify-center py-20 px-4 relative">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6 bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                            Ready to Master Anything?
                        </h2>
                        <p className="text-xl sm:text-2xl text-emerald-100/70 mb-12 max-w-2xl mx-auto">
                            Start your learning journey today. It's free, it's fast, and it's fun.
                        </p>
                        <Link href="/setup">
                            <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-12 md:px-16 py-5 md:py-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-teal-500 font-display font-bold text-xl md:text-2xl text-white shadow-2xl transition-all uppercase tracking-wider"
                                style={{
                                    boxShadow: "0 0 80px rgba(0, 255, 148, 0.7), 0 0 120px rgba(0, 255, 148, 0.5)",
                                }}
                            >
                                Get Started Free →
                            </motion.button>
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
