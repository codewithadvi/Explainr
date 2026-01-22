import type { Metadata, Viewport } from "next";
import "./globals.css";
import ErrorBoundaryWrapper from "@/components/ErrorBoundaryWrapper";

export const metadata: Metadata = {
    title: "Explainr - Master Concepts Through Voice",
    description: "Voice-first active recall using the Feynman Technique with AI personas",
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1.0,
    maximumScale: 5.0,
    userScalable: true,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <ErrorBoundaryWrapper>
                    {children}
                    {/* SVG Filters for Gooey Effect */}
                    <svg className="filters">
                        <defs>
                            <filter id="gooey-filter">
                                <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                                <feColorMatrix
                                    in="blur"
                                    mode="matrix"
                                    values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
                                    result="gooey"
                                />
                                <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
                            </filter>
                        </defs>
                    </svg>
                </ErrorBoundaryWrapper>
            </body>
        </html>
    );
}
