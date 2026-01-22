/**
 * Production-ready logging and monitoring system
 * Supports multiple log levels and can be extended with external services
 */

export enum LogLevel {
    DEBUG = "DEBUG",
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR",
}

export interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    context?: Record<string, any>;
    error?: Error;
    userId?: string;
    requestId?: string;
}

class Logger {
    private isDevelopment = process.env.NODE_ENV === "development";
    private enableConsole = true;
    private enableRemote = process.env.ENABLE_REMOTE_LOGGING === "true";

    log(entry: LogEntry): void {
        const formatted = this.formatLog(entry);

        // Always log to console in development
        if (this.isDevelopment || this.enableConsole) {
            this.logToConsole(entry);
        }

        // Send to remote service in production (if configured)
        if (this.enableRemote && !this.isDevelopment) {
            this.logToRemote(entry).catch((err) => {
                console.error("Failed to send log to remote:", err);
            });
        }
    }

    private formatLog(entry: LogEntry): string {
        const { level, message, timestamp, context, error } = entry;
        let log = `[${timestamp}] [${level}] ${message}`;

        if (context && Object.keys(context).length > 0) {
            log += ` | Context: ${JSON.stringify(context)}`;
        }

        if (error) {
            log += ` | Error: ${error.message}`;
            if (error.stack) {
                log += ` | Stack: ${error.stack}`;
            }
        }

        return log;
    }

    private logToConsole(entry: LogEntry): void {
        const { level, message, context, error } = entry;
        const style = this.getConsoleStyle(level);

        console.log(
            `%c[${level}]`,
            style,
            message,
            context || "",
            error || ""
        );
    }

    private getConsoleStyle(level: LogLevel): string {
        const styles: Record<LogLevel, string> = {
            [LogLevel.DEBUG]: "color: #888",
            [LogLevel.INFO]: "color: #2196F3",
            [LogLevel.WARN]: "color: #FF9800",
            [LogLevel.ERROR]: "color: #F44336; font-weight: bold",
        };
        return styles[level] || "";
    }

    private async logToRemote(entry: LogEntry): Promise<void> {
        // In production, you can integrate with:
        // - Sentry (error tracking)
        // - LogRocket (session replay)
        // - Datadog (APM)
        // - Custom logging service

        // Example: Send to API endpoint
        try {
            if (process.env.LOGGING_API_URL) {
                await fetch(process.env.LOGGING_API_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(entry),
                });
            }
        } catch (error) {
            // Fail silently to avoid breaking the app
            console.error("Remote logging failed:", error);
        }
    }

    debug(message: string, context?: Record<string, any>): void {
        this.log({
            level: LogLevel.DEBUG,
            message,
            timestamp: new Date().toISOString(),
            context,
        });
    }

    info(message: string, context?: Record<string, any>): void {
        this.log({
            level: LogLevel.INFO,
            message,
            timestamp: new Date().toISOString(),
            context,
        });
    }

    warn(message: string, context?: Record<string, any>, error?: Error): void {
        this.log({
            level: LogLevel.WARN,
            message,
            timestamp: new Date().toISOString(),
            context,
            error,
        });
    }

    error(message: string, error?: Error, context?: Record<string, any>): void {
        this.log({
            level: LogLevel.ERROR,
            message,
            timestamp: new Date().toISOString(),
            context,
            error,
        });

        // In production, send critical errors to monitoring service
        if (!this.isDevelopment && error) {
            this.sendToErrorTracking(error, context);
        }
    }

    private async sendToErrorTracking(error: Error, context?: Record<string, any>): Promise<void> {
        // Integrate with Sentry or similar
        // Example:
        // if (typeof window !== 'undefined' && window.Sentry) {
        //   window.Sentry.captureException(error, { extra: context });
        // }
    }
}

export const logger = new Logger();
