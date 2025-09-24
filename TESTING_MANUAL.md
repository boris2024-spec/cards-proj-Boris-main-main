# 🧪 Manual Testing Guide for User Blocking

## 🚀 Quick Start

### 1. Start the app
```bash
# In the project terminal
npm run dev
```

### 2. Open in browser
- Go to `http://localhost:5173`
- Open the login page

## 🔧 Test Scenarios

### Scenario 1: User blocking

1. **Create a test user** (if not present):
   - Go to the registration page
   - Create a user with email: `test@example.com`
   - Password: `Abc123!`

2. **Test failed login attempts**:
   - Email: `test@example.com`
   - Password: `wrongpassword`
   - Repeat 3 times

3. **Expected behavior**:
   - 1st attempt: Normal error message
   - 2nd attempt: Show "2 attempts remaining" + a warning
   - 3rd attempt: Account blocked for 24 hours + countdown timer

### Scenario 2: Blocking UI

1. **Check UI elements**:
   - ✅ Attempts indicator (dots)
   - ✅ Attempts progress bar
   - ✅ Warning message
   - ✅ Disabled login button when blocked
   - ✅ Countdown timer

2. **Check responsiveness**:
   - Test on mobile
   - Ensure all elements render correctly

### Scenario 3: Admin functions

1. **Log in as administrator**:
   - Use an admin account
   - Open the admin panel

2. **Reset blocking (admin)**:
   - Go to "User Management"
   - Find the blocked user
   - Click the "Reset" button
   - Confirm the action

3. **Reset via admin form**:
   - Open "Admin Dashboard"
   - Use the "Reset User Login Attempts" form
   - Enter email: `test@example.com`
   - Click "Reset Login Attempts"

### Scenario 4: Automated testing

1. **Run in browser console**:
```javascript
// Load the test script
const script = document.createElement('script');
script.src = '/test-user-blocking.js';
document.head.appendChild(script);

// After it loads, run the tests
setTimeout(() => {
  runAllTests();
}, 1000);
```

2. **Watch console output**:
   - Test user creation
   - 3 failed login attempts
   - Blocking verification
   - Summary of results

## 📋 Test Checklist

### Functionality ✅
- [ ] Blocking after 3 failed attempts
- [ ] Display remaining attempts
- [ ] Warning before blocking
- [ ] Countdown timer
- [ ] Disabled login button when blocked
- [ ] Admin can reset blocking
- [ ] Automatic unblock after timeout

### UI/UX ✅
- [ ] Attempts indicator (dots)
- [ ] Progress bar
- [ ] Warning messages
- [ ] Error messages
- [ ] Responsive layout
- [ ] Animations and transitions

### Admin panel ✅
- [ ] Reset button in users list
- [ ] Reset form in dashboard
- [ ] Action confirmations
- [ ] Success/error notifications

## 🐛 Known behaviors

1. **Timer updates every second** — this is expected
2. **Blocking is reset on successful login** — by design
3. **Admin can reset attempts at any time** — intended functionality
4. **Reset form is disabled while the account is blocked** — anti-spam measure

## 🔍 Debugging

### If something doesn't work:

1. **Check browser console** for JavaScript errors
2. **Check Network tab** for API responses
3. **Make sure the backend is running** on port 3000
4. **Verify browser supports ES6+**

### Helpful debugging commands:

```javascript
// In the browser console
localStorage.getItem('token'); // Check token
fetch('http://localhost:3000/users/login', {method: 'POST', ...}); // Test API
```

## ✅ Done!

After completing all tests the user-blocking system is ready for production use. 🎉
