# 🧪 WEBKIOSK LOGIN TEST

## Testing with Real Credentials:
- **Enrollment**: 221b034
- **Password**: Holameadi@1  
- **DOB**: 05-01-2004 (formatted as dd-mm-yyyy)

## Test API Endpoint:
```bash
POST https://juet-attendance-buddy.onrender.com/api/auth/webkiosk-login
```

## Test Payload:
```json
{
  "enrollmentNumber": "221b034",
  "password": "Holameadi@1",
  "dateOfBirth": "05-01-2004"
}
```

## Expected Flow:
1. ✅ Navigate to WebKiosk login page
2. ✅ Select "Student" from UserType dropdown
3. ✅ Fill MemberCode: 221b034
4. ✅ Fill Password: Holameadi@1
5. ✅ Fill DATE1: 05-01-2004
6. ✅ Extract captcha from .noselect element
7. ✅ Fill txtcap with captcha text
8. ✅ Submit form via BTNSubmit
9. ✅ Check if redirected away from UserAction.jsp
10. ✅ Return success/failure

## Testing Results:
Will be updated after test...
