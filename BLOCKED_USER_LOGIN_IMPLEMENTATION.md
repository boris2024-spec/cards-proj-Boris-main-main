# Testing blocked-user behavior on login

## What was implemented

### 1. Improved error handling on login
- The file `src/users/components/LoginForm.jsx` includes specific error handling
- Now different messages are shown depending on the error type:
  - Blocked user: "User is blocked. Please contact an administrator."
  - Invalid credentials: "Invalid email or password"
  - Generic error: "Login error"

### 2. Modern UI notifications
- Replaced `alert()` calls with nicer notifications via `useSnack`
- Added a notification for successful login

### 3. Global block handling
- Created an axios interceptor (`src/services/axiosInterceptor.js`)
- Automatically handles cases where a user becomes blocked during an active session
- On detected blockage the interceptor will:
  - Remove the token from localStorage
  - Redirect to the login page
  - Show a blocked notification

## How to test

### Scenario 1: Blocked on login
1. Open the admin panel (http://localhost:5174/admin/users)
2. Log in as an administrator
3. Find a test user
4. Click the "Block" button to block the user
5. Log out
6. Try to log in with the blocked user
7. **Expected result**: A red notification appears: "User is blocked. Please contact an administrator."

### Scenario 2: Block while active
1. Log in as the test user
2. In another tab or browser, log in as an administrator
3. Block the same user from the admin panel
4. Return to the first tab with the test user
5. Try to perform any action (navigate pages, trigger API calls)
6. **Expected result**: The user will be automatically logged out and redirected to the login page

### Scenario 3: Unblock
1. Unblock the user from the admin panel ("Unblock" button)
2. The user can log in again

## Files changed

1. **src/users/components/LoginForm.jsx**
   - Improved login error handling
   - Replaced alerts with notifications

2. **src/services/axiosInterceptor.js** (new file)
   - Global handling of block errors
   - Automatic logout on block

3. **src/App.jsx**
   - Registered the axios interceptor

4. **src/users/providers/UserProvider.jsx**
   - Added import for removeToken

## Technical details

### Server error format
The system expects the following response shapes from the server:

```json
// When a user is blocked
{
  "error": {
    "message": "User is blocked" // or contains "blocked"
  }
}

// When credentials are invalid
{
  "error": {
    "message": "Invalid email or password"
  }
}
```

### HTTP status codes
- **403** - Forbidden (used for blocked users)
- **401** - Unauthorized (invalid credentials or token)
- **400** - Bad request

## Additional improvements

For a more complete solution you can add:

1. **Periodic status check** - poll the server every 5-10 minutes to verify the user is not blocked
2. **WebSocket notifications** - instant notifications about blocking events
3. **Action logging** - record attempts of blocked users to log in
4. **Block timestamp** - show the date/time of the block
5. **Block reason** - a field where the admin can set a reason for the block

## Security

- Tokens are automatically removed when a user is blocked
- Blocked users are prevented from performing actions
- All checks must be duplicated on the backend for security
