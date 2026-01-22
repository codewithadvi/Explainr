const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export interface TopicRelationship {
    sourceId: string;
    targetId: string;
    type: 'prerequisite' | 'related' | 'partOf' | 'enables';
    strength: number; // 0-1
    reason: string;
}

export interface TopicAnalysis {
    topic: string;
    domain: string;
    tags: string[];
    difficulty: 1 | 2 | 3 | 4 | 5;
}

async function callGeminiForJSON(prompt: string): Promise<any> {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('Gemini API key not configured');
    }

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }],
                }],
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 2048,
                },
            }),
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.statusText}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        throw new Error('No JSON found in response');
    } catch (error) {
        console.error('Gemini API error:', error);
        throw error;
    }
}

/**
 * Analyze a topic using AI to extract domain, tags, and difficulty
 */
export async function analyzeTopic(topic: string): Promise<TopicAnalysis> {
    try {
        const prompt = `Analyze this learning topic: "${topic}"

Return a JSON object with:
{
  "domain": "primary field (e.g., machine-learning, politics, mathematics, computer-science, etc.)",
  "tags": ["3-5 relevant tags"],
  "difficulty": 1-5 (1=beginner, 5=expert)
}

Be concise and accurate. Return ONLY the JSON, no explanation.`;

        const analysis = await callGeminiForJSON(prompt);
        return {
            topic,
            domain: analysis.domain || 'general',
            tags: analysis.tags || [],
            difficulty: analysis.difficulty || 3
        };
    } catch (error) {
        console.error('Error analyzing topic:', error);
        // Fallback
        return {
            topic,
            domain: 'general',
            tags: [],
            difficulty: 3
        };
    }
}

/**
 * Find semantic relationships between topics using AI
 */
export async function findTopicRelationships(
    topics: string[]
): Promise<TopicRelationship[]> {
    if (topics.length < 2) return [];

    try {
        const prompt = `Analyze these learning topics and identify semantic relationships:

Topics: ${topics.map((t, i) => `${i}. ${t}`).join('\n')}

For each pair of related topics, determine:
1. Relationship type: "prerequisite" (A must be learned before B), "related" (similar domain), "partOf" (hierarchical), or "enables" (A helps understand B)
2. Strength: 0.0-1.0 (how strong the relationship is)
3. Reason: Brief explanation

Return a JSON array of relationships:
[
  {
    "source": "topic name",
    "target": "topic name", 
    "type": "prerequisite|related|partOf|enables",
    "strength": 0.8,
    "reason": "brief explanation"
  }
]

Rules:
- Only include meaningful relationships (strength > 0.3)
- "Neural Networks" relates to "Backpropagation", NOT to "Trump Venezuela Policy"
- Focus on conceptual connections, not just keywords
- Maximum 3 relationships per topic

Return ONLY the JSON array, no explanation.`;

        const relationships = await callGeminiForJSON(prompt);

        // Convert topic names to IDs (we'll need to map these)
        return relationships.map((rel: any) => ({
            sourceId: rel.source,
            targetId: rel.target,
            type: rel.type,
            strength: rel.strength,
            reason: rel.reason
        }));
    } catch (error) {
        console.error('Error finding relationships:', error);
        return [];
    }
}

/**
 * Build a complete knowledge graph with AI-powered relationships
 */
export async function buildSemanticKnowledgeGraph(
    nodes: Array<{ id: string; topic: string }>
): Promise<{
    analyses: Map<string, TopicAnalysis>;
    relationships: TopicRelationship[];
}> {
    const analyses = new Map<string, TopicAnalysis>();

    // Analyze each topic
    for (const node of nodes) {
        const analysis = await analyzeTopic(node.topic);
        analyses.set(node.id, analysis);
    }

    // Find relationships between all topics
    const topics = nodes.map(n => n.topic);
    const rawRelationships = await findTopicRelationships(topics);

    // Map topic names back to IDs
    const relationships: TopicRelationship[] = rawRelationships.map(rel => {
        const sourceNode = nodes.find(n => n.topic === rel.sourceId);
        const targetNode = nodes.find(n => n.topic === rel.targetId);

        if (sourceNode && targetNode) {
            return {
                ...rel,
                sourceId: sourceNode.id,
                targetId: targetNode.id
            };
        }
        return null;
    }).filter(Boolean) as TopicRelationship[];

    return { analyses, relationships };
}
