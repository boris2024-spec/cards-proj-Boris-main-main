import React, { useEffect, useState } from "react";
import {
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    Box,
    Paper,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    CircularProgress,
    Alert,
} from "@mui/material";
import {
    People,
    CreditCard,
    Dashboard,
    Settings,
    BarChart,
    Security,
    SupervisorAccount,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../users/providers/UserProvider";
import useAdmin from "../users/hooks/useAdmin";
import ROUTES from "../routes/routesDict";

export default function AdminDashboardPage() {
    const navigate = useNavigate();
    const { token } = useCurrentUser();
    const { getSystemStats, loading, error } = useAdmin(token);
    const [stats, setStats] = useState({
        totalUsers: 0,
        businessUsers: 0,
        totalCards: 0,
        totalLikes: 0,
    });

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const systemStats = await getSystemStats();
            setStats(systemStats);
        } catch (error) {
            console.error("Error loading stats:", error);
        }
    };

    const adminMenuItems = [
        {
            title: "Управление пользователями",
            description: "Просмотр, редактирование и удаление пользователей",
            icon: <People fontSize="large" />,
            path: ROUTES.adminUsers,
            color: "#1976d2",
        },
        {
            title: "Управление карточками",
            description: "Модерация и управление бизнес-карточками",
            icon: <CreditCard fontSize="large" />,
            path: ROUTES.adminCards,
            color: "#2e7d32",
        },
        {
            title: "Аналитика",
            description: "Статистика и отчеты системы",
            icon: <BarChart fontSize="large" />,
            path: "#",
            color: "#ed6c02",
        },
        {
            title: "Безопасность",
            description: "Настройки безопасности и логи",
            icon: <Security fontSize="large" />,
            path: "#",
            color: "#d32f2f",
        },
    ];

    const quickStats = [
        { title: "Всего пользователей", value: stats.totalUsers.toString(), color: "#1976d2" },
        { title: "Бизнес пользователи", value: stats.businessUsers.toString(), color: "#2e7d32" },
        { title: "Всего карточек", value: stats.totalCards.toString(), color: "#ed6c02" },
        { title: "Всего лайков", value: stats.totalLikes.toString(), color: "#9c27b0" },
    ];

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom>
                    Панель администратора
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Добро пожаловать в административную панель управления
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {/* Quick Stats */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        {quickStats.map((stat, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card sx={{ height: "100%" }}>
                                    <CardContent>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                            }}
                                        >
                                            <Box>
                                                <Typography color="text.secondary" gutterBottom>
                                                    {stat.title}
                                                </Typography>
                                                <Typography variant="h4" component="div">
                                                    {stat.value}
                                                </Typography>
                                            </Box>
                                            <Dashboard sx={{ fontSize: 40, color: stat.color }} />
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Admin Menu */}
                    <Grid container spacing={3}>
                        {adminMenuItems.map((item, index) => (
                            <Grid item xs={12} md={6} key={index}>
                                <Card
                                    sx={{
                                        height: "100%",
                                        cursor: "pointer",
                                        transition: "transform 0.2s, box-shadow 0.2s",
                                        "&:hover": {
                                            transform: "translateY(-4px)",
                                            boxShadow: 4,
                                        }
                                    }}
                                    onClick={() => navigate(item.path)}
                                >
                                    <CardContent sx={{ p: 3 }}>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "flex-start",
                                                mb: 2,
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    p: 2,
                                                    borderRadius: 2,
                                                    backgroundColor: `${item.color}20`,
                                                    color: item.color,
                                                    mr: 2,
                                                }}
                                            >
                                                {item.icon}
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="h6" component="h2" gutterBottom>
                                                    {item.title}
                                                </Typography>
                                                <Typography color="text.secondary">
                                                    {item.description}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Button
                                            variant="outlined"
                                            fullWidth
                                            sx={{ mt: 2 }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(item.path);
                                            }}
                                        >
                                            Перейти
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Recent Activity */}
                    <Grid container spacing={3} sx={{ mt: 2 }}>
                        <Grid item xs={12}>
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Последняя активность
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                <List>
                                    <ListItem>
                                        <ListItemIcon>
                                            <People />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Новый пользователь зарегистрирован"
                                            secondary="2 минуты назад"
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <CreditCard />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Создана новая бизнес-карточка"
                                            secondary="5 минут назад"
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <Settings />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Обновлены настройки системы"
                                            secondary="1 час назад"
                                        />
                                    </ListItem>
                                </List>
                            </Paper>
                        </Grid>
                    </Grid>
                </>
            )}
        </Container>
    );
}
