/**
 * Utility functions for user info, roles, and route prefixes.
 */

export const getUserInfo = () => {
    try {
        const userInfoStr = localStorage.getItem("userInfo");
        if (userInfoStr) {
            const parsed = JSON.parse(userInfoStr);
            if (typeof parsed === "object" && parsed !== null) {
                return parsed;
            }
        }
    } catch {
        // Ignore JSON parse errors
    }
    return {};
};

export const getUserTypeId = () => {
    const userInfo = getUserInfo();
    const typeId = userInfo.user_type_id ?? userInfo.userTypeId ?? userInfo.user_type;
    return typeId !== undefined && typeId !== null && !isNaN(Number(typeId)) ? Number(typeId) : null;
};

export const isAuthenticated = () => {
    const userInfo = getUserInfo();
    const typeId = getUserTypeId();
    const currentUser = localStorage.getItem("currentUser");
    return Boolean((currentUser || userInfo.user_id) && typeId !== null);
};

export const getDefaultDashboardPath = (userTypeId) => {
    const roleId = Number(userTypeId);
    switch (roleId) {
        case 1:
            return "/admin";
        case 2:
            return "/customer";
        case 3:
            return "/analyst";
        default:
            return "/login";
    }
};

export const isAnalystUser = () => {
    const typeId = getUserTypeId();
    return typeId === 3;
};

export const isAdminUser = () => {
    const typeId = getUserTypeId();
    return typeId === 1;
};

export const isCustomerUser = () => {
    const typeId = getUserTypeId();
    return typeId === 2;
};

export const getRolePrefix = () => {
    if (typeof window !== "undefined" && window.location) {
        const path = window.location.pathname;
        if (path.startsWith("/analyst")) return "/analyst";
        if (path.startsWith("/analysist")) return "/analysist";
    }
    if (isAnalystUser()) return "/analyst";
    return "/admin";
};

