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
            setError("Ошибка при загрузке пользователей");
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUserToggle = async (userId, field, currentValue) => {
        try {
            const updateData = { [field]: !currentValue };
            await axios.patch(`${API_BASE_URL}/users/${userId}`, updateData, {
                headers: { "x-auth-token": token },
            });

            setUsers(users.map(user =>
                user._id === userId
                    ? { ...user, [field]: !currentValue }
                    : user
            ));

            setSuccess(`Статус пользователя обновлен`);
        } catch (error) {
            setError("Ошибка при обновлении статуса пользователя");
            console.error("Error updating user:", error);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Вы уверены, что хотите удалить этого пользователя?")) {
            return;
        }

        try {
            await axios.delete(`${API_BASE_URL}/users/${userId}`, {
                headers: { "x-auth-token": token },
            });

            setUsers(users.filter(user => user._id !== userId));
            setSuccess("Пользователь удален");
        } catch (error) {
            setError("Ошибка при удалении пользователя");
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
                await axios.put(`${API_BASE_URL}/users/${user._id}`, editUser, {
                    headers: { "x-auth-token": token },
                });

                setUsers(users.map(u => u._id === user._id ? editUser : u));
                setSuccess("Пользователь обновлен");
                onClose();
            } catch (error) {
                setError("Ошибка при сохранении изменений");
                console.error("Error updating user:", error);
            }
        };

        return (
            <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
                <DialogTitle>Редактирование пользователя</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
                        <TextField
                            label="Имя"
                            value={editUser.name?.first || ""}
                            onChange={(e) => setEditUser({
                                ...editUser,
                                name: { ...editUser.name, first: e.target.value }
                            })}
                            fullWidth
                        />
                        <TextField
                            label="Фамилия"
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
                            label="Телефон"
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
                            label="Бизнес аккаунт"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={editUser.isAdmin || false}
                                    onChange={(e) => setEditUser({ ...editUser, isAdmin: e.target.checked })}
                                />
                            }
                            label="Администратор"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Отмена</Button>
                    <Button onClick={handleSave} variant="contained">
                        Сохранить
                    </Button>
                </DialogActions>
            </Dialog>
        );
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h4" component="h1">
                    Управление пользователями
                </Typography>
                <Button
                    variant="contained"
                    onClick={fetchUsers}
                    disabled={loading}
                >
                    Обновить
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
                    placeholder="Поиск пользователей..."
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
                            <TableCell>Пользователь</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Телефон</TableCell>
                            <TableCell>Роль</TableCell>
                            <TableCell>Статус</TableCell>
                            <TableCell align="center">Действия</TableCell>
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
                                                label="Администратор"
                                                color="error"
                                                size="small"
                                            />
                                        )}
                                        {user.isBusiness && (
                                            <Chip
                                                icon={<Business />}
                                                label="Бизнес"
                                                color="primary"
                                                size="small"
                                            />
                                        )}
                                        {!user.isAdmin && !user.isBusiness && (
                                            <Chip label="Пользователь" size="small" />
                                        )}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        icon={user.isBlocked ? <Block /> : <CheckCircle />}
                                        label={user.isBlocked ? "Заблокирован" : "Активен"}
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
                                            {user.isBlocked ? "Разблокировать" : "Заблокировать"}
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
                    labelRowsPerPage="Строк на странице:"
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
