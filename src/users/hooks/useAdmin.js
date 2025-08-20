import { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../services/userApiServicece";

const useAdmin = (token) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const getAllUsers = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await axios.get(`${API_BASE_URL}/users`, {
                headers: { "x-auth-token": token },
            });
            return response.data;
        } catch (error) {
            setError("Ошибка при загрузке пользователей");
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const updateUser = async (userId, userData) => {
        try {
            setLoading(true);
            setError("");
            const response = await axios.put(`${API_BASE_URL}/users/${userId}`, userData, {
                headers: { "x-auth-token": token },
            });
            setSuccess("Пользователь обновлен");
            return response.data;
        } catch (error) {
            setError("Ошибка при обновлении пользователя");
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (userId) => {
        try {
            setLoading(true);
            setError("");
            await axios.delete(`${API_BASE_URL}/users/${userId}`, {
                headers: { "x-auth-token": token },
            });
            setSuccess("Пользователь удален");
        } catch (error) {
            setError("Ошибка при удалении пользователя");
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const toggleUserStatus = async (userId, field, value) => {
        try {
            setLoading(true);
            setError("");
            const response = await axios.patch(
                `${API_BASE_URL}/users/${userId}`,
                { [field]: value },
                {
                    headers: { "x-auth-token": token },
                }
            );
            setSuccess("Статус пользователя обновлен");
            return response.data;
        } catch (error) {
            setError("Ошибка при обновлении статуса");
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const getAllCards = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await axios.get(`${API_BASE_URL}/cards`, {
                headers: { "x-auth-token": token },
            });
            return response.data;
        } catch (error) {
            setError("Ошибка при загрузке карточек");
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const updateCard = async (cardId, cardData) => {
        try {
            setLoading(true);
            setError("");
            const response = await axios.put(`${API_BASE_URL}/cards/${cardId}`, cardData, {
                headers: { "x-auth-token": token },
            });
            setSuccess("Карточка обновлена");
            return response.data;
        } catch (error) {
            setError("Ошибка при обновлении карточки");
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const deleteCard = async (cardId) => {
        try {
            setLoading(true);
            setError("");
            await axios.delete(`${API_BASE_URL}/cards/${cardId}`, {
                headers: { "x-auth-token": token },
            });
            setSuccess("Карточка удалена");
        } catch (error) {
            setError("Ошибка при удалении карточки");
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const toggleCardStatus = async (cardId, field, value) => {
        try {
            setLoading(true);
            setError("");
            const response = await axios.patch(
                `${API_BASE_URL}/cards/${cardId}`,
                { [field]: value },
                {
                    headers: { "x-auth-token": token },
                }
            );
            setSuccess("Статус карточки обновлен");
            return response.data;
        } catch (error) {
            setError("Ошибка при обновлении статуса карточки");
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const getSystemStats = async () => {
        try {
            setLoading(true);
            setError("");
            const [usersResponse, cardsResponse] = await Promise.all([
                axios.get(`${API_BASE_URL}/users`, {
                    headers: { "x-auth-token": token },
                }),
                axios.get(`${API_BASE_URL}/cards`, {
                    headers: { "x-auth-token": token },
                }),
            ]);

            const users = usersResponse.data;
            const cards = cardsResponse.data;

            return {
                totalUsers: users.length,
                businessUsers: users.filter(user => user.isBusiness).length,
                adminUsers: users.filter(user => user.isAdmin).length,
                blockedUsers: users.filter(user => user.isBlocked).length,
                totalCards: cards.length,
                blockedCards: cards.filter(card => card.isBlocked).length,
                totalLikes: cards.reduce((sum, card) => sum + (card.likes?.length || 0), 0),
            };
        } catch (error) {
            setError("Ошибка при загрузке статистики");
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const clearMessages = () => {
        setError("");
        setSuccess("");
    };

    return {
        loading,
        error,
        success,
        getAllUsers,
        updateUser,
        deleteUser,
        toggleUserStatus,
        getAllCards,
        updateCard,
        deleteCard,
        toggleCardStatus,
        getSystemStats,
        clearMessages,
    };
};

export default useAdmin;
