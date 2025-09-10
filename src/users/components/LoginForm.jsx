import { TextField, Box, Alert, Typography, LinearProgress } from "@mui/material";
import Form from "../../components/Form";
import useForm from "../../hooks/useForm";

import axios from "axios";
import loginSchema from "../models/loginSchema";
import { API_BASE_URL } from "../services/userApiServicece";
import initialLoginForm from "../helpers/initialForms/initialLoginForm";
import {
  getUser,
  setTokenInLocalStorage,
} from "../services/localStorageService";
import { useCurrentUser } from "../providers/UserProvider";
import { useNavigate } from "react-router-dom";
import { useSnack } from "../../providers/SnackbarProvider";
import { useState, useEffect } from "react";

function LoginForm() {
  const { setToken, setUser } = useCurrentUser();
  const navigate = useNavigate();
  const setSnack = useSnack();

  // Состояния для блокировки и попыток
  const [isBlocked, setIsBlocked] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(3);
  const [blockCountdown, setBlockCountdown] = useState('');
  const [warning, setWarning] = useState('');
  const [countdownInterval, setCountdownInterval] = useState(null);

  // Очистка интервала при размонтировании
  useEffect(() => {
    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [countdownInterval]);

  // Функция для запуска таймера обратного отсчета
  const startCountdown = (blockedUntil) => {
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }

    const updateCountdown = () => {
      const now = new Date();
      const timeLeft = blockedUntil - now;

      if (timeLeft <= 0) {
        setIsBlocked(false);
        setBlockCountdown('');
        setWarning('');
        setRemainingAttempts(3);
        if (countdownInterval) {
          clearInterval(countdownInterval);
          setCountdownInterval(null);
        }
        setSnack("success", "Блокировка снята. Вы можете попробовать войти снова.");
        return;
      }

      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

      setBlockCountdown(`🔒 Разблокировка через: ${hours}ч ${minutes}м ${seconds}с`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 5000);
    setCountdownInterval(interval);
  };

  const handleLogin = async (user) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/users/login`,
        user
      );
      console.log(response);

      // Успешный вход - сбрасываем все состояния
      setIsBlocked(false);
      setRemainingAttempts(3);
      setWarning('');
      setBlockCountdown('');

      setTokenInLocalStorage(response.data);
      setToken(response.data);
      setUser(getUser());
      setSnack("success", "Добро пожаловать!");
      navigate("/");
    } catch (error) {
      console.log(error);

      const status = error.response?.status;
      const data = error.response?.data || {};
      const errorMessage = data.message || data.error?.message || error.message;

      // Обработка блокировки аккаунта (код 423)
      if (status === 423) {
        setIsBlocked(true);
        setSnack("error", errorMessage);

        // Показать время разблокировки если есть
        if (data.blockedUntil) {
          const blockedUntil = new Date(data.blockedUntil);
          startCountdown(blockedUntil);
        }
        return;
      }

      // Обработка неверных учетных данных (код 401) с показом оставшихся попыток
      if (status === 401) {
        setSnack("error", errorMessage);

        // Извлечь количество попыток из сообщения
        const remainingMatch = errorMessage.match(/(\d+) attempts remaining/);
        if (remainingMatch) {
          const remaining = parseInt(remainingMatch[1]);
          setRemainingAttempts(remaining);

          if (remaining <= 1) {
            setWarning('⚠️ Еще одна неудачная попытка заблокирует аккаунт на 24 часа!');
          } else {
            setWarning('');
          }
        } else {
          // Если формат сообщения другой, уменьшаем счетчик
          setRemainingAttempts(prev => Math.max(0, prev - 1));
          if (remainingAttempts <= 2) {
            setWarning('⚠️ Еще одна неудачная попытка заблокирует аккаунт на 24 часа!');
          }
        }
        return;
      }

      // Обработка других ошибок
      if (errorMessage.includes("blocked") || errorMessage.includes("заблокирован")) {
        setSnack("error", "Пользователь заблокирован. Обратитесь к администратору.");
        setIsBlocked(true);
      } else if (errorMessage.includes("Invalid email or password")) {
        setSnack("error", "Неверный email или пароль");
      } else {
        setSnack("error", "Ошибка входа в систему");
      }
    }
  };

  const { formDetails, errors, handleChange, handleSubmit } = useForm(
    initialLoginForm,
    loginSchema,
    handleLogin
  );

  const handleReset = () => {
    // Сброс формы к начальным значениям
    handleChange({ target: { name: 'email', value: '' } });
    handleChange({ target: { name: 'password', value: '' } });
    setWarning('');
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "60vh",
      }}
    >
      <Form
        onSubmit={handleSubmit}
        onReset={handleReset}
        title={"sign in form"}
        styles={{
          maxWidth: "500px",
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          backgroundColor: "#fff"
        }}
        hideButtons={false}
        validateForm={() => formDetails.email && formDetails.password && !isBlocked}
      >
        {/* Индикатор блокировки */}
        {isBlocked && (
          <Box sx={{ mb: 2, width: '100%' }}>
            <Alert severity="error" sx={{ mb: 1 }}>
              🔒 Аккаунт заблокирован из-за множественных неудачных попыток входа
            </Alert>
            {blockCountdown && (
              <Typography
                variant="body2"
                sx={{
                  textAlign: 'center',
                  color: 'text.secondary',
                  fontFamily: 'monospace',
                  fontSize: '1.1rem'
                }}
              >
                {blockCountdown}
              </Typography>
            )}
          </Box>
        )}

        {/* Предупреждение о приближающейся блокировке */}
        {warning && !isBlocked && (
          <Box sx={{ mb: 2, width: '100%' }}>
            <Alert severity="warning">
              {warning}
            </Alert>
          </Box>
        )}

        {/* Индикатор оставшихся попыток */}
        {!isBlocked && remainingAttempts < 3 && (
          <Box sx={{ mb: 2, textAlign: 'center', width: '100%' }}>
            <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
              Осталось попыток: {remainingAttempts}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
              {[1, 2, 3].map(i => (
                <Box
                  key={i}
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: i <= remainingAttempts ? '#4caf50' : '#f44336',
                    transition: 'background-color 1s ease'
                  }}
                />
              ))}
            </Box>
            <LinearProgress
              variant="determinate"
              value={(remainingAttempts / 3) * 100}
              sx={{
                mt: 1,
                height: 4,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: remainingAttempts > 1 ? '#4caf50' : '#ff9800'
                }
              }}
            />
          </Box>
        )}

        <Box sx={{ width: '100%', mb: -2 }}>
          <TextField
            fullWidth
            variant="outlined"
            name="email"
            label="email"
            error={errors.email}
            onChange={handleChange}
            value={formDetails.email}
            disabled={isBlocked}
            sx={{ mb: 2 }}
          />
        </Box>

        <Box sx={{ width: '100%', mb: -0.5 }}>
          <TextField
            fullWidth
            variant="outlined"
            name="password"
            label="password"
            error={errors.password}
            onChange={handleChange}
            value={formDetails.password}
            type="password"
            disabled={isBlocked}
          />
        </Box>
      </Form>
    </Box>
  );
}

export default LoginForm;
