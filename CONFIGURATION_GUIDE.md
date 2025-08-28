# 🔐 JUET Attendance Buddy - Configuration Guide

## 📍 **WHERE TO ENTER YOUR CREDENTIALS**

---

## 🎯 **1. MAIN CONFIGURATION FILE**

### 📁 Location: `backend/.env.production`

```bash
# ⚠️  REQUIRED CHANGES - MUST UPDATE THESE:

# JWT Secret Key (CHANGE THIS!)
JWT_SECRET=your-super-secure-production-jwt-secret-key-256-bits
# 👆 Replace with a strong 32+ character secret key

# Database Connection (if using remote MongoDB)
MONGODB_URI=mongodb://localhost:27017/juet_attendance_production
# 👆 Replace with your MongoDB connection string if using cloud database

# WebKiosk Base URL (should be correct, but verify)
WEBKIOSK_BASE_URL=https://webkiosk.juet.ac.in
# 👆 Verify this is the correct JUET WebKiosk URL

# CORS Origins (update for production)
CORS_ORIGIN=*
# 👆 Replace * with your frontend domain for security
# Example: CORS_ORIGIN=https://yourapp.com
```

---

## 🚫 **NO CREDENTIALS STORED IN CODE**

### ✅ **Important:** 
**The system does NOT store any WebKiosk usernames/passwords!**

**How authentication works:**
1. **Users enter their own credentials** in the mobile app login
2. **Credentials are sent to your API** via POST request
3. **API validates with WebKiosk** in real-time
4. **JWT token is returned** for subsequent requests
5. **No passwords are stored anywhere**

---

## 📱 **2. HOW USERS WILL PROVIDE CREDENTIALS**

### When users use your mobile app, they will enter:

```json
POST /api/auth/login
{
  "enrollmentNumber": "20BCS101",     // ← User enters this
  "password": "student_password",      // ← User enters this  
  "dateOfBirth": "2003-05-15"         // ← User enters this (optional)
}
```

**These are NOT your credentials - these are the individual student's WebKiosk login details.**

---

## 🛠️ **3. REQUIRED SETUP STEPS**

### **Step 1: Generate JWT Secret**
```bash
# Generate a secure JWT secret (run this command)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copy the output and paste it in .env.production as JWT_SECRET
```

### **Step 2: Database Setup (Choose One)**

#### **Option A: Local MongoDB**
```bash
# Install MongoDB locally, then use:
MONGODB_URI=mongodb://localhost:27017/juet_attendance_production
```

#### **Option B: MongoDB Atlas (Cloud)**
```bash
# Sign up at https://www.mongodb.com/cloud/atlas
# Create a cluster and get connection string like:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/juet_attendance
```

#### **Option C: Railway/Render Database**
```bash
# If deploying on Railway/Render, they provide database URLs
MONGODB_URI=your-provided-database-url
```

### **Step 3: Update CORS for Production**
```bash
# For development (current setting)
CORS_ORIGIN=*

# For production (replace with your frontend domain)
CORS_ORIGIN=https://yourapp.com
# Or if multiple domains:
CORS_ORIGIN=https://yourapp.com,https://app.yourcompany.com
```

---

## 🎯 **4. ENVIRONMENT FILES TO CONFIGURE**

### **File 1: `backend/.env.production`** (Main Config)
```bash
# CHANGE THESE:
JWT_SECRET=your-generated-secret-key-here
MONGODB_URI=your-database-connection-string
CORS_ORIGIN=your-frontend-domain.com

# OPTIONAL CHANGES:
PORT=3000                    # API server port
LOG_LEVEL=info              # Logging level
RATE_LIMIT_MAX_REQUESTS=100 # Rate limiting
```

### **File 2: `backend/.env.example`** (Template - Don't Edit)
- This is just a template
- Copy it to create new environment files if needed

---

## ☁️ **5. CLOUD DEPLOYMENT CONFIGURATION**

### **Railway.app:**
```bash
# Set these environment variables in Railway dashboard:
JWT_SECRET=your-generated-secret
MONGODB_URI=your-database-url
NODE_ENV=production
```

### **Render.com:**
```bash
# Set these in Render environment variables:
JWT_SECRET=your-generated-secret  
MONGODB_URI=your-database-url
NODE_ENV=production
```

### **Docker:**
```bash
# Create docker-compose.override.yml with your secrets:
version: '3.8'
services:
  backend:
    environment:
      - JWT_SECRET=your-generated-secret
      - MONGODB_URI=your-database-url
```

---

## 🔒 **6. SECURITY BEST PRACTICES**

### **JWT Secret Generation:**
```bash
# Generate strong secret (32+ characters)
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### **Database Security:**
```bash
# Use strong database passwords
# Enable authentication on MongoDB
# Use SSL/TLS connections in production
# Whitelist IP addresses in cloud databases
```

### **CORS Security:**
```bash
# Never use CORS_ORIGIN=* in production
# Specify exact domains that can access your API
CORS_ORIGIN=https://yourapp.com,https://admin.yourapp.com
```

---

## 🚀 **7. QUICK START CHECKLIST**

### **For Local Development:**
- [ ] ✅ Install MongoDB locally
- [ ] ✅ Generate JWT secret and add to `.env.production`
- [ ] ✅ Set `MONGODB_URI=mongodb://localhost:27017/juet_attendance`
- [ ] ✅ Run `npm start` in backend directory

### **For Production:**
- [ ] ✅ Set up cloud database (MongoDB Atlas)
- [ ] ✅ Generate strong JWT secret
- [ ] ✅ Update CORS_ORIGIN with your domain
- [ ] ✅ Set environment variables in hosting platform
- [ ] ✅ Deploy application

---

## 📝 **8. TESTING CONFIGURATION**

### **Test with sample student credentials:**
```bash
# Use any valid JUET student credentials for testing
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "enrollmentNumber": "STUDENT_ENROLLMENT_NUMBER",
    "password": "STUDENT_WEBKIOSK_PASSWORD"
  }'
```

**Note:** Use real student credentials that work on the JUET WebKiosk portal.

---

## 🔍 **SUMMARY - WHAT YOU NEED TO PROVIDE:**

1. **JWT Secret Key** → Generate and add to environment file
2. **Database Connection** → MongoDB local/cloud connection string  
3. **Frontend Domain** → For CORS configuration
4. **Optional: Redis URL** → For caching (not required)

**You do NOT need to provide:**
- ❌ Student usernames/passwords (users provide their own)
- ❌ WebKiosk API keys (system scrapes public portal)
- ❌ External API credentials (none required)

**🎉 Your API is designed to be secure and self-contained!**
