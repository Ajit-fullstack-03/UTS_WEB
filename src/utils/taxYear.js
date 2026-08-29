/**
 * Utility functions for managing the application's active tax year in localStorage.
 */

export const getStoredTaxYear = () => {
    try {
        const storedTaxYear = localStorage.getItem("taxYear");
        if (storedTaxYear && storedTaxYear.trim() !== "") {
            return storedTaxYear.replace(/"/g, "").trim();
        }

        const userInfoStr = localStorage.getItem("userInfo");
        if (userInfoStr) {
            const userInfo = JSON.parse(userInfoStr);
            const year = userInfo.taxYear || userInfo.taxyear || userInfo.current_year;
            if (year) {
                return String(year).trim();
            }
        }
    } catch (e) {
        console.error("Error retrieving taxYear from localStorage:", e);
    }
    return String(new Date().getFullYear());
};

export const setStoredTaxYear = (taxYear) => {
    try {
        if (!taxYear) return;
        const yearStr = String(taxYear).trim();
        localStorage.setItem("taxYear", yearStr);

        const userInfoStr = localStorage.getItem("userInfo");
        if (userInfoStr) {
            const userInfo = JSON.parse(userInfoStr);
            userInfo.taxYear = Number(yearStr) || yearStr;
            userInfo.taxyear = Number(yearStr) || yearStr;
            localStorage.setItem("userInfo", JSON.stringify(userInfo));
        }
    } catch (e) {
        console.error("Error saving taxYear to localStorage:", e);
    }
};

export const removeStoredTaxYear = () => {
    try {
        localStorage.removeItem("taxYear");
        localStorage.removeItem("utsTaxYearsList");
    } catch (e) {
        console.error("Error removing taxYear from localStorage:", e);
    }
};

export const getStoredTaxYearsList = () => {
    try {
        const stored = localStorage.getItem("utsTaxYearsList");
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
    } catch (e) {
        console.error("Error reading utsTaxYearsList from localStorage:", e);
    }
    return [];
};

export const setStoredTaxYearsList = (taxYears) => {
    try {
        if (Array.isArray(taxYears)) {
            localStorage.setItem("utsTaxYearsList", JSON.stringify(taxYears));
        }
    } catch (e) {
        console.error("Error saving utsTaxYearsList to localStorage:", e);
    }
};
