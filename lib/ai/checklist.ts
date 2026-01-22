import type { ChecklistItem } from "@/types";

export async function generateChecklist(topic: string): Promise<ChecklistItem[]> {
    const prompt = `You are an expert educator. Generate a checklist of 5-7 key concepts that someone should understand to truly grasp "${topic}".

For each concept, determine its importance level (critical, important, or nice-to-have).

Respond ONLY with a JSON array in this exact format:
[
  {"concept": "Concept name", "importance": "critical"},
  {"concept": "Another concept", "importance": "important"}
]

Do not include any other text.`;

    try {
        const response = await fetch("/api/generate-checklist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ topic, prompt }),
        });

        if (!response.ok) {
            throw new Error("Failed to generate checklist");
        }

        const data = await response.json();
        return data.checklist.map((item: any) => ({
            ...item,
            covered: false,
        }));
    } catch (error) {
        console.error("Checklist generation error:", error);
        // Fallback to basic checklist
        return [
            { concept: "Basic definition", covered: false, importance: "critical" },
            { concept: "Key components", covered: false, importance: "critical" },
            { concept: "How it works", covered: false, importance: "important" },
            { concept: "Common use cases", covered: false, importance: "important" },
            { concept: "Limitations", covered: false, importance: "nice-to-have" },
        ];
    }
}

export function updateChecklistCoverage(
    checklist: ChecklistItem[],
    userInput: string,
    aiResponse: string
): ChecklistItem[] {
    return checklist.map((item) => {
        // Simple keyword matching - could be enhanced with AI
        const combined = (userInput + " " + aiResponse).toLowerCase();
        const conceptKeywords = item.concept.toLowerCase().split(" ");

        const mentioned = conceptKeywords.some((keyword) =>
            combined.includes(keyword)
        );

        return {
            ...item,
            covered: item.covered || mentioned,
        };
    });
}

export function getNextProbe(checklist: ChecklistItem[]): string | null {
    const uncovered = checklist.filter((item) => !item.covered);

    if (uncovered.length === 0) {
        return null;
    }

    // Prioritize critical concepts
    const critical = uncovered.find((item) => item.importance === "critical");
    if (critical) {
        return critical.concept;
    }

    // Then important ones
    const important = uncovered.find((item) => item.importance === "important");
    if (important) {
        return important.concept;
    }

    // Finally nice-to-have
    return uncovered[0].concept;
}

export function getChecklistProgress(checklist: ChecklistItem[]): {
    covered: number;
    total: number;
    percentage: number;
} {
    const covered = checklist.filter((item) => item.covered).length;
    const total = checklist.length;

    return {
        covered,
        total,
        percentage: Math.round((covered / total) * 100),
    };
}
