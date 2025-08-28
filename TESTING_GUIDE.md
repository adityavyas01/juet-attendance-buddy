# 🧪 JUET Attendance Buddy - Testing Guide

## 📋 Table of Contents
- [🚀 Quick Start Testing](#-quick-start-testing)
- [🔐 Authentication Testing](#-authentication-testing)
- [📊 API Endpoints Testing](#-api-endpoints-testing)
- [🤖 Automated Testing](#-automated-testing)
- [⚡ Performance Testing](#-performance-testing)
- [🔍 Integration Testing](#-integration-testing)

---

## 🚀 Quick Start Testing

### Prerequisites
```bash
# Ensure backend is running
cd backend
npm run dev

# Server should be running on http://localhost:3000
```

### Quick Health Check
```bash
# Test server availability
curl http://localhost:3000/health

# Expected Response:
# {
#   "status": "ok",
#   "timestamp": "2024-01-XX...",
#   "environment": "development"
# }
```

---

## 🔐 Authentication Testing

### Step 1: Register/Login User
```bash
# Login with JUET WebKiosk credentials
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "enrollmentNumber": "YOUR_ENROLLMENT_NUMBER",
    "password": "YOUR_WEBKIOSK_PASSWORD"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "enrollmentNumber": "20XXJUXXXXXX",
    "name": "Student Name",
    "program": "B.Tech",
    "branch": "Computer Science Engineering"
  }
}
```

### Step 2: Save Token for Testing
```bash
# Save token in variable (Linux/Mac)
export TOKEN="your_jwt_token_here"

# Save token in variable (Windows PowerShell)
$TOKEN = "your_jwt_token_here"
```

### Step 3: Test Protected Route
```bash
# Test authentication middleware
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3000/api/student/profile
```

---

## 📊 API Endpoints Testing

### 📱 Dashboard Endpoint
```bash
# Test dashboard data
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3000/api/student/dashboard

# Expected Response Structure:
# {
#   "success": true,
#   "data": {
#     "student": { "name": "...", "enrollmentNumber": "..." },
#     "currentSemester": 6,
#     "overallAttendance": 85.5,
#     "lowAttendanceSubjects": [...],
#     "academicSummary": { "cgpa": 8.5, "sgpa": 8.2 },
#     "quickStats": { "totalSubjects": 8, "criticalSubjects": 1 }
#   }
# }
```

### 📚 Attendance Testing

#### Get All Attendance
```bash
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3000/api/student/attendance
```

#### Get Subject-Specific Attendance
```bash
# Replace {subjectId} with actual subject ID from attendance response
curl -H "Authorization: Bearer $TOKEN" \
     "http://localhost:3000/api/student/attendance/CS601"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "subject": {
      "code": "CS601",
      "name": "Software Engineering",
      "type": "Theory"
    },
    "attendance": {
      "present": 25,
      "total": 30,
      "percentage": 83.33
    },
    "details": [
      {
        "date": "2024-01-15",
        "status": "Present",
        "period": "1st"
      }
    ]
  }
}
```

### 🎓 Academics Testing

#### Get All Academic Data
```bash
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3000/api/student/academics
```

#### Get Semester-Specific Results
```bash
# Get specific semester results
curl -H "Authorization: Bearer $TOKEN" \
     "http://localhost:3000/api/student/academics/6"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "semester": 6,
    "sgpa": 8.2,
    "subjects": [
      {
        "code": "CS601",
        "name": "Software Engineering",
        "credits": 4,
        "grade": "A",
        "gradePoints": 9
      }
    ],
    "totalCredits": 22,
    "earnedCredits": 22
  }
}
```

### 👤 Profile Testing
```bash
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3000/api/student/profile
```

### 🔄 Sync Testing
```bash
# Trigger data synchronization
curl -X POST \
     -H "Authorization: Bearer $TOKEN" \
     http://localhost:3000/api/student/sync
```

---

## 🤖 Automated Testing

### Setting Up Test Environment
```bash
# Install test dependencies
cd backend
npm install --save-dev jest supertest @types/jest

# Create test database
export NODE_ENV=test
export MONGODB_URI=mongodb://localhost:27017/juet_attendance_test
export JWT_SECRET=test-secret-key
```

### Sample Test Cases

#### Authentication Tests
```javascript
// tests/auth.test.js
const request = require('supertest');
const app = require('../src/server');

describe('Authentication', () => {
  test('POST /api/auth/login - should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        enrollmentNumber: '20XXJUXXXXXX',
        password: 'valid_password'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();
  });

  test('POST /api/auth/login - should reject invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        enrollmentNumber: '20XXJUXXXXXX',
        password: 'wrong_password'
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
```

#### API Endpoints Tests
```javascript
// tests/student.test.js
describe('Student API', () => {
  let authToken;

  beforeAll(async () => {
    // Login and get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        enrollmentNumber: '20XXJUXXXXXX',
        password: 'valid_password'
      });
    authToken = loginResponse.body.token;
  });

  test('GET /api/student/dashboard - should return dashboard data', async () => {
    const response = await request(app)
      .get('/api/student/dashboard')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.student).toBeDefined();
    expect(response.body.data.overallAttendance).toBeDefined();
  });

  test('GET /api/student/attendance - should return attendance data', async () => {
    const response = await request(app)
      .get('/api/student/attendance')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
```

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test auth.test.js
```

---

## ⚡ Performance Testing

### Load Testing with Artillery
```bash
# Install Artillery
npm install -g artillery

# Create load test configuration
```

```yaml
# load-test.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Sustained load"
    - duration: 60
      arrivalRate: 100
      name: "High load"

scenarios:
  - name: "API Load Test"
    beforeRequest: "setAuthToken"
    flow:
      - post:
          url: "/api/auth/login"
          json:
            enrollmentNumber: "20XXJUXXXXXX"
            password: "password"
          capture:
            json: "$.token"
            as: "authToken"
      - get:
          url: "/api/student/dashboard"
          headers:
            Authorization: "Bearer {{ authToken }}"
      - get:
          url: "/api/student/attendance"
          headers:
            Authorization: "Bearer {{ authToken }}"
```

```bash
# Run load test
artillery run load-test.yml
```

### Memory and CPU Monitoring
```bash
# Monitor server performance during tests
top -p $(pgrep node)

# Monitor memory usage
ps aux | grep node

# Check for memory leaks
node --inspect backend/dist/server.js
```

---

## 🔍 Integration Testing

### WebKiosk Integration Test
```bash
# Test WebKiosk connectivity
curl -X POST http://localhost:3000/api/test/webkiosk \
  -H "Content-Type: application/json" \
  -d '{
    "enrollmentNumber": "20XXJUXXXXXX",
    "password": "password"
  }'
```

### Database Integration Test
```bash
# Test MongoDB connection
curl http://localhost:3000/api/test/database

# Expected Response:
# {
#   "status": "connected",
#   "database": "juet_attendance",
#   "collections": ["users", "attendance"]
# }
```

### End-to-End Testing with Postman

#### Import Postman Collection
```json
{
  "info": {
    "name": "JUET Attendance Buddy API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"enrollmentNumber\": \"{{enrollmentNumber}}\",\n  \"password\": \"{{password}}\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/auth/login",
              "host": ["{{baseUrl}}"],
              "path": ["api", "auth", "login"]
            }
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Login successful\", function () {",
                  "    pm.response.to.have.status(200);",
                  "    const response = pm.response.json();",
                  "    pm.expect(response.success).to.be.true;",
                  "    pm.environment.set(\"authToken\", response.token);",
                  "});"
                ]
              }
            }
          ]
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000"
    }
  ]
}
```

---

## 📊 Test Reports and Monitoring

### Test Coverage Report
```bash
# Generate coverage report
npm run test:coverage

# View coverage report
open coverage/lcov-report/index.html
```

### API Response Time Monitoring
```javascript
// middleware/responseTime.js
const responseTime = require('response-time');

app.use(responseTime((req, res, time) => {
  console.log(`${req.method} ${req.originalUrl} - ${time}ms`);
}));
```

### Health Check for Testing
```bash
# Comprehensive health check
curl http://localhost:3000/api/health/detailed

# Expected Response:
# {
#   "status": "healthy",
#   "checks": {
#     "database": "connected",
#     "webkiosk": "reachable",
#     "memory": "normal",
#     "uptime": "2h 30m"
#   }
# }
```

---

## 🎯 Testing Checklist

### ✅ Manual Testing
- [ ] User can login with valid credentials
- [ ] Invalid credentials are rejected
- [ ] JWT token is properly generated
- [ ] Protected routes require authentication
- [ ] Dashboard returns complete data
- [ ] Attendance data is accurate
- [ ] Academic records are properly formatted
- [ ] Profile information is correct
- [ ] Sync functionality works
- [ ] Error handling works properly

### ✅ Automated Testing
- [ ] Unit tests for all services
- [ ] Integration tests for API endpoints
- [ ] Database connection tests
- [ ] Authentication middleware tests
- [ ] WebKiosk scraper tests
- [ ] Error handling tests
- [ ] Performance benchmarks

### ✅ Performance Testing
- [ ] Load testing completed
- [ ] Memory leaks checked
- [ ] Response times measured
- [ ] Concurrent user handling tested
- [ ] Database query optimization verified

### ✅ Security Testing
- [ ] JWT token validation
- [ ] Password security verified
- [ ] CORS configuration tested
- [ ] Rate limiting functional
- [ ] SQL injection prevention
- [ ] XSS protection verified

---

## 🐛 Common Issues & Solutions

### Authentication Issues
```bash
# Token expired
# Solution: Re-login to get new token

# Invalid credentials
# Solution: Verify WebKiosk credentials work on official site

# Missing Authorization header
# Solution: Include "Authorization: Bearer {token}" in requests
```

### API Response Issues
```bash
# Empty responses
# Check: User has synced data recently

# Slow responses
# Check: Database indexes and WebKiosk connectivity

# Error 500
# Check: Server logs for detailed error information
```

### WebKiosk Integration Issues
```bash
# Connection timeout
# Check: WebKiosk site availability and network connectivity

# Login failed
# Check: Credentials and WebKiosk session management

# Data parsing errors
# Check: WebKiosk HTML structure hasn't changed
```

**Your API is now thoroughly tested and ready for production! 🚀**
