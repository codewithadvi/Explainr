"use client";

import { useState } from "react";

interface VoiceButtonProps {
    isRecording: boolean;
    onStart: () => void;
    onStop: () => void;
    disabled?: boolean;
    amplitude?: number;
}

export default function VoiceButton({
    isRecording,
    onStart,
    onStop,
    disabled = false,
    amplitude = 0,
}: VoiceButtonProps) {
    const [isPressed, setIsPressed] = useState(false);

    const handleMouseDown = () => {
        if (disabled) return;
        setIsPressed(true);
        onStart();
    };

    const handleMouseUp = () => {
        if (disabled) return;
        setIsPressed(false);
        onStop();
    };

    const handleMouseLeave = () => {
        if (isPressed) {
            setIsPressed(false);
            onStop();
        }
    };

    const pulseScale = 1 + amplitude * 0.5;

    return (
        <div className="relative flex items-center justify-center">
            {/* Outer glow ring */}
            {isRecording && (
                <div
                    className="absolute inset-0 rounded-full bg-error/30 animate-ping"
                    style={{
                        transform: `scale(${pulseScale})`,
                    }}
                />
            )}

            {/* Main button */}
            <button
                className={`voice-button ${isRecording ? "recording" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onTouchStart={handleMouseDown}
                onTouchEnd={handleMouseUp}
                disabled={disabled}
                aria-label={isRecording ? "Recording... Release to stop" : "Hold to speak"}
            >
                <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white"
                >
                    {isRecording ? (
                        <rect x="6" y="4" width="12" height="16" rx="2" />
                    ) : (
                        <>
                            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                            <line x1="12" x2="12" y1="19" y2="22" />
                        </>
                    )}
                </svg>
            </button>

            {/* Instruction text */}
            <div className="absolute -bottom-12 text-center text-sm text-text/60">
                {isRecording ? "🔴 Recording..." : "Hold to speak"}
            </div>
        </div>
    );
}
