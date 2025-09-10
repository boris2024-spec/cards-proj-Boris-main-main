import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    TextField,
    Button,
    Alert,
    Typography,
    Divider,
} from '@mui/material';
import { LockReset, Send } from '@mui/icons-material';
import { API_BASE_URL } from '../users/services/userApiServicece';
import axios from 'axios';
import { useCurrentUser } from '../users/providers/UserProvider';

const AdminLockResetForm = () => {
    const { token } = useCurrentUser();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleReset = async () => {
        if (!email.trim()) {
            setError('Please enter an email address');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            await axios.patch(`${API_BASE_URL}/users/reset-login-attempts`, {
                email: email.trim()
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                }
            });

            setMessage(`✅ Login attempts successfully reset for ${email}`);
            setEmail(''); // Clear the form
        } catch (error) {
            if (error.response?.status === 404) {
                setError('User not found with this email address');
            } else if (error.response?.status === 403) {
                setError('Access denied. Admin privileges required.');
            } else {
                setError(error.response?.data?.message || 'Error resetting login attempts');
            }
            console.error('Error resetting login attempts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleReset();
        }
    };

    return (
        <Card sx={{ maxWidth: 500, mx: 'auto', mt: 2 }}>
            <CardHeader
                avatar={<LockReset color="primary" />}
                title="Reset User Login Attempts"
                subheader="Remove login blocks and reset failed attempt counters"
            />
            <Divider />
            <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        Enter the email address of the user whose login attempts you want to reset.
                        This will remove any login blocks and reset their failed attempt counter to zero.
                    </Typography>

                    {error && (
                        <Alert severity="error" onClose={() => setError('')}>
                            {error}
                        </Alert>
                    )}

                    {message && (
                        <Alert severity="success" onClose={() => setMessage('')}>
                            {message}
                        </Alert>
                    )}

                    <TextField
                        fullWidth
                        type="email"
                        label="User Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="user@example.com"
                        disabled={loading}
                        variant="outlined"
                        helperText="Email address of the user to reset"
                    />

                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button
                            variant="outlined"
                            onClick={() => {
                                setEmail('');
                                setError('');
                                setMessage('');
                            }}
                            disabled={loading}
                        >
                            Clear
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleReset}
                            disabled={loading || !email.trim()}
                            startIcon={loading ? null : <Send />}
                            color="primary"
                        >
                            {loading ? 'Resetting...' : 'Reset Login Attempts'}
                        </Button>
                    </Box>

                    <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                            ⚠️ This action will immediately remove any login blocks and allow the user to attempt login again.
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default AdminLockResetForm;
