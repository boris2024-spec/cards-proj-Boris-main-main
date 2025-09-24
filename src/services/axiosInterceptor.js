import axios from "axios";
import { removeToken } from "../users/services/localStorageService";

// Setup interceptor to handle authentication errors and account blocking
let isRedirecting = false;

axios.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const errorMessage = error.response?.data?.error?.message || error.response?.data?.message || "";

        // Handle user blocking error
        if (
            error.response?.status === 403 &&
            errorMessage.includes("blocked")
        ) {
            if (!isRedirecting) {
                isRedirecting = true;
                removeToken();

                // Redirect to login page
                window.location.href = "/login";

                // Show notification in English
                alert("Your account was blocked by an administrator.");

                setTimeout(() => {
                    isRedirecting = false;
                }, 1000);
            }
        }

        // Handle 401 (unauthorized) errors
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
