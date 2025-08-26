# JUET Attendance Buddy - API Documentation

## Base URL
```
http://your-server:3000/api
```

## Authentication
All endpoints use JWT token authentication (except login). Include in headers:
```
Authorization: Bearer <jwt_token>
```

---

## 📱 Authentication Endpoints

### 1. WebKiosk Login
**POST** `/auth/webkiosk-login`

**Description:** Login using JUET WebKiosk credentials and get attendance + SGPA data

**Request Body:**
```json
{
  "enrollmentNumber": "221B034",
  "password": "your_password",
  "dateOfBirth": "05-01-2004"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "enrollmentNumber": "221B034",
      "name": "Aditya Vyas",
      "course": "B.T.(CSE)",
      "branch": "CSE",
      "semester": 7
    },
    "attendance": [
      {
        "name": "AD-HOC AND WIRELESS NETWORKS - 18B14CI744",
        "lecturePercentage": 0,
        "tutorialPercentage": 0,
        "practicalPercentage": null,
        "totalPercentage": 0
      },
      {
        "name": "ALGORITHMS ANALYSIS AND DESIGN - 18B14CI844",
        "lecturePercentage": 0,
        "tutorialPercentage": 0,
        "practicalPercentage": null,
        "totalPercentage": 0
      },
      {
        "name": "OPERATIONS RESEARCH - 18B14MA845",
        "lecturePercentage": 66,
        "tutorialPercentage": 66,
        "practicalPercentage": null,
        "totalPercentage": 66
      }
    ],
    "sgpa": [
      {
        "semester": 1,
        "sgpa": 8.5,
        "cgpa": 8.5
      },
      {
        "semester": 2,
        "sgpa": 8.7,
        "cgpa": 8.6
      },
      {
        "semester": 3,
        "sgpa": 9.0,
        "cgpa": 8.73
      }
    ]
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Failed to authenticate with WebKiosk. Please check your credentials."
}
```

---

### 2. Regular Login
**POST** `/auth/login`

**Description:** Login with stored credentials (for returning users)

**Request Body:**
```json
{
  "enrollmentNumber": "221B034",
  "password": "your_password"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "enrollmentNumber": "221B034",
    "name": "Aditya Vyas",
    "course": "B.T.(CSE)",
    "semester": 7
  }
}
```

---

### 3. Register
**POST** `/auth/register`

**Description:** Register new user account

**Request Body:**
```json
{
  "enrollmentNumber": "221B034",
  "password": "your_password",
  "name": "Aditya Vyas",
  "course": "B.T.(CSE)",
  "semester": 7
}
```

---

## 📊 Student Data Endpoints

### 4. Get Student Profile
**GET** `/student/profile`

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "enrollmentNumber": "221B034",
    "name": "Aditya Vyas",
    "course": "B.T.(CSE)",
    "semester": 7,
    "lastSync": "2024-01-15T10:30:00Z"
  }
}
```

---

### 5. Get Attendance Data
**GET** `/student/attendance`

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "subjects": [
      {
        "id": "subject_id_1",
        "name": "AD-HOC AND WIRELESS NETWORKS",
        "code": "18B14CI744",
        "lecturePercentage": 75,
        "tutorialPercentage": 80,
        "practicalPercentage": 70,
        "totalPercentage": 75,
        "requiredClasses": 5,
        "lastUpdated": "2024-01-15T10:30:00Z"
      }
    ],
    "summary": {
      "totalSubjects": 6,
      "averageAttendance": 72.5,
      "criticalSubjects": 2,
      "lastSync": "2024-01-15T10:30:00Z"
    }
  }
}
```

---

### 6. Get SGPA/CGPA Data
**GET** `/student/sgpa`

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "semesters": [
      {
        "semester": 1,
        "sgpa": 8.5,
        "cgpa": 8.5,
        "credits": 22,
        "subjects": [
          {
            "name": "Mathematics I",
            "code": "MATH101",
            "credits": 4,
            "grade": "A",
            "gradePoints": 9
          }
        ]
      }
    ],
    "overall": {
      "currentCGPA": 8.73,
      "totalCredits": 132,
      "totalSemesters": 6
    }
  }
}
```

---

### 7. Sync Latest Data
**POST** `/student/sync`

**Description:** Force sync with WebKiosk to get latest data

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "syncType": "full" // or "attendance_only", "sgpa_only"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Data synced successfully",
  "data": {
    "syncedAt": "2024-01-15T10:30:00Z",
    "attendanceUpdated": true,
    "sgpaUpdated": true,
    "newSubjects": 0
  }
}
```

---

## 🔔 Notification Endpoints

### 8. Get Notifications
**GET** `/student/notifications`

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "notif_1",
      "type": "attendance_warning",
      "title": "Low Attendance Alert",
      "message": "Your attendance in Mathematics III is below 75%",
      "subject": "Mathematics III",
      "percentage": 68,
      "createdAt": "2024-01-15T10:30:00Z",
      "read": false
    }
  ]
}
```

---

### 9. Mark Notification as Read
**PUT** `/student/notifications/:id/read`

**Headers:** `Authorization: Bearer <token>`

---

## 📈 Analytics Endpoints

### 10. Get Attendance Analytics
**GET** `/student/analytics/attendance`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `period` (optional): "week", "month", "semester" (default: "semester")

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "trends": [
      {
        "subject": "Mathematics III",
        "weeklyData": [75, 76, 74, 73, 72],
        "trend": "decreasing",
        "projectedAttendance": 70
      }
    ],
    "summary": {
      "improvingSubjects": 2,
      "decliningSubjects": 3,
      "stableSubjects": 1
    }
  }
}
```

---

### 11. Get SGPA Analytics
**GET** `/student/analytics/sgpa`

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "semesterWise": [
      {
        "semester": 1,
        "sgpa": 8.5,
        "improvement": null
      },
      {
        "semester": 2,
        "sgpa": 8.7,
        "improvement": "+0.2"
      }
    ],
    "predictions": {
      "nextSemesterProjection": 8.8,
      "graduationCGPA": 8.75
    }
  }
}
```

---

## ⚙️ Settings Endpoints

### 12. Update User Settings
**PUT** `/student/settings`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "notifications": {
    "attendanceAlerts": true,
    "sgpaUpdates": true,
    "threshold": 75
  },
  "autoSync": {
    "enabled": true,
    "frequency": "daily" // "hourly", "daily", "weekly"
  }
}
```

---

### 13. Get User Settings
**GET** `/student/settings`

**Headers:** `Authorization: Bearer <token>`

---

## 🏥 Health Check

### 14. Server Health
**GET** `/health`

**Success Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 86400,
  "environment": "production"
}
```

---

## 📱 Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Invalid or missing token |
| 403 | Forbidden | Access denied |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | WebKiosk unavailable |

---

## 📱 Kotlin/Android Implementation Notes

### Dependencies to Add:
```gradle
implementation 'com.squareup.retrofit2:retrofit:2.9.0'
implementation 'com.squareup.retrofit2:converter-gson:2.9.0'
implementation 'com.squareup.okhttp3:logging-interceptor:4.9.3'
implementation 'androidx.lifecycle:lifecycle-viewmodel-ktx:2.6.2'
implementation 'androidx.lifecycle:lifecycle-livedata-ktx:2.6.2'
```

### Key Implementation Points:
1. **JWT Token Storage**: Store JWT token securely using `SharedPreferences` or `DataStore`
2. **Auto-Refresh**: Implement token refresh mechanism
3. **Offline Support**: Cache attendance/SGPA data locally using Room database
4. **Background Sync**: Use WorkManager for periodic data sync
5. **Push Notifications**: Implement FCM for attendance alerts
6. **Biometric Auth**: Add fingerprint/face unlock for app security

### Sample Retrofit Interface:
```kotlin
interface JuetApiService {
    @POST("auth/webkiosk-login")
    suspend fun loginWithWebKiosk(@Body request: WebKioskLoginRequest): Response<LoginResponse>
    
    @GET("student/attendance")
    suspend fun getAttendance(@Header("Authorization") token: String): Response<AttendanceResponse>
    
    @GET("student/sgpa")
    suspend fun getSgpa(@Header("Authorization") token: String): Response<SgpaResponse>
}
```

### Data Models:
```kotlin
data class LoginResponse(
    val success: Boolean,
    val data: UserData,
    val message: String?
)

data class UserData(
    val token: String,
    val user: User,
    val attendance: List<Subject>,
    val sgpa: List<SemesterData>
)
```
