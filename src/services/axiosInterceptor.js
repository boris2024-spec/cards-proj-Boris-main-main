import axios from "axios";
import { removeToken } from "../users/services/localStorageService";

// Настройка interceptor для обработки ошибок аутентификации и блокировки
let isRedirecting = false;

axios.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const errorMessage = error.response?.data?.error?.message || error.response?.data?.message || "";

        // Обработка ошибки блокировки пользователя
        if (
            error.response?.status === 403 &&
            (errorMessage.includes("blocked") || errorMessage.includes("заблокирован"))
        ) {
            if (!isRedirecting) {
                isRedirecting = true;
                removeToken();

                // Перенаправляем на страницу логина
                window.location.href = "/login";

                // Показываем уведомление
                alert("Ваш аккаунт был заблокирован администратором.");

                setTimeout(() => {
                    isRedirecting = false;
                }, 1000);
            }
        }

        // Обработка ошибок 401 (неавторизован)
        if (error.response?.status === 401) {
            if (!isRedirecting) {
                isRedirecting = true;
                removeToken();
                window.location.href = "/login";
                setTimeout(() => {
                    isRedirecting = false;
                }, 1000);
            }
        }

        return Promise.reject(error);
    }
);

export default axios;
