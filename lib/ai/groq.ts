import type { AIResponse } from "@/types";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function callGroqAPI(
    systemPrompt: string,
    userMessage: string,
    apiKey: string
): Promise<AIResponse> {
    try {
        const response = await fetch(GROQ_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userMessage },
                ],
                temperature: 0.8,
                max_tokens: 500,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || "Groq API error");
        }

        const data = await response.json();
        const aiMessage = data.choices[0]?.message?.content || "";

        return parseAIResponse(aiMessage);
    } catch (error) {
        console.error("Groq API error:", error);
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
        conceptsIdentified: [], // Could be enhanced with NLP
    };
}
