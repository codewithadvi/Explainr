interface ScoringConfig {
    baseXP: number;
    conceptBonus: number;
    streakMultiplier: number;
    xpPerLevel: number;
}

const DEFAULT_CONFIG: ScoringConfig = {
    baseXP: 100,
    conceptBonus: 20,
    streakMultiplier: 1.5,
    xpPerLevel: 500,
};

export function calculateSessionScore(
    conceptsCovered: number,
    totalConcepts: number,
    averageConfusion: number
): number {
    // Coverage score (0-50 points)
    const coverageScore = (conceptsCovered / totalConcepts) * 50;

    // Clarity score (0-50 points) - lower confusion = higher score
    const clarityScore = (1 - averageConfusion / 100) * 50;

    return Math.round(coverageScore + clarityScore);
}

export function calculateXP(
    score: number,
    conceptsCovered: number,
    currentStreak: number,
    config: Partial<ScoringConfig> = {}
): number {
    // Don't award XP if score is 0 or no concepts covered
    if (score === 0 || conceptsCovered === 0) {
        return 0;
    }

    const cfg = { ...DEFAULT_CONFIG, ...config };

    // Base XP from score
    let xp = (score / 100) * cfg.baseXP;

    // Bonus for concept coverage
    xp += conceptsCovered * cfg.conceptBonus;

    // Streak multiplier
    if (currentStreak > 1) {
        const streakBonus = Math.min(currentStreak / 7, 2); // Max 2x at 14 day streak
        xp *= 1 + streakBonus * 0.5;
    }

    return Math.round(xp);
}

export function calculateLevel(totalXP: number, config: Partial<ScoringConfig> = {}): number {
    const cfg = { ...DEFAULT_CONFIG, ...config };
    return Math.floor(totalXP / cfg.xpPerLevel) + 1;
}

export function getXPForNextLevel(currentLevel: number, config: Partial<ScoringConfig> = {}): number {
    const cfg = { ...DEFAULT_CONFIG, ...config };
    return currentLevel * cfg.xpPerLevel;
}

export function getXPProgress(totalXP: number, config: Partial<ScoringConfig> = {}): {
    currentLevel: number;
    currentLevelXP: number;
    nextLevelXP: number;
    progress: number; // 0-1
} {
    const cfg = { ...DEFAULT_CONFIG, ...config };
    const currentLevel = calculateLevel(totalXP, cfg);
    const xpForCurrentLevel = (currentLevel - 1) * cfg.xpPerLevel;
    const xpForNextLevel = currentLevel * cfg.xpPerLevel;
    const currentLevelXP = totalXP - xpForCurrentLevel;
    const progress = currentLevelXP / cfg.xpPerLevel;

    return {
        currentLevel,
        currentLevelXP,
        nextLevelXP: xpForNextLevel,
        progress,
    };
}
