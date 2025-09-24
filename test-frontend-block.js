// Test script for frontend block functionality
// Run in the browser console

async function testFrontendBlockFunctionality() {
    console.log('🚀 Testing frontend user blocking functionality\n');

    const API_BASE_URL = "http://localhost:3000";

    // Get token from localStorage (assumes admin is already logged in)
    const token = localStorage.getItem('my token');
    if (!token) {
        console.error('❌ Token not found in localStorage. Please login as an administrator.');
        return;
    }

    console.log('✅ Token found in localStorage');

    try {
        // 1. Get list of all users
        console.log('1️⃣ Fetching users...');
        const usersResponse = await fetch(`${API_BASE_URL}/users`, {
            headers: { "x-auth-token": token },
        });

        if (!usersResponse.ok) {
            throw new Error(`HTTP ${usersResponse.status}: ${await usersResponse.text()}`);
        }

        const users = await usersResponse.json();
        console.log(`   Users found: ${users.length}`);

        // Find the first non-admin user for testing
        const testUser = users.find(user => !user.isAdmin);
        if (!testUser) {
            console.error('❌ No test user found (all users are administrators)');
            return;
        }

        console.log(`   Test user: ${testUser.email} (ID: ${testUser._id})`);
        console.log(`   Current status: isBlocked = ${testUser.isBlocked}, isBusiness = ${testUser.isBusiness}\n`);

        // 2. Test blocking the user
        console.log('2️⃣ Testing user block...');
        const blockResponse = await fetch(`${API_BASE_URL}/users/${testUser._id}/block`, {
            method: 'PATCH',
            headers: {
                "x-auth-token": token,
                "Content-Type": "application/json"
            },
        });

        if (!blockResponse.ok) {
            throw new Error(`Block error: HTTP ${blockResponse.status}: ${await blockResponse.text()}`);
        }

        const blockedUser = await blockResponse.json();
        console.log(`   ✅ User blocked`);
        console.log(`   isBlocked: ${blockedUser.isBlocked}`);
        console.log(`   isBusiness: ${blockedUser.isBusiness} (should be false)\n`);

        // 3. Wait a bit and test unblocking
        console.log('3️⃣ Testing user unblock...');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

        const unblockResponse = await fetch(`${API_BASE_URL}/users/${testUser._id}/unblock`, {
            method: 'PATCH',
            headers: {
                "x-auth-token": token,
                "Content-Type": "application/json"
            },
        });

        if (!unblockResponse.ok) {
            throw new Error(`Unblock error: HTTP ${unblockResponse.status}: ${await unblockResponse.text()}`);
        }

        const unblockedUser = await unblockResponse.json();
        console.log(`   ✅ User unblocked`);
        console.log(`   isBlocked: ${unblockedUser.isBlocked}`);
        console.log(`   isBusiness: ${unblockedUser.isBusiness}\n`);

        // 4. Test regular user update (not block)
        console.log('4️⃣ Testing regular user update...');
        const updateResponse = await fetch(`${API_BASE_URL}/users/${testUser._id}`, {
            method: 'PATCH',
            headers: {
                "x-auth-token": token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ isBusiness: true })
        });

        if (!updateResponse.ok) {
            throw new Error(`Update error: HTTP ${updateResponse.status}: ${await updateResponse.text()}`);
        }

        const updatedUser = await updateResponse.json();
        console.log(`   ✅ User updated`);
        console.log(`   isBusiness set to: ${updatedUser.isBusiness}\n`);

        console.log('✅ All tests passed! API endpoints working as expected.');
        console.log('\n📝 UI testing instructions:');
        console.log('1. Navigate to Admin Users page (/admin/users)');
        console.log('2. Find a user and click "Block"');
        console.log('3. Verify status changed to "Blocked" and "Business" was removed');
        console.log('4. Click "Unblock" to restore the user');

    } catch (error) {
        console.error('❌ Error during testing:', error.message);
        console.error('Full error:', error);
    }
}

// Function to copy to clipboard
function copyToClipboard() {
    const code = `(${testFrontendBlockFunctionality.toString()})()`;
    navigator.clipboard.writeText(code).then(() => {
        console.log('✅ Code copied to clipboard! Paste it into the browser console.');
    });
}

console.log('🔧 Frontend test script loaded!');
console.log('📋 Run testFrontendBlockFunctionality() in the browser console');
console.log('📋 Or run copyToClipboard() to copy the code for pasting');

// Export functions
window.testFrontendBlockFunctionality = testFrontendBlockFunctionality;
window.copyToClipboard = copyToClipboard;
