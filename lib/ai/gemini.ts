import type { AIResponse } from "@/types";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export async function callGeminiAPI(
    systemPrompt: string,
    userMessage: string,
    apiKey: string
): Promise<AIResponse> {
    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: `${systemPrompt}\n\nUser: ${userMessage}`,
                            },
                        ],
                    },
                ],
                generationConfig: {
                    temperature: 0.8,
                    maxOutputTokens: 500,
                },
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || "Gemini API error");
        }

        const data = await response.json();
        const aiMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

        return parseAIResponse(aiMessage);
    } catch (error) {
        console.error("Gemini API error:", error);
        throw error;
    }
}

function parseAIResponse(message: string): AIResponse {
    // Expected format:
    // CONFUSION: 45
    // JARGON: 30
    // TAG: PROBE
    // MESSAGE: Your actual response here

    const confusionMatch = message.match(/CONFUSION:\s*(\d+)/i);
    const jargonMatch = message.match(/JARGON:\s*(\d+)/i);
    const tagMatch = message.match(/TAG:\s*(CORRECTION|PROBE|VERIFIED)/i);
    const messageMatch = message.match(/MESSAGE:\s*([\s\S]+)/i);

    const confusionLevel = confusionMatch ? parseInt(confusionMatch[1], 10) : 50;
    const jargonLevel = jargonMatch ? parseInt(jargonMatch[1], 10) : 0;
    const validationTag = (tagMatch?.[1]?.toUpperCase() as "CORRECTION" | "PROBE" | "VERIFIED") || "PROBE";
    const cleanMessage = messageMatch ? messageMatch[1].trim() : message;

    return {
        message: cleanMessage,
        confusionLevel: Math.min(Math.max(confusionLevel, 0), 100),
        jargonLevel: Math.min(Math.max(jargonLevel, 0), 100),
        validationTag,
        conceptsIdentified: [],
    };
}
