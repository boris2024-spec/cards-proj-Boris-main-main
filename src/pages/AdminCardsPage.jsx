import React, { useState, useEffect } from "react";
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardMedia,
    CardActions,
    Button,
    Box,
    Chip,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    IconButton,
    Pagination,
} from "@mui/material";
import {
    Search,
    Visibility,
    Edit,
    Delete,
    Block,
    CheckCircle,
    FilterList,
} from "@mui/icons-material";
import { useCurrentUser } from "../users/providers/UserProvider";
import { API_BASE_URL } from "../users/services/userApiServicece";
import axios from "axios";

export default function AdminCardsPage() {
    const { token } = useCurrentUser();
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [cardsPerPage] = useState(12);
    const [selectedCard, setSelectedCard] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        fetchCards();
    }, []);

    const fetchCards = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/cards`, {
                headers: { "x-auth-token": token },
            });
            setCards(response.data);
        } catch (error) {
            setError("Ошибка при загрузке карточек");
            console.error("Error fetching cards:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCardToggle = async (cardId, field, currentValue) => {
        try {
            const updateData = { [field]: !currentValue };
            await axios.patch(`${API_BASE_URL}/cards/${cardId}`, updateData, {
                headers: { "x-auth-token": token },
            });

            setCards(cards.map(card =>
                card._id === cardId
                    ? { ...card, [field]: !currentValue }
                    : card
            ));

            setSuccess(`Статус карточки обновлен`);
        } catch (error) {
            setError("Ошибка при обновлении статуса карточки");
            console.error("Error updating card:", error);
        }
    };

    const handleDeleteCard = async (cardId) => {
        if (!window.confirm("Вы уверены, что хотите удалить эту карточку?")) {
            return;
        }

        try {
            await axios.delete(`${API_BASE_URL}/cards/${cardId}`, {
                headers: { "x-auth-token": token },
            });

            setCards(cards.filter(card => card._id !== cardId));
            setSuccess("Карточка удалена");
        } catch (error) {
            setError("Ошибка при удалении карточки");
            console.error("Error deleting card:", error);
        }
    };

    const filteredCards = cards.filter(card => {
        const matchesSearch =
            card.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            card.subtitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            card.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "active" && !card.isBlocked) ||
            (statusFilter === "blocked" && card.isBlocked);

        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredCards.length / cardsPerPage);
    const paginatedCards = filteredCards.slice(
        (page - 1) * cardsPerPage,
        page * cardsPerPage
    );

    const CardDetailsDialog = ({ card, open, onClose }) => {
        if (!card) return null;

        return (
            <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
                <DialogTitle>Детали карточки</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} md={6}>
                            {card.image?.url && (
                                <CardMedia
                                    component="img"
                                    height="200"
                                    image={card.image.url}
                                    alt={card.image.alt}
                                    sx={{ borderRadius: 1, mb: 2 }}
                                />
                            )}
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom>
                                {card.title}
                            </Typography>
                            <Typography color="text.secondary" gutterBottom>
                                {card.subtitle}
                            </Typography>
                            <Typography variant="body2" paragraph>
                                {card.description}
                            </Typography>

                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2">Контактная информация:</Typography>
                                <Typography variant="body2">Email: {card.email}</Typography>
                                <Typography variant="body2">Телефон: {card.phone}</Typography>
                                <Typography variant="body2">Сайт: {card.web}</Typography>
                            </Box>

                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2">Адрес:</Typography>
                                <Typography variant="body2">
                                    {card.address?.country}, {card.address?.city}
                                </Typography>
                                <Typography variant="body2">
                                    {card.address?.street} {card.address?.houseNumber}
                                </Typography>
                            </Box>

                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2">Статистика:</Typography>
                                <Typography variant="body2">Лайков: {card.likes?.length || 0}</Typography>
                                <Typography variant="body2">
                                    Создано: {new Date(card.createdAt).toLocaleDateString()}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Закрыть</Button>
                </DialogActions>
            </Dialog>
        );
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h4" component="h1">
                    Управление карточками
                </Typography>
                <Button
                    variant="contained"
                    onClick={fetchCards}
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

            {/* Filters */}
            <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
                <TextField
                    placeholder="Поиск карточек..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ width: 300 }}
                />
                <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Статус</InputLabel>
                    <Select
                        value={statusFilter}
                        label="Статус"
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <MenuItem value="all">Все</MenuItem>
                        <MenuItem value="active">Активные</MenuItem>
                        <MenuItem value="blocked">Заблокированные</MenuItem>
                    </Select>
                </FormControl>
                <Typography variant="body2" color="text.secondary">
                    Найдено: {filteredCards.length} карточек
                </Typography>
            </Box>

            {/* Cards Grid */}
            <Grid container spacing={3}>
                {paginatedCards.map((card) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={card._id}>
                        <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                            {card.image?.url && (
                                <CardMedia
                                    component="img"
                                    height="140"
                                    image={card.image.url}
                                    alt={card.image.alt}
                                />
                            )}
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography gutterBottom variant="h6" component="div" noWrap>
                                    {card.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" noWrap>
                                    {card.subtitle}
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 1 }} noWrap>
                                    {card.email}
                                </Typography>

                                <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
                                    <Chip
                                        icon={card.isBlocked ? <Block /> : <CheckCircle />}
                                        label={card.isBlocked ? "Заблокирована" : "Активна"}
                                        color={card.isBlocked ? "error" : "success"}
                                        size="small"
                                    />
                                    <Chip
                                        label={`${card.likes?.length || 0} лайков`}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Box>
                            </CardContent>

                            <CardActions sx={{ p: 2, pt: 0 }}>
                                <IconButton
                                    onClick={() => {
                                        setSelectedCard(card);
                                        setDialogOpen(true);
                                    }}
                                    color="primary"
                                    size="small"
                                >
                                    <Visibility />
                                </IconButton>
                                <Button
                                    onClick={() => handleCardToggle(card._id, "isBlocked", card.isBlocked)}
                                    size="small"
                                    variant="outlined"
                                    color={card.isBlocked ? "success" : "warning"}
                                >
                                    {card.isBlocked ? "Разблокировать" : "Заблокировать"}
                                </Button>
                                <IconButton
                                    onClick={() => handleDeleteCard(card._id)}
                                    color="error"
                                    size="small"
                                >
                                    <Delete />
                                </IconButton>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
                <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(event, value) => setPage(value)}
                        color="primary"
                    />
                </Box>
            )}

            <CardDetailsDialog
                card={selectedCard}
                open={dialogOpen}
                onClose={() => {
                    setDialogOpen(false);
                    setSelectedCard(null);
                }}
            />
        </Container>
    );
}
