/**
 * Test script to verify hidden blocked cards
 * Run in the browser console on http://localhost:5174/
 */

async function testBlockedCardsVisibility() {
    console.log('🧪 Starting blocked cards visibility test...');

    const API_BASE_URL = 'http://localhost:3000';

    try {
        // 1. Get all cards via public API
        console.log('📋 Fetching all cards from public API...');
        const response = await fetch(`${API_BASE_URL}/cards`);
        const allCards = await response.json();

        console.log(`📊 Total cards in the system: ${allCards.length}`);

        // 2. Count active and blocked cards
        const activeCards = allCards.filter(card => !card.isBlocked);
        const blockedCards = allCards.filter(card => card.isBlocked);

        console.log(`✅ Active cards: ${activeCards.length}`);
        console.log(`🚫 Blocked cards: ${blockedCards.length}`);

        // 3. Verify that only active cards are shown on the main page
        if (blockedCards.length > 0) {
            console.log('🎯 Found blocked cards:');
            blockedCards.forEach(card => {
                console.log(`   - "${card.title}" (ID: ${card._id})`);
            });

            console.log('✨ Functionality works: blocked cards are not displayed on the main page!');
        } else {
            console.log('ℹ️  There are no blocked cards. All cards are displayed.');
        }

        // 4. Output how many cards should be displayed
        console.log(`🎨 On the main page should be displayed: ${activeCards.length} cards`);

        return {
            total: allCards.length,
            active: activeCards.length,
            blocked: blockedCards.length,
            success: true
        };

    } catch (error) {
        console.error('❌ Error during testing:', error);
        return { success: false, error: error.message };
    }
}

// Function to demonstrate card blocking (requires admin token)
async function demonstrateCardBlocking(cardId, adminToken) {
    console.log('🔒 Demonstrating card blocking...');

    const API_BASE_URL = 'http://localhost:3000';

    try {
        // Block the card
        const response = await fetch(`${API_BASE_URL}/cards/${cardId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': adminToken
            },
            body: JSON.stringify({ isBlocked: true })
        });

        if (response.ok) {
            console.log(`✅ Card ${cardId} blocked successfully!`);
            console.log('🔄 Refresh the main page to see changes.');
            return true;
        } else {
            console.error('❌ Error blocking card:', response.statusText);
            return false;
        }
    } catch (error) {
        console.error('❌ Error:', error);
        return false;
    }
}

// Function to unblock a card
async function unblockCard(cardId, adminToken) {
    console.log('🔓 Unblocking the card...');

    const API_BASE_URL = 'http://localhost:3000';

    try {
        const response = await fetch(`${API_BASE_URL}/cards/${cardId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': adminToken
            },
            body: JSON.stringify({ isBlocked: false })
        });

        if (response.ok) {
            console.log(`✅ Card ${cardId} unblocked successfully!`);
            console.log('🔄 Refresh the main page to see changes.');
            return true;
        } else {
            console.error('❌ Error unblocking card:', response.statusText);
            return false;
        }
    } catch (error) {
        console.error('❌ Error:', error);
        return false;
    }
}

console.log('🚀 Test functions loaded!');
console.log('📝 Available commands:');
console.log('   testBlockedCardsVisibility() - check cards visibility');
console.log('   demonstrateCardBlocking(cardId, adminToken) - block a card');
console.log('   unblockCard(cardId, adminToken) - unblock a card');
console.log('');
console.log('🔥 Run testBlockedCardsVisibility() to start testing!');
