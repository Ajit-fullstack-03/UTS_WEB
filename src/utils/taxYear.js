/**
 * Utility functions for managing the application's active tax year in localStorage.
 */

export const getStoredTaxYear = () => {
    try {
        const storedTaxYear = localStorage.getItem("taxYear");
        if (storedTaxYear && storedTaxYear.trim() !== "" && storedTaxYear !== "undefined" && storedTaxYear !== "null") {
            return storedTaxYear.replace(/"/g, "").trim();
        }

        const userInfoStr = localStorage.getItem("userInfo");
        if (userInfoStr) {
            const userInfo = JSON.parse(userInfoStr);
            const year = userInfo.taxYear || userInfo.taxyear || userInfo.current_year;
            if (year && year !== "undefined" && year !== "null") {
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
        const yearStr = String(taxYear).replace(/"/g, "").trim();
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
    return [
        { utstaxyear: "2026", dutstaxyear: "TY 2026" },
        { utstaxyear: "2025", dutstaxyear: "TY 2025" },
        { utstaxyear: "2024", dutstaxyear: "TY 2024" },
        { utstaxyear: "2023", dutstaxyear: "TY 2023" },
        { utstaxyear: "2022", dutstaxyear: "TY 2022" },
        { utstaxyear: "2021", dutstaxyear: "TY 2021" },
        { utstaxyear: "2020", dutstaxyear: "TY 2020" },
    ];
};

export const setStoredTaxYearsList = (taxYears) => {
    try {
        if (Array.isArray(taxYears) && taxYears.length > 0) {
            localStorage.setItem("utsTaxYearsList", JSON.stringify(taxYears));
        }
    } catch (e) {
        console.error("Error saving utsTaxYearsList to localStorage:", e);
    }
};
