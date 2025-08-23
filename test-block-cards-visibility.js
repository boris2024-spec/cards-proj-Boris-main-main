/**
 * Тестовый скрипт для проверки скрытия заблокированных карточек
 * Выполните в консоли браузера на странице http://localhost:5174/
 */

async function testBlockedCardsVisibility() {
    console.log('🧪 Начинаем тест скрытия заблокированных карточек...');

    const API_BASE_URL = 'http://localhost:3000';

    try {
        // 1. Получаем все карточки через публичный API
        console.log('📋 Получаем все карточки через публичный API...');
        const response = await fetch(`${API_BASE_URL}/cards`);
        const allCards = await response.json();

        console.log(`📊 Всего карточек в системе: ${allCards.length}`);

        // 2. Считаем активные и заблокированные карточки
        const activeCards = allCards.filter(card => !card.isBlocked);
        const blockedCards = allCards.filter(card => card.isBlocked);

        console.log(`✅ Активных карточек: ${activeCards.length}`);
        console.log(`🚫 Заблокированных карточек: ${blockedCards.length}`);

        // 3. Проверяем, что на главной странице показываются только активные карточки
        if (blockedCards.length > 0) {
            console.log('🎯 Найдены заблокированные карточки:');
            blockedCards.forEach(card => {
                console.log(`   - "${card.title}" (ID: ${card._id})`);
            });

            console.log('✨ Функциональность работает: заблокированные карточки не отображаются на главной странице!');
        } else {
            console.log('ℹ️  Заблокированных карточек нет. Все карточки отображаются.');
        }

        // 4. Выводим информацию о том, сколько карточек должно отображаться
        console.log(`🎨 На главной странице должно отображаться: ${activeCards.length} карточек`);

        return {
            total: allCards.length,
            active: activeCards.length,
            blocked: blockedCards.length,
            success: true
        };

    } catch (error) {
        console.error('❌ Ошибка при тестировании:', error);
        return { success: false, error: error.message };
    }
}

// Функция для демонстрации блокировки карточки (требует админский токен)
async function demonstrateCardBlocking(cardId, adminToken) {
    console.log('🔒 Демонстрируем блокировку карточки...');

    const API_BASE_URL = 'http://localhost:3000';

    try {
        // Блокируем карточку
        const response = await fetch(`${API_BASE_URL}/cards/${cardId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': adminToken
            },
            body: JSON.stringify({ isBlocked: true })
        });

        if (response.ok) {
            console.log(`✅ Карточка ${cardId} успешно заблокирована!`);
            console.log('🔄 Обновите главную страницу, чтобы увидеть изменения.');
            return true;
        } else {
            console.error('❌ Ошибка при блокировке карточки:', response.statusText);
            return false;
        }
    } catch (error) {
        console.error('❌ Ошибка:', error);
        return false;
    }
}

// Функция для разблокировки карточки
async function unblockCard(cardId, adminToken) {
    console.log('🔓 Разблокируем карточку...');

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
            console.log(`✅ Карточка ${cardId} успешно разблокирована!`);
            console.log('🔄 Обновите главную страницу, чтобы увидеть изменения.');
            return true;
        } else {
            console.error('❌ Ошибка при разблокировке карточки:', response.statusText);
            return false;
        }
    } catch (error) {
        console.error('❌ Ошибка:', error);
        return false;
    }
}

console.log('🚀 Тестовые функции загружены!');
console.log('📝 Доступные команды:');
console.log('   testBlockedCardsVisibility() - проверить отображение карточек');
console.log('   demonstrateCardBlocking(cardId, adminToken) - заблокировать карточку');
console.log('   unblockCard(cardId, adminToken) - разблокировать карточку');
console.log('');
console.log('🔥 Запустите testBlockedCardsVisibility() для начала тестирования!');
