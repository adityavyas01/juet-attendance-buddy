# =====================================
# WEBKIOSK SCRAPING API REQUIREMENTS
# =====================================

## 🎯 Target WebKiosk System: JUET University

### Base URLs:
```
Primary: https://webkiosk.juet.ac.in
```

## 🔐 Required Authentication APIs

### 1. Login Endpoint
```
POST https://webkiosk.juet.ac.in/CommonFiles/UserAction.jsp
```

**Required Form Data:**
```javascript
{
  userType: "Student",
  user: "ENROLLMENT_NUMBER",  // e.g., "21JEITXXXXXX"
  pass: "PASSWORD",
  captcha: "SOLVED_CAPTCHA",
  requestFrom: "Student",
  whatToDo: "Login"
}
```

**Headers:**
```javascript
{
  "Content-Type": "application/x-www-form-urlencoded",
  "User-Agent": "Mozilla/5.0 (Mobile; Android 12) WebKit/537.36"
}
```

### 2. Captcha Image
```
GET https://webkiosk.juet.ac.in/CommonFiles/Captcha.jpg
```

**Session Management:**
- Extract `JSESSIONID` cookie from login response
- Include in all subsequent requests
- Session expires after 30 minutes of inactivity

## 📊 Data Scraping APIs

### 1. Attendance Data
```
POST https://webkiosk.juet.ac.in/StudentFiles/Academic/StudentAttendanceList.jsp
```

**Form Data:**
```javascript
{
  typeOfReport: "student_wise",
  reportType: "attendance_report", 
  student: "ENROLLMENT_NUMBER",
  whatToDo: "GenerateReport"
}
```

**Response Format:** HTML table with attendance data

### 2. Marks/Results
```
POST https://webkiosk.juet.ac.in/StudentFiles/Exam/StudentMarkList.jsp
```

**Form Data:**
```javascript
{
  student: "ENROLLMENT_NUMBER",
  exam: "ALL",
  examType: "internal", // or "external"
  whatToDo: "Show"
}
```

### 3. SGPA/CGPA Results
```
POST https://webkiosk.juet.ac.in/StudentFiles/Exam/StudentSemesterResult.jsp
```

**Form Data:**
```javascript
{
  student: "ENROLLMENT_NUMBER", 
  semester: "ALL",
  whatToDo: "Show"
}
```

### 4. Subject Details
```
POST https://webkiosk.juet.ac.in/StudentFiles/Academic/StudentSubjectList.jsp
```

## 🤖 Required Scraping Tools & Services

### 1. Web Scraping Engine
**Current**: Puppeteer (headless Chrome)
```javascript
const puppeteer = require('puppeteer');
const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
```

### 2. Captcha Solving Services

**Option A: Tesseract.js (Free, Local)**
```javascript
const Tesseract = require('tesseract.js');
const result = await Tesseract.recognize(captchaImage, 'eng');
```

**Option B: 2captcha.com (Paid, 99% accuracy)**
```javascript
const solver = new Captcha.Solver("YOUR_API_KEY");
const result = await solver.imageCaptcha(captchaBase64);
```

**Option C: Anti-Captcha (Paid, Fast)**
```javascript
const ac = require('@antiadmin/anticaptcha');
ac.setAPIKey('YOUR_API_KEY');
```

### 3. Proxy Services (Optional)
```javascript
const proxyChain = require('proxy-chain');
const proxy = 'http://username:password@proxy-server:port';
```

## 🔄 Scraping Workflow

### Step 1: Initialize Session
```javascript
1. Launch headless browser
2. Navigate to WebKiosk login page
3. Download captcha image
4. Solve captcha using OCR/service
5. Submit login form with credentials + captcha
6. Store JSESSIONID cookie
```

### Step 2: Data Extraction  
```javascript
1. Navigate to each data endpoint
2. Submit required form data
3. Parse HTML response
4. Extract structured data
5. Store in MongoDB
6. Cache in Redis for 1 hour
```

### Step 3: Error Handling
```javascript
1. Retry failed requests (max 3 attempts)
2. Handle session timeouts
3. Solve new captchas if required
4. Log all errors for debugging
5. Notify user of scraping status
```

## 📱 Mobile App Integration

### API Endpoints Your Mobile App Will Use:
```javascript
// User Authentication
POST /api/auth/login         // Student login
POST /api/auth/register      // Register with WebKiosk credentials
POST /api/auth/refresh       // Refresh JWT token

// Data Retrieval (cached from WebKiosk)
GET /api/student/attendance  // Get attendance data
GET /api/student/marks       // Get marks/results
GET /api/student/sgpa        // Get SGPA/CGPA
GET /api/student/subjects    // Get subject list

// Data Synchronization
POST /api/sync/attendance    // Force sync attendance
POST /api/sync/all          // Sync all data

// Notifications
GET /api/notifications      // Get push notifications
POST /api/notifications/register // Register device for push
```

## ⚙️ Environment Configuration

### Required Environment Variables:
```bash
# WebKiosk Configuration
WEBKIOSK_URL=https://webkiosk.juet.ac.in
WEBKIOSK_TIMEOUT=30000
WEBKIOSK_RETRY_ATTEMPTS=3
WEBKIOSK_USER_AGENT=Mozilla/5.0 (Android 12) WebKit/537.36

# Captcha Solving
CAPTCHA_SERVICE=tesseract  # or "2captcha" or "anticaptcha"
CAPTCHA_API_KEY=your-api-key-if-paid-service

# Browser Configuration  
PUPPETEER_HEADLESS=true
PUPPETEER_DISABLE_DEV_SHM_USAGE=true
PUPPETEER_NO_SANDBOX=true

# Rate Limiting (avoid IP blocks)
SCRAPING_DELAY_MS=2000
MAX_CONCURRENT_USERS=5
```

## 🚀 Production Deployment

### For Railway/Heroku:
```dockerfile
# Add to Dockerfile (if needed)
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libxss1 \
    libxtst6 \
    xdg-utils
```

### Cloud Memory Requirements:
- **Minimum**: 512MB RAM
- **Recommended**: 1GB RAM (for Puppeteer)
- **Storage**: 500MB for Chrome browser

## 📊 Expected Data Structure

### Attendance Response:
```javascript
{
  "student_id": "21JEITXXXXXX",
  "subjects": [
    {
      "code": "CSE301",
      "name": "Data Structures",
      "total_classes": 45,
      "attended": 38,
      "percentage": 84.44,
      "status": "Present" // or "Absent"
    }
  ],
  "overall_percentage": 82.5,
  "last_updated": "2024-01-15T10:30:00Z"
}
```

### Marks Response:
```javascript
{
  "semester": 5,
  "subjects": [
    {
      "code": "CSE301", 
      "name": "Data Structures",
      "internal_marks": 18,
      "external_marks": 65,
      "total": 83,
      "grade": "A"
    }
  ],
  "sgpa": 8.5,
  "cgpa": 8.2
}
```

## 🔒 Security Considerations

1. **Encrypt stored passwords** using bcrypt
2. **Rate limit requests** to avoid IP blocks  
3. **Use rotating user agents** to appear human
4. **Implement session management** properly
5. **Log all activities** for debugging
6. **Handle WebKiosk downtimes** gracefully

Your mobile app is now ready for both Android and iOS with automatic cloud-based WebKiosk scraping! 🚀
