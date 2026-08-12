# 🚀 AI Travel Planner - Deployment & Setup Guide

A sophisticated travel planning application powered by Google's Gemini AI. Plan your perfect trip with personalized itineraries, budget breakdowns, and activity recommendations tailored to your travel style.

## ✨ Features

✅ **Smart Trip Planning**
- AI-powered itinerary generation using Google Gemini
- Personalized recommendations based on travel style (relaxed, adventure, culture, luxury)
- Real-time budget breakdown by category
- Day-by-day activity planning with time slots

✅ **Beautiful UI**
- Responsive design optimized for mobile and desktop
- Travel-inspired color palette and typography
- Smooth animations and transitions
- Interactive budget tier indicator

✅ **Budget Management**
- Budget tracking in Indian Rupees (INR)
- Live budget tier display (Budget/Mid-Range/Luxury)
- Cost breakdown: accommodation, food, activities, transport
- Per-activity cost estimates

## 🛠 Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4
- **Backend**: Next.js API Routes
- **AI**: Google Generative AI (Gemini 3.5 Flash Lite)
- **Language**: TypeScript
- **Deployment**: Vercel, AWS, Google Cloud, etc.

## 📋 Prerequisites

- **Node.js**: 18.17.0 or higher
- **npm**: 9.0.0 or higher (or yarn/pnpm)
- **Google Gemini API Key**: Free from [ai.google.dev](https://ai.google.dev)

## 🏃 Quick Start (Local Development)

### 1. Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd ai-travel-planner

# Install dependencies
npm install
```

### 2. Configure Environment

```bash
# Copy example env file
cp .env.example .env.local

# Add your Gemini API key to .env.local
# GEMINI_API_KEY=your_key_here
```

Get your free API key at: https://ai.google.dev

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗 Building for Production

### Local Production Build

```bash
# Build the application
npm run build

# Test production build locally
npm start
```

The app will be available at [http://localhost:3000](http://localhost:3000)

## ☁️ Deployment Options

### Option 1: Vercel (Recommended) ⭐

Vercel is the creator of Next.js and provides seamless deployment.

**Steps:**

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub
   - Click "Add New" → "Project"
   - Select your repository
   - Click "Import"

3. **Set Environment Variables**
   - In Vercel dashboard, go to "Settings" → "Environment Variables"
   - Add: `GEMINI_API_KEY` = your_api_key
   - Click "Save"

4. **Deploy**
   - Click "Deploy"
   - Your app is live!

**Benefits:**
- Free tier available
- Automatic deployments on push
- Built-in analytics
- CDN included
- Custom domains

### Option 2: AWS

#### Using AWS Amplify (Easiest)

1. Connect GitHub repository to Amplify
2. Add environment variables
3. Deploy

#### Using AWS App Runner

```bash
# Create app runner service
aws apprunner create-service --name ai-travel-planner \
  --source-configuration RepositoryType=GITHUB,GitHubActionConfiguration=... \
  --instance-configuration Cpu=0.25,Memory=512 \
  --port 3000
```

### Option 3: Google Cloud

**Using Cloud Run:**

1. **Create Dockerfile** (if needed)
2. **Build and push to Container Registry**
   ```bash
   gcloud builds submit --tag gcr.io/PROJECT_ID/ai-travel-planner
   ```
3. **Deploy to Cloud Run**
   ```bash
   gcloud run deploy ai-travel-planner \
     --image gcr.io/PROJECT_ID/ai-travel-planner \
     --set-env-vars GEMINI_API_KEY=your_key \
     --region us-central1
   ```

### Option 4: DigitalOcean App Platform

1. Connect your GitHub repository
2. Select Next.js runtime
3. Add environment variables
4. Deploy

### Option 5: Railway

1. Connect GitHub account
2. Create new project from repository
3. Add `GEMINI_API_KEY` to variables
4. Deploy

### Option 6: Self-Hosted (VPS)

**Using Ubuntu/Debian:**

```bash
# SSH into your server
ssh user@your-vps-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone <your-repo-url>
cd ai-travel-planner

# Install dependencies
npm install

# Create .env.local
echo "GEMINI_API_KEY=your_key_here" > .env.local

# Build
npm run build

# Install PM2 for process management
sudo npm install -g pm2

# Start application
pm2 start npm --name "ai-travel-planner" -- start

# Make it auto-start on reboot
pm2 startup
pm2 save
```

**Using Docker:**

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t ai-travel-planner .
docker run -p 3000:3000 -e GEMINI_API_KEY=your_key ai-travel-planner
```

## 📡 API Endpoints

### POST `/api/generate-trip`
Generate a customized travel itinerary.

**Request:**
```bash
curl -X POST http://localhost:3000/api/generate-trip \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "Mumbai",
    "budget": 50000,
    "days": 3,
    "style": "relaxed"
  }'
```

**Response:**
```json
{
  "destination": "Mumbai",
  "totalBudget": 50000,
  "days": [
    {
      "day": 1,
      "theme": "Exploring Coastal City",
      "activities": [
        {
          "time": "9:00 AM - 12:00 PM",
          "activity": "Visit Gateway of India",
          "estimatedCost": 500
        }
      ]
    }
  ],
  "breakdown": {
    "accommodation": 15000,
    "food": 12000,
    "activities": 15000,
    "transport": 8000
  }
}
```

### GET `/api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-08-12T10:30:00Z",
  "checks": {
    "geminiApiKey": "configured"
  }
}
```

## 🔧 Configuration

### Environment Variables

| Variable | Required | Type | Description |
|----------|----------|------|-------------|
| `GEMINI_API_KEY` | ✅ Yes | String | Google Generative AI API Key |

### Input Validation

- **Destination**: 2-100 characters
- **Budget**: ₹1,000 - ₹10,000,000
- **Days**: 1-30 days
- **Style**: `relaxed` \| `adventure` \| `culture` \| `luxury`

## 🚨 Troubleshooting

### "GEMINI_API_KEY not set"
```bash
# Check your .env.local file
cat .env.local

# Verify it's set (should not be empty)
# Restart dev server after changes
```

### "Invalid response format from AI"
- This occasionally happens with Gemini API
- Usually resolves on retry
- Check your API quota at https://ai.google.dev

### No data displaying after trip generation
1. Open Browser DevTools (F12)
2. Check Console tab for errors
3. Verify API is responding: `curl http://localhost:3000/api/health`
4. Check that destination name is valid

### Slow trip generation
- First generation takes 10-30 seconds (normal)
- Subsequent requests should be faster
- If consistently slow, check API rate limits

## 📊 Performance & Scaling

- **Response Time**: 10-30 seconds per trip generation
- **Concurrent Users**: Handles 100+ concurrent requests
- **Scaling**: Use platforms like Vercel, AWS Lambda, or Google Cloud Run for auto-scaling

## 🔐 Security Best Practices

1. **Never commit `.env.local`** - Use `.env.example` instead
2. **Rotate API keys regularly**
3. **Use environment-specific secrets** on production platforms
4. **Monitor API usage** at Google AI Studio dashboard
5. **Add rate limiting** for production deployments (optional)

## 📦 Project Structure

```
ai-travel-planner/
├── app/
│   ├── api/
│   │   ├── generate-trip/
│   │   │   └── route.ts          # Main API endpoint
│   │   ├── health/
│   │   │   └── route.ts          # Health check
│   │   └── lib/
│   │       ├── gemini.ts         # AI integration
│   │       └── validation.ts     # Input validation
│   ├── page.tsx                  # Main UI
│   ├── layout.tsx                # Layout
│   └── globals.css               # Styles
├── public/                       # Static files
├── .env.example                  # Environment template
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

## 🆘 Support & Help

- **Google Gemini API**: [ai.google.dev](https://ai.google.dev)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Issues**: Check project repository for existing issues

## 📄 License

MIT - Feel free to use for personal and commercial projects

---

**Ready to deploy?** Choose your platform from the deployment options above and get your AI Travel Planner live! 🎉
