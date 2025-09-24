// Test script to verify user blocking behavior on login
// Run in the browser console on http://localhost:5174

async function testBlockedUserLogin() {
    console.log('🧪 Testing user blocking on login\n');

    const API_BASE_URL = "http://localhost:3000";

    try {
        // 1. Attempt login with intentionally wrong credentials
        console.log('1️⃣ Testing with wrong credentials...');

        const wrongLoginResponse = await fetch(`${API_BASE_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'wrong@email.com',
                password: 'wrongpassword'
            })
        });

        if (!wrongLoginResponse.ok) {
            const wrongError = await wrongLoginResponse.json();
            console.log(`   ❌ Wrong credentials error: ${wrongError.error?.message}`);
        }

        // 2. Fetch users list (requires admin token)
        const adminToken = localStorage.getItem('my token');
        if (!adminToken) {
            console.log('⚠️ Full testing requires you to be logged in as an administrator');
            console.log('   Log in as admin and run the script again');
            return;
        }

        console.log('\n2️⃣ Fetching users...');
        const usersResponse = await fetch(`${API_BASE_URL}/users`, {
            headers: { "x-auth-token": adminToken }
        });

        if (!usersResponse.ok) {
            console.log(`   ❌ Failed to fetch users: ${usersResponse.status}`);
            return;
        }

        const users = await usersResponse.json();
        const testUser = users.find(user => !user.isAdmin && !user.isBlocked);

        if (!testUser) {
            console.log('   ⚠️ No suitable test user found');
            return;
        }

        console.log(`   ✅ Test user: ${testUser.email}`);

        // 3. Block the user
        console.log('\n3️⃣ Blocking the test user...');
        const blockResponse = await fetch(`${API_BASE_URL}/users/${testUser._id}/block`, {
            method: 'PATCH',
            headers: { "x-auth-token": adminToken }
        });

        if (blockResponse.ok) {
            console.log('   ✅ User blocked');

            // 4. Attempt login with the blocked user
            console.log('\n4️⃣ Attempt login with blocked user...');

            // You need to enter the correct password for the test user here
            console.log('⚠️ Important: You need to know the test user password for this step');
            console.log(`   Try to login as ${testUser.email} via the login form`);
            console.log('   Expected result: "User is blocked. Contact administrator."');

            // 5. Unblock the user
            setTimeout(async () => {
                console.log('\n5️⃣ Unblocking the user...');
                const unblockResponse = await fetch(`${API_BASE_URL}/users/${testUser._id}/unblock`, {
                    method: 'PATCH',
                    headers: { "x-auth-token": adminToken }
                });

                if (unblockResponse.ok) {
                    console.log('   ✅ User unblocked');
                    console.log('   The user can now log in again');
                }
            }, 2000);

        } else {
            console.log('   ❌ Failed to block the user');
        }

    } catch (error) {
        console.error('❌ Testing error:', error);
    }
}

// Function to directly test the login form
function testLoginForm() {
    console.log('🔑 Testing login form...');

    // Find the form fields
    const emailField = document.querySelector('input[name="email"]');
    const passwordField = document.querySelector('input[name="password"]');
    const submitButton = document.querySelector('button[type="submit"]');

    if (!emailField || !passwordField || !submitButton) {
        console.log('❌ Login form not found. Make sure you are on /login');
        return;
    }

    console.log('✅ Login form found');
    console.log('📝 Enter the blocked user credentials and click "Login"');
    console.log('   Expected result: red notification about blocking');
}

// Export functions
window.testBlockedUserLogin = testBlockedUserLogin;
window.testLoginForm = testLoginForm;

console.log('🔧 Blocking test script loaded!');
console.log('📋 Available commands:');
console.log('   testBlockedUserLogin() - full blocking test');
console.log('   testLoginForm() - login form check');
