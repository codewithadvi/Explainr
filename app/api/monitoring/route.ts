import { NextRequest, NextResponse } from "next/server";
import { serverRateLimiter } from "@/lib/monitoring/rate-limit-server";
import { performanceMonitor } from "@/lib/monitoring/performance";
import { logger } from "@/lib/monitoring/logger";

/**
 * Monitoring endpoint (protected - should require auth in production)
 * GET /api/monitoring - Get monitoring stats
 */
export async function GET(req: NextRequest) {
    try {
        // In production, add authentication here
        // const authHeader = req.headers.get("authorization");
        // if (authHeader !== `Bearer ${process.env.MONITORING_SECRET}`) {
        //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        // }

        const stats = serverRateLimiter.getStats();
        const performanceSummary = performanceMonitor.getSummary();

        return NextResponse.json({
            rateLimiting: {
                activeEntries: stats.totalEntries,
                entries: stats.entries.slice(0, 50), // Limit response size
            },
            performance: performanceSummary,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        logger.error("Monitoring endpoint error", error as Error);
        return NextResponse.json(
            { error: "Failed to get monitoring data" },
            { status: 500 }
        );
    }
}
