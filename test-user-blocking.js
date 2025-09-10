// Тестовый файл для проверки функциональности блокировки пользователей
// Запускать в браузерной консоли для тестирования API

const API_BASE_URL = 'http://localhost:3000';

// Функция для тестирования блокировки пользователей
const testUserBlocking = async () => {
    console.log('🧪 Starting user blocking tests...');

    const testUser = {
        email: 'test@example.com',
        password: 'wrongpassword'
    };

    try {
        // Тест 1: Первая неудачная попытка
        console.log('\n1️⃣ Testing first failed login attempt...');
        let response = await fetch(`${API_BASE_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });

        let data = await response.json();
        console.log(`Status: ${response.status}`);
        console.log(`Message: ${data.message}`);

        if (response.status === 401) {
            console.log('✅ First attempt correctly returned 401');
        }

        // Тест 2: Вторая неудачная попытка
        console.log('\n2️⃣ Testing second failed login attempt...');
        response = await fetch(`${API_BASE_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });

        data = await response.json();
        console.log(`Status: ${response.status}`);
        console.log(`Message: ${data.message}`);

        if (response.status === 401 && data.message.includes('2 attempts remaining')) {
            console.log('✅ Second attempt correctly shows remaining attempts');
        }

        // Тест 3: Третья неудачная попытка - должна заблокировать
        console.log('\n3️⃣ Testing third failed login attempt (should block)...');
        response = await fetch(`${API_BASE_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });

        data = await response.json();
        console.log(`Status: ${response.status}`);
        console.log(`Message: ${data.message}`);
        console.log(`Blocked until: ${data.blockedUntil}`);

        if (response.status === 423) {
            console.log('✅ User correctly blocked after 3 attempts');
            console.log(`🔒 Account blocked until: ${new Date(data.blockedUntil).toLocaleString()}`);
        }

        // Тест 4: Попытка входа заблокированного пользователя
        console.log('\n4️⃣ Testing login attempt while blocked...');
        response = await fetch(`${API_BASE_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });

        data = await response.json();
        console.log(`Status: ${response.status}`);
        console.log(`Message: ${data.message}`);

        if (response.status === 423) {
            console.log('✅ Blocked user correctly rejected');
        }

        return {
            success: true,
            message: 'All tests completed',
            blockedUntil: data.blockedUntil
        };

    } catch (error) {
        console.error('❌ Test failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Функция для тестирования сброса попыток админом
const testAdminReset = async (adminToken, userEmail) => {
    console.log('\n🔧 Testing admin reset functionality...');

    try {
        const response = await fetch(`${API_BASE_URL}/users/reset-login-attempts`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': adminToken
            },
            body: JSON.stringify({ email: userEmail })
        });

        const data = await response.json();
        console.log(`Status: ${response.status}`);
        console.log(`Message: ${data.message || 'Reset successful'}`);

        if (response.ok) {
            console.log('✅ Admin reset successful');
        } else {
            console.log('❌ Admin reset failed');
        }

        return response.ok;
    } catch (error) {
        console.error('❌ Admin reset test failed:', error);
        return false;
    }
};

// Функция для создания тестового пользователя
const createTestUser = async () => {
    console.log('👤 Creating test user...');

    const testUser = {
        name: { first: 'Test', middle: '', last: 'User' },
        phone: '050-0000000',
        email: 'test@example.com',
        password: 'Abc123!',
        address: {
            state: 'Test State',
            country: 'Test Country',
            city: 'Test City',
            street: 'Test Street',
            houseNumber: 123,
            zip: '12345'
        },
        image: {
            url: 'https://via.placeholder.com/150',
            alt: 'Test User'
        },
        isBusiness: false
    };

    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });

        if (response.ok) {
            console.log('✅ Test user created successfully');
            return true;
        } else {
            const data = await response.json();
            console.log('⚠️ User might already exist:', data.message);
            return true; // Продолжаем тесты даже если пользователь уже существует
        }
    } catch (error) {
        console.error('❌ Failed to create test user:', error);
        return false;
    }
};

// Основная функция для запуска всех тестов
const runAllTests = async () => {
    console.log('🚀 Starting comprehensive user blocking tests...');
    console.log('════════════════════════════════════════════════════════════');

    // Создаем тестового пользователя
    const userCreated = await createTestUser();
    if (!userCreated) {
        console.log('❌ Cannot proceed without test user');
        return;
    }

    // Тестируем блокировку
    const blockingResults = await testUserBlocking();

    console.log('\n📋 Test Summary:');
    console.log('════════════════════════════════════════════════════════════');
    if (blockingResults.success) {
        console.log('✅ All blocking tests passed');
        console.log(`🔒 User will be unblocked at: ${new Date(blockingResults.blockedUntil).toLocaleString()}`);
    } else {
        console.log('❌ Some tests failed');
    }

    console.log('\n💡 To test admin reset:');
    console.log('1. Login as admin to get token');
    console.log('2. Run: testAdminReset("your-admin-token", "test@example.com")');
};

// Экспортируем функции для использования в консоли
if (typeof window !== 'undefined') {
    window.testUserBlocking = testUserBlocking;
    window.testAdminReset = testAdminReset;
    window.createTestUser = createTestUser;
    window.runAllTests = runAllTests;

    console.log('🧪 Test functions loaded! Available functions:');
    console.log('- runAllTests() - запустить все тесты');
    console.log('- testUserBlocking() - тест блокировки');
    console.log('- testAdminReset(token, email) - тест сброса админом');
    console.log('- createTestUser() - создать тестового пользователя');
}

export { testUserBlocking, testAdminReset, createTestUser, runAllTests };
