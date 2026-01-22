# Product Requirement Document (PRD)
**Project Name:** Explainr
**Classification:** Active Recall / Educational Technology
**Version:** 2.1 (Production Grade)

## 1. Executive Summary
Explainr is a voice-first knowledge verification engine. It gamifies the **Feynman Technique** by using an AI that adaptively "plays dumb" or "plays expert" to test the user's understanding. The core differentiator is the **Liquid Interface** (a fluid avatar that visually represents the AI's confusion) and the **Checklist Protocol** (hidden validation of sub-concepts).

## 2. User Personas (The "Listeners")
The user must select a specific target audience. The AI logic changes entirely based on this selection.

### 2.1 The Toddler (Simplicity Mode)
* **Prompt Logic:** "You are a 5-year-old. You have a short attention span."
* **Constraint:** Zero Jargon. If the user says "Database," the AI asks "Is that a box?"
* **Fail State:** Use of Tier-3 vocabulary (e.g., "Latency," "Optimization").
* **Win State:** Successful use of a physical metaphor (e.g., "The database is like a toy box").

### 2.2 The Sassy Frat Bro (Engagement Mode)
* **Prompt Logic:** "You are a Gen-Z college student. You only care about status and what's cool."
* **Constraint:** Must bridge the topic to social value or utility.
* **Fail State:** Boring, dry recitation of facts.
* **Win State:** High-energy analogies, slang usage (appropriate), convincing the AI why this "matters."

### 2.3 The Non-Technical Client (ROI Mode)
* **Prompt Logic:** "You are a busy CEO. You care about Money, Time, and Risk. You do not care about code."
* **Constraint:** Outcome-focused explanation.
* **Fail State:** Explaining the *process* (how it works).
* **Win State:** Explaining the *result* (value proposition).

### 2.4 The Tenured Professor (Precision Mode)
* **Prompt Logic:** "You are a hostile academic reviewer. You are looking for logical gaps."
* **Constraint:** Absolute technical accuracy.
* **Fail State:** Hand-waving ("it just works"), circular logic, or factual errors.
* **Win State:** A comprehensive, citation-worthy definition covering edge cases.

## 3. Core Mechanics

### 3.1 The "Checklist Protocol" (Backend)
* **Trigger:** User selects topic (e.g., "React Hooks").
* **Generation:** AI silently generates a JSON list of 5-7 key concepts (e.g., `useState`, `useEffect`, `Lifecycle Methods`, `Rules of Hooks`, `Dependency Array`).
* **Validation:** As the user speaks, the AI marks these as `TRUE` or `FALSE`.
* **Probing:** If the user misses "Dependency Array," the next question is specifically: "But when does this code actually run?"

### 3.2 The Liquid Avatar (Frontend)
* **Visual Metaphor:** Mercury / Liquid Metal.
* **State Mapping:**
    * **Confusion (0-20%):** Smooth, round sphere. Green glow.
    * **Confusion (21-60%):** Slight ripples. Yellow glow.
    * **Confusion (61-100%):** Spiky, jagged edges, rapid rotation. Red/Orange glow.

## 4. Gamification Systems

### 4.1 The Commitment Grid (Consistency)
* **Visual:** A 52x7 heat map (GitHub style).
* **Logic:**
    * 1 Session/Day = Light Green square.
    * 3+ Sessions/Day = Neon Green square.
    * Streak Multiplier: XP gain increases with consecutive days.

### 4.2 The Knowledge Galaxy (Mastery)
* **Visual:** Force-directed graph (`react-force-graph-2d`).
* **Logic:**
    * **Nodes:** Topics. Size = Mastery Level.
    * **Edges:** Semantic links (AI generates these: "React" is linked to "JavaScript").
    * **Clusters:** Topics naturally group together (e.g., "Backend" cluster, "Biology" cluster).