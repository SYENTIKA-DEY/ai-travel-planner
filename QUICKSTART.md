# 🎯 Quick Start Guide

Get your AI Travel Planner up and running in 5 minutes!

## Step 1: Get Your API Key (2 min)

1. Go to [ai.google.dev](https://ai.google.dev)
2. Click "Get API Key"
3. Copy your API key

## Step 2: Setup Local Project (2 min)

```bash
# Open terminal in project folder
cd ai-travel-planner

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

## Step 3: Add Your API Key (1 min)

Open `.env.local` and add your key:
```
GEMINI_API_KEY=paste_your_key_here
```

Save the file.

## Step 4: Run the App (1 min)

```bash
npm run dev
```

Open browser to: **http://localhost:3000**

## 🎉 That's it!

Your app is running! Try:
1. Enter "Mumbai" as destination
2. Budget: 50000 (INR)
3. Days: 3
4. Click "Generate Trip"

## Next: Deploy to the Web

### Option A: Vercel (Easiest - 5 minutes)

1. Push to GitHub: `git push`
2. Go to [vercel.com](https://vercel.com)
3. Click "Add New Project"
4. Select your repo
5. Add env var: `GEMINI_API_KEY`
6. Deploy!

→ Your app is live on the internet! 🌍

### Option B: Other Platforms

See `DEPLOYMENT.md` for AWS, Google Cloud, DigitalOcean, etc.

## 🆘 Stuck?

- **App won't start?** → Check API key is in `.env.local`
- **API errors?** → Check browser DevTools (F12) → Console
- **Slow?** → Normal (10-30 sec first time) - Gemini is thinking! 🤔
- **Still stuck?** → See `DEPLOYMENT.md` troubleshooting section

## ✅ Success Checklist

- [ ] App runs locally on http://localhost:3000
- [ ] Can generate a trip
- [ ] Budget shows in INR (₹)
- [ ] Ready to deploy

**Now deploy it!** Choose Vercel above or follow `DEPLOYMENT.md` for your platform.

---

**Questions?** Check the full docs in `DEPLOYMENT.md` or `LAUNCH_CHECKLIST.md`
