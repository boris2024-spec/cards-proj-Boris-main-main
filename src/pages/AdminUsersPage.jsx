import React, { useState, useEffect } from "react";
import {
    Container,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    IconButton,
    Box,
    Chip,
    Avatar,
    TextField,
    InputAdornment,
    TablePagination,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    FormControlLabel,
    Switch,
} from "@mui/material";
import {
    Search,
    Edit,
    Delete,
    Block,
    CheckCircle,
    Business,
    AdminPanelSettings,
} from "@mui/icons-material";
import { useCurrentUser } from "../users/providers/UserProvider";
import { API_BASE_URL } from "../users/services/userApiServicece";
import axios from "axios";

export default function AdminUsersPage() {
    const { token } = useCurrentUser();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedUser, setSelectedUser] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/users`, {
                headers: { "x-auth-token": token },
            });
            setUsers(response.data);
        } catch (error) {
            setError("Error loading users");
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUserToggle = async (userId, field, currentValue) => {
        try {
            let response;

            // Специальная обработка для блокировки/разблокировки
            if (field === "isBlocked") {
                const endpoint = !currentValue ? "block" : "unblock";
                response = await axios.patch(`${API_BASE_URL}/users/${userId}/${endpoint}`, {}, {
                    headers: { "x-auth-token": token },
                });
            } else {
                // Для других полей используем обычный PATCH
                const updateData = { [field]: !currentValue };
                response = await axios.patch(`${API_BASE_URL}/users/${userId}`, updateData, {
                    headers: { "x-auth-token": token },
                });
            }

            // Обновляем состояние с данными из ответа сервера
            setUsers(users.map(user =>
                user._id === userId ? response.data : user
            ));

            // Улучшенное сообщение об успехе
            if (field === "isBlocked" && !currentValue) {
                setSuccess("User blocked and business status removed");
            } else if (field === "isBlocked" && currentValue) {
                setSuccess("User unblocked");
            } else {
                setSuccess("User status updated");
            }
        } catch (error) {
            setError("Error updating user status");
            console.error("Error updating user:", error);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) {
            return;
        }

        try {
            await axios.delete(`${API_BASE_URL}/users/${userId}`, {
                headers: { "x-auth-token": token },
            });

            setUsers(users.filter(user => user._id !== userId));
            setSuccess("User deleted");
        } catch (error) {
            setError("Error deleting user");
            console.error("Error deleting user:", error);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name?.first?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name?.last?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const paginatedUsers = filteredUsers.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const UserDialog = ({ user, open, onClose }) => {
        const [editUser, setEditUser] = useState(user || {});

        useEffect(() => {
            setEditUser(user || {});
        }, [user]);

        const handleSave = async () => {
            try {
                // Сначала обновляем основные данные пользователя
                const updatedUser = await axios.put(`${API_BASE_URL}/users/${user._id}`, {
                    ...editUser,
                    isBlocked: undefined // Исключаем isBlocked из основного обновления
                }, {
                    headers: { "x-auth-token": token },
                });

                let finalUser = updatedUser.data;

                // Если статус блокировки изменился, обрабатываем его отдельно
                if (editUser.isBlocked !== user.isBlocked) {
                    const endpoint = editUser.isBlocked ? "block" : "unblock";
                    const blockResponse = await axios.patch(
                        `${API_BASE_URL}/users/${user._id}/${endpoint}`,
                        {},
                        {
                            headers: { "x-auth-token": token },
                        }
                    );
                    finalUser = blockResponse.data;
                }

                setUsers(users.map(u => u._id === user._id ? finalUser : u));
                setSuccess("User updated");
                onClose();
            } catch (error) {
                setError("Error saving changes");
                console.error("Error updating user:", error);
            }
        };

        return (
            <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
                <DialogTitle>Edit User</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
                        <TextField
                            label="First Name"
                            value={editUser.name?.first || ""}
                            onChange={(e) => setEditUser({
                                ...editUser,
                                name: { ...editUser.name, first: e.target.value }
                            })}
                            fullWidth
                        />
                        <TextField
                            label="Last Name"
                            value={editUser.name?.last || ""}
                            onChange={(e) => setEditUser({
                                ...editUser,
                                name: { ...editUser.name, last: e.target.value }
                            })}
                            fullWidth
                        />
                        <TextField
                            label="Email"
                            value={editUser.email || ""}
                            onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Phone"
                            value={editUser.phone || ""}
                            onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
                            fullWidth
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={editUser.isBusiness || false}
                                    onChange={(e) => setEditUser({ ...editUser, isBusiness: e.target.checked })}
                                />
                            }
                            label="Business Account"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={editUser.isAdmin || false}
                                    onChange={(e) => setEditUser({ ...editUser, isAdmin: e.target.checked })}
                                />
                            }
                            label="Administrator"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={editUser.isBlocked || false}
                                    onChange={(e) => {
                                        const isBlocked = e.target.checked;
                                        const updatedUser = { ...editUser, isBlocked };

                                        // При блокировке убираем статус бизнес-пользователя
                                        if (isBlocked) {
                                            updatedUser.isBusiness = false;
                                        }

                                        setEditUser(updatedUser);
                                    }}
                                />
                            }
                            label="Blocked"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        );
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h4" component="h1">
                    User Management
                </Typography>
                <Button
                    variant="contained"
                    onClick={fetchUsers}
                    disabled={loading}
                >
                    Refresh
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
                    {success}
                </Alert>
            )}

            <Box sx={{ mb: 3 }}>
                <TextField
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ width: 400 }}
                />
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>User</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedUsers.map((user) => (
                            <TableRow key={user._id}>
                                <TableCell>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                        <Avatar src={user.image?.url} alt={user.image?.alt}>
                                            {user.name?.first?.charAt(0)}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle2">
                                                {user.name?.first} {user.name?.last}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                ID: {user._id}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.phone}</TableCell>
                                <TableCell>
                                    <Box sx={{ display: "flex", gap: 1 }}>
                                        {user.isAdmin && (
                                            <Chip
                                                icon={<AdminPanelSettings />}
                                                label="Administrator"
                                                color="error"
                                                size="small"
                                            />
                                        )}
                                        {user.isBusiness && (
                                            <Chip
                                                icon={<Business />}
                                                label="Business"
                                                color="primary"
                                                size="small"
                                            />
                                        )}
                                        {!user.isAdmin && !user.isBusiness && (
                                            <Chip label="User" size="small" />
                                        )}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        icon={user.isBlocked ? <Block /> : <CheckCircle />}
                                        label={user.isBlocked ? "Blocked" : "Active"}
                                        color={user.isBlocked ? "error" : "success"}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="center">
                                    <Box sx={{ display: "flex", gap: 1 }}>
                                        <IconButton
                                            onClick={() => {
                                                setSelectedUser(user);
                                                setDialogOpen(true);
                                            }}
                                            color="primary"
                                            size="small"
                                        >
                                            <Edit />
                                        </IconButton>
                                        <Button
                                            onClick={() => handleUserToggle(user._id, "isBlocked", user.isBlocked)}
                                            size="small"
                                            variant="outlined"
                                            color={user.isBlocked ? "success" : "warning"}
                                        >
                                            {user.isBlocked ? "Unblock" : "Block"}
                                        </Button>
                                        <IconButton
                                            onClick={() => handleDeleteUser(user._id)}
                                            color="error"
                                            size="small"
                                        >
                                            <Delete />
                                        </IconButton>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredUsers.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Rows per page:"
                />
            </TableContainer>

            <UserDialog
                user={selectedUser}
                open={dialogOpen}
                onClose={() => {
                    setDialogOpen(false);
                    setSelectedUser(null);
                }}
            />
        </Container>
    );
}
