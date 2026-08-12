# 🚀 Launch Checklist

Complete this checklist before deploying your AI Travel Planner to production.

## ✅ Prerequisites
- [ ] Node.js 18+ installed locally
- [ ] Google Gemini API key obtained from [ai.google.dev](https://ai.google.dev)
- [ ] Git repository initialized (if using version control)
- [ ] GitHub account (for Vercel or GitHub Actions)

## ✅ Local Testing
- [ ] Run `npm install` successfully
- [ ] Add `GEMINI_API_KEY` to `.env.local`
- [ ] Run `npm run dev` and access http://localhost:3000
- [ ] Test trip generation with sample data:
  - Destination: "Mumbai"
  - Budget: 50000
  - Days: 3
  - Style: "relaxed"
- [ ] Verify API health check: http://localhost:3000/api/health
- [ ] Test on mobile view (responsive design)
- [ ] Check browser console for errors (F12)

## ✅ Code Quality
- [ ] Run linter: `npm run lint` (no errors)
- [ ] Build production bundle: `npm run build` (succeeds)
- [ ] Test production build locally: `npm start`

## ✅ Security
- [ ] `.env.local` is in `.gitignore` ✓ (already configured)
- [ ] `GEMINI_API_KEY` is NOT committed to git
- [ ] `.env.example` shows placeholder values only

## ✅ Deployment Preparation

### For Vercel:
- [ ] GitHub repository created and pushed
- [ ] Vercel account created
- [ ] Project connected to Vercel
- [ ] Environment variable `GEMINI_API_KEY` added in Vercel
- [ ] Initial deployment successful

### For AWS:
- [ ] AWS account with appropriate permissions
- [ ] IAM user created for deployment (if using programmatic access)
- [ ] Selected deployment method (Amplify, App Runner, EC2, etc.)
- [ ] Environment variables configured in AWS

### For Other Platforms:
- [ ] Platform account created
- [ ] Repository connected
- [ ] Environment variables configured
- [ ] Port 3000 is accessible

## ✅ Post-Deployment
- [ ] Application accessible via public URL
- [ ] Health check endpoint responds: `/api/health`
- [ ] Trip generation works on live site
- [ ] Budget tier indicator shows correct values
- [ ] Save trip functionality downloads JSON file
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] No console errors in browser DevTools

## ✅ Monitoring
- [ ] Set up error logging (optional)
- [ ] Monitor API rate limits at [ai.google.dev](https://ai.google.dev)
- [ ] Watch for rate limit errors
- [ ] Verify uptime monitoring (if using Vercel or similar)

## ✅ Documentation
- [ ] README.md is updated with your deployment info
- [ ] DEPLOYMENT.md has your chosen platform details
- [ ] Team/users know how to run locally: `npm install && npm run dev`

## 🚨 Common Issues & Fixes

### Issue: "GEMINI_API_KEY not configured"
```bash
# Solution:
cat .env.local
# Should output: GEMINI_API_KEY=your_actual_key
```

### Issue: Build fails locally
```bash
# Solution:
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: API timeouts
- Check API key quota at https://ai.google.dev
- Gemini typically takes 10-30 seconds per request (normal)
- Retry after a few seconds

### Issue: No data displayed
- Check `/api/health` endpoint
- Open browser DevTools (F12) → Console
- Verify API is responding with valid JSON

## 📞 Getting Help

- **Google Generative AI**: [ai.google.dev](https://ai.google.dev)
- **Next.js**: [nextjs.org](https://nextjs.org)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Your Platform**: Check platform-specific documentation

## 🎉 You're Ready!

Once all items are checked, your AI Travel Planner is ready for production!

**Quick Launch Commands:**

```bash
# Development
npm run dev

# Production build
npm run build
npm start

# Deployment (Vercel)
vercel deploy --prod
```

Good luck! 🚀
