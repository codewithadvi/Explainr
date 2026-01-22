import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimitMiddleware } from "@/lib/monitoring/rate-limit-server";
import { logger } from "@/lib/monitoring/logger";

/**
 * Next.js middleware for global rate limiting
 * Runs on every request before it reaches API routes
 */
export async function middleware(request: NextRequest) {
    // Only apply rate limiting to API routes
    if (request.nextUrl.pathname.startsWith("/api/")) {
        const path = request.nextUrl.pathname;
        const rateLimit = await rateLimitMiddleware(request, path);

        if (!rateLimit || !rateLimit.allowed) {
            logger.warn("Rate limit exceeded in middleware", {
                path,
                ip: request.ip || "unknown",
            });

            return NextResponse.json(
                {
                    error: "Rate limit exceeded",
                    message: "Too many requests. Please try again later.",
                    retryAfter: Math.ceil((rateLimit?.resetTime || Date.now() + 60000 - Date.now()) / 1000),
                },
                {
                    status: 429,
                    headers: {
                        "X-RateLimit-Limit": "30",
                        "X-RateLimit-Remaining": String(rateLimit?.remaining || 0),
                        "X-RateLimit-Reset": String(rateLimit?.resetTime || Date.now() + 60000),
                        "Retry-After": String(Math.ceil((rateLimit?.resetTime || Date.now() + 60000 - Date.now()) / 1000)),
                    },
                }
            );
        }

        // Add rate limit headers to successful responses
        const response = NextResponse.next();
        response.headers.set("X-RateLimit-Limit", "30");
        response.headers.set("X-RateLimit-Remaining", String(rateLimit.remaining));
        response.headers.set("X-RateLimit-Reset", String(rateLimit.resetTime));
        return response;
    }

    return NextResponse.next();
}

// Configure which routes the middleware runs on
export const config = {
    matcher: "/api/:path*",
};
