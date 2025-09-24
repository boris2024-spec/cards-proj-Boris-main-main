# Testing instructions for user blocking functionality

## Quick testing guide

### 🚀 Quick UI test:

1. **Open the application**: http://localhost:5174
2. **Log in as an administrator**
3. **Go to Admin Dashboard**: Click "Admin Dashboard" in the menu
4. **Open User Management**: Click "User Management"
5. **Find a user** (not an admin) in the table
6. **Click the "Block" button** - the user should be blocked
7. **Verify status**: the status should become "Blocked" (red chip)
8. **Click the "Unblock" button** - the user should be unblocked

### 🔧 Automatic test via browser console:

1. **Open DevTools** (F12)
2. **Go to the Console tab**
3. **Load the test script**:
   ```javascript
   // Copy the contents of test-frontend-block.js and paste into the console
   ```
4. **Run the test**:
   ```javascript
   testFrontendBlockFunctionality()
   ```

### ✅ Expected behavior:

- When blocking:
  - User status changes to "Blocked"
  - If the user had a "Business" role, the "Business" status is removed
  - The button switches from "Block" to "Unblock"
  - A success notification is shown

- When unblocking:
  - User status changes to "Active"
  - The button switches from "Unblock" to "Block"
  - A success notification is shown

### 🔍 What to verify:

1. Visual changes: status chips should change color and text
2. Buttons: text and colors should update correctly
3. Notifications: success/error messages should appear
4. Business role: when blocked, the "Business" status should be removed
5. Permissions: only admins should be able to block/unblock users

### ❌ Possible errors:

- **404 Not Found**: Make sure the backend server is running on port 3000
- **403 Forbidden**: Ensure you are logged in as an administrator
- **Network Error**: Check your connection to the server

### 📝 Debug logs:

All actions are logged to the browser console. Open DevTools to inspect network requests and responses.

---

**Done!** The user blocking functionality can be tested using the steps above.
