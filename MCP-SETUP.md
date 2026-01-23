<div align="center">

# MCP Server Setup Guide

### Connect Explainr to Any AI Assistant

[![MCP](https://img.shields.io/badge/Model_Context_Protocol-Enabled-00c8ff?style=for-the-badge)](https://modelcontextprotocol.io)
[![Tools](https://img.shields.io/badge/Tools-17-00ffc8?style=for-the-badge)](./mcp-server/TOOLS.md)
[![Resources](https://img.shields.io/badge/Resources-3-c800ff?style=for-the-badge)](./mcp-server/TOOLS.md)

---

**Your learning data. Every AI tool. One protocol.**

</div>

---

## What Is MCP?

The **Model Context Protocol (MCP)** is an open standard that allows AI assistants to connect directly to external data sources and tools. With the Explainr MCP server, your knowledge graph, learning sessions, and progress statistics become accessible from any MCP-compatible AI client.

<div align="center">

| Benefit | Description |
|---------|-------------|
| **Portability** | Access your learning data from Claude, ChatGPT, Cline, or any MCP client |
| **Continuity** | Continue learning conversations across different AI tools |
| **Integration** | Query your knowledge graph while coding, researching, or studying |
| **Full CRUD** | Create, read, update, and delete sessions and topics via natural language |

</div>

---

## Prerequisites

Before setting up the MCP server, ensure you have:

- Node.js version 18 or higher installed
- The MCP server built (instructions below)
- An MCP-compatible AI client

### Building the MCP Server

```bash
# From the Explainr root directory
npm run mcp-server:build

# This installs dependencies and compiles TypeScript to dist/index.js
```

---

## Client Configuration

### VS Code with Cline Extension

**Step 1:** Install the [Cline extension](https://marketplace.visualstudio.com/items?itemName=saoudrizwan.claude-dev) from the VS Code marketplace.

**Step 2:** Open Cline settings by clicking the gear icon in the Cline panel.

**Step 3:** Navigate to the MCP Servers section and add:

```json
{
  "mcpServers": {
    "explainr": {
      "command": "node",
      "args": ["C:\\Users\\YourName\\path\\to\\explainr\\mcp-server\\dist\\index.js"]
    }
  }
}
```

**Step 4:** Restart VS Code.

**Step 5:** Test with: *"Show my Explainr knowledge graph"*

---

### Claude Desktop

**Configuration file locations:**

| Platform | Path |
|----------|------|
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |
| Linux | `~/.config/Claude/claude_desktop_config.json` |

**Add the Explainr server:**

```json
{
  "mcpServers": {
    "explainr": {
      "command": "node",
      "args": ["/absolute/path/to/explainr/mcp-server/dist/index.js"]
    }
  }
}
```

**Windows users:** Remember to escape backslashes:

```json
{
  "mcpServers": {
    "explainr": {
      "command": "node",
      "args": ["C:\\Users\\YourName\\Explainr\\mcp-server\\dist\\index.js"]
    }
  }
}
```

**Restart Claude Desktop** after saving the configuration.

---

### ChatGPT Desktop

**Configuration file locations:**

| Platform | Path |
|----------|------|
| Windows | `%APPDATA%\OpenAI\ChatGPT\mcp_config.json` |
| macOS | `~/Library/Application Support/OpenAI/ChatGPT/mcp_config.json` |

Use the same JSON format as Claude Desktop. **Restart ChatGPT Desktop** after saving.

---

## Available Tools and Resources

<div align="center">

### Resources (Read-Only Data)

| Resource URI | Description |
|-------------|-------------|
| `knowledge://graph` | Full knowledge graph with all nodes, relationships, and mastery levels |
| `sessions://list` | Complete list of all learning sessions with metadata |
| `stats://user` | User statistics including XP, level, streak, and commitment grid |

</div>

<div align="center">

### Tools (17 Total)

| Category | Tool | Description |
|----------|------|-------------|
| **Read-Only** | `get_knowledge_summary` | Overview of knowledge state with strongest and weakest topics |
| | `search_sessions` | Full-text search across all session content |
| | `get_session_details` | Complete conversation history from a specific session |
| | `get_topic_connections` | Semantic relationships for any topic |
| | `get_learning_progress` | XP, level, and streak statistics |
| | `list_topics` | All topics grouped by domain |
| **Session Mgmt** | `create_session` | Start new learning session with topic, persona, and mode |
| | `add_session_round` | Add conversation round to active session |
| | `end_session` | Complete session and calculate final mastery score |
| | `delete_session` | Remove a session from history |
| | `rename_session` | Update session topic name |
| **Knowledge** | `add_topic` | Add new topic to knowledge graph with mastery level |
| | `update_topic_mastery` | Modify mastery percentage for existing topic |
| | `delete_topic` | Remove topic from knowledge graph |
| **Data Mgmt** | `export_data` | Export all data as JSON for backup |
| | `import_data` | Import data from JSON backup |
| | `clear_all_data` | Delete all data (requires confirmation) |

</div>

**Full tool signatures and parameters:** [mcp-server/TOOLS.md](mcp-server/TOOLS.md)

---

## Example Commands

Once connected, interact with Explainr through natural language:

### Session Management

```
"Create a new learning session on Docker Containers with the professor persona"
"Show me the details of my last session"
"Delete my oldest session"
"Rename my Python session to Python Fundamentals"
```

### Knowledge Graph

```
"Add Machine Learning to my knowledge graph at 40% mastery in the AI domain"
"Update my React mastery to 85%"
"Show all connections to my TypeScript topic"
"What topics am I weakest in?"
```

### Progress Tracking

```
"What is my current XP and level?"
"Show my learning streak"
"How many sessions have I completed this week?"
```

### Data Management

```
"Export all my Explainr data"
"Search my sessions for anything about neural networks"
"What should I review before my exam?"
```

---

## Troubleshooting

### Server Not Found

| Symptom | Solution |
|---------|----------|
| "Cannot find module" error | Verify the absolute path to `dist/index.js` is correct |
| Server not appearing in client | Ensure you ran `npm run mcp-server:build` first |
| Node not found | Check that Node.js 18+ is installed and in PATH |

### Connection Issues

| Symptom | Solution |
|---------|----------|
| Connection refused | Use absolute paths, not relative |
| Build fails | Run `npm install` in the mcp-server directory first |
| Permission denied | Check file permissions on the dist folder |

### Empty or Missing Data

| Symptom | Solution |
|---------|----------|
| No sessions found | Use the web app first to create some learning data |
| Resources return empty | Verify JSON files exist in `mcp-server/data/` |
| Invalid JSON errors | Check that data files are not corrupted |

### Server Crashes

| Symptom | Solution |
|---------|----------|
| Immediate crash on start | Ensure Node.js 18+ is installed |
| Crash during operations | Check terminal for detailed error logs |
| Memory errors | Reduce concurrent operations |

---

## Advanced Configuration

### Custom Data Directory

Modify `mcp-server/src/storage.ts` to change where data is stored:

```typescript
const DATA_DIR = path.join(__dirname, '..', 'custom-data-path');
```

### Multiple User Instances

Run separate Explainr instances for different contexts:

```json
{
  "mcpServers": {
    "explainr-personal": {
      "command": "node",
      "args": ["/path/to/explainr-personal/mcp-server/dist/index.js"]
    },
    "explainr-work": {
      "command": "node",
      "args": ["/path/to/explainr-work/mcp-server/dist/index.js"]
    }
  }
}
```

---

## What You Can Do

With the MCP server running, you gain the ability to:

<div align="center">

| Capability | Example |
|------------|---------|
| **Learn while coding** | Create sessions in VS Code without leaving your editor |
| **Review before exams** | Query weak topics across all your sessions |
| **Track progress** | Check streaks and XP from any AI assistant |
| **Backup learning** | Export full history with a single command |
| **Cross-reference** | Find connections between topics across different sessions |
| **Build knowledge** | Add topics manually when reading or watching lectures |

</div>

---

<div align="center">

**Questions or issues?** [Open an issue](https://github.com/codewithadvi/Explainr/issues)

---

[Back to README](README.md) | [Full Tool Reference](mcp-server/TOOLS.md)

</div>
