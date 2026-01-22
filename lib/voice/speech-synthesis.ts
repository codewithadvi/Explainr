import type { PersonaType } from "@/types";

export class SpeechSynthesis {
    private synth: globalThis.SpeechSynthesis | null = null;
    private currentUtterance: SpeechSynthesisUtterance | null = null;

    constructor() {
        if (typeof window !== "undefined") {
            this.synth = window.speechSynthesis;
        }
    }

    speak(text: string, persona?: PersonaType) {
        if (!this.synth) {
            console.warn("Speech synthesis not available");
            return;
        }

        // Cancel any ongoing speech
        this.synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Customize voice based on persona
        const voices = this.synth.getVoices();
        switch (persona) {
            case "toddler":
                utterance.pitch = 1.5;
                utterance.rate = 1.1;
                break;
            case "fratbro":
                utterance.pitch = 1.0;
                utterance.rate = 1.3;
                break;
            case "ceo":
                utterance.pitch = 0.9;
                utterance.rate = 1.0;
                break;
            case "professor":
                utterance.pitch = 0.8;
                utterance.rate = 0.9;
                break;
            default:
                utterance.pitch = 1.0;
                utterance.rate = 1.0;
        }

        // Try to find a suitable voice
        if (voices.length > 0) {
            const englishVoice = voices.find((voice) => voice.lang.startsWith("en"));
            if (englishVoice) {
                utterance.voice = englishVoice;
            }
        }

        this.currentUtterance = utterance;
        this.synth.speak(utterance);
    }

    stop() {
        if (this.synth) {
            this.synth.cancel();
        }
    }

    isPaused(): boolean {
        return this.synth?.paused ?? false;
    }

    isSpeaking(): boolean {
        return this.synth?.speaking ?? false;
    }
}

export function isSpeechSynthesisSupported(): boolean {
    if (typeof window === "undefined") return false;
    return "speechSynthesis" in window;
}
