// Единая точка для базового URL API
export const API_BASE_URL = "http://localhost:3000";
// export const API_BASE_URL = "https://cards-server-boris.onrender.com";

export const buildApiUrl = (path = "") => {
    if (!path) return API_BASE_URL;
    return path.startsWith("/") ? `${API_BASE_URL}${path}` : `${API_BASE_URL}/${path}`;
};
