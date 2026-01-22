"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import VoiceButton from "@/components/ui/VoiceButton";
import TranscriptDisplay from "@/components/ui/TranscriptDisplay";
import GlassPanel from "@/components/ui/GlassPanel";
import JargonMeter from "@/components/session/JargonMeter";
import type { PersonaType, Round, ChecklistItem, SessionData } from "@/types";
import { getPersona, generateSystemPrompt } from "@/lib/ai/prompts";
import { generateChecklist, updateChecklistCoverage, getChecklistProgress } from "@/lib/ai/checklist";
import { SpeechRecognition, isSpeechRecognitionSupported } from "@/lib/voice/speech-recognition";
import { AudioAnalyzer, requestMicrophoneAccess } from "@/lib/voice/audio-analyzer";
import { rateLimiter } from "@/lib/utils/rate-limiter";
import { saveSession, addKnowledgeNode } from "@/lib/storage/local-storage";

const MercuryBlob = dynamic(() => import("@/components/mercury-blob/MercuryBlob"), {
    ssr: false,
});

function SessionContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const topic = searchParams.get("topic") || "";
    const persona = (searchParams.get("persona") as PersonaType) || "toddler";
    const mode = (searchParams.get("mode") as "voice" | "text") || "voice";

    const [rounds, setRounds] = useState<Round[]>([]);
    const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [audioAmplitude, setAudioAmplitude] = useState(0);
    const [currentConfusion, setCurrentConfusion] = useState(0);
    const [currentJargon, setCurrentJargon] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [textInput, setTextInput] = useState("");
    const [error, setError] = useState("");

    const [speechRecognition, setSpeechRecognition] = useState<SpeechRecognition | null>(null);
    const [audioAnalyzer, setAudioAnalyzer] = useState<AudioAnalyzer | null>(null);

    // Initialize checklist
    useEffect(() => {
        if (topic) {
            generateChecklist(topic).then(setChecklist);
        }
    }, [topic]);

    // Initialize voice (if mode is voice)
    useEffect(() => {
        if (mode === "voice" && isSpeechRecognitionSupported()) {
            const recognition = new SpeechRecognition({ continuous: true }); // Changed to continuous

            recognition.onResult((transcript) => {
                // Update transcript in real-time (replaces, not appends)
                // This shows both interim and final results
                setTextInput(transcript);
            });

            recognition.onError((err) => {
                console.error("Speech recognition error:", err);
                setError("Voice recognition error. Please try again.");
                setIsRecording(false);
            });

            setSpeechRecognition(recognition);

            // Setup audio analyzer
            requestMicrophoneAccess().then((stream) => {
                const analyzer = new AudioAnalyzer();
                analyzer.initialize(stream);
                analyzer.startAnalysis((data) => {
                    setAudioAmplitude(data.amplitude);
                });
                setAudioAnalyzer(analyzer);
            }).catch((err) => {
                console.error("Microphone access error:", err);
                setError("Microphone access denied. Switching to text mode.");
            });
        }

        return () => {
            audioAnalyzer?.cleanup();
        };
    }, [mode]);

    const handleStartRecording = () => {
        if (speechRecognition) {
            setTextInput(""); // Clear input when starting new recording
            setError(""); // Clear any errors
            speechRecognition.start();
            setIsRecording(true);
        }
    };

    const handleStopRecording = () => {
        if (speechRecognition) {
            speechRecognition.stop();
            setIsRecording(false);
            // Transcript will be updated by onResult callback
            // User can now review and edit before sending
        }
    };

    const handleUserInput = async (input: string) => {
        if (!input.trim() || isProcessing) return;

        setIsProcessing(true);
        setError("");

        // Check round limit
        const roundLimit = rateLimiter.checkRoundLimit(rounds.length);
        if (!roundLimit.allowed) {
            setError(roundLimit.message || "Session limit reached");
            setIsProcessing(false);
            return;
        }

        // Check API frequency limit (Client-side protection)
        const apiLimit = rateLimiter.checkApiRateLimit();
        if (!apiLimit.allowed) {
            setError(apiLimit.message || "Please slow down");
            setIsProcessing(false);
            return;
        }

        try {
            // Generate system prompt
            const personaData = getPersona(persona);
            const checklistConcepts = checklist.map((item) => item.concept);
            const systemPrompt = generateSystemPrompt(personaData, topic, checklistConcepts);

            // Call AI API
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    systemPrompt,
                    userMessage: input,
                    provider: "auto",
                }),
            });

            if (!response.ok) {
                if (response.status === 429) {
                    setError("Global traffic is high. Please wait a moment.");
                    throw new Error("Rate limit exceeded");
                }
                throw new Error("AI request failed");
            }

            // Record successful API call for client-side throttling
            rateLimiter.recordApiCall();

            const data = await response.json();
            const aiResponse = data.response;

            // Create new round
            const newRound: Round = {
                id: `round_${Date.now()}`,
                userInput: input,
                aiResponse: aiResponse.message,
                confusionLevel: aiResponse.confusionLevel,
                jargonLevel: aiResponse.jargonLevel || 0,
                validationTag: aiResponse.validationTag,
                resources: aiResponse.resources,
                timestamp: Date.now(),
            };

            setRounds((prev) => [...prev, newRound]);
            setCurrentConfusion(aiResponse.confusionLevel);
            setCurrentJargon(aiResponse.jargonLevel || 0);

            // Update checklist
            const updatedChecklist = updateChecklistCoverage(checklist, input, aiResponse.message);
            setChecklist(updatedChecklist);

        } catch (err) {
            console.error("Error processing input:", err);
            setError("Failed to process your explanation. Please try again.");
        } finally {
            setIsProcessing(false);
            setTextInput("");
        }
    };

    const handleTextSubmit = () => {
        if (textInput.trim()) {
            handleUserInput(textInput);
        }
    };

    const handleFinishSession = () => {
        // Save session
        const progress = getChecklistProgress(checklist);
        const avgConfusion = rounds.reduce((sum, r) => sum + r.confusionLevel, 0) / (rounds.length || 1);
        const score = Math.round((progress.percentage + (100 - avgConfusion)) / 2);

        const sessionData: SessionData = {
            id: `session_${Date.now()}`,
            topic,
            persona,
            mode,
            rounds,
            score,
            conceptsCovered: checklist.filter((c) => c.covered).map((c) => c.concept),
            startTime: Date.now() - rounds.length * 60000, // Rough estimate
            endTime: Date.now(),
        };

        // Update Knowledge Graph
        checklist.forEach((item) => {
            if (item.covered) {
                // Base score + bonus for importance
                const nodeScore = item.importance === "critical" ? 80 :
                    item.importance === "important" ? 60 : 40;
                addKnowledgeNode(item.concept, nodeScore);
            }
        });

        // Add the main topic itself
        addKnowledgeNode(topic, score);

        saveSession(sessionData);
        rateLimiter.incrementSessionCount();
        rateLimiter.recordSessionEnd();

        // Navigate to results
        router.push(`/results?sessionId=${sessionData.id}`);
    };

    const progress = getChecklistProgress(checklist);

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <div className="p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <h2 className="text-xl md:text-2xl font-display font-bold truncate">{topic}</h2>
                    <p className="text-xs md:text-sm text-text/60">
                        {getPersona(persona).name} • Round {rounds.length + 1}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 md:gap-4 w-full sm:w-auto">
                    {/* Progress */}
                    <GlassPanel className="px-3 md:px-4 py-2">
                        <div className="text-xs md:text-sm">
                            <span className="font-bold">{progress.covered}</span>
                            <span className="text-text/60">/{progress.total}</span>
                        </div>
                    </GlassPanel>

                    {/* Confusion Meter */}
                    <GlassPanel className="px-3 md:px-4 py-2">
                        <div className="flex items-center gap-1 md:gap-2">
                            <div className="text-xs md:text-sm font-display">Conf:</div>
                            <div
                                className={`text-xs md:text-sm font-bold ${currentConfusion < 30
                                    ? "text-success"
                                    : currentConfusion < 70
                                        ? "text-liquid"
                                        : "text-error"
                                    }`}
                            >
                                {currentConfusion}%
                            </div>
                        </div>
                    </GlassPanel>

                    {/* Jargon Meter */}
                    <div className="w-32 hidden sm:block">
                        <JargonMeter level={currentJargon} />
                    </div>

                    <button
                        onClick={handleFinishSession}
                        className="px-3 md:px-4 py-2 rounded-lg bg-liquid/10 hover:bg-liquid/20 transition-colors text-xs md:text-sm whitespace-nowrap"
                    >
                        Finish
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4 md:gap-6 p-4 md:p-6">
                {/* Left: Blob + Input */}
                <div className="flex flex-col items-center justify-center gap-4 md:gap-8">
                    {/* Mercury Blob */}
                    <div className="w-full max-w-sm h-64 sm:h-80 md:h-96 aspect-square">
                        <MercuryBlob
                            confusionLevel={currentConfusion}
                            audioAmplitude={audioAmplitude}
                            persona={persona}
                        />
                    </div>

                    {/* Input */}
                    {mode === "voice" ? (
                        <div className="w-full max-w-lg px-4 md:px-0 space-y-4">
                            {/* Voice Button */}
                            <div className="flex justify-center">
                                <VoiceButton
                                    isRecording={isRecording}
                                    onStart={handleStartRecording}
                                    onStop={handleStopRecording}
                                    disabled={isProcessing}
                                    amplitude={audioAmplitude}
                                />
                            </div>

                            {/* Transcript Review (shown after recording or if text exists) */}
                            {(textInput.trim() || !isRecording) && (
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <textarea
                                            value={textInput}
                                            onChange={(e) => setTextInput(e.target.value)}
                                            placeholder={isRecording ? "Recording... text will appear here" : "Your transcript will appear here. Edit if needed, then click Send."}
                                            className="flex-1 px-3 md:px-4 py-2 md:py-3 rounded-lg bg-liquid/5 border border-liquid/20 focus:border-accent outline-none text-sm md:text-base min-h-[80px] resize-y"
                                            disabled={isProcessing || isRecording}
                                            aria-label="Review and edit your transcript"
                                            aria-describedby="voice-input-help"
                                        />
                                        <button
                                            onClick={handleTextSubmit}
                                            disabled={!textInput.trim() || isProcessing || isRecording}
                                            className="px-4 md:px-6 py-2 md:py-3 rounded-lg bg-gradient-to-r from-accent to-success font-display font-bold disabled:opacity-50 text-sm md:text-base whitespace-nowrap self-start"
                                            aria-label="Send message"
                                        >
                                            Send
                                        </button>
                                    </div>
                                    {textInput.trim() && !isRecording && (
                                        <div className="flex gap-2 justify-center">
                                            <button
                                                onClick={() => {
                                                    setTextInput("");
                                                    handleStartRecording();
                                                }}
                                                disabled={isProcessing}
                                                className="px-3 py-1 text-xs rounded-lg bg-liquid/10 hover:bg-liquid/20 transition-colors text-text/70"
                                                aria-label="Record again"
                                            >
                                                🔄 Record Again
                                            </button>
                                            <button
                                                onClick={() => setTextInput("")}
                                                disabled={isProcessing || isRecording}
                                                className="px-3 py-1 text-xs rounded-lg bg-error/10 hover:bg-error/20 transition-colors text-error"
                                                aria-label="Clear transcript"
                                            >
                                                ✕ Clear
                                            </button>
                                        </div>
                                    )}
                                    <span id="voice-input-help" className="sr-only">
                                        Review and edit your transcript, then click Send to submit
                                    </span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="w-full max-w-lg px-4 md:px-0">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={textInput}
                                    onChange={(e) => setTextInput(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && handleTextSubmit()}
                                    placeholder="Type your explanation..."
                                    className="flex-1 px-3 md:px-4 py-2 md:py-3 rounded-lg bg-liquid/5 border border-liquid/20 focus:border-accent outline-none text-sm md:text-base"
                                    disabled={isProcessing}
                                    aria-label="Type your explanation"
                                    aria-describedby="input-help"
                                />
                                <button
                                    onClick={handleTextSubmit}
                                    disabled={!textInput.trim() || isProcessing}
                                    className="px-4 md:px-6 py-2 md:py-3 rounded-lg bg-gradient-to-r from-accent to-success font-display font-bold disabled:opacity-50 text-sm md:text-base whitespace-nowrap"
                                    aria-label="Send message"
                                >
                                    Send
                                </button>
                                <span id="input-help" className="sr-only">Type your explanation and press Enter or click Send</span>
                            </div>
                        </div>
                    )}

                    {/* Processing Indicator */}
                    {isProcessing && (
                        <div className="text-accent animate-pulse">Processing...</div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="glass-panel px-4 py-2 bg-error/20 text-error text-sm">
                            {error}
                        </div>
                    )}
                </div>

                {/* Right: Transcript */}
                <GlassPanel className="h-[400px] md:h-[calc(100vh-200px)] min-h-[400px]">
                    <TranscriptDisplay rounds={rounds} />
                </GlassPanel>
            </div>
        </div>
    );
}

export default function SessionPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-2xl font-display animate-pulse">Loading session...</div>
            </div>
        }>
            <SessionContent />
        </Suspense>
    );
}
