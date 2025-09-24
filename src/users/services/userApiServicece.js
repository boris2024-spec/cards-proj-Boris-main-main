// Single source for the API base URL
// Do NOT append a trailing slash so consumers can use patterns like `${API_BASE_URL}/cards`
// export const API_BASE_URL = "http://localhost:3000";
export const API_BASE_URL = "https://cards-server-boris.onrender.com";

// (Optional) common axios instance. Not used everywhere yet but ready for gradual migration.
// import axios from 'axios';
// export const api = axios.create({ baseURL: API_BASE_URL });

// Helper to build API URLs (if needed later)
export const buildApiUrl = (path = "") => {
    if (!path) return API_BASE_URL;
    return path.startsWith("/") ? `${API_BASE_URL}${path}` : `${API_BASE_URL}/${path}`;
};

