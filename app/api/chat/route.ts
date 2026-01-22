import { NextRequest, NextResponse } from "next/server";
import { callGroqAPI } from "@/lib/ai/groq";
import { callGeminiAPI } from "@/lib/ai/gemini";
import { sanitizeUserInput } from "@/lib/utils/sanitize";
import { rateLimitMiddleware } from "@/lib/monitoring/rate-limit-server";
import { logger } from "@/lib/monitoring/logger";
import { performanceMonitor } from "@/lib/monitoring/performance";

export async function POST(req: NextRequest) {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();

    try {
        // Rate limiting
        const rateLimit = await rateLimitMiddleware(req, "/api/chat");
        if (!rateLimit || !rateLimit.allowed) {
            logger.warn("Rate limit exceeded", {
                requestId,
                path: "/api/chat",
                remaining: rateLimit?.remaining || 0,
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

        // Parse request
        const { systemPrompt, userMessage, provider = "groq" } = await req.json();

        // Validate inputs
        if (!systemPrompt || !userMessage) {
            logger.warn("Missing required fields", { requestId });
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Sanitize user input
        const sanitizedMessage = sanitizeUserInput(userMessage);
        if (!sanitizedMessage) {
            logger.warn("Invalid input detected", { requestId });
            return NextResponse.json(
                { error: "Invalid input" },
                { status: 400 }
            );
        }

        logger.info("Processing chat request", {
            requestId,
            provider,
            messageLength: sanitizedMessage.length,
        });

        // Try Groq first (primary, free) with performance monitoring
        if (provider === "groq" || provider === "auto") {
            const groqKey = process.env.GROQ_API_KEY;
            if (groqKey) {
                try {
                    const response = await performanceMonitor.measure(
                        "groq_api_call",
                        () => callGroqAPI(systemPrompt, sanitizedMessage, groqKey),
                        { requestId, provider: "groq" }
                    );

                    const duration = Date.now() - startTime;
                    logger.info("Chat request completed", {
                        requestId,
                        provider: "groq",
                        duration,
                    });

                    return NextResponse.json(
                        { response, provider: "groq" },
                        {
                            headers: {
                                "X-RateLimit-Remaining": String(rateLimit.remaining - 1),
                                "X-Request-ID": requestId,
                                "X-Response-Time": `${duration}ms`,
                            },
                        }
                    );
                } catch (error) {
                    logger.error("Groq API failed", error as Error, {
                        requestId,
                        provider: "groq",
                    });
                    // Fall through to Gemini
                }
            }
        }

        // Fallback to Gemini
        const geminiKey = process.env.GOOGLE_GEMINI_API_KEY;
        if (!geminiKey) {
            logger.error("No API keys configured", undefined, { requestId });
            return NextResponse.json(
                { error: "No API keys configured" },
                { status: 500 }
            );
        }

        const response = await performanceMonitor.measure(
            "gemini_api_call",
            () => callGeminiAPI(systemPrompt, sanitizedMessage, geminiKey),
            { requestId, provider: "gemini" }
        );

        const duration = Date.now() - startTime;
        logger.info("Chat request completed", {
            requestId,
            provider: "gemini",
            duration,
        });

        return NextResponse.json(
            { response, provider: "gemini" },
            {
                headers: {
                    "X-RateLimit-Remaining": String(rateLimit.remaining - 1),
                    "X-Request-ID": requestId,
                    "X-Response-Time": `${duration}ms`,
                },
            }
        );

    } catch (error) {
        const duration = Date.now() - startTime;
        logger.error("Chat API error", error as Error, {
            requestId,
            duration,
        });

        return NextResponse.json(
            {
                error: "Failed to process request",
                requestId,
            },
            {
                status: 500,
                headers: {
                    "X-Request-ID": requestId,
                },
            }
        );
    }
}
