import type { VoiceConfig } from "@/types";

export class SpeechRecognition {
    private recognition: any;
    private isListening: boolean = false;
    private onResultCallback?: (transcript: string) => void;
    private onErrorCallback?: (error: string) => void;
    private fullTranscript: string = ""; // Accumulate all transcript chunks

    constructor(config?: Partial<VoiceConfig>) {
        if (typeof window === "undefined") {
            throw new Error("SpeechRecognition only works in browser");
        }

        // Check browser support
        const SpeechRecognitionAPI =
            (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition;

        if (!SpeechRecognitionAPI) {
            throw new Error("Speech recognition not supported in this browser");
        }

        this.recognition = new SpeechRecognitionAPI();
        this.recognition.continuous = config?.continuous ?? true; // Default to continuous for better UX
        this.recognition.interimResults = config?.interimResults ?? true; // Show real-time results
        this.recognition.lang = config?.language ?? "en-US";
        this.recognition.maxAlternatives = 1; // Only get best result

        this.setupEventListeners();
    }

    private setupEventListeners() {
        this.recognition.onresult = (event: any) => {
            // Build transcript from all results
            let interimTranscript = "";
            let finalTranscript = "";

            for (let i = 0; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + " ";
                } else {
                    interimTranscript += transcript + " ";
                }
            }

            // Combine final and interim transcripts
            this.fullTranscript = (finalTranscript + interimTranscript).trim();

            // Call callback with current transcript (updates in real-time)
            if (this.onResultCallback) {
                this.onResultCallback(this.fullTranscript);
            }
        };

        this.recognition.onerror = (event: any) => {
            console.error("Speech recognition error:", event.error);
            this.isListening = false;
            if (this.onErrorCallback) {
                this.onErrorCallback(event.error);
            }
        };

        this.recognition.onend = () => {
            this.isListening = false;
            // Ensure final transcript is sent when recognition ends
            if (this.onResultCallback && this.fullTranscript) {
                // Small delay to ensure all final results are processed
                setTimeout(() => {
                    if (this.onResultCallback && this.fullTranscript) {
                        this.onResultCallback(this.fullTranscript);
                    }
                }, 200);
            }
        };
    }

    start() {
        if (!this.isListening) {
            this.fullTranscript = ""; // Reset transcript on new recording
            this.recognition.start();
            this.isListening = true;
        }
    }

    stop() {
        if (this.isListening) {
            this.recognition.stop();
            this.isListening = false;
            // onend event will handle final transcript callback
        }
    }

    onResult(callback: (transcript: string) => void) {
        this.onResultCallback = callback;
    }

    onError(callback: (error: string) => void) {
        this.onErrorCallback = callback;
    }

    isActive(): boolean {
        return this.isListening;
    }
}

export function isSpeechRecognitionSupported(): boolean {
    if (typeof window === "undefined") return false;
    return !!(
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition
    );
}
