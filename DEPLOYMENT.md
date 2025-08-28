# 🚀 JUET Attendance Buddy - Deployment Guide

## 📋 Table of Contents
- [🏗️ Prerequisites](#️-prerequisites)
- [🐳 Docker Deployment](#-docker-deployment)
- [☁️ Cloud Deployment](#️-cloud-deployment)
- [🔧 Environment Configuration](#-environment-configuration)
- [📊 Monitoring & Logs](#-monitoring--logs)
- [🔒 Security Setup](#-security-setup)
- [🔄 CI/CD Pipeline](#-cicd-pipeline)

---

## 🏗️ Prerequisites

### System Requirements
```bash
# Minimum Requirements
- CPU: 1 vCPU
- RAM: 512 MB
- Storage: 10 GB
- OS: Ubuntu 20.04+ / CentOS 7+ / Windows Server

# Recommended for Production
- CPU: 2+ vCPUs
- RAM: 2+ GB
- Storage: 50+ GB SSD
- Load Balancer: nginx/Apache
```

### Software Dependencies
```bash
# Required
- Node.js 18+
- MongoDB 4.4+
- Git

# Optional (for enhanced features)
- Redis 6.0+
- Docker & Docker Compose
- nginx (reverse proxy)
- PM2 (process manager)
```

---

## 🐳 Docker Deployment

### Quick Docker Setup
```bash
# 1. Clone repository
git clone https://github.com/adityavyas01/juet-attendance-buddy.git
cd juet-attendance-buddy

# 2. Create production environment file
cp backend/.env.example backend/.env.production
# Edit .env.production with your settings

# 3. Build and run with Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# 4. Check logs
docker-compose logs -f backend
```

### Docker Compose Configuration
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  backend:
    build: 
      context: ./backend
      dockerfile: Dockerfile.prod
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - MONGODB_URI=mongodb://mongodb:27017/juet_attendance
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongodb
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs

  mongodb:
    image: mongo:5.0
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USERNAME}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
    volumes:
      - mongodb_data:/data/db
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
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
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  mongodb_data:
  redis_data:
```

### Dockerfile for Production
```dockerfile
# backend/Dockerfile.prod
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start application
CMD ["npm", "start"]
```

---

## ☁️ Cloud Deployment

### 🌟 Railway.app (Recommended)
```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login to Railway
railway login

# 3. Initialize project
railway init

# 4. Deploy
railway up

# 5. Set environment variables
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=your-secret-key
railway variables set MONGODB_URI=your-mongodb-connection-string
```

### 🌐 Render.com
```yaml
# render.yaml
services:
  - type: web
    name: juet-attendance-backend
    env: node
    plan: starter
    buildCommand: cd backend && npm install && npm run build
    startCommand: cd backend && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
      - key: JWT_SECRET
        generateValue: true
      - key: MONGODB_URI
        fromDatabase:
          name: juet-attendance-db
          property: connectionString

databases:
  - name: juet-attendance-db
    plan: starter
```

### ⚡ Vercel
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/src/server.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/src/server.ts"
    }
  ],
  "env": {
    "NODE_ENV": "production",
    "JWT_SECRET": "@jwt-secret",
    "MONGODB_URI": "@mongodb-uri"
  }
}
```

### 🚀 Heroku
```bash
# 1. Install Heroku CLI
npm install -g heroku

# 2. Login and create app
heroku login
heroku create juet-attendance-buddy

# 3. Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret-key
heroku config:set MONGODB_URI=your-mongodb-uri

# 4. Deploy
git push heroku main

# 5. Scale dynos
heroku ps:scale web=1
```

---

## 🔧 Environment Configuration

### Production Environment Variables
```bash
# .env.production
NODE_ENV=production
PORT=3000

# Database Configuration
MONGODB_URI=mongodb://username:password@host:port/database
REDIS_URL=redis://username:password@host:port

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-key-256-bits
JWT_EXPIRES_IN=7d

# WebKiosk Integration
WEBKIOSK_BASE_URL=https://webkiosk.juet.ac.in
WEBKIOSK_TIMEOUT=30000
WEBKIOSK_RETRY_ATTEMPTS=3

# Security
CORS_ORIGIN=https://your-frontend-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=/var/log/juet-attendance/
LOG_MAX_SIZE=10m
LOG_MAX_FILES=5

# Monitoring
HEALTH_CHECK_INTERVAL=30000
METRICS_ENABLED=true

# Background Jobs
SYNC_INTERVAL=3600000
CLEANUP_INTERVAL=86400000
```

### Database Configuration
```javascript
// Production MongoDB setup
const mongoConfig = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
  retryWrites: true,
  writeConcern: {
    w: 'majority',
    j: true,
    wtimeout: 1000
  }
};
```

---

## 📊 Monitoring & Logs

### Winston Logging Configuration
```javascript
// Production logging setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 10485760,
      maxFiles: 10
    })
  ]
});
```

### Health Check Endpoint
```javascript
// Health monitoring
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version,
    environment: process.env.NODE_ENV
  });
});
```

### PM2 Configuration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'juet-attendance-backend',
    script: 'dist/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: 'logs/pm2-error.log',
    out_file: 'logs/pm2-out.log',
    log_file: 'logs/pm2-combined.log',
    time: true,
    watch: false,
    max_memory_restart: '500M',
    restart_delay: 4000
  }]
};
```

---

## 🔒 Security Setup

### nginx Configuration
```nginx
# /etc/nginx/sites-available/juet-attendance
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self'" always;
}
```

### SSL Certificate Setup
```bash
# Using Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
sudo certbot renew --dry-run
```

### Firewall Configuration
```bash
# UFW setup
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp  # Only if direct access needed
sudo ufw status
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
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
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json
      
      - name: Install dependencies
        run: cd backend && npm ci
      
      - name: Run linting
        run: cd backend && npm run lint
      
      - name: Run tests
        run: cd backend && npm test
        env:
          NODE_ENV: test
          JWT_SECRET: test-secret
      
      - name: Build application
        run: cd backend && npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Railway
        uses: railway-org/railway-action@v1
        with:
          api-token: ${{ secrets.RAILWAY_TOKEN }}
          command: up
      
      - name: Health Check
        run: |
          sleep 30
          curl -f ${{ secrets.DEPLOYMENT_URL }}/health || exit 1
      
      - name: Notify Deployment
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: '#deployments'
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### Deployment Scripts
```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Starting deployment..."

# Pull latest code
git pull origin main

# Install dependencies
cd backend
npm ci --only=production

# Build application
npm run build

# Restart PM2
pm2 reload ecosystem.config.js

# Health check
sleep 5
curl -f http://localhost:3000/health || exit 1

echo "✅ Deployment completed successfully!"
```

### Environment Management
```bash
# Production secrets management
export JWT_SECRET=$(openssl rand -base64 32)
export MONGODB_PASSWORD=$(openssl rand -base64 24)
export REDIS_PASSWORD=$(openssl rand -base64 16)

# Store in secure environment
echo "JWT_SECRET=$JWT_SECRET" >> .env.production
echo "MONGODB_PASSWORD=$MONGODB_PASSWORD" >> .env.production
echo "REDIS_PASSWORD=$REDIS_PASSWORD" >> .env.production
```

---

## 📈 Performance Optimization

### Database Indexing
```javascript
// MongoDB indexes for performance
db.users.createIndex({ enrollmentNumber: 1 }, { unique: true });
db.attendance.createIndex({ studentId: 1, semester: 1 });
db.attendance.createIndex({ lastUpdated: -1 });
```

### Caching Strategy
```javascript
// Redis caching
const cacheConfig = {
  attendance: 3600,      // 1 hour
  sgpa: 7200,           // 2 hours
  profile: 1800,        // 30 minutes
  dashboard: 600        // 10 minutes
};
```

### Rate Limiting
```javascript
// Production rate limiting
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', apiLimiter);
```

---

## 🎯 Deployment Checklist

### ✅ Pre-Deployment
- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] SSL certificates installed
- [ ] Security headers configured
- [ ] Monitoring setup complete
- [ ] Backup strategy implemented

### ✅ Post-Deployment
- [ ] Health check endpoint responding
- [ ] API endpoints functional
- [ ] WebKiosk integration working
- [ ] Logs being generated
- [ ] Performance metrics collected
- [ ] Error tracking active

### ✅ Ongoing Maintenance
- [ ] Regular security updates
- [ ] Database backups scheduled
- [ ] Log rotation configured
- [ ] Performance monitoring
- [ ] SSL certificate renewal
- [ ] Dependency updates

---

## 🆘 Troubleshooting

### Common Issues
```bash
# Port already in use
lsof -ti:3000 | xargs kill -9

# MongoDB connection issues
mongosh mongodb://localhost:27017/
db.adminCommand("ping")

# PM2 issues
pm2 logs
pm2 restart all
pm2 delete all && pm2 start ecosystem.config.js

# nginx issues
sudo nginx -t
sudo systemctl reload nginx
sudo tail -f /var/log/nginx/error.log
```

### Performance Issues
```bash
# Memory usage
free -h
top -p $(pgrep node)

# Database performance
db.currentOp()
db.serverStatus()

# Network connectivity
curl -I https://webkiosk.juet.ac.in/
ping webkiosk.juet.ac.in
```

**Your JUET Attendance Buddy backend is now production-ready! 🚀**
