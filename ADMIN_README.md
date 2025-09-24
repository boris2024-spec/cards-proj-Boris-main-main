# Admin functionality

## Overview

The application includes full admin functionality that allows managing users and cards.

## Key features

### 1. User roles
- **Regular user** - basic permissions
- **Business user** - can create cards
- **Administrator** - full system management permissions

### 2. Admin panel
- Accessible at route `/admin`
- Real-time system statistics
- Quick links to manage users and cards

### 3. User management (`/admin/users`)
- View all users
- Search by name and email
- Block/unblock users
- Change roles (business, administrator)
- Delete users
- Edit user profiles

### 4. Cards management (`/admin/cards`)
- View all cards
- Search and filtering
- Block/unblock cards
- Delete cards
- View card details

## Files and components

### Guards (Route protection)
- `src/guards/AdminRoute.jsx` - protects admin routes

### Pages
- `src/pages/AdminDashboardPage.jsx` - Admin dashboard
- `src/pages/AdminUsersPage.jsx` - User management
- `src/pages/AdminCardsPage.jsx` - Cards management

### Hooks
- `src/users/hooks/useAdmin.js` - Hook for admin operations

### Components
- `src/components/AdminSetupHelper.jsx` - Helper to assign the first admin

### Routes
New routes were added in `src/routes/routesDict.js`:
- `/admin` - Admin dashboard
- `/admin/users` - User management
- `/admin/cards` - Cards management

## Data schemas

### Updated user model
```javascript
{
  name: { first, middle, last },
  email,
  phone,
  image: { url, alt },
  address: { street, houseNumber, city, state, country, zip },
  isBusiness: Boolean,
  isAdmin: Boolean,     // NEW FIELD
  isBlocked: Boolean,   // Used to block users
  createdAt,
  updatedAt
}
```

## API Endpoints (required on the backend)

### Users
- `GET /users` - Get all users (admin only)
- `PUT /users/:id` - Update a user (admin only)
- `PATCH /users/:id` - Partially update a user
- `DELETE /users/:id` - Delete a user (admin only)

### Cards
- `GET /cards` - Get all cards (with filtering support)
- `PUT /cards/:id` - Update a card (admin only)
- `PATCH /cards/:id` - Partially update a card
- `DELETE /cards/:id` - Delete a card (admin only)

## Security

1. All admin routes are protected by the `AdminRoute` component
2. Access rights are checked based on the `isAdmin` field
3. Authorization token is passed in request headers
4. Admin functions are not available to regular users

## Initial setup

To assign the first administrator:

1. Register a user as usual
2. Use the `AdminSetupHelper` component (button in the bottom-right corner)
3. Enter the email of the user to make an administrator
4. After assignment, the user will get access to the admin panel

## Usage

### Entering the admin panel
1. Log in as a user with administrator rights
2. An "Admin Panel" item will appear in the navigation menu
3. Go to the admin panel

### User management
1. Go to "User management"
2. Use the search to find specific users
3. Use action buttons to manage users

### Cards management
1. Go to "Cards management"
2. Filter cards by status
3. View details and manage cards

## Backend integration

Make sure your backend supports:
1. The `isAdmin` field in the user model
2. The `isBlocked` field for users and cards
3. Corresponding API endpoints for CRUD operations
4. Access rights validation on the server side

## Development

To add new admin features:
1. Create a new page in `src/pages/`
2. Add a route to `routesDict.js`
3. Protect the route with the `AdminRoute` component
4. Add corresponding functions to the `useAdmin` hook
5. Update the admin panel navigation
