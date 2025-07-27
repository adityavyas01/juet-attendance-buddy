# ==============================================
# RENDER.COM DEPLOYMENT CONFIGURATION
# ==============================================

# This file contains the exact configuration needed for Render.com

## 🚀 Render Web Service Settings

### Basic Configuration:
```
Name: juet-attendance-buddy
Environment: Node
Region: Oregon (US-West) or Singapore (closest to India)
Branch: main
Root Directory: backend
```

### Build & Deploy Commands:
```
Build Command: npm install
Start Command: npm start
```

### Instance Type:
```
Free Tier: 512 MB RAM, 0.1 CPU (enough for testing)
Starter: $7/month, 512 MB RAM, 0.5 CPU (recommended for production)
```

## 🔧 Required External Services

### 1. MongoDB Atlas (Free Tier)
- **URL**: https://mongodb.com/atlas
- **Plan**: M0 Sandbox (512 MB, Free forever)
- **Region**: Choose closest to your Render region
- **Connection String**: `mongodb+srv://username:password@cluster.mongodb.net/juet-attendance`

### 2. Redis Cloud (Free Tier)  
- **URL**: https://redis.com/try-free
- **Plan**: 30 MB, Free forever
- **Connection String**: `redis://username:password@redis-server:port`

## 📋 Environment Variables for Render

Copy-paste these into Render's Environment Variables section:

```
NODE_ENV=production
PORT=10000
JWT_SECRET=juet-attendance-super-secret-key-32-characters-minimum
WEBKIOSK_URL=https://webkiosk.juet.ac.in
WEBKIOSK_TIMEOUT=30000
WEBKIOSK_RETRY_ATTEMPTS=3
CORS_ORIGIN=*
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
SYNC_INTERVAL_MINUTES=60
CAPTCHA_SERVICE=tesseract
PUPPETEER_HEADLESS=true
PUPPETEER_NO_SANDBOX=true
PUPPETEER_DISABLE_DEV_SHM_USAGE=true
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/juet-attendance
REDIS_URL=redis://your-username:your-password@your-redis-server:port
```

## 🔄 Deployment Steps

### Step 1: Setup External Services (5 minutes)
1. Create MongoDB Atlas account and cluster
2. Create Redis Cloud account and database  
3. Note down connection strings

### Step 2: Deploy to Render (3 minutes)
1. Go to https://render.com
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Fill in the configuration above
6. Add all environment variables
7. Click "Create Web Service"

### Step 3: Update Mobile App (1 minute)
Update `src/lib/api.ts`:
```typescript
const API_BASE_URL = 'https://juet-attendance-buddy.onrender.com/api';
```

## 🎯 Render Advantages

✅ **750 hours/month free** (enough for 24/7 operation)
✅ **Automatic HTTPS** with SSL certificates  
✅ **Zero-downtime deployments**
✅ **Automatic scaling**
✅ **Global CDN** for faster API responses
✅ **GitHub integration** for auto-deployments
✅ **Built-in monitoring** and logs
✅ **No credit card required** for free tier

## 🚨 Important Notes

- **Free tier**: Service sleeps after 15 minutes of inactivity
- **Solution**: Add a cron job to ping your service every 14 minutes
- **Cold start**: First request after sleep takes 10-15 seconds
- **Upgrade to Starter ($7/month)** for always-on service

## 📱 Your App URL
After deployment, your backend will be available at:
```
https://juet-attendance-buddy.onrender.com/api
```

## 🔧 Troubleshooting

### If deployment fails:
1. Check build logs in Render dashboard
2. Verify all environment variables are set
3. Ensure MongoDB/Redis connections are working
4. Check if `package.json` has all required dependencies

### If WebKiosk scraping fails:
1. Check PUPPETEER environment variables
2. Verify WebKiosk is accessible
3. Test captcha solving service
4. Check server logs for errors

Your JUET Attendance Buddy will be live in 10 minutes! 🚀
