# 📁 Project Structure Documentation

## 🏗️ Complete Directory Structure

```
juet-attendance-buddy/
├── 📄 README.md                           # Main project documentation
├── 📄 API_DOCUMENTATION.md                # Complete API reference
├── 📄 API_ENDPOINTS_FOR_FRONTEND.md       # Frontend-specific API guide
├── 📄 DEPLOYMENT.md                       # Production deployment guide
├── 📄 SETUP_GUIDE.md                      # Development setup guide
├── 📄 test-login.json                     # Sample test credentials
├── 📄 test-api.ps1                        # PowerShell API testing script
├── 📄 railway-env-vars.txt                # Environment variables reference
│
└── backend/                               # 🎯 Main Backend Application
    ├── 📄 package.json                    # Dependencies and scripts
    ├── 📄 tsconfig.json                   # TypeScript configuration
    ├── 📄 .env                           # Environment variables
    ├── 📄 .env.example                   # Environment template
    ├── 📄 login-response.json            # Sample API response
    ├── 📄 new-login.json                 # Test response data
    │
    ├── 📁 src/                           # 🚀 Source Code
    │   ├── 📄 server.ts                  # Main Express server
    │   ├── 📄 simple-server.ts           # Lightweight test server
    │   │
    │   ├── 📁 config/                    # ⚙️ Configuration
    │   │   ├── 📄 database.ts            # MongoDB connection setup
    │   │   └── 📄 redis.ts               # Redis cache configuration
    │   │
    │   ├── 📁 middleware/                # 🛡️ Express Middleware
    │   │   ├── 📄 auth.ts                # JWT authentication
    │   │   └── 📄 errorHandler.ts        # Global error handling
    │   │
    │   ├── 📁 models/                    # 🗄️ Database Models
    │   │   ├── 📄 User.ts                # User schema and methods
    │   │   └── 📄 Attendance.ts          # Attendance data schema
    │   │
    │   ├── 📁 routes/                    # 🛣️ API Routes
    │   │   ├── 📄 auth.ts                # Authentication endpoints
    │   │   ├── 📄 authSimple.ts          # Simplified auth routes
    │   │   ├── 📄 student.ts             # Student data endpoints
    │   │   ├── 📄 admin.ts               # Admin panel routes
    │   │   └── 📄 sync.ts                # Data synchronization
    │   │
    │   ├── 📁 services/                  # 🔧 Business Logic
    │   │   ├── 📄 webkioskScraper.ts     # WebKiosk integration
    │   │   └── 📄 backgroundJobs.ts      # Scheduled tasks
    │   │
    │   ├── 📁 types/                     # 📝 TypeScript Types
    │   │   └── 📄 index.ts               # Shared type definitions
    │   │
    │   └── 📁 utils/                     # 🛠️ Utilities
    │       └── 📄 logger.ts              # Winston logging setup
    │
    ├── 📁 logs/                          # 📋 Application Logs
    │   ├── 📄 combined.log               # All logs combined
    │   └── 📄 error.log                  # Error logs only
    │
    └── 📁 node_modules/                  # 📦 Dependencies (auto-generated)
```

## 📂 Key Directories Explained

### 🎯 `/backend/src/` - Core Application
The main source code directory containing all TypeScript files.

#### 🛣️ `/routes/` - API Endpoints
- **`auth.ts`** - Authentication routes (login, register, profile)
- **`student.ts`** - Student-specific endpoints (attendance, academics, profile)
- **`admin.ts`** - Administrative functions
- **`sync.ts`** - Data synchronization endpoints

#### 🔧 `/services/` - Business Logic
- **`webkioskScraper.ts`** - Core WebKiosk integration using Puppeteer
- **`backgroundJobs.ts`** - Scheduled tasks and automated sync

#### 🗄️ `/models/` - Data Models
- **`User.ts`** - User account and profile management
- **`Attendance.ts`** - Attendance tracking and calculations

#### 🛡️ `/middleware/` - Express Middleware
- **`auth.ts`** - JWT token validation and user authentication
- **`errorHandler.ts`** - Centralized error handling and logging

#### ⚙️ `/config/` - Configuration
- **`database.ts`** - MongoDB connection and configuration
- **`redis.ts`** - Redis cache setup (optional for development)

#### 📝 `/types/` - TypeScript Definitions
- **`index.ts`** - Shared interfaces and type definitions

#### 🛠️ `/utils/` - Utility Functions
- **`logger.ts`** - Winston-based logging configuration

### 📄 Root Configuration Files

#### 📦 `package.json`
```json
{
  "name": "juet-attendance-backend",
  "version": "1.0.0",
  "main": "src/server.ts",
  "scripts": {
    "start": "npx tsx src/server.ts",
    "dev": "nodemon --exec npx tsx src/server.ts",
    "build": "tsc",
    "test": "jest"
  }
}
```

#### ⚙️ `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

#### 🔐 `.env` (Environment Variables)
```bash
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/juet_attendance
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# WebKiosk
WEBKIOSK_BASE_URL=https://webkiosk.juet.ac.in
WEBKIOSK_TIMEOUT=30000
```

## 🗂️ File Responsibilities

### 🚀 Main Server Files
| File | Purpose | Key Features |
|------|---------|--------------|
| `server.ts` | Main Express server | Full production server with all middleware |
| `simple-server.ts` | Lightweight test server | Minimal setup for testing |

### 🛣️ Route Files
| File | Endpoints | Purpose |
|------|-----------|---------|
| `auth.ts` | `/auth/*` | Login, registration, profile management |
| `student.ts` | `/student/*` | Attendance, academics, dashboard data |
| `admin.ts` | `/admin/*` | Administrative functions |
| `sync.ts` | `/sync/*` | Data synchronization with WebKiosk |

### 🔧 Service Files
| File | Purpose | Technologies |
|------|---------|-------------|
| `webkioskScraper.ts` | WebKiosk integration | Puppeteer, Chrome headless |
| `backgroundJobs.ts` | Scheduled tasks | Node-cron, automatic sync |

### 🗄️ Model Files
| File | Purpose | Schema |
|------|---------|--------|
| `User.ts` | User management | MongoDB, Mongoose |
| `Attendance.ts` | Attendance tracking | Subject-wise data |

### 🛡️ Middleware Files
| File | Purpose | Features |
|------|---------|----------|
| `auth.ts` | Authentication | JWT validation, user context |
| `errorHandler.ts` | Error handling | Global error catching, logging |

### ⚙️ Configuration Files
| File | Purpose | Configuration |
|------|---------|---------------|
| `database.ts` | Database setup | MongoDB connection, options |
| `redis.ts` | Cache setup | Redis configuration |

### 📝 Type Files
| File | Purpose | Definitions |
|------|---------|-------------|
| `types/index.ts` | Type definitions | Interfaces, API responses |

### 🛠️ Utility Files
| File | Purpose | Features |
|------|---------|----------|
| `logger.ts` | Logging | Winston, file/console output |

## 📊 Data Flow Architecture

```
📱 Mobile App
    ↓ HTTP Requests
🛣️ Express Routes (auth.ts, student.ts)
    ↓ Middleware
🛡️ Authentication (auth.ts)
    ↓ Business Logic
🔧 Services (webkioskScraper.ts)
    ↓ Data Storage
🗄️ Models (User.ts, Attendance.ts)
    ↓ Database
💾 MongoDB / Redis Cache
```

## 🔧 Development Workflow

### 1. **Setup Environment**
```bash
cd backend
npm install
cp .env.example .env
```

### 2. **Start Development**
```bash
npm run dev          # Start with nodemon
npm start           # Start production mode
```

### 3. **Test API**
```bash
# Use test credentials
curl -X POST http://localhost:3000/api/auth/webkiosk-login \
  -d @test-login.json
```

### 4. **Monitor Logs**
```bash
tail -f logs/combined.log    # All logs
tail -f logs/error.log       # Error logs only
```

## 📈 Scalability Structure

### 🔄 Horizontal Scaling
- **Load Balancer** → Multiple server instances
- **Database Clustering** → MongoDB replica sets
- **Cache Layer** → Redis for session management

### 📊 Monitoring & Logging
- **Winston Logging** → File and console output
- **Error Tracking** → Centralized error handling
- **Performance Metrics** → Request timing and statistics

### 🛡️ Security Layers
- **JWT Authentication** → Stateless token validation
- **Input Validation** → Request sanitization
- **Rate Limiting** → DDoS protection
- **CORS Configuration** → Cross-origin security

This structure provides a solid foundation for building a production-ready JUET Attendance Buddy backend! 🚀
