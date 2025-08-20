import React from "react";
import { Route, Routes } from "react-router-dom";
import CardsPage from "./../pages/CardsPage";
import FavoriteCardsPage from "./../pages/FavoriteCardsPage";
import MyCardsPage from "./../pages/MyCardsPage";
import AboutPage from "./../pages/AboutPage";
import LoginPage from "./../pages/LoginPage";
import RegisterPage from "./../pages/RegisterPage";
import ErrorPage from "../pages/ErrorPage";
import CardDetailsPage from "../pages/CardDetailsPage";
import UserProfilePage from "../pages/UserProfilePage";
import EditProfilePage from "../pages/EditProfilePage";
import AdminDashboardPage from "../pages/AdminDashboardPage";
import AdminUsersPage from "../pages/AdminUsersPage";
import AdminCardsPage from "../pages/AdminCardsPage";
import ROUTES from "./routesDict";
import SandboxPage from "../pages/SandboxPage";
import CreateCard from "../users/components/CreateCard";
import BusinessRoute from "../guards/BusinessRoute";
import AdminRoute from "../guards/AdminRoute";
function Router() {
  return (
    <Routes>
      <Route path={ROUTES.root} element={<CardsPage />} />
      <Route path={ROUTES.favorite} element={<FavoriteCardsPage />} />
      <Route path={ROUTES.myCards} element={<MyCardsPage />} />
      <Route path={ROUTES.about} element={<AboutPage />} />
      <Route path={ROUTES.login} element={<LoginPage />} />
      <Route path={ROUTES.register} element={<RegisterPage />} />
      <Route
        path={ROUTES.sandbox}
        element={
          <BusinessRoute>
            <SandboxPage />
          </BusinessRoute>
        }
      />
      <Route
        path={ROUTES.admin}
        element={
          <AdminRoute>
            <AdminDashboardPage />
          </AdminRoute>
        }
      />
      <Route
        path={ROUTES.adminUsers}
        element={
          <AdminRoute>
            <AdminUsersPage />
          </AdminRoute>
        }
      />
      <Route
        path={ROUTES.adminCards}
        element={
          <AdminRoute>
            <AdminCardsPage />
          </AdminRoute>
        }
      />
      <Route path={ROUTES.cardDetails} element={<CardDetailsPage />} />
      <Route path={ROUTES.editCard} element={<CreateCard />} />
      <Route path={ROUTES.userProfile} element={<UserProfilePage />} />
      <Route path={ROUTES.editProfile} element={<EditProfilePage />} />

      <Route path="/*" element={<ErrorPage />} />
    </Routes>
  );
}

export default Router;
