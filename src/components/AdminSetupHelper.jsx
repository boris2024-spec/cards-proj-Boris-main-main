import React, { useState } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
    Typography,
} from "@mui/material";
import axios from "axios";
import { API_BASE_URL } from "../users/services/userApiServicece";

export default function AdminSetupHelper() {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [adminToken, setAdminToken] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleMakeAdmin = async () => {
        if (!email.trim()) {
            setError("Введите email пользователя");
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");

        try {
            // Сначала попробуем найти пользователя по email
            const usersResponse = await axios.get(`${API_BASE_URL}/users`);
            const users = usersResponse.data;
            const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

            if (!user) {
                setError("Пользователь с таким email не найден");
                return;
            }

            // Обновляем пользователя, делая его администратором
            const updateResponse = await axios.put(
                `${API_BASE_URL}/users/${user._id}`,
                { ...user, isAdmin: true },
                {
                    headers: { "x-auth-token": adminToken },
                }
            );

            setMessage(`Пользователь ${email} теперь администратор!`);
            setEmail("");
        } catch (error) {
            if (error.response?.status === 403) {
                setError("Недостаточно прав для выполнения операции");
            } else if (error.response?.status === 401) {
                setError("Неверный токен");
            } else {
                setError("Ошибка при назначении администратора: " + (error.response?.data?.message || error.message));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                variant="contained"
                color="warning"
                onClick={() => setOpen(true)}
                sx={{ position: "fixed", bottom: 16, right: 16, zIndex: 1000 }}
            >
                Назначить админа
            </Button>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Назначение администратора</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Эта функция предназначена для назначения первого администратора системы.
                        Используйте с осторожностью!
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {message && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            {message}
                        </Alert>
                    )}

                    <TextField
                        fullWidth
                        label="Email пользователя"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        sx={{ mb: 2 }}
                        placeholder="user@example.com"
                    />

                    <TextField
                        fullWidth
                        label="Токен администратора (если требуется)"
                        value={adminToken}
                        onChange={(e) => setAdminToken(e.target.value)}
                        placeholder="Оставьте пустым, если не требуется"
                        type="password"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Отмена</Button>
                    <Button
                        onClick={handleMakeAdmin}
                        variant="contained"
                        disabled={loading}
                    >
                        {loading ? "Обработка..." : "Назначить администратором"}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
