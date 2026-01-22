# Feynman Mirror - Replit Deployment

## Quick Start on Replit

1. **Import this repository** to Replit
2. **Add Secrets** (Environment Variables):
   - `NEXT_PUBLIC_GEMINI_API_KEY` - Your Gemini API key
   - `GROQ_API_KEY` - Your Groq API key (optional)
   - `GOOGLE_GEMINI_API_KEY` - Same as NEXT_PUBLIC_GEMINI_API_KEY

3. **Run**: Click the "Run" button - Replit will automatically:
   - Install dependencies
   - Build the Next.js app
   - Start the development server

4. **Access**: Your app will be available at `https://your-repl-name.your-username.repl.co`

## Features Available on Replit

✅ **Full Learning Experience:**
- 5 AI Personas (Toddler, Peer, Frat Bro, CEO, Professor)
- Interactive learning sessions
- Real-time AI feedback
- Knowledge Galaxy visualization
- Commitment Grid tracking

⚠️ **Limitations:**
- Data stored in browser localStorage (not persistent across devices)
- MCP server not available (use local setup for AI client integration)

## Adding API Keys

1. Click the **🔒 Secrets** tab in Replit
2. Add these secrets:

```
NEXT_PUBLIC_GEMINI_API_KEY = your_gemini_api_key_here
GROQ_API_KEY = your_groq_api_key_here
GOOGLE_GEMINI_API_KEY = your_gemini_api_key_here
```

## Troubleshooting

**Port Issues:**
If you see "Port 3000 already in use", Replit will automatically use a different port.

**Build Errors:**
Make sure all dependencies are installed:
```bash
npm install
```

**API Key Errors:**
Verify secrets are set correctly in the Secrets tab.

## For Full MCP Server Support

For AI client integration (ChatGPT, Claude, Cline), use the local setup:
```bash
git clone https://github.com/YOUR_USERNAME/feynman-mirror.git
cd feynman-mirror
npm install
cd mcp-server && npm install && npm run build
```

See main [README.md](README.md) for complete setup instructions.
