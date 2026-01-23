<div align="center">

# MCP Server Tools Reference

### Complete API Documentation

[![Tools](https://img.shields.io/badge/Interactive_Tools-17-00ffc8?style=for-the-badge)](#interactive-tools-17)
[![Resources](https://img.shields.io/badge/Read_Only_Resources-3-c800ff?style=for-the-badge)](#resources-3)
[![Coverage](https://img.shields.io/badge/Website_Parity-100%25-22c55e?style=for-the-badge)](#feature-coverage)

---

</div>

## Resources (3)

Resources provide read-only access to Explainr data. These are automatically refreshed and return current state.

<div align="center">

| Resource URI | Returns | Description |
|-------------|---------|-------------|
| `knowledge://graph` | JSON | Full knowledge graph including all nodes, edges, and mastery levels |
| `sessions://list` | JSON | List of all learning sessions with metadata and summaries |
| `stats://user` | JSON | User statistics: XP, level, streak count, and commitment grid data |

</div>

---

## Interactive Tools (17)

### Read-Only Tools

These tools query data without making modifications.

---

#### get_knowledge_summary

Returns an overview of your knowledge state with topics grouped by domain and mastery level.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *None* | - | - | No parameters required |

**Returns:** Object containing:
- Total topic count
- Topics grouped by domain
- Strongest topics (top 5 by mastery)
- Weakest topics (bottom 5 by mastery)
- Average mastery percentage

---

#### search_sessions

Full-text search across all session content including topics, conversations, and summaries.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Search term or phrase |
| `limit` | number | No | Maximum results (default: 10) |

**Returns:** Array of matching sessions with relevance scores and highlighted matches.

---

#### get_session_details

Retrieves the complete conversation history from a specific session.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sessionId` | string | Yes | UUID of the session |

**Returns:** Full session object including:
- Topic and persona
- All conversation rounds
- Confusion levels per round
- Final mastery score
- Timestamps

---

#### get_topic_connections

Shows how a specific topic relates to other topics in your knowledge graph.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `topic` | string | Yes | Topic name to analyze |

**Returns:** Object containing:
- Direct connections (topics linked by relationships)
- Connection types (prerequisite, related, builds-upon)
- Shared domains

---

#### get_learning_progress

Returns current gamification statistics.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| *None* | - | - | No parameters required |

**Returns:** Object containing:
- Current XP and level
- XP needed for next level
- Current streak count
- Longest streak
- Total sessions completed
- Last session date

---

#### list_topics

Lists all topics in your knowledge graph, grouped by domain.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `domain` | string | No | Filter by specific domain |
| `sortBy` | string | No | Sort by: mastery, name, date (default: name) |

**Returns:** Array of topics with mastery levels, domains, and last practice dates.

---

### Session Management Tools

These tools create, modify, and delete learning sessions.

---

#### create_session

Starts a new learning session with the specified configuration.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `topic` | string | Yes | Subject of the learning session |
| `persona` | string | Yes | AI persona: toddler, peer, fratBro, ceo, professor |
| `mode` | string | No | Input mode: voice, text (default: text) |

**Returns:** Session object with generated UUID and initial state.

---

#### add_session_round

Adds a conversation round to an active session.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sessionId` | string | Yes | UUID of the active session |
| `userExplanation` | string | Yes | User's explanation text |
| `aiResponse` | string | Yes | AI's follow-up question or feedback |
| `confusionLevel` | number | Yes | AI confusion: 0 (clear) to 100 (confused) |

**Returns:** Updated session with new round appended and recalculated metrics.

---

#### end_session

Completes a session and calculates the final mastery score.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sessionId` | string | Yes | UUID of the session to end |
| `summary` | string | No | Optional summary of what was learned |

**Returns:** Final session object with:
- Calculated mastery score
- XP earned
- Knowledge graph updates applied

---

#### delete_session

Removes a session from history permanently.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sessionId` | string | Yes | UUID of the session to delete |

**Returns:** Confirmation with deleted session details.

---

#### rename_session

Updates the topic name of an existing session.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sessionId` | string | Yes | UUID of the session |
| `newTopic` | string | Yes | New topic name |

**Returns:** Updated session object.

---

### Knowledge Graph Tools

These tools directly modify the knowledge graph.

---

#### add_topic

Adds a new topic to the knowledge graph.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `topic` | string | Yes | Name of the topic |
| `domain` | string | Yes | Category: programming, science, business, etc. |
| `mastery` | number | No | Initial mastery: 0-100 (default: 0) |
| `connections` | array | No | Array of related topic names |

**Returns:** Created topic node with generated ID.

---

#### update_topic_mastery

Modifies the mastery level of an existing topic.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `topic` | string | Yes | Topic name to update |
| `mastery` | number | Yes | New mastery level: 0-100 |

**Returns:** Updated topic with new mastery and recalculated XP.

---

#### delete_topic

Removes a topic from the knowledge graph.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `topic` | string | Yes | Topic name to delete |

**Returns:** Confirmation with details of removed topic and affected connections.

---

### Data Management Tools

These tools handle bulk data operations.

---

#### export_data

Exports all Explainr data as a JSON backup.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `format` | string | No | Export format: json, markdown (default: json) |

**Returns:** Complete data dump including:
- All sessions with conversations
- Full knowledge graph
- User statistics and settings

---

#### import_data

Imports data from a JSON backup.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | object | Yes | JSON data object from export_data |
| `merge` | boolean | No | Merge with existing data (default: false = replace) |

**Returns:** Import summary with counts of imported items.

---

#### clear_all_data

Deletes all Explainr data. Requires confirmation.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `confirm` | boolean | Yes | Must be true to proceed |

**Returns:** Confirmation of deletion.

---

## Feature Coverage

The MCP server provides complete parity with the Explainr website functionality:

<div align="center">

| Feature | Web App | MCP Server |
|---------|---------|------------|
| Create learning sessions | Yes | Yes |
| Voice/text input | Yes | Text only |
| Multiple AI personas | Yes | Yes |
| Real-time feedback | Yes | Via rounds |
| Knowledge graph visualization | Yes | Data only |
| Add/update/delete topics | Yes | Yes |
| Progress tracking (XP, levels) | Yes | Yes |
| Streak tracking | Yes | Yes |
| Commitment grid data | Yes | Yes |
| Session search | Yes | Yes |
| Data export/import | Yes | Yes |

</div>

---

<div align="center">

[Setup Guide](../MCP-SETUP.md) | [Back to README](../README.md)

</div>
