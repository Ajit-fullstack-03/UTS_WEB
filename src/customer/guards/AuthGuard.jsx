import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getUserTypeId, isAuthenticated, getDefaultDashboardPath } from "../../utils/userRole";

/**
 * AuthGuard component for Customer routes
 * Checks if the user is authenticated and has customer role (user_type_id = 2).
 * If not authenticated, redirects to the login page.
 * If authenticated with a different role, redirects to their authorized dashboard.
 * If customer, renders the child routes via Outlet.
 */
const AuthGuard = () => {
    const location = useLocation();
    const isAuthed = isAuthenticated();
    const userTypeId = getUserTypeId();

    if (!isAuthed || !userTypeId) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (userTypeId !== 2) {
        return <Navigate to={getDefaultDashboardPath(userTypeId)} replace />;
    }

    return <Outlet />;
};

export default AuthGuard;

