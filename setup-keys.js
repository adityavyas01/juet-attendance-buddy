#!/usr/bin/env node

/**
 * 🔑 JUET Attendance Buddy - Environment Setup
 * 
 * This script generates secure keys and creates your .env file
 * Run with: node setup-keys.js
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('🔐 JUET Attendance Buddy - Environment Setup');
console.log('==========================================\n');

// Generate secure keys
const jwtSecret = crypto.randomBytes(64).toString('hex');
const encryptionKey = crypto.randomBytes(16).toString('hex'); // 32 characters for AES-256

console.log('✅ Generated secure keys:');
console.log(`JWT_SECRET: ${jwtSecret}`);
console.log(`ENCRYPTION_KEY: ${encryptionKey}`);
console.log('');

// Create .env content
const envContent = `# ===========================================
# 🔑 AUTHENTICATION & SECURITY
# ===========================================
JWT_SECRET=${jwtSecret}
ENCRYPTION_KEY=${encryptionKey}

# ===========================================
# 🗄️ DATABASE CONNECTION
# ===========================================
# Option A: Local MongoDB
MONGODB_URI=mongodb://localhost:27017/juet-attendance

# Option B: MongoDB Atlas (Cloud) - Replace with your connection string
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/juet-attendance?retryWrites=true&w=majority

# ===========================================
# 📡 SERVER CONFIGURATION
# ===========================================
PORT=3000
NODE_ENV=development

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
`;

// Write to backend/.env
const backendDir = path.join(__dirname, 'backend');
const envPath = path.join(backendDir, '.env');

try {
    if (!fs.existsSync(backendDir)) {
        console.log('❌ Backend directory not found. Make sure you run this from the project root.');
        process.exit(1);
    }

    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env file at: backend/.env');
    console.log('');
    console.log('🎯 Next steps:');
    console.log('1. Update MONGODB_URI if using MongoDB Atlas');
    console.log('2. Run: cd backend && npm install');
    console.log('3. Run: npm run dev');
    console.log('');
    console.log('🔒 Your keys are securely generated and ready to use!');
    
} catch (error) {
    console.error('❌ Error creating .env file:', error.message);
    console.log('');
    console.log('📝 Manual setup:');
    console.log('Create backend/.env with the following content:');
    console.log('');
    console.log(envContent);
}
