
# User Blocking Functionality

## Description of Changes

Enhanced user blocking functionality has been added to the admin panel using dedicated API endpoints.

### Main Changes:

1. **Fixed API endpoints for blocking**
   - Special endpoints are used: `/users/:id/block` and `/users/:id/unblock`
   - Blocking automatically sets `isBusiness: false` on the backend

2. **Updated files:**
   - `src/pages/AdminUsersPage.jsx` – main blocking logic in the UI
   - `src/users/hooks/useAdmin.js` – hook for admin operations

### API Endpoints:

#### Block user:
```http
PATCH /users/:id/block
Headers: x-auth-token: <admin_token>
```
Response: updated user object with `isBlocked: true` and `isBusiness: false`

#### Unblock user:
```http
PATCH /users/:id/unblock
Headers: x-auth-token: <admin_token>
```
Response: updated user object with `isBlocked: false`

### How it works:

#### In the user table:
- The "Block" button calls the `handleUserToggle` function
- When blocking a user, `PATCH /users/:id/block` is sent
- When unblocking, `PATCH /users/:id/unblock` is sent
- Backend automatically manages the `isBusiness` field

#### In the edit modal:
- Added "Blocked" toggle
- On save, main data is updated via `PUT /users/:id`
- Then, if block status changed, the corresponding PATCH request is sent

### Security Logic:
- Only administrators can block/unblock users
- Blocked users automatically lose business account status
- After unblocking, business status can be manually set again
- All changes are logged to the console for debugging

### Testing:

#### Automated testing:
1. Run the test script: `test-frontend-block.js`
2. Execute in browser console: `testFrontendBlockFunctionality()`

#### Manual UI testing:
1. Log in as administrator
2. Go to "Admin Users" page (/admin/users)
3. Find a user and click the "Block" button
4. Check that the status changes to "Blocked"
5. Click "Unblock" to unblock

### Interface:
- Blocked users are shown with a red "Blocked" chip
- Active users are shown with a green "Active" chip
- The block button changes text from "Block" to "Unblock" and color
- Success/error messages are shown as notifications

### Error Handling:
- On 404 error: check API endpoint correctness
- On 403 error: check admin rights
- On network error: check server connection
