# =====================================
# JUET Attendance Buddy - Cloud Deployment Guide
# =====================================

## 🚀 Cloud Hosting Options for Automatic Backend

### Option 1: Render (Recommended - Best Free Tier)
- **Cost**: Free tier with 750 hours/month
- **Setup**: GitHub integration, automatic deployments
- **Features**: Built-in environment variables, SSL certificates
- **URL**: https://render.com

#### Render Setup:
1. Sign up at render.com
2. Connect your GitHub repository
3. Create new "Web Service"
4. Set root directory to `backend`
5. Add environment variables:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=<MongoDB Atlas URL>
   REDIS_URL=<Redis Cloud URL>
   JWT_SECRET=your-secure-secret-key
   WEBKIOSK_URL=https://webkiosk.juet.ac.in
   ```

### Option 2: Railway
- **Cost**: $5/month after free credits
- **Setup**: GitHub integration, automatic deployments
- **Features**: MongoDB, Redis included

### Option 3: Heroku
- **Cost**: $7/month minimum
- **Setup**: Git-based deployment
- **Features**: Add-ons for MongoDB and Redis

### Option 4: Vercel + PlanetScale + Upstash
- **Cost**: Free tiers available
- **Setup**: Serverless functions
- **Features**: Global edge network

### Option 4: AWS Free Tier
- **Cost**: 12 months free
- **Setup**: EC2 + RDS + ElastiCache
- **Features**: Full control, scalable

## 🔧 Quick Render Deployment (10 minutes)

### Step 1: Setup External Services
1. **MongoDB Atlas** (Free):
   - Go to https://mongodb.com/atlas
   - Create free cluster
   - Get connection string

2. **Redis Cloud** (Free):
   - Go to https://redis.com/try-free
   - Create free database
   - Get Redis URL

### Step 2: Deploy to Render
1. **Go to Render.com** and sign up with GitHub
2. **Create Web Service** from GitHub repo
3. **Configure deployment**:
   ```
   Name: juet-attendance-buddy
   Root Directory: backend
   Build Command: npm install
   Start Command: npm start
   ```
4. **Add environment variables**:
   ```bash
   NODE_ENV=production
   PORT=10000
   JWT_SECRET=super-secret-key-change-this-32-chars
   WEBKIOSK_URL=https://webkiosk.juet.ac.in
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/juet
   REDIS_URL=redis://username:password@redis-server:port
   CORS_ORIGIN=*
   PUPPETEER_HEADLESS=true
   PUPPETEER_NO_SANDBOX=true
   ```
5. **Deploy**: Automatic from main branch

## 📱 Mobile App Configuration

Update your mobile app to use the cloud API:

```typescript
// In src/lib/api.ts
const API_BASE_URL = 'https://your-app-name.onrender.com/api';
```

## 🔐 Required APIs for WebKiosk Scraping

### WebKiosk API Endpoints (Target):
- **Login**: `https://webkiosk.juet.ac.in/CommonFiles/UserAction.jsp`
- **Attendance**: `https://webkiosk.juet.ac.in/StudentFiles/Academic/StudentAttendanceList.jsp`
- **Marks**: `https://webkiosk.juet.ac.in/StudentFiles/Exam/StudentMarkList.jsp` 
- **SGPA/CGPA**: `https://webkiosk.juet.ac.in/StudentFiles/Exam/StudentSemesterResult.jsp`

### Required Data for Scraping:
- **Student Credentials**:
  - Enrollment Number
  - Password
  - Date of Birth (for some operations)

- **Session Management**:
  - JSESSIONID cookie
  - CSRF tokens
  - Captcha solving

### Third-party Services Needed:
- **OCR Service**: For captcha solving (Tesseract.js or cloud OCR)
- **Proxy Service**: Optional for avoiding IP blocks
- **Database**: MongoDB for storing scraped data
- **Cache**: Redis for session management

## 🌐 Environment Variables for Production

```bash
# Server Configuration
NODE_ENV=production
PORT=10000

# Database URLs (from MongoDB Atlas & Redis Cloud)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/juet-attendance
REDIS_URL=redis://username:password@redis-server:port

# Security
JWT_SECRET=your-super-secure-secret-key-32-chars-min
CORS_ORIGIN=*

# WebKiosk Configuration
WEBKIOSK_URL=https://webkiosk.juet.ac.in
WEBKIOSK_TIMEOUT=30000
WEBKIOSK_RETRY_ATTEMPTS=3

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000

# Background Jobs
SYNC_INTERVAL_MINUTES=60

# Puppeteer Configuration (Required for Render)
PUPPETEER_HEADLESS=true
PUPPETEER_NO_SANDBOX=true
PUPPETEER_DISABLE_DEV_SHM_USAGE=true
```

## 📱 Mobile App Production Build

```bash
# Build for production
npm run build

# Android APK
npm run mobile:android
# In Android Studio: Build > Generate Signed Bundle/APK

# iOS App
npm run mobile:ios  
# In Xcode: Product > Archive > Distribute App
```

## 🚀 Automatic Backend Features

The cloud backend will automatically:
- ✅ Scrape WebKiosk every 60 minutes
- ✅ Handle multiple students simultaneously
- ✅ Store data in MongoDB
- ✅ Cache frequent requests in Redis
- ✅ Send push notifications on attendance changes
- ✅ Handle WebKiosk downtime gracefully
- ✅ Solve captchas automatically
- ✅ Maintain user sessions

## 💡 Mobile App Features

Your lightweight mobile app includes:
- ✅ Native Android and iOS support
- ✅ Offline data caching
- ✅ Secure authentication
- ✅ Real-time sync with cloud backend
- ✅ Push notifications
- ✅ Material Design UI
- ✅ Dark/light theme support
- ✅ Biometric authentication (if available)

## 🔄 Deployment Workflow

1. **Code Changes** → Push to GitHub
2. **Render** → Automatic deployment (2-3 minutes)
3. **Mobile App** → Build and distribute
4. **Users** → Automatic updates from cloud

Your app will work 24/7 even when your laptop is offline!
