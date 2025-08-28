# 🚀 Deployment Configuration Guide

This guide tells you **exactly where** to enter all your credentials, API keys, and configuration details for running the JUET Attendance Buddy system.

## 📋 Prerequisites

1. **MongoDB Database** (local or MongoDB Atlas)
2. **Node.js 18+** installed
3. **Git** (for cloning if needed)

## 🔐 Step 1: Environment Configuration

### Backend Environment Variables

Create or update the file: `backend/.env`

```env
# ===========================================
# 🔑 AUTHENTICATION & SECURITY
# ===========================================
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
ENCRYPTION_KEY=your_32_character_encryption_key_here_exactly_32_chars

# ===========================================
# 🗄️ DATABASE CONNECTION
# ===========================================
# Option A: Local MongoDB
MONGODB_URI=mongodb://localhost:27017/juet-attendance

# Option B: MongoDB Atlas (Cloud)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/juet-attendance?retryWrites=true&w=majority

# ===========================================
# 📡 SERVER CONFIGURATION
# ===========================================
PORT=3000
NODE_ENV=production

# ===========================================
# 🔄 REDIS (Optional - for session management)
# ===========================================
# REDIS_URL=redis://localhost:6379
# REDIS_PASSWORD=your_redis_password_if_needed

# ===========================================
# 🌐 CORS CONFIGURATION
# ===========================================
# CORS_ORIGIN=http://localhost:3000,https://yourdomain.com

# ===========================================
# 📊 LOGGING
# ===========================================
LOG_LEVEL=info
```

### 🎯 Where to Get These Values:

#### JWT_SECRET
```bash
# Generate a random JWT secret (run in terminal):
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### ENCRYPTION_KEY
```bash
# Generate exactly 32 character encryption key:
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

#### MongoDB URI Options:

**Local MongoDB:**
- Install MongoDB locally
- Use: `mongodb://localhost:27017/juet-attendance`

**MongoDB Atlas (Cloud):**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create free account
3. Create cluster
4. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/juet-attendance`

## 🖥️ Step 2: WebKiosk Credentials

### How Students Enter Their Credentials:

1. **Registration/Login:** Students enter their WebKiosk credentials during app registration
2. **Stored Securely:** Credentials are encrypted using AES-256 encryption
3. **Auto-Login:** Students can enable auto-login to avoid repeated credential entry

### API Endpoints for Credential Management:

```javascript
// Student login with credential storage
POST /api/auth/login
{
  "username": "student_webkiosk_username",
  "password": "student_webkiosk_password",
  "storeCredentials": true  // Optional: store for auto-login
}

// Enable auto-login (saves WebKiosk credentials)
POST /api/auth/enable-auto-login
{
  "webkioskUsername": "student_webkiosk_username",
  "webkioskPassword": "student_webkiosk_password"
}
```

## 🏃‍♂️ Step 3: Running the System

### Development Mode:
```bash
cd backend
npm install
npm run dev
```

### Production Mode:
```bash
cd backend
npm install
npm run build
npm run start:prod
```

## 🔧 Step 4: Admin Configuration

### Admin Account Setup:

1. **Create Admin User** (run once):
```bash
# In your terminal/command prompt:
curl -X POST http://localhost:3000/api/admin/setup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "your_admin_password",
    "email": "admin@juet.ac.in"
  }'
```

2. **Admin Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "your_admin_password"
  }'
```

## 🌐 Step 5: Frontend Configuration

If you have a frontend application, update these settings:

### Frontend Environment Variables:
```env
# Create: frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api
# or for production:
# NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
```

## 📱 Step 6: Mobile App Configuration

If you have a mobile app, update the API base URL:

```javascript
// In your mobile app config
const API_BASE_URL = 'http://localhost:3000/api';
// or for production:
// const API_BASE_URL = 'https://your-backend-domain.com/api';
```

## 🔍 Step 7: Testing Your Setup

### 1. Check Server Status:
```bash
curl http://localhost:3000/api/health
```

### 2. Test Student Registration:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_student",
    "password": "test_password",
    "email": "student@juet.ac.in",
    "studentId": "20XXXXX",
    "branch": "CSE",
    "semester": 6
  }'
```

### 3. Test WebKiosk Integration:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_student",
    "password": "test_password",
    "storeCredentials": true
  }'
```

## 🚨 Security Checklist

### ✅ Before Going Live:

1. **Change Default Passwords:**
   - [ ] Generated strong JWT_SECRET
   - [ ] Generated strong ENCRYPTION_KEY
   - [ ] Set strong admin password

2. **Database Security:**
   - [ ] MongoDB authentication enabled
   - [ ] Database user has minimal required permissions
   - [ ] Network access restricted (if using Atlas)

3. **Server Security:**
   - [ ] CORS origins configured for production
   - [ ] HTTPS enabled (use reverse proxy like Nginx)
   - [ ] Environment variables secured (not in code)

4. **Application Security:**
   - [ ] Rate limiting enabled
   - [ ] Input validation working
   - [ ] Error messages don't leak sensitive info

## 🆘 Troubleshooting

### Common Issues:

1. **"ENCRYPTION_KEY not found"**
   - Make sure your `.env` file has the ENCRYPTION_KEY variable
   - Ensure it's exactly 32 characters long

2. **"Cannot connect to MongoDB"**
   - Check your MONGODB_URI
   - Ensure MongoDB is running (if local)
   - Check network connectivity (if Atlas)

3. **"WebKiosk login failed"**
   - Verify student credentials are correct
   - Check WebKiosk website availability
   - Check network connectivity

4. **"CORS Error"**
   - Add your frontend URL to CORS_ORIGIN
   - Check if frontend and backend URLs match

## 📞 Support

If you encounter issues:

1. Check the logs in `backend/logs/`
2. Ensure all environment variables are set
3. Verify all dependencies are installed
4. Check firewall/network settings

---

🎉 **You're all set!** Your JUET Attendance Buddy is ready for deployment with secure credential storage and auto-login functionality.
