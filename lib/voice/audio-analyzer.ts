import type { AudioData } from "@/types";

export class AudioAnalyzer {
    private audioContext: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;
    private microphone: MediaStreamAudioSourceNode | null = null;
    private dataArray: Uint8Array | null = null;
    private animationId: number | null = null;

    async initialize(stream: MediaStream): Promise<void> {
        if (typeof window === "undefined") {
            throw new Error("AudioAnalyzer only works in browser");
        }

        this.audioContext = new AudioContext();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;

        const bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(bufferLength);

        this.microphone = this.audioContext.createMediaStreamSource(stream);
        this.microphone.connect(this.analyser);
    }

    getAudioData(): AudioData {
        if (!this.analyser || !this.dataArray) {
            return { amplitude: 0, frequency: [], isActive: false };
        }

        this.analyser.getByteFrequencyData(this.dataArray);

        // Calculate amplitude (average of all frequencies)
        const sum = this.dataArray.reduce((acc, val) => acc + val, 0);
        const amplitude = sum / this.dataArray.length / 255; // Normalize to 0-1

        // Get frequency data
        const frequency = Array.from(this.dataArray).map((val) => val / 255);

        return {
            amplitude,
            frequency,
            isActive: amplitude > 0.01, // Threshold for voice activity
        };
    }

    startAnalysis(callback: (data: AudioData) => void): void {
        const analyze = () => {
            const data = this.getAudioData();
            callback(data);
            this.animationId = requestAnimationFrame(analyze);
        };
        analyze();
    }

    stopAnalysis(): void {
        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    cleanup(): void {
        this.stopAnalysis();
        if (this.microphone) {
            this.microphone.disconnect();
        }
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}

export async function requestMicrophoneAccess(): Promise<MediaStream> {
    try {
        return await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
        console.error("Microphone access denied:", error);
        throw new Error("Microphone access is required for voice mode");
    }
}
