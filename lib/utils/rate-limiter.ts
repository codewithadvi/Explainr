interface RateLimitConfig {
    maxSessionsPerDay: number;
    maxRoundsPerSession: number;
    cooldownMinutes: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
    maxSessionsPerDay: 20,
    maxRoundsPerSession: 10,
    cooldownMinutes: 2,
};

export class RateLimiter {
    private config: RateLimitConfig;

    constructor(config?: Partial<RateLimitConfig>) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    checkDailyLimit(): { allowed: boolean; remaining: number; message?: string } {
        const today = new Date().toDateString();
        const sessions = this.getSessionData();
        const todaySessions = sessions[today] || 0;

        if (todaySessions >= this.config.maxSessionsPerDay) {
            return {
                allowed: false,
                remaining: 0,
                message: `Daily limit reached (${this.config.maxSessionsPerDay} sessions). Try again tomorrow! 🌙`,
            };
        }

        return {
            allowed: true,
            remaining: this.config.maxSessionsPerDay - todaySessions,
        };
    }

    checkRoundLimit(currentRounds: number): { allowed: boolean; remaining: number; message?: string } {
        if (currentRounds >= this.config.maxRoundsPerSession) {
            return {
                allowed: false,
                remaining: 0,
                message: `Session limit reached (${this.config.maxRoundsPerSession} rounds). Time to wrap up! 🎯`,
            };
        }

        return {
            allowed: true,
            remaining: this.config.maxRoundsPerSession - currentRounds,
        };
    }

    checkCooldown(): { allowed: boolean; waitMinutes?: number; message?: string } {
        const lastSession = localStorage.getItem("lastSessionEnd");
        if (!lastSession) {
            return { allowed: true };
        }

        const lastSessionTime = parseInt(lastSession, 10);
        const now = Date.now();
        const minutesSinceLastSession = (now - lastSessionTime) / 1000 / 60;

        if (minutesSinceLastSession < this.config.cooldownMinutes) {
            const waitMinutes = Math.ceil(this.config.cooldownMinutes - minutesSinceLastSession);
            return {
                allowed: false,
                waitMinutes,
                message: `Please wait ${waitMinutes} minute${waitMinutes > 1 ? "s" : ""} before starting a new session. Take a break! ☕`,
            };
        }

        return { allowed: true };
    }

    incrementSessionCount(): void {
        const today = new Date().toDateString();
        const sessions = this.getSessionData();
        sessions[today] = (sessions[today] || 0) + 1;
        localStorage.setItem("sessionCounts", JSON.stringify(sessions));
    }

    recordSessionEnd(): void {
        localStorage.setItem("lastSessionEnd", Date.now().toString());
    }

    private getSessionData(): Record<string, number> {
        try {
            const data = localStorage.getItem("sessionCounts");
            return data ? JSON.parse(data) : {};
        } catch {
            return {};
        }
    }

    // API Usage Protection (Client-side throttling)
    // This strictly prevents the client from flooding the API, saving money/limits.
    checkApiRateLimit(): { allowed: boolean; remaining: number; message?: string } {
        const now = Date.now();
        const timestamps = this.getApiTimestamps();

        // Filter out old timestamps (older than 1 minute)
        const recentRequestTimes = timestamps.filter(t => now - t < 60 * 1000);

        // Update storage if we filtered anything
        if (recentRequestTimes.length !== timestamps.length) {
            localStorage.setItem("api_timestamps", JSON.stringify(recentRequestTimes));
        }

        const MAX_API_CALLS_PER_MINUTE = 15; // Generous for voice chat, but blocks loops

        if (recentRequestTimes.length >= MAX_API_CALLS_PER_MINUTE) {
            return {
                allowed: false,
                remaining: 0,
                message: "Whoa, slow down! ⚡ You're talking too fast for the AI.",
            };
        }

        return {
            allowed: true,
            remaining: MAX_API_CALLS_PER_MINUTE - recentRequestTimes.length,
        };
    }

    recordApiCall(): void {
        const timestamps = this.getApiTimestamps();
        timestamps.push(Date.now());
        // Keep only last 20 timestamps to prevent storage bloat
        const keptTimestamps = timestamps.slice(-20);
        localStorage.setItem("api_timestamps", JSON.stringify(keptTimestamps));
    }

    private getApiTimestamps(): number[] {
        try {
            const data = localStorage.getItem("api_timestamps");
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }

    // Clean up old data (keep last 7 days)
    cleanup(): void {
        const sessions = this.getSessionData();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const cleaned: Record<string, number> = {};
        Object.entries(sessions).forEach(([date, count]) => {
            if (new Date(date) >= sevenDaysAgo) {
                cleaned[date] = count;
            }
        });

        localStorage.setItem("sessionCounts", JSON.stringify(cleaned));

        // Also cleanup API timestamps
        const timestamps = this.getApiTimestamps();
        const now = Date.now();
        const recent = timestamps.filter(t => now - t < 60 * 1000);
        localStorage.setItem("api_timestamps", JSON.stringify(recent));
    }
}

export const rateLimiter = new RateLimiter();
