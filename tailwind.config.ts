import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            gridTemplateColumns: {
                '52': 'repeat(52, minmax(0, 1fr))',
            },
            colors: {
                void: "#050505",
                liquid: "#E2E8F0",
                success: "#00FF94",
                error: "#FF2A6D",
                accent: "#7B2CBF",
                text: "#F8F9FA",
                // Galaxy Theme Colors
                space: {
                    950: "#020010", // Deepest void
                    900: "#080020", // Deep dark purple
                    800: "#100035", // Dark nebula
                },
                star: {
                    100: "#FFFFFF",
                    200: "#E0F0FF",
                    300: "#B0D0FF",
                },
            },
            fontFamily: {
                display: ['"Space Grotesk"', '"Geist"', "system-ui", "sans-serif"],
                body: ["Inter", '"Geist"', "system-ui", "sans-serif"],
                mono: ['"JetBrains Mono"', "monospace"],
            },
            backdropBlur: {
                glass: "16px",
            },
            animation: {
                "blob-pulse": "blob-pulse 3s ease-in-out infinite",
                "float": "float 6s ease-in-out infinite",
                "glow": "glow 2s ease-in-out infinite",
                "particle-burst": "particle-burst 0.8s ease-out forwards",
                "spin-slow": "spin 8s linear infinite",
                "gradient-xy": "gradient-xy 15s ease infinite",
                "gradient-slow": "gradient-xy 20s ease infinite",
            },
            keyframes: {
                "blob-pulse": {
                    "0%, 100%": { transform: "scale(1)" },
                    "50%": { transform: "scale(1.05)" },
                },
                "float": {
                    "0%, 100%": { transform: "translateY(0px)" },
                    "50%": { transform: "translateY(-20px)" },
                },
                "glow": {
                    "0%, 100%": { opacity: "1" },
                    "50%": { opacity: "0.5" },
                },
                "particle-burst": {
                    "0%": { transform: "scale(0)", opacity: "1" },
                    "100%": { transform: "scale(2)", opacity: "0" },
                },
                "gradient-xy": {
                    "0%, 100%": {
                        "background-size": "400% 400%",
                        "background-position": "0% 0%"
                    },
                    "50%": {
                        "background-size": "400% 400%",
                        "background-position": "100% 100%"
                    },
                },
            },
        },
    },
    plugins: [],
};

export default config;
