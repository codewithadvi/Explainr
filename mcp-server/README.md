# Feynman Mirror MCP Server

This MCP (Model Context Protocol) server exposes your Feynman Mirror learning data to AI assistants like ChatGPT, Claude, and Gemini.

## Quick Start

```bash
# Build the server
cd mcp-server
npm install
npm run build

# Or from root
npm run mcp-server:build
```

## Features

### Resources (Read-only data)
- **Knowledge Graph** (`knowledge://graph`) - Your full knowledge graph with topics, connections, and relationships
- **Sessions List** (`sessions://list`) - All learning sessions with scores and concepts
- **User Stats** (`stats://user`) - XP, level, streak, and commitment grid

### Tools (Actions)
| Tool | Description |
|------|-------------|
| `get_knowledge_summary` | Overview of your knowledge state |
| `search_sessions` | Search sessions by topic keyword |
| `get_session_details` | Get full conversation from a session |
| `get_topic_connections` | Find how a topic connects to others |
| `get_learning_progress` | Your XP, level, streak stats |
| `list_topics` | All topics grouped by domain |

## Connecting to AI Clients

### Claude Desktop
Add to `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "feynman-mirror": {
      "command": "node",
      "args": ["d:/Feynman Mirror/mcp-server/dist/index.js"]
    }
  }
}
```

### Other Clients
Use the `mcp-server.json` in the project root as a template.

## Data Location

The server reads data from `mcp-server/data/`:
- `sessions.json` - Learning sessions
- `knowledge-graph.json` - Knowledge nodes
- `relationships.json` - Topic relationships  
- `stats.json` - User statistics

To sync with your browser data, export from the web app and place files in this directory.
