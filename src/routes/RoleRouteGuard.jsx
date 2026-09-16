import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getUserTypeId, isAuthenticated, getDefaultDashboardPath } from "../utils/userRole";

/**
 * RoleRouteGuard protects routes based on user authentication and user_type_id:
 * - Admin routes: allowedRoles = [1]
 * - Customer routes: allowedRoles = [2]
 * - Analyst routes: allowedRoles = [3]
 *
 * If not authenticated: Redirects to /login
 * If authenticated but wrong role: Redirects to the user's appropriate portal/dashboard
 */
const RoleRouteGuard = ({ allowedRoles = [] }) => {
    const location = useLocation();
    const isAuthed = isAuthenticated();
    const userTypeId = getUserTypeId();

    // 1. If not logged in, redirect to login page
    if (!isAuthed || !userTypeId) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 2. If user role is not permitted for this route, redirect to their allowed dashboard
    if (allowedRoles.length > 0 && !allowedRoles.includes(userTypeId)) {
        const redirectPath = getDefaultDashboardPath(userTypeId);
        return <Navigate to={redirectPath} replace />;
    }

    // 3. User is authorized, render child routes
    return <Outlet />;
};

export default RoleRouteGuard;
