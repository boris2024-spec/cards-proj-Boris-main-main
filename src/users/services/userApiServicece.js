// Единая точка для базового URL API
// Не добавляем завершающий слэш, чтобы шаблоны были единообразны: `${API_BASE_URL}/cards`
export const API_BASE_URL = "http://localhost:3000";

// (Опционально) общий axios инстанс. Пока не используется везде, но готов для постепенной миграции.
// import axios from 'axios';
// export const api = axios.create({ baseURL: API_BASE_URL });

// Хелпер для построения URL (если пригодится позже)
export const buildApiUrl = (path = "") => {
    if (!path) return API_BASE_URL;
    return path.startsWith("/") ? `${API_BASE_URL}${path}` : `${API_BASE_URL}/${path}`;
};

