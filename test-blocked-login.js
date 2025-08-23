// Тестовый скрипт для проверки блокировки пользователей при логине
// Выполните в консоли браузера на странице http://localhost:5174

async function testBlockedUserLogin() {
    console.log('🧪 Тестирование блокировки пользователей при логине\n');

    const API_BASE_URL = "http://localhost:3000";

    try {
        // 1. Попытка логина с заведомо неверными данными
        console.log('1️⃣ Тестирование с неверными данными...');

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
            console.log(`   ❌ Ошибка неверных данных: ${wrongError.error?.message}`);
        }

        // 2. Получение списка пользователей (требует admin токена)
        const adminToken = localStorage.getItem('my token');
        if (!adminToken) {
            console.log('⚠️ Для полного тестирования нужно быть авторизованным как администратор');
            console.log('   Авторизуйтесь как админ и запустите скрипт снова');
            return;
        }

        console.log('\n2️⃣ Получение списка пользователей...');
        const usersResponse = await fetch(`${API_BASE_URL}/users`, {
            headers: { "x-auth-token": adminToken }
        });

        if (!usersResponse.ok) {
            console.log(`   ❌ Не удалось получить список пользователей: ${usersResponse.status}`);
            return;
        }

        const users = await usersResponse.json();
        const testUser = users.find(user => !user.isAdmin && !user.isBlocked);

        if (!testUser) {
            console.log('   ⚠️ Не найден подходящий пользователь для тестирования');
            return;
        }

        console.log(`   ✅ Тестовый пользователь: ${testUser.email}`);

        // 3. Блокируем пользователя
        console.log('\n3️⃣ Блокируем тестового пользователя...');
        const blockResponse = await fetch(`${API_BASE_URL}/users/${testUser._id}/block`, {
            method: 'PATCH',
            headers: { "x-auth-token": adminToken }
        });

        if (blockResponse.ok) {
            console.log('   ✅ Пользователь заблокирован');

            // 4. Попытка логина заблокированного пользователя
            console.log('\n4️⃣ Попытка логина заблокированного пользователя...');

            // Здесь нужно ввести правильный пароль для тестового пользователя
            console.log('⚠️ Важно: Для тестирования нужно знать пароль тестового пользователя');
            console.log(`   Попробуйте войти под ${testUser.email} через форму логина`);
            console.log('   Ожидаемый результат: "Пользователь заблокирован. Обратитесь к администратору."');

            // 5. Разблокируем пользователя
            setTimeout(async () => {
                console.log('\n5️⃣ Разблокируем пользователя...');
                const unblockResponse = await fetch(`${API_BASE_URL}/users/${testUser._id}/unblock`, {
                    method: 'PATCH',
                    headers: { "x-auth-token": adminToken }
                });

                if (unblockResponse.ok) {
                    console.log('   ✅ Пользователь разблокирован');
                    console.log('   Теперь пользователь снова может войти в систему');
                }
            }, 2000);

        } else {
            console.log('   ❌ Не удалось заблокировать пользователя');
        }

    } catch (error) {
        console.error('❌ Ошибка тестирования:', error);
    }
}

// Функция для тестирования формы логина напрямую
function testLoginForm() {
    console.log('🔑 Тестирование формы логина...');

    // Находим поля формы
    const emailField = document.querySelector('input[name="email"]');
    const passwordField = document.querySelector('input[name="password"]');
    const submitButton = document.querySelector('button[type="submit"]');

    if (!emailField || !passwordField || !submitButton) {
        console.log('❌ Форма логина не найдена. Убедитесь, что вы на странице /login');
        return;
    }

    console.log('✅ Форма логина найдена');
    console.log('📝 Введите данные заблокированного пользователя и нажмите "Войти"');
    console.log('   Ожидаемый результат: красное уведомление о блокировке');
}

// Экспортируем функции
window.testBlockedUserLogin = testBlockedUserLogin;
window.testLoginForm = testLoginForm;

console.log('🔧 Скрипт тестирования блокировки загружен!');
console.log('📋 Доступные команды:');
console.log('   testBlockedUserLogin() - полное тестирование блокировки');
console.log('   testLoginForm() - проверка формы логина');
