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
    const { token, user } = useCurrentUser();
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
            setError("Error loading cards");
            console.error("Error fetching cards:", error);
        } finally {
            setLoading(false);
        }
    };

    // Block card
    const handleBlockCard = async (cardId) => {
        try {
            await axios.patch(`${API_BASE_URL}/cards/${cardId}/block`, {}, {
                headers: { "x-auth-token": token },
            });
            setCards(cards.map(card =>
                card._id === cardId
                    ? { ...card, isBlocked: true }
                    : card
            ));
            setSuccess("Card blocked");
        } catch (error) {
            setError("Error blocking card");
            console.error("Error blocking card:", error);
        }
    };

    // Unblock card
    const handleUnblockCard = async (cardId) => {
        try {
            await axios.patch(`${API_BASE_URL}/cards/${cardId}/unblock`, {}, {
                headers: { "x-auth-token": token },
            });
            setCards(cards.map(card =>
                card._id === cardId
                    ? { ...card, isBlocked: false }
                    : card
            ));
            setSuccess("Card unblocked");
        } catch (error) {
            setError("Error unblocking card");
            console.error("Error unblocking card:", error);
        }
    };

    const handleDeleteCard = async (cardId) => {
        if (!window.confirm("Are you sure you want to delete this card?")) {
            return;
        }

        try {
            await axios.delete(`${API_BASE_URL}/cards/${cardId}`, {
                headers: { "x-auth-token": token },
            });

            setCards(cards.filter(card => card._id !== cardId));
            setSuccess("Card deleted");
        } catch (error) {
            setError("Error deleting card");
            console.error("Error deleting card:", error);
        }
    };

    const filteredCards = cards.filter(card => {
        const matchesSearch =
            card.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            card.subtitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            card.email?.toLowerCase().includes(searchTerm.toLowerCase());

        // If admin, show all cards (only apply search filter)
        if (user?.isAdmin) {
            return matchesSearch;
        }

        // For regular users, apply status filtering
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
                <DialogTitle>Card Details</DialogTitle>
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
                                <Typography variant="subtitle2">Contact Information:</Typography>
                                <Typography variant="body2">Email: {card.email}</Typography>
                                <Typography variant="body2">Phone: {card.phone}</Typography>
                                <Typography variant="body2">Website: {card.web}</Typography>
                            </Box>

                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2">Address:</Typography>
                                <Typography variant="body2">
                                    {card.address?.country}, {card.address?.city}
                                </Typography>
                                <Typography variant="body2">
                                    {card.address?.street} {card.address?.houseNumber}
                                </Typography>
                            </Box>

                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2">Statistics:</Typography>
                                <Typography variant="body2">Likes: {card.likes?.length || 0}</Typography>
                                <Typography variant="body2">
                                    Created: {new Date(card.createdAt).toLocaleDateString()}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Close</Button>
                </DialogActions>
            </Dialog>
        );
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h4" component="h1">
                    Card Management
                </Typography>
                <Button
                    variant="contained"
                    onClick={fetchCards}
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

            {/* Filters */}
            <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
                <TextField
                    placeholder="Search cards..."
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
                    <InputLabel>Status</InputLabel>
                    <Select
                        value={statusFilter}
                        label="Status"
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="blocked">Blocked</MenuItem>
                    </Select>
                </FormControl>
                <Typography variant="body2" color="text.secondary">
                    Found: {filteredCards.length} cards
                </Typography>
            </Box>

            {/* Cards Grid */}
            <Grid container columns={12} spacing={3}>
                {paginatedCards.map((card) => (
                    <Grid key={card._id} columnSpacing={3} xs={12} md={6} lg={3}>
                        <Box sx={{ position: 'relative' }}>
                            {/* ...existing card markup... */}
                            <Card
                                sx={{
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    opacity: card.isBlocked ? 0.5 : 1,
                                    filter: card.isBlocked ? 'grayscale(0.7)' : 'none',
                                    pointerEvents: card.isBlocked ? 'auto' : 'auto',
                                }}
                            >
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
                                            label={card.isBlocked ? "Blocked" : "Active"}
                                            color={card.isBlocked ? "error" : "success"}
                                            size="small"
                                        />
                                        <Chip
                                            label={`${card.likes?.length || 0} likes`}
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
                                    {card.isBlocked ? (
                                        <Button
                                            onClick={() => handleUnblockCard(card._id)}
                                            size="small"
                                            variant="outlined"
                                            color="success"
                                        >
                                            Unblock
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() => handleBlockCard(card._id)}
                                            size="small"
                                            variant="outlined"
                                            color="warning"
                                        >
                                            Block
                                        </Button>
                                    )}
                                    <IconButton
                                        onClick={() => handleDeleteCard(card._id)}
                                        color="error"
                                        size="small"
                                    >
                                        <Delete />
                                    </IconButton>
                                </CardActions>
                            </Card>
                            {card.isBlocked && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        bgcolor: 'rgba(255,0,0,0.15)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        zIndex: 2,
                                        pointerEvents: 'none',
                                        borderRadius: 2,
                                    }}
                                >
                                    <Typography variant="h5" color="error" sx={{ fontWeight: 'bold', textShadow: '0 0 6px #fff' }}>
                                        BLOCKED
                                    </Typography>
                                </Box>
                            )}
                        </Box>
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
