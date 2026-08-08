import React from "react";
import { Navigate, Outlet } from "react-router-dom";

/**
 * AuthGuard component (similar to Angular CanActivate Guard)
 * Checks if the user is authenticated (by checking if 'currentUser' exists in localStorage).
 * If not authenticated, redirects to the login page.
 * If authenticated, renders the child routes via React Router's Outlet.
 */
const AuthGuard = () => {
    // In this app, we check if 'currentUser' (token/user data) exists in localStorage
    const isAuthenticated = localStorage.getItem("currentUser");

    if (!isAuthenticated) {
        // Redirect to login page and keep the history clean (replace: true)
        return <Navigate to="/login" replace />;
    }

    // Render the nested protected components
    return <Outlet />;
};

export default AuthGuard;
