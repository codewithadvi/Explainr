import { NextRequest, NextResponse } from "next/server";
import { callGroqAPI } from "@/lib/ai/groq";
import { callGeminiAPI } from "@/lib/ai/gemini";
import { sanitizeTopicName } from "@/lib/utils/sanitize";
import { rateLimitMiddleware } from "@/lib/monitoring/rate-limit-server";
import { logger } from "@/lib/monitoring/logger";
import { performanceMonitor } from "@/lib/monitoring/performance";

export async function POST(req: NextRequest) {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();

    try {
        // Rate limiting
        const rateLimit = await rateLimitMiddleware(req, "/api/generate-checklist");
        if (!rateLimit || !rateLimit.allowed) {
            logger.warn("Rate limit exceeded", {
                requestId,
                path: "/api/generate-checklist",
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
                        "X-RateLimit-Limit": "10",
                        "X-RateLimit-Remaining": String(rateLimit?.remaining || 0),
                        "X-RateLimit-Reset": String(rateLimit?.resetTime || Date.now() + 60000),
                        "Retry-After": String(Math.ceil((rateLimit?.resetTime || Date.now() + 60000 - Date.now()) / 1000)),
                    },
                }
            );
        }

        const { topic, prompt } = await req.json();

        if (!topic) {
            logger.warn("Missing topic", { requestId });
            return NextResponse.json(
                { error: "Topic is required" },
                { status: 400 }
            );
        }

        const sanitizedTopic = sanitizeTopicName(topic);
        logger.info("Generating checklist", { requestId, topic: sanitizedTopic });

        // Try Groq first with performance monitoring
        const groqKey = process.env.GROQ_API_KEY;
        let aiResponse: string;

        try {
            if (groqKey) {
                const response = await performanceMonitor.measure(
                    "checklist_generation_groq",
                    () => callGroqAPI("", prompt, groqKey),
                    { requestId, provider: "groq", topic: sanitizedTopic }
                );
                aiResponse = response.message;
            } else {
                throw new Error("No Groq key");
            }
        } catch (error) {
            // Fallback to Gemini if Groq fails
            logger.warn("Groq failed, trying Gemini", { requestId }, error as Error);
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
                "checklist_generation_gemini",
                () => callGeminiAPI("", prompt, geminiKey),
                { requestId, provider: "gemini", topic: sanitizedTopic }
            );
            aiResponse = response.message;
        }

        // Parse JSON response
        try {
            const checklist = JSON.parse(aiResponse);
            const duration = Date.now() - startTime;
            logger.info("Checklist generated successfully", {
                requestId,
                topic: sanitizedTopic,
                itemCount: checklist.length || 0,
                duration,
            });

            return NextResponse.json(
                { checklist },
                {
                    headers: {
                        "X-RateLimit-Remaining": String(rateLimit.remaining - 1),
                        "X-Request-ID": requestId,
                        "X-Response-Time": `${duration}ms`,
                    },
                }
            );
        } catch {
            // If parsing fails, return a default checklist
            logger.warn("Failed to parse checklist, using default", { requestId });
            return NextResponse.json({
                checklist: [
                    { concept: "Basic definition", importance: "critical" },
                    { concept: "Key components", importance: "critical" },
                    { concept: "How it works", importance: "important" },
                    { concept: "Common use cases", importance: "important" },
                    { concept: "Limitations", importance: "nice-to-have" },
                ],
            });
        }

    } catch (error) {
        const duration = Date.now() - startTime;
        logger.error("Checklist generation error", error as Error, {
            requestId,
            duration,
        });

        return NextResponse.json(
            {
                error: "Failed to generate checklist",
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
