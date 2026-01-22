/**
 * Server-side rate limiting
 * Uses in-memory storage by default, can be upgraded to Redis/Upstash
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

interface RateLimitConfig {
    maxRequests: number;
    windowMs: number;
}

class ServerRateLimiter {
    private store: Map<string, RateLimitEntry> = new Map();
    private cleanupInterval: NodeJS.Timeout;

    // Default limits
    private readonly DEFAULT_LIMITS: Record<string, RateLimitConfig> = {
        "/api/chat": { maxRequests: 30, windowMs: 60 * 1000 }, // 30 requests per minute
        "/api/generate-checklist": { maxRequests: 10, windowMs: 60 * 1000 }, // 10 requests per minute
        default: { maxRequests: 60, windowMs: 60 * 1000 }, // 60 requests per minute for other routes
    };

    constructor() {
        // Cleanup expired entries every 5 minutes
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 5 * 60 * 1000);
    }

    /**
     * Check if request is allowed
     * @param identifier - IP address or user ID
     * @param path - API path for route-specific limits
     * @returns Object with allowed status and remaining requests
     */
    checkLimit(
        identifier: string,
        path: string = "default"
    ): { allowed: boolean; remaining: number; resetTime: number } {
        const config = this.DEFAULT_LIMITS[path] || this.DEFAULT_LIMITS.default;
        const key = `${identifier}:${path}`;
        const now = Date.now();
        const entry = this.store.get(key);

        if (!entry || now > entry.resetTime) {
            // Create new entry or reset expired one
            const newEntry: RateLimitEntry = {
                count: 1,
                resetTime: now + config.windowMs,
            };
            this.store.set(key, newEntry);
            return {
                allowed: true,
                remaining: config.maxRequests - 1,
                resetTime: newEntry.resetTime,
            };
        }

        if (entry.count >= config.maxRequests) {
            return {
                allowed: false,
                remaining: 0,
                resetTime: entry.resetTime,
            };
        }

        // Increment count
        entry.count++;
        this.store.set(key, entry);

        return {
            allowed: true,
            remaining: config.maxRequests - entry.count,
            resetTime: entry.resetTime,
        };
    }

    /**
     * Get client IP from request
     */
    getClientIdentifier(req: Request | { ip?: string; headers: { get: (name: string) => string | null } }): string {
        // Try to get IP from various headers (for proxies/load balancers)
        const forwarded = req.headers.get("x-forwarded-for");
        const realIp = req.headers.get("x-real-ip");
        const cfConnectingIp = req.headers.get("cf-connecting-ip"); // Cloudflare

        if (forwarded) {
            return forwarded.split(",")[0].trim();
        }
        if (realIp) {
            return realIp;
        }
        if (cfConnectingIp) {
            return cfConnectingIp;
        }

        // Try NextRequest ip property
        if ("ip" in req && req.ip) {
            return req.ip;
        }

        // Fallback (won't work in serverless, but helps in dev)
        return "unknown";
    }

    /**
     * Cleanup expired entries
     */
    private cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.store.entries()) {
            if (now > entry.resetTime) {
                this.store.delete(key);
            }
        }
    }

    /**
     * Get current rate limit status
     */
    getStatus(identifier: string, path: string): RateLimitEntry | null {
        const key = `${identifier}:${path}`;
        return this.store.get(key) || null;
    }

    /**
     * Reset rate limit for an identifier (admin function)
     */
    reset(identifier: string, path: string): void {
        const key = `${identifier}:${path}`;
        this.store.delete(key);
    }

    /**
     * Clear all rate limits (use with caution)
     */
    clearAll(): void {
        this.store.clear();
    }

    /**
     * Get stats (for monitoring)
     */
    getStats(): { totalEntries: number; entries: Array<{ key: string; count: number; resetTime: number }> } {
        const entries = Array.from(this.store.entries()).map(([key, entry]) => ({
            key,
            count: entry.count,
            resetTime: entry.resetTime,
        }));

        return {
            totalEntries: entries.length,
            entries,
        };
    }
}

// Global singleton instance for Vercel/Serverless
// This allows the rate limit store to survive across hot lambda invocations
const globalForRateLimit = global as unknown as { serverRateLimiter: ServerRateLimiter };

export const serverRateLimiter = globalForRateLimit.serverRateLimiter || new ServerRateLimiter();

if (process.env.NODE_ENV !== "production") {
    globalForRateLimit.serverRateLimiter = serverRateLimiter;
} else {
    // In production, we also assign it to try and keep it warm
    globalForRateLimit.serverRateLimiter = serverRateLimiter;
}

/**
 * Rate limit middleware for Next.js API routes
 */
export async function rateLimitMiddleware(
    req: Request,
    path: string
): Promise<{ allowed: boolean; remaining: number; resetTime: number } | null> {
    const identifier = serverRateLimiter.getClientIdentifier(req);
    return serverRateLimiter.checkLimit(identifier, path);
}
