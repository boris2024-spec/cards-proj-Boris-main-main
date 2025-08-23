// Тестовый скрипт для проверки функциональности блокировки во фронтенде
// Запускается в браузере через консоль разработчика

async function testFrontendBlockFunctionality() {
    console.log('🚀 Тестирование фронтенд функциональности блокировки пользователей\n');

    const API_BASE_URL = "http://localhost:3000";

    // Получаем токен из localStorage (предполагаем, что администратор уже авторизован)
    const token = localStorage.getItem('my token');
    if (!token) {
        console.error('❌ Токен не найден в localStorage. Пожалуйста, авторизуйтесь как администратор.');
        return;
    }

    console.log('✅ Токен найден в localStorage');

    try {
        // 1. Получаем список всех пользователей
        console.log('1️⃣ Получение списка пользователей...');
        const usersResponse = await fetch(`${API_BASE_URL}/users`, {
            headers: { "x-auth-token": token },
        });

        if (!usersResponse.ok) {
            throw new Error(`HTTP ${usersResponse.status}: ${await usersResponse.text()}`);
        }

        const users = await usersResponse.json();
        console.log(`   Найдено пользователей: ${users.length}`);

        // Находим первого не-админа для тестирования
        const testUser = users.find(user => !user.isAdmin);
        if (!testUser) {
            console.error('❌ Не найден пользователь для тестирования (все пользователи - администраторы)');
            return;
        }

        console.log(`   Тестовый пользователь: ${testUser.email} (ID: ${testUser._id})`);
        console.log(`   Текущий статус: isBlocked = ${testUser.isBlocked}, isBusiness = ${testUser.isBusiness}\n`);

        // 2. Тестируем блокировку пользователя
        console.log('2️⃣ Тестирование блокировки пользователя...');
        const blockResponse = await fetch(`${API_BASE_URL}/users/${testUser._id}/block`, {
            method: 'PATCH',
            headers: {
                "x-auth-token": token,
                "Content-Type": "application/json"
            },
        });

        if (!blockResponse.ok) {
            throw new Error(`Ошибка блокировки: HTTP ${blockResponse.status}: ${await blockResponse.text()}`);
        }

        const blockedUser = await blockResponse.json();
        console.log(`   ✅ Пользователь заблокирован`);
        console.log(`   isBlocked: ${blockedUser.isBlocked}`);
        console.log(`   isBusiness: ${blockedUser.isBusiness} (должно быть false)\n`);

        // 3. Ждем немного и тестируем разблокировку
        console.log('3️⃣ Тестирование разблокировки пользователя...');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Ждем 1 секунду

        const unblockResponse = await fetch(`${API_BASE_URL}/users/${testUser._id}/unblock`, {
            method: 'PATCH',
            headers: {
                "x-auth-token": token,
                "Content-Type": "application/json"
            },
        });

        if (!unblockResponse.ok) {
            throw new Error(`Ошибка разблокировки: HTTP ${unblockResponse.status}: ${await unblockResponse.text()}`);
        }

        const unblockedUser = await unblockResponse.json();
        console.log(`   ✅ Пользователь разблокирован`);
        console.log(`   isBlocked: ${unblockedUser.isBlocked}`);
        console.log(`   isBusiness: ${unblockedUser.isBusiness}\n`);

        // 4. Тестируем обычное обновление пользователя (не блокировка)
        console.log('4️⃣ Тестирование обычного обновления пользователя...');
        const updateResponse = await fetch(`${API_BASE_URL}/users/${testUser._id}`, {
            method: 'PATCH',
            headers: {
                "x-auth-token": token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ isBusiness: true })
        });

        if (!updateResponse.ok) {
            throw new Error(`Ошибка обновления: HTTP ${updateResponse.status}: ${await updateResponse.text()}`);
        }

        const updatedUser = await updateResponse.json();
        console.log(`   ✅ Пользователь обновлен`);
        console.log(`   isBusiness установлен в: ${updatedUser.isBusiness}\n`);

        console.log('✅ Все тесты прошли успешно! API endpoints работают корректно.');
        console.log('\n📝 Инструкции для тестирования в UI:');
        console.log('1. Перейдите на страницу Admin Users (/admin/users)');
        console.log('2. Найдите пользователя и нажмите кнопку "Block"');
        console.log('3. Проверьте, что статус изменился на "Blocked" и убрался статус "Business"');
        console.log('4. Нажмите "Unblock" для разблокировки');

    } catch (error) {
        console.error('❌ Ошибка при тестировании:', error.message);
        console.error('Полная ошибка:', error);
    }
}

// Функция для копирования в буфер обмена
function copyToClipboard() {
    const code = `(${testFrontendBlockFunctionality.toString()})()`;
    navigator.clipboard.writeText(code).then(() => {
        console.log('✅ Код скопирован в буфер обмена! Вставьте его в консоль браузера.');
    });
}

console.log('🔧 Тестовый скрипт для фронтенда загружен!');
console.log('📋 Выполните testFrontendBlockFunctionality() в консоли браузера');
console.log('📋 Или выполните copyToClipboard() чтобы скопировать код для вставки');

// Экспортируем функции
window.testFrontendBlockFunctionality = testFrontendBlockFunctionality;
window.copyToClipboard = copyToClipboard;
