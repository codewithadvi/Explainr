# Deploy to Vercel (Recommended)

## Why Vercel?

✅ **Built for Next.js** - Made by the Next.js team  
✅ **Lightning Fast** - Global edge network  
✅ **Auto Deployments** - Push to GitHub = instant deploy  
✅ **Free SSL** - Automatic HTTPS  
✅ **Zero Config** - Just works  

## Quick Deploy (2 minutes)

### 1. Push to GitHub First
```bash
git add .
git commit -m "Add Feynman Mirror"
git push origin main
```

### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click **"Import Project"**
3. Select your GitHub repo: `feynman-mirror`
4. Click **"Deploy"** (Vercel auto-detects Next.js!)

### 3. Add Environment Variables
In Vercel dashboard → Settings → Environment Variables:
```
NEXT_PUBLIC_GEMINI_API_KEY = your_gemini_key
GROQ_API_KEY = your_groq_key
GOOGLE_GEMINI_API_KEY = your_gemini_key
```

### 4. Redeploy
Click **"Redeploy"** to apply environment variables.

## Your App is Live! 🎉

- **URL**: `https://feynman-mirror.vercel.app`
- **Auto Updates**: Every git push deploys automatically
- **Analytics**: Built-in performance monitoring

## Custom Domain (Optional)

1. Buy domain (e.g., `feynmanmirror.com`)
2. Vercel → Settings → Domains
3. Add domain → Follow DNS instructions
4. Free SSL certificate automatically applied

## Vercel vs Replit

| | Vercel | Replit |
|---|---|---|
| Speed | ⚡ Fast | 🐌 Slow |
| Uptime | ✅ 99.99% | ⚠️ Sleeps |
| Deploy | 🚀 Auto | 🔧 Manual |
| Cost | 💰 Free | 💰 Free (limited) |

**Verdict: Use Vercel for production!**

## Troubleshooting

**Build Fails:**
- Check environment variables are set
- Verify `npm run build` works locally

**API Errors:**
- Ensure API keys are added in Vercel dashboard
- Check API key format (no quotes)

**404 Errors:**
- Vercel auto-handles Next.js routing
- No additional config needed
