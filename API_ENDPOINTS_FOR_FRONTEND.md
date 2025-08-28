# 📱 JUET Attendance Buddy - Frontend API Endpoints

## 🔐 Authentication
**Base URL:** `http://localhost:3000/api`

All endpoints (except login) require JWT token in headers:
```
Authorization: Bearer <jwt_token>
```

---

## 🚪 Login/Auth Endpoints

### 1. WebKiosk Login (Primary Login)
**POST** `/auth/webkiosk-login`

**Purpose:** Login with JUET WebKiosk credentials and get all initial data

**Request:**
```json
{
  "enrollmentNumber": "221B034",
  "password": "Holameadi@1",
  "dateOfBirth": "05-01-2004"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful - Fetched 6 subjects from WebKiosk",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "enrollmentNumber": "221B034",
      "name": "Aditya Vyas",
      "course": "B.T.(CSE)",
      "branch": "CSE",
      "semester": 7,
      "dateOfBirth": "05-01-2004"
    },
    "attendance": [...], // All subjects attendance
    "sgpa": [...] // All semesters SGPA data
  }
}
```

---

## 👤 Profile Page Endpoints

### 2. Get Student Profile
**GET** `/student/profile`

**Purpose:** Get user profile information for profile page

**Response:**
```json
{
  "success": true,
  "data": {
    "enrollmentNumber": "221B034",
    "name": "Aditya Vyas",
    "course": "B.T.(CSE)",
    "branch": "CSE",
    "semester": 7,
    "lastSync": "2025-08-28T17:46:31.148Z",
    "profilePicture": null
  }
}
```

---

## 📊 Dashboard Page Endpoints

### 3. Get Dashboard Summary
**GET** `/student/dashboard`

**Purpose:** Get overview data for main dashboard page

**Response:**
```json
{
  "success": true,
  "data": {
    "profile": {
      "name": "Aditya Vyas",
      "enrollmentNumber": "221B034",
      "semester": 7,
      "course": "B.T.(CSE)"
    },
    "attendanceSummary": {
      "averageAttendance": 52.33,
      "totalSubjects": 6,
      "criticalSubjects": 2,
      "warningSubjects": 3,
      "goodSubjects": 0
    },
    "academicSummary": {
      "currentCGPA": 8.72,
      "currentSemester": 7,
      "totalCredits": 126,
      "expectedGraduation": "May 2026"
    },
    "recentActivities": [
      {
        "type": "attendance",
        "message": "Attendance updated for Operations Research",
        "time": "2 hours ago"
      }
    ],
    "quickStats": {
      "classesToday": 3,
      "assignmentsPending": 2,
      "upcomingExams": 5,
      "notifications": 1
    },
    "lastSync": "2025-08-28T17:46:31.148Z"
  }
}
```

---

## 📚 Attendance Page Endpoints

### 4. Get All Subjects Attendance
**GET** `/student/attendance`

**Purpose:** Get all subjects attendance for attendance page with subject cards

**Response:**
```json
{
  "success": true,
  "data": {
    "subjects": [
      {
        "subjectId": "18B14CI744",
        "name": "AD-HOC AND WIRELESS NETWORKS",
        "code": "18B14CI744",
        "faculty": "Dr. Faculty Name",
        "attendance": {
          "lectures": { "attended": 42, "total": 80 },
          "tutorials": { "attended": 0, "total": 0 },
          "practicals": { "attended": 0, "total": 0 }
        },
        "percentage": 53,
        "status": "warning",
        "requiredClasses": 18,
        "semester": 7,
        "credits": 3,
        "lastUpdated": "2025-08-28T17:46:31.148Z"
      }
    ],
    "summary": {
      "totalSubjects": 6,
      "averageAttendance": 52.33,
      "criticalSubjects": 2,
      "warningSubjects": 3,
      "goodSubjects": 0,
      "lastSync": "2025-08-28T17:46:31.148Z"
    }
  }
}
```

**Status Values:**
- `"good"`: >= 75% (Green)
- `"warning"`: 60-74% (Yellow/Orange)
- `"critical"`: < 60% (Red)
- `"info"`: Project subjects (Blue)

### 5. Get Individual Subject Details
**GET** `/student/attendance/:subjectId`

**Purpose:** Get detailed view for a single subject (when user taps on subject card)

**Example:** `/student/attendance/18B14CI744`

**Response:**
```json
{
  "success": true,
  "data": {
    "subjectId": "18B14CI744",
    "name": "AD-HOC AND WIRELESS NETWORKS",
    "code": "18B14CI744",
    "faculty": "Dr. Faculty Name",
    "semester": 7,
    "credits": 3,
    "attendance": {
      "lectures": { "attended": 42, "total": 80 },
      "tutorials": { "attended": 0, "total": 0 },
      "practicals": { "attended": 0, "total": 0 }
    },
    "percentage": 53,
    "status": "warning",
    "requiredClasses": 18,
    "weeklyProgress": [
      { "week": 1, "percentage": 80 },
      { "week": 2, "percentage": 75 },
      { "week": 3, "percentage": 70 },
      { "week": 4, "percentage": 65 },
      { "week": 5, "percentage": 60 },
      { "week": 6, "percentage": 55 },
      { "week": 7, "percentage": 53 }
    ],
    "recentClasses": [
      { "date": "2025-08-28", "type": "lecture", "status": "present" },
      { "date": "2025-08-27", "type": "lecture", "status": "absent" },
      { "date": "2025-08-26", "type": "lecture", "status": "present" }
    ],
    "lastUpdated": "2025-08-28T17:46:31.148Z"
  }
}
```

---

## 🎓 Academic/SGPA Page Endpoints

### 6. Get Complete Academic Data
**GET** `/student/academics`

**Purpose:** Get all semesters SGPA/CGPA data for academic page

**Response:**
```json
{
  "success": true,
  "data": {
    "semesters": [
      {
        "semester": 1,
        "sgpa": 8.57,
        "cgpa": 8.57,
        "credits": 19,
        "gradePoints": 163,
        "status": "completed",
        "subjects": [
          {
            "name": "Mathematics I",
            "code": "MATH101",
            "credits": 4,
            "grade": "A",
            "gradePoints": 9
          }
        ],
        "academicYear": "2022-23",
        "publishedDate": "2023-01-15"
      },
      {
        "semester": 7,
        "sgpa": null,
        "cgpa": 8.72,
        "credits": 18,
        "gradePoints": null,
        "status": "ongoing",
        "subjects": [
          {
            "name": "Ad-hoc and Wireless Networks",
            "code": "18B14CI744",
            "credits": 3,
            "grade": null,
            "gradePoints": null
          }
        ],
        "academicYear": "2025-26",
        "publishedDate": null
      }
    ],
    "overall": {
      "currentCGPA": 8.72,
      "totalCredits": 126,
      "totalSemesters": 6,
      "percentage": 87.2,
      "classification": "First Class with Distinction"
    },
    "trends": {
      "cgpaProgress": [8.57, 8.66, 8.84, 8.87, 8.78, 8.72],
      "sgpaProgress": [8.57, 8.75, 9.20, 8.95, 8.65, 8.40],
      "predictions": {
        "expectedCGPA": 8.75,
        "targetCGPA": 9.0,
        "requiredSGPA": 9.5
      }
    },
    "lastUpdated": "2025-08-28T17:46:31.148Z"
  }
}
```

**Semester Status Values:**
- `"completed"`: Semester finished with results
- `"ongoing"`: Current semester
- `"upcoming"`: Future semester

### 7. Get Individual Semester Details
**GET** `/student/academics/:semester`

**Purpose:** Get detailed view for a specific semester (when user taps on semester card)

**Example:** `/student/academics/3`

**Response:**
```json
{
  "success": true,
  "data": {
    "semester": 3,
    "sgpa": 9.20,
    "cgpa": 8.84,
    "credits": 22,
    "gradePoints": 202,
    "status": "completed",
    "subjects": [
      {
        "name": "Mathematics III",
        "code": "MATH201",
        "credits": 4,
        "grade": "A+",
        "gradePoints": 10
      },
      {
        "name": "Object Oriented Programming",
        "code": "CS201",
        "credits": 4,
        "grade": "A+",
        "gradePoints": 10
      }
    ],
    "academicYear": "2023-24",
    "publishedDate": "2024-01-15",
    "examSchedule": null
  }
}
```

---

## 🔄 Data Sync Endpoints

### 8. Force Sync with WebKiosk
**POST** `/student/sync`

**Purpose:** Manually trigger data refresh from WebKiosk

**Request:**
```json
{
  "syncType": "full"
}
```

**Sync Types:**
- `"full"`: Sync both attendance and SGPA
- `"attendance_only"`: Sync only attendance data
- `"sgpa_only"`: Sync only SGPA data

**Response:**
```json
{
  "success": true,
  "message": "Data synced successfully",
  "data": {
    "syncedAt": "2025-08-28T17:46:31.148Z",
    "attendanceUpdated": true,
    "sgpaUpdated": true,
    "newSubjects": 0,
    "changes": [
      {
        "type": "attendance",
        "subject": "Operations Research",
        "old": 70,
        "new": 71
      }
    ]
  }
}
```

---

## 📱 Frontend Implementation Guide

### Page Structure & API Mapping:

1. **🔐 Login Page**
   - Use: `POST /auth/webkiosk-login`
   - Store: JWT token, user data, initial attendance/SGPA
   - Cache: All data locally for offline access

2. **📊 Dashboard Page**
   - Use: `GET /student/dashboard`
   - Show: Quick stats, recent activities, summary cards

3. **📚 Attendance Page**
   - Use: `GET /student/attendance`
   - Show: Subject cards with color-coded status
   - On Card Tap: Navigate to subject detail page

4. **📖 Subject Detail Page**
   - Use: `GET /student/attendance/:subjectId`
   - Show: Detailed attendance, graphs, recent classes

5. **🎓 Academic Page**
   - Use: `GET /student/academics`
   - Show: Semester cards, CGPA trends, overall stats
   - On Semester Tap: Navigate to semester detail page

6. **📋 Semester Detail Page**
   - Use: `GET /student/academics/:semester`
   - Show: Subject grades, semester performance

7. **👤 Profile Page**
   - Use: `GET /student/profile`
   - Show: Personal info, settings, last sync

### Color Coding:
```
🟢 Good (>=75%): #4CAF50
🟡 Warning (60-74%): #FF9800  
🔴 Critical (<60%): #F44336
🔵 Info (Project): #2196F3
```

### Error Handling:
```json
{
  "success": false,
  "message": "Error description",
  "timestamp": "2025-08-28T17:46:31.148Z"
}
```

### HTTP Status Codes:
- `200`: Success
- `400`: Bad Request (validation error)
- `401`: Unauthorized (invalid/expired token)
- `404`: Not Found
- `500`: Server Error

---

## 🚀 Quick Implementation Notes:

1. **Store JWT token** securely after login
2. **Cache data locally** for offline access
3. **Pull-to-refresh** should call sync endpoint
4. **Auto-refresh** dashboard data every few minutes
5. **Show loading states** during API calls
6. **Handle offline mode** with cached data
7. **Color-code attendance** based on percentage
8. **Progress bars/charts** for visual representation

This API structure gives you clean, organized endpoints for each page with proper data separation! 🎯
