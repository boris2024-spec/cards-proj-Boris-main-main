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

  // States for blocking and login attempts
  const [isBlocked, setIsBlocked] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(3);
  const [blockCountdown, setBlockCountdown] = useState('');
  const [warning, setWarning] = useState('');
  const [countdownInterval, setCountdownInterval] = useState(null);

  // Clear countdown interval on unmount
  useEffect(() => {
    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [countdownInterval]);

  // Function to start countdown timer
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
        setSnack("success", "Account unblocked. You may try to sign in again.");
        return;
      }

      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

      // Show countdown in English (hours, minutes, seconds)
      setBlockCountdown(`🔒 Unblocks in: ${hours}h ${minutes}m ${seconds}s`);
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

      // Successful login - reset all states
      setIsBlocked(false);
      setRemainingAttempts(3);
      setWarning('');
      setBlockCountdown('');

      setTokenInLocalStorage(response.data);
      setToken(response.data);
      setUser(getUser());
      setSnack("success", "Welcome!");
      navigate("/");
    } catch (error) {
      console.log(error);

      const status = error.response?.status;
      const data = error.response?.data || {};
      const errorMessage = data.message || data.error?.message || error.message;

      // Handle account blocking (status 423)
      if (status === 423) {
        setIsBlocked(true);
        setSnack("error", errorMessage);

        // Show unblock time if provided
        if (data.blockedUntil) {
          const blockedUntil = new Date(data.blockedUntil);
          startCountdown(blockedUntil);
        }
        return;
      }

      // Handle invalid credentials (status 401) and show remaining attempts
      if (status === 401) {
        setSnack("error", errorMessage);

        // Extract remaining attempts from the message
        const remainingMatch = errorMessage.match(/(\d+) attempts remaining/);
        if (remainingMatch) {
          const remaining = parseInt(remainingMatch[1]);
          setRemainingAttempts(remaining);

          if (remaining <= 1) {
            setWarning('⚠️ One more failed attempt will block the account for 24 hours!');
          } else {
            setWarning('');
          }
        } else {
          // If message format is different, decrement counter
          setRemainingAttempts(prev => Math.max(0, prev - 1));
          if (remainingAttempts <= 2) {
            setWarning('⚠️ One more failed attempt will block the account for 24 hours!');
          }
        }
        return;
      }

      // Handle other errors
      if (errorMessage.includes("blocked")) {
        setSnack("error", "User is blocked. Contact an administrator.");
        setIsBlocked(true);
      } else if (errorMessage.includes("Invalid email or password")) {
        setSnack("error", "Invalid email or password");
      } else {
        setSnack("error", "Login error");
      }
    }
  };

  const { formDetails, errors, handleChange, handleSubmit } = useForm(
    initialLoginForm,
    loginSchema,
    handleLogin
  );

  const handleReset = () => {
    // Reset form to initial values
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
        {/* Block indicator */}
        {isBlocked && (
          <Box sx={{ mb: 2, width: '100%' }}>
            <Alert severity="error" sx={{ mb: 1 }}>
              🔒 Account blocked due to multiple failed sign-in attempts
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

        {/* Warning about impending block */}
        {warning && !isBlocked && (
          <Box sx={{ mb: 2, width: '100%' }}>
            <Alert severity="warning">
              {warning}
            </Alert>
          </Box>
        )}

        {/* Remaining attempts indicator */}
        {!isBlocked && remainingAttempts < 3 && (
          <Box sx={{ mb: 2, textAlign: 'center', width: '100%' }}>
            <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
              Remaining attempts: {remainingAttempts}
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
