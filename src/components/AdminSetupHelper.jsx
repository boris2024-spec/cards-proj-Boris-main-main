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
            setError("Please enter user email");
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");

        try {
            // First try to find user by email
            const usersResponse = await axios.get(`${API_BASE_URL}/users`);
            const users = usersResponse.data;
            const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

            if (!user) {
                setError("User with this email not found");
                return;
            }

            // Update user, making them admin
            await axios.put(
                `${API_BASE_URL}/users/${user._id}`,
                { ...user, isAdmin: true },
                {
                    headers: { "x-auth-token": adminToken },
                }
            );

            setMessage(`User ${email} is now an administrator!`);
            setEmail("");
        } catch (error) {
            if (error.response?.status === 403) {
                setError("Insufficient permissions to perform this operation");
            } else if (error.response?.status === 401) {
                setError("Invalid token");
            } else {
                setError("Error assigning administrator: " + (error.response?.data?.message || error.message));
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
                Assign Admin
            </Button>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Admin Assignment</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        This function is designed to assign the first system administrator.
                        Use with caution!
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
                        label="User Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        sx={{ mb: 2 }}
                        placeholder="user@example.com"
                    />

                    <TextField
                        fullWidth
                        label="Admin Token (if required)"
                        value={adminToken}
                        onChange={(e) => setAdminToken(e.target.value)}
                        placeholder="Leave empty if not required"
                        type="password"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleMakeAdmin}
                        variant="contained"
                        disabled={loading}
                    >
                        {loading ? "Processing..." : "Assign Administrator"}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
