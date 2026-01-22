/**
 * Performance monitoring and metrics
 */

interface PerformanceMetric {
    name: string;
    duration: number;
    timestamp: number;
    metadata?: Record<string, any>;
}

class PerformanceMonitor {
    private metrics: PerformanceMetric[] = [];
    private maxMetrics = 1000; // Keep last 1000 metrics

    /**
     * Measure execution time of async function
     */
    async measure<T>(
        name: string,
        fn: () => Promise<T>,
        metadata?: Record<string, any>
    ): Promise<T> {
        const start = performance.now();
        try {
            const result = await fn();
            const duration = performance.now() - start;
            this.recordMetric(name, duration, metadata);
            return result;
        } catch (error) {
            const duration = performance.now() - start;
            this.recordMetric(name, duration, { ...metadata, error: true });
            throw error;
        }
    }

    /**
     * Measure execution time of sync function
     */
    measureSync<T>(
        name: string,
        fn: () => T,
        metadata?: Record<string, any>
    ): T {
        const start = performance.now();
        try {
            const result = fn();
            const duration = performance.now() - start;
            this.recordMetric(name, duration, metadata);
            return result;
        } catch (error) {
            const duration = performance.now() - start;
            this.recordMetric(name, duration, { ...metadata, error: true });
            throw error;
        }
    }

    /**
     * Record a metric manually
     */
    recordMetric(name: string, duration: number, metadata?: Record<string, any>): void {
        const metric: PerformanceMetric = {
            name,
            duration,
            timestamp: Date.now(),
            metadata,
        };

        this.metrics.push(metric);

        // Keep only last N metrics
        if (this.metrics.length > this.maxMetrics) {
            this.metrics.shift();
        }

        // Log slow operations
        if (duration > 1000) {
            console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`, metadata);
        }
    }

    /**
     * Get metrics for a specific operation
     */
    getMetrics(name?: string): PerformanceMetric[] {
        if (name) {
            return this.metrics.filter((m) => m.name === name);
        }
        return [...this.metrics];
    }

    /**
     * Get statistics for an operation
     */
    getStats(name: string): {
        count: number;
        avgDuration: number;
        minDuration: number;
        maxDuration: number;
        p95: number;
        p99: number;
    } | null {
        const metrics = this.getMetrics(name);
        if (metrics.length === 0) return null;

        const durations = metrics.map((m) => m.duration).sort((a, b) => a - b);
        const sum = durations.reduce((a, b) => a + b, 0);

        return {
            count: durations.length,
            avgDuration: sum / durations.length,
            minDuration: durations[0],
            maxDuration: durations[durations.length - 1],
            p95: durations[Math.floor(durations.length * 0.95)],
            p99: durations[Math.floor(durations.length * 0.99)],
        };
    }

    /**
     * Clear all metrics
     */
    clear(): void {
        this.metrics = [];
    }

    /**
     * Get summary of all operations
     */
    getSummary(): Record<string, ReturnType<typeof this.getStats>> {
        const names = new Set(this.metrics.map((m) => m.name));
        const summary: Record<string, ReturnType<typeof this.getStats>> = {};

        for (const name of names) {
            summary[name] = this.getStats(name) || null;
        }

        return summary;
    }
}

export const performanceMonitor = new PerformanceMonitor();
