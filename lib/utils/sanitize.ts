const BLACKLIST_PHRASES = [
    "ignore previous",
    "ignore all previous",
    "disregard",
    "system prompt",
    "you are now",
    "new instructions",
    "forget everything",
    "act as",
    "pretend you are",
    "new role",
];

export function sanitizeUserInput(input: string): string {
    if (!input || typeof input !== "string") {
        return "";
    }

    // Remove potential prompt injection attempts
    let sanitized = input;
    const lowerInput = input.toLowerCase();

    BLACKLIST_PHRASES.forEach((phrase) => {
        const regex = new RegExp(phrase, "gi");
        if (lowerInput.includes(phrase)) {
            sanitized = sanitized.replace(regex, "");
        }
    });

    // Limit length to prevent abuse
    sanitized = sanitized.slice(0, 2000);

    // Remove excessive whitespace
    sanitized = sanitized.replace(/\s+/g, " ").trim();

    return sanitized;
}

export function sanitizeTopicName(topic: string): string {
    if (!topic || typeof topic !== "string") {
        return "";
    }

    // Remove special characters that could cause issues
    let sanitized = topic.replace(/[<>\"'`]/g, "");

    // Limit length
    sanitized = sanitized.slice(0, 100);

    return sanitized.trim();
}

export function validateInput(input: string, maxLength: number = 2000): boolean {
    if (!input || typeof input !== "string") {
        return false;
    }

    if (input.length > maxLength) {
        return false;
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+=/i, // Event handlers like onclick=
        /eval\(/i,
    ];

    return !suspiciousPatterns.some((pattern) => pattern.test(input));
}
