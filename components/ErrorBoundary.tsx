"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import Link from "next/link";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center p-6 bg-void">
                    <div className="glass-panel p-8 max-w-md w-full text-center">
                        <h1 className="text-2xl font-display font-bold mb-4 text-error">
                            Something went wrong
                        </h1>
                        <p className="text-text/70 mb-6">
                            {this.state.error?.message || "An unexpected error occurred"}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-2 rounded-lg bg-accent hover:bg-accent/80 font-display transition-colors"
                            >
                                Reload Page
                            </button>
                            <Link href="/">
                                <button className="px-6 py-2 rounded-lg bg-liquid/10 hover:bg-liquid/20 font-display transition-colors">
                                    Go Home
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
