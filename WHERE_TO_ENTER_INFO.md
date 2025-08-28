# 🎯 Where to Enter Your Information - Quick Reference

## ✅ ALREADY CONFIGURED (No action needed):

### 🔐 Security Keys (Generated & Set):
- ✅ **JWT_SECRET**: Auto-generated secure key
- ✅ **ENCRYPTION_KEY**: Auto-generated 32-character key for password encryption
- ✅ **Server**: Running successfully on port 3000

---

## 🔧 YOU NEED TO CONFIGURE:

### 1. 🗄️ Database Connection
**File:** `backend/.env`
**Line:** `MONGODB_URI=mongodb://localhost:27017/juet_attendance`

**Options:**
- **Local MongoDB**: Keep as is (install MongoDB locally)
- **Cloud MongoDB**: Replace with your Atlas connection string

**How to get MongoDB Atlas URI:**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create free account → Create cluster
3. Get connection string → Replace the line above

---

### 2. 👥 Students Enter Their WebKiosk Credentials:

**Method 1 - During App Registration:**
Students register with their WebKiosk credentials through the app:
```
POST /api/auth/register
{
  "username": "student_app_username",
  "password": "student_app_password", 
  "webkioskUsername": "their_webkiosk_username",
  "webkioskPassword": "their_webkiosk_password",
  "email": "student@email.com",
  "studentId": "20XXXXX"
}
```

**Method 2 - During Login (Auto-save):**
Students login and enable auto-login:
```
POST /api/auth/login
{
  "username": "student_username",
  "password": "student_password",
  "storeCredentials": true  // This saves WebKiosk creds
}
```

---

### 3. 👨‍💼 Admin Account Setup:

**Current Admin (from .env file):**
- Username: `admin`
- Password: `admin123`
- Email: `admin@juet.ac.in`

**To change admin credentials:**
**File:** `backend/.env`
```env
ADMIN_USERNAME=your_new_admin_username
ADMIN_PASSWORD=your_new_admin_password
ADMIN_EMAIL=your_admin_email@juet.ac.in
```

---

### 4. 🌐 Frontend/Mobile App Connection:

**If you have a frontend app, update the API URL:**

**React/Next.js (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

**Mobile App (config file):**
```javascript
const API_BASE_URL = 'http://localhost:3000/api';
```

---

### 5. 🚀 Production Deployment:

**For production, update these in `backend/.env`:**
```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
CORS_ORIGIN=https://your-frontend-domain.com
```

---

## 🏃‍♂️ HOW TO START:

### Start the Backend:
```bash
cd backend
npm install
npm run dev
```

### Test if Everything Works:
```bash
# Check server health
curl http://localhost:3000/api/health

# Test student registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_student",
    "password": "test123",
    "email": "test@student.com",
    "studentId": "20XXXXX",
    "branch": "CSE"
  }'
```

---

## 📱 FOR STUDENTS USING THE APP:

Students will enter their information through:

1. **App Registration**: WebKiosk username/password during signup
2. **Login Screen**: Enable "Remember me" to store credentials securely
3. **Settings**: Update WebKiosk credentials if they change

**All student credentials are encrypted with AES-256 before storage!**

---

## 🆘 Need Help?

1. **Server won't start**: Check MongoDB is running
2. **WebKiosk login fails**: Verify student credentials
3. **Database errors**: Check MONGODB_URI in .env
4. **CORS errors**: Add your frontend URL to CORS_ORIGIN

---

## 📊 Current Status:

✅ **Server**: Running on http://localhost:3000  
✅ **Database**: Connected to MongoDB  
✅ **Security**: Encryption keys generated  
✅ **WebKiosk**: Integration enabled  
✅ **Logging**: Active (check backend/logs/)  

**🎉 Your system is ready! Students can now register and use the app.**
