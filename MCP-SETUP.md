# MCP Server Setup Guide

## What is MCP?

The **Model Context Protocol (MCP)** enables AI assistants like ChatGPT, Claude, and Cline to interact with your Explainr learning data directly through a standardized interface.

## Quick Setup

### **VS Code (Cline Extension)**

1. Install **Cline** extension from VS Code marketplace
2. Open Cline settings (gear icon in Cline panel)
3. Navigate to MCP Servers section
4. Add server configuration:

```json
{
  "mcpServers": {
    "explainr": {
      "command": "node",
      "args": ["absolute/path/to/explainr/mcp-server/dist/index.js"]
    }
  }
}
```

5. Restart VS Code
6. Test with: `"Show my Explainr knowledge graph"`

### **Claude Desktop**

**Configuration File Locations:**
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

**Add Server:**

```json
{
  "mcpServers": {
    "explainr": {
      "command": "node",
      "args": ["C:\\absolute\\path\\to\\explainr\\mcp-server\\dist\\index.js"]
    }
  }
}
```

**Restart Claude Desktop** and the server will be available.

### **ChatGPT Desktop**

**Configuration File:**
- **Windows**: `%APPDATA%\OpenAI\ChatGPT\mcp_config.json`
- **macOS**: `~/Library/Application Support/OpenAI/ChatGPT/mcp_config.json`

**Add Server** (same format as Claude)

**Restart ChatGPT Desktop**

## Example Commands

Once connected, interact with Explainr through natural language:

```
"Create a new learning session on Docker Containers with professor persona"
"Add TypeScript to my knowledge graph with 75% mastery in the programming domain"
"Show my learning progress, XP, and current streak"
"Search my sessions for anything related to machine learning"
"Export all my Explainr data as JSON"
"What topics am I strongest in?"
```

## Troubleshooting

### Server Not Found
- Verify the absolute path is correct
- Ensure you ran `npm run build` in the `mcp-server` directory
- Check that Node.js is installed and in PATH

### Connection Failed
- Try using absolute paths instead of relative
- Confirm the server builds without errors
- Check file permissions on the dist folder

### Empty Data
- Use the web app first to create learning sessions
- Data is stored in `mcp-server/data/` directory
- Verify JSON files exist and are valid

### Server Crashes
- Check Node.js version (requires v18+)
- Review error logs in terminal
- Ensure all dependencies are installed

## Advanced Configuration

### Custom Data Directory

Modify `mcp-server/src/storage.ts` to change data location:

```typescript
const DATA_DIR = path.join(__dirname, '..', 'custom-data-path');
```

### Multiple Instances

Run separate instances for different users:

```json
{
  "mcpServers": {
    "explainr-personal": {
      "command": "node",
      "args": ["path/to/instance1/mcp-server/dist/index.js"]
    },
    "explainr-work": {
      "command": "node",
      "args": ["path/to/instance2/mcp-server/dist/index.js"]
    }
  }
}
```

## Full Tool Documentation

See [mcp-server/TOOLS.md](mcp-server/TOOLS.md) for complete API reference including:
- Tool signatures
- Parameter descriptions
- Return value formats
- Usage examples
