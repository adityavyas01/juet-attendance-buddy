# 🎓 JUET Attendance Buddy - Backend API

A comprehensive Node.js backend API for JUET students to track attendance and SGPA data by integrating with the official WebKiosk system.

## 📋 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [API Documentation](#-api-documentation)
- [Architecture](#-architecture)
- [WebKiosk Integration](#-webkiosk-integration)
- [Database Schema](#-database-schema)
- [Security Features](#-security-features)
- [Mobile App Development](#-mobile-app-development)
- [Deployment](#-deployment)

---

## 🚀 Features

### Core Functionality
- **Real WebKiosk Integration**: Direct scraping from https://webkiosk.juet.ac.in/
- **JWT Authentication**: Secure token-based authentication
- **Attendance Tracking**: Real-time attendance data from all subjects
- **SGPA/CGPA Analytics**: Semester-wise grade tracking and analytics
- **Auto-Sync**: Background synchronization with WebKiosk
- **Push Notifications**: Attendance alerts and grade updates
- **Offline Support**: Cached data for offline access

### Advanced Features
- **Attendance Predictions**: ML-based attendance forecasting
- **Grade Analytics**: Trend analysis and improvement suggestions
- **Multi-semester Support**: Complete academic history tracking
- **Real-time Alerts**: Low attendance and grade drop notifications
- **Data Export**: PDF/Excel export of attendance/grade reports
- **Admin Dashboard**: Batch-wise analytics for administrators

---

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB (Primary) + Redis (Caching)
- **Authentication**: JWT (JSON Web Tokens)
- **Web Scraping**: Puppeteer (Chrome Headless)
- **File Processing**: Multer, Sharp
- **Validation**: Joi
- **Logging**: Winston
- **Testing**: Jest, Supertest

### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Monitoring**: PM2
- **Security**: Helmet, CORS, Rate Limiting
- **Documentation**: Swagger/OpenAPI

---

## 📦 Installation

### Prerequisites
```bash
- Node.js 18+ 
- MongoDB 4.4+
- Redis 6.0+
- Git
```

### Local Development Setup
```bash
# 1. Clone repository
git clone https://github.com/adityavyas01/juet-attendance-buddy.git
cd juet-attendance-buddy

# 2. Install dependencies
cd backend
npm install

# 3. Environment setup
cp .env.example .env.development
# Edit .env.development with your configuration

# 4. Start MongoDB and Redis
# Install MongoDB and Redis locally or use Docker:
docker run -d -p 27017:27017 --name mongodb mongo:latest
docker run -d -p 6379:6379 --name redis redis:latest

# 5. Start development server
npm run dev
```

### Docker Setup
```bash
# Run entire stack with Docker Compose
docker-compose up -d

# Check logs
docker-compose logs -f backend
```

---

## 📖 API Documentation

Complete API documentation is available in [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md)

### Quick Start Endpoints:

**🔐 Authentication**
```
POST /api/auth/webkiosk-login    # Login with WebKiosk credentials
POST /api/auth/login             # Regular login
POST /api/auth/register          # User registration
```

**📊 Student Data**
```
GET  /api/student/profile        # User profile
GET  /api/student/attendance     # Attendance data
GET  /api/student/sgpa          # SGPA/CGPA data
POST /api/student/sync          # Force sync with WebKiosk
```

**📱 Mobile Features**
```
GET  /api/student/notifications  # Push notifications
GET  /api/student/analytics     # Data analytics
PUT  /api/student/settings      # App settings
```

---

## 🏗 Architecture

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │   Web App       │    │   Admin Panel   │
│   (Kotlin)      │    │   (React)       │    │   (React)       │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴───────────┐
                    │     Backend API         │
                    │     (Node.js)           │
                    └─────────┬───────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
    ┌─────┴──────┐    ┌───────┴────────┐    ┌────┴─────┐
    │  MongoDB   │    │     Redis      │    │ WebKiosk │
    │ (Primary)  │    │   (Cache)      │    │ (JUET)   │
    └────────────┘    └────────────────┘    └──────────┘
```

### Data Flow
1. **User Login** → JWT Token Generation
2. **WebKiosk Sync** → Puppeteer Scraping → Data Processing → MongoDB Storage
3. **API Requests** → JWT Validation → Data Retrieval → JSON Response
4. **Background Jobs** → Auto-sync → Notifications → Cache Updates

---

## 🌐 WebKiosk Integration

### How It Works
The system integrates with JUET's official WebKiosk portal using automated browser automation:

1. **Login Process**:
   - Navigates to https://webkiosk.juet.ac.in/
   - Handles dynamic CAPTCHA solving
   - Submits enrollment number, DOB, and password
   - Maintains session for data scraping

2. **Data Extraction**:
   - **Attendance Page**: Scrapes subject-wise attendance percentages
   - **SGPA Page**: Extracts semester-wise SGPA and CGPA data
   - **Student Info**: Parses name, course, branch, semester details

3. **Error Handling**:
   - Network timeout management
   - CAPTCHA retry mechanisms
   - Session expiry handling
   - Invalid credential detection

### Sample WebKiosk Response Processing
```javascript
// Raw HTML → Structured Data
const attendanceData = parseAttendanceTable(htmlContent);
// Output: [
//   {
//     name: "ALGORITHMS ANALYSIS AND DESIGN - 18B14CI844",
//     lecturePercentage: 75,
//     tutorialPercentage: 80,
//     totalPercentage: 77
//   }
// ]
```

---

## 🗄 Database Schema

### MongoDB Collections

#### Users Collection
```javascript
{
  _id: ObjectId,
  enrollmentNumber: "221B034",
  password: "hashed_password",
  name: "Aditya Vyas",
  course: "B.T.(CSE)",
  branch: "CSE",
  semester: 7,
  createdAt: Date,
  lastLogin: Date,
  isActive: Boolean
}
```

#### Attendance Collection
```javascript
{
  _id: ObjectId,
  studentId: ObjectId,
  subjects: [
    {
      name: "Subject Name",
      code: "18B14CI844",
      lecturePercentage: 75,
      tutorialPercentage: 80,
      practicalPercentage: 70,
      totalPercentage: 75,
      lastUpdated: Date
    }
  ],
  semester: 7,
  academicYear: "2024-25",
  lastSync: Date
}
```

#### SGPA Collection
```javascript
{
  _id: ObjectId,
  studentId: ObjectId,
  semesters: [
    {
      semester: 1,
      sgpa: 8.5,
      cgpa: 8.5,
      credits: 22,
      subjects: [
        {
          name: "Mathematics I",
          code: "MATH101",
          credits: 4,
          grade: "A",
          gradePoints: 9
        }
      ]
    }
  ],
  lastSync: Date
}
```

---

## 🔒 Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure, stateless authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevents brute force attacks
- **CORS Protection**: Cross-origin request security

### Data Protection
- **Input Validation**: Joi schema validation
- **SQL Injection Prevention**: MongoDB parameterized queries
- **XSS Protection**: Content Security Policy headers
- **Data Encryption**: Sensitive data encryption at rest

### Security Headers
```javascript
// Helmet.js security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));
```

---

## 📱 Mobile App Development Guide

### For Kotlin/Android Developers

#### 1. Project Setup
```gradle
// app/build.gradle
dependencies {
    // Networking
    implementation 'com.squareup.retrofit2:retrofit:2.9.0'
    implementation 'com.squareup.retrofit2:converter-gson:2.9.0'
    implementation 'com.squareup.okhttp3:logging-interceptor:4.9.3'
    
    // Architecture
    implementation 'androidx.lifecycle:lifecycle-viewmodel-ktx:2.6.2'
    implementation 'androidx.lifecycle:lifecycle-livedata-ktx:2.6.2'
    implementation 'androidx.navigation:navigation-fragment-ktx:2.5.3'
    
    // Database
    implementation 'androidx.room:room-runtime:2.4.3'
    implementation 'androidx.room:room-ktx:2.4.3'
    kapt 'androidx.room:room-compiler:2.4.3'
    
    // Authentication
    implementation 'androidx.security:security-crypto:1.1.0-alpha06'
    implementation 'androidx.biometric:biometric:1.1.0'
    
    // UI
    implementation 'com.google.android.material:material:1.9.0'
    implementation 'androidx.compose.ui:ui:1.4.3'
    implementation 'com.github.PhilJay:MPAndroidChart:v3.1.0'
}
```

#### 2. Network Layer Setup
```kotlin
// ApiService.kt
interface JuetApiService {
    @POST("auth/webkiosk-login")
    suspend fun loginWithWebKiosk(
        @Body request: WebKioskLoginRequest
    ): Response<LoginResponse>
    
    @GET("student/attendance")
    suspend fun getAttendance(
        @Header("Authorization") token: String
    ): Response<AttendanceResponse>
    
    @GET("student/sgpa")
    suspend fun getSgpa(
        @Header("Authorization") token: String
    ): Response<SgpaResponse>
    
    @POST("student/sync")
    suspend fun syncData(
        @Header("Authorization") token: String,
        @Body syncRequest: SyncRequest
    ): Response<SyncResponse>
}

// NetworkModule.kt
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    
    @Provides
    @Singleton
    fun provideOkHttpClient(): OkHttpClient {
        return OkHttpClient.Builder()
            .addInterceptor(AuthInterceptor())
            .addInterceptor(HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            })
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build()
    }
    
    @Provides
    @Singleton
    fun provideRetrofit(okHttpClient: OkHttpClient): Retrofit {
        return Retrofit.Builder()
            .baseUrl("http://your-server:3000/api/")
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
    
    @Provides
    @Singleton
    fun provideApiService(retrofit: Retrofit): JuetApiService {
        return retrofit.create(JuetApiService::class.java)
    }
}
```

#### 3. Data Models
```kotlin
// LoginRequest.kt
data class WebKioskLoginRequest(
    val enrollmentNumber: String,
    val password: String,
    val dateOfBirth: String  // Format: DD-MM-YYYY
)

// LoginResponse.kt
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

data class User(
    val enrollmentNumber: String,
    val name: String,
    val course: String,
    val branch: String,
    val semester: Int
)

data class Subject(
    val name: String,
    val lecturePercentage: Int,
    val tutorialPercentage: Int,
    val practicalPercentage: Int?,
    val totalPercentage: Int
)

data class SemesterData(
    val semester: Int,
    val sgpa: Double,
    val cgpa: Double
)
```

### App Architecture Recommendations

#### 1. Project Structure
```
app/
├── src/main/java/com/juet/attendance/
│   ├── data/
│   │   ├── local/          # Room database, DAOs
│   │   ├── remote/         # API services, DTOs
│   │   └── repository/     # Repository implementations
│   ├── domain/
│   │   ├── model/          # Domain models
│   │   ├── repository/     # Repository interfaces
│   │   └── usecase/        # Business logic
│   ├── presentation/
│   │   ├── ui/
│   │   │   ├── login/      # Login screen
│   │   │   ├── attendance/ # Attendance screens
│   │   │   ├── sgpa/       # SGPA screens
│   │   │   └── profile/    # Profile screens
│   │   └── viewmodel/      # ViewModels
│   ├── di/                 # Dependency injection
│   └── utils/              # Utility classes
```

#### 2. Recommended Features

##### Core Features
- ✅ WebKiosk Login Integration
- ✅ Real-time Attendance Tracking
- ✅ SGPA/CGPA Analytics
- ✅ Offline Data Caching
- ✅ Push Notifications
- ✅ Biometric Authentication

##### Advanced Features
- 📊 **Attendance Predictions**: ML-based attendance forecasting
- 📈 **Grade Analytics**: Trend analysis and improvement suggestions
- 🎯 **Goal Setting**: Set and track attendance/grade targets
- 📱 **Widget Support**: Home screen widgets for quick stats
- 🌙 **Dark Mode**: Light/dark theme support
- 🔄 **Auto-sync**: Background synchronization
- 📤 **Data Export**: PDF/Excel export functionality
- 👥 **Peer Comparison**: Anonymous class average comparison

---

## 🚀 Deployment

### Production Environment Setup

#### 1. Docker Deployment
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  backend:
    build: 
      context: ./backend
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
      - MONGODB_URI=${MONGODB_URI}
      - REDIS_URL=${REDIS_URL}
    ports:
      - "3000:3000"
    depends_on:
      - mongodb
      - redis
    restart: unless-stopped

  mongodb:
    image: mongo:5.0
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_USERNAME}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_PASSWORD}
    volumes:
      - mongodb_data:/data/db
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  mongodb_data:
  redis_data:
```

#### 2. Environment Variables
```bash
# .env.production
NODE_ENV=production
PORT=3000

# Database
MONGODB_URI=mongodb://username:password@mongodb:27017/juet_attendance
REDIS_URL=redis://redis:6379

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# WebKiosk
WEBKIOSK_BASE_URL=https://webkiosk.juet.ac.in
WEBKIOSK_TIMEOUT=30000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Monitoring
LOG_LEVEL=info
```

#### 3. CI/CD Pipeline (GitHub Actions)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd backend && npm ci
      - name: Run tests
        run: cd backend && npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.4
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/juet-attendance-buddy
            git pull origin main
            docker-compose -f docker-compose.prod.yml up -d --build
```

---

## 📞 Support & Contributing

### Contact Information
- **Developer**: Aditya Vyas
- **Email**: adityavyas01@example.com
- **GitHub**: [@adityavyas01](https://github.com/adityavyas01)
- **Project Repository**: [juet-attendance-buddy](https://github.com/adityavyas01/juet-attendance-buddy)

### Contributing Guidelines
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Issue Reporting
Please use GitHub Issues for bug reports and feature requests. Include:
- Device/OS information
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **JUET University** for providing the WebKiosk system
- **Open Source Community** for amazing libraries and tools
- **Beta Testers** from JUET student community

---

**Made with ❤️ for JUET Students by JUET Students**
