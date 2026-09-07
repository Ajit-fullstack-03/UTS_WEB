/**
 * Utility functions for user info, roles, and route prefixes.
 */

export const getUserInfo = () => {
    try {
        const userInfoStr = localStorage.getItem("userInfo") || localStorage.getItem("currentUser");
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
    const typeId = userInfo.user_type_id || userInfo.userTypeId || userInfo.user_type;
    return typeId !== undefined && typeId !== null ? Number(typeId) : null;
};

export const isAnalystUser = () => {
    const typeId = getUserTypeId();
    if (typeId === 3) return true;
    if (typeof window !== "undefined" && window.location) {
        const path = window.location.pathname;
        if (path.startsWith("/analyst") || path.startsWith("/analysist")) {
            return true;
        }
    }
    return false;
};

export const isAdminUser = () => {
    const typeId = getUserTypeId();
    return typeId === 1;
};

export const isCustomerUser = () => {
    const typeId = getUserTypeId();
    if (typeId === 2) return true;
    if (typeof window !== "undefined" && window.location) {
        return window.location.pathname.startsWith("/customer");
    }
    return false;
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
