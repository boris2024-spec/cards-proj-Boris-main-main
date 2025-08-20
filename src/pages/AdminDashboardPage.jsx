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
            title: "User Management",
            description: "View, edit and delete users",
            icon: <People fontSize="large" />,
            path: ROUTES.adminUsers,
            color: "#1976d2",
        },
        {
            title: "Card Management",
            description: "Moderation and management of business cards",
            icon: <CreditCard fontSize="large" />,
            path: ROUTES.adminCards,
            color: "#2e7d32",
        },
        {
            title: "Analytics",
            description: "System statistics and reports",
            icon: <BarChart fontSize="large" />,
            path: "#",
            color: "#ed6c02",
        },
        {
            title: "Security",
            description: "Security settings and logs",
            icon: <Security fontSize="large" />,
            path: "#",
            color: "#d32f2f",
        },
    ];

    const quickStats = [
        { title: "Total Users", value: stats.totalUsers.toString(), color: "#1976d2" },
        { title: "Business Users", value: stats.businessUsers.toString(), color: "#2e7d32" },
        { title: "Total Cards", value: stats.totalCards.toString(), color: "#ed6c02" },
        { title: "Total Likes", value: stats.totalLikes.toString(), color: "#9c27b0" },
    ];

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom>
                    Admin Dashboard
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Welcome to the administrative control panel
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
                                            Go to
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
                                    Recent Activity
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                <List>
                                    <ListItem>
                                        <ListItemIcon>
                                            <People />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="New user registered"
                                            secondary="2 minutes ago"
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <CreditCard />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="New business card created"
                                            secondary="5 minutes ago"
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <Settings />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="System settings updated"
                                            secondary="1 hour ago"
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
